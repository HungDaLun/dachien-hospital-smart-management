/**
 * 稽核報告生成功能
 * 定期生成員工操作統計報告，並透過 Email 發送給管理層
 */
'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export interface AuditReportData {
    userId: string;
    userEmail: string;
    userName: string;
    departmentName: string | null;
    period: {
        start: Date;
        end: Date;
    };
    statistics: {
        // 檔案操作統計
        filesViewed: number;
        filesDownloaded: number;
        filesUploaded: number;
        filesUpdated: number;
        filesDeleted: number;
        // Agent 操作統計
        agentsCreated: number;
        agentsQueried: number;
        // 跨部門存取統計
        crossDepartmentAccess: {
            departmentId: string;
            departmentName: string;
            accessCount: number;
        }[];
        // 異常行為標記
        anomalies: string[];
    };
    detailedLogs: Array<{
        timestamp: Date;
        action: string;
        resourceType: string;
        resourceId: string | null;
        details: Record<string, any>;
    }>;
}

/**
 * 生成單一員工的稽核報告
 */
export async function generateUserAuditReport(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<AuditReportData | null> {
    const adminSupabase = createAdminClient();

    // 取得使用者資訊
    const { data: userProfile } = await adminSupabase
        .from('user_profiles')
        .select(`
            id,
            email,
            display_name,
            department_id,
            departments (id, name)
        `)
        .eq('id', userId)
        .single();

    if (!userProfile) {
        return null;
    }

    // 取得該期間的所有操作記錄
    const { data: logs } = await adminSupabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

    const safeLogs = logs || [];

    // 統計各類操作
    const statistics = {
        filesViewed: safeLogs.filter(l => l.action === 'VIEW_FILE' || l.action === 'VIEW_FILE_METADATA').length,
        filesDownloaded: safeLogs.filter(l => l.action === 'DOWNLOAD_FILE').length,
        filesUploaded: safeLogs.filter(l => l.action === 'UPLOAD_FILE').length,
        filesUpdated: safeLogs.filter(l => l.action === 'UPDATE_FILE').length,
        filesDeleted: safeLogs.filter(l => l.action === 'DELETE_FILE').length,
        agentsCreated: safeLogs.filter(l => l.action === 'CREATE_AGENT').length,
        agentsQueried: safeLogs.filter(l => l.action === 'AGENT_QUERY').length,
        crossDepartmentAccess: [] as Array<{ departmentId: string; departmentName: string; accessCount: number }>,
        anomalies: [] as string[],
    };

    // 分析跨部門存取
    const crossDeptMap = new Map<string, number>();
    safeLogs.forEach(log => {
        if (log.resource_type === 'FILE' && log.file_department_id) {
            // 如果操作的檔案不屬於使用者自己的部門，則記錄為跨部門存取
            if (log.file_department_id !== userProfile.department_id) {
                const deptId = log.file_department_id;
                crossDeptMap.set(deptId, (crossDeptMap.get(deptId) || 0) + 1);
            }
        }
    });

    // 取得跨部門存取的部門名稱
    for (const [deptId, count] of crossDeptMap.entries()) {
        const { data: dept } = await adminSupabase
            .from('departments')
            .select('id, name')
            .eq('id', deptId)
            .single();

        if (dept) {
            statistics.crossDepartmentAccess.push({
                departmentId: deptId,
                departmentName: dept.name,
                accessCount: count,
            });
        }
    }

    // 檢測異常行為
    const anomalies: string[] = [];

    // 異常 1: 大量刪除操作
    if (statistics.filesDeleted > 10) {
        anomalies.push(`異常：在報告期間內刪除了 ${statistics.filesDeleted} 個檔案，請確認是否為正常操作`);
    }

    // 異常 2: 大量跨部門存取
    if (statistics.crossDepartmentAccess.length > 5) {
        anomalies.push(`異常：存取了 ${statistics.crossDepartmentAccess.length} 個不同部門的檔案`);
    }

    // 異常 3: 非工作時間的大量操作（假設工作時間為 9:00-18:00）
    const offHoursOperations = safeLogs.filter(log => {
        const hour = new Date(log.created_at).getHours();
        return hour < 9 || hour >= 18;
    }).length;

    if (safeLogs.length > 0 && offHoursOperations > safeLogs.length * 0.3) {
        anomalies.push(`異常：${Math.round(offHoursOperations / safeLogs.length * 100)}% 的操作發生在非工作時間`);
    }

    // 異常 4: 短時間內大量操作
    if (safeLogs.length > 100) {
        const timeSpan = endDate.getTime() - startDate.getTime();
        const days = timeSpan / (1000 * 60 * 60 * 24);
        if (days > 0 && safeLogs.length / days > 50) {
            anomalies.push(`異常：平均每天操作 ${Math.round(safeLogs.length / days)} 次，請確認是否為正常使用`);
        }
    }

    return {
        userId: userProfile.id,
        userEmail: userProfile.email,
        userName: userProfile.display_name || userProfile.email,
        departmentName: (userProfile.departments as any)?.name || null,
        period: { start: startDate, end: endDate },
        statistics,
        detailedLogs: safeLogs.map(log => ({
            timestamp: new Date(log.created_at),
            action: log.action,
            resourceType: log.resource_type,
            resourceId: log.resource_id,
            details: log.details || {},
        })),
    };
}

/**
 * 生成所有員工的稽核報告摘要
 */
export async function generateCompanyAuditReport(
    startDate: Date,
    endDate: Date
): Promise<{
    summary: {
        totalUsers: number;
        totalOperations: number;
        totalAnomalies: number;
        topUsers: Array<{
            userId: string;
            userName: string;
            operationCount: number;
        }>;
    };
    userReports: AuditReportData[];
}> {
    const adminSupabase = createAdminClient();

    // 取得所有使用者
    const { data: users } = await adminSupabase
        .from('user_profiles')
        .select('id')
        .eq('is_active', true);

    if (!users || users.length === 0) {
        return {
            summary: {
                totalUsers: 0,
                totalOperations: 0,
                totalAnomalies: 0,
                topUsers: [],
            },
            userReports: [],
        };
    }

    // 為每個使用者生成報告
    const userReports: AuditReportData[] = [];
    for (const user of users) {
        const report = await generateUserAuditReport(user.id, startDate, endDate);
        if (report) {
            userReports.push(report);
        }
    }

    // 計算摘要統計
    const totalOperations = userReports.reduce(
        (sum, r) => sum + r.detailedLogs.length,
        0
    );
    const totalAnomalies = userReports.reduce(
        (sum, r) => sum + r.statistics.anomalies.length,
        0
    );

    // 找出操作最多的前 10 名使用者
    const topUsers = userReports
        .map(r => ({
            userId: r.userId,
            userName: r.userName,
            operationCount: r.detailedLogs.length,
        }))
        .sort((a, b) => b.operationCount - a.operationCount)
        .slice(0, 10);

    return {
        summary: {
            totalUsers: userReports.length,
            totalOperations,
            totalAnomalies,
            topUsers,
        },
        userReports,
    };
}

/**
 * 格式化報告為 HTML（用於 Email）
 */
export async function formatAuditReportAsHTML(report: AuditReportData): Promise<string> {
    const { statistics, period, userName, departmentName } = report;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #4F46E5; color: white; padding: 20px; }
        .content { padding: 20px; }
        .stat-box { background: #F3F4F6; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .anomaly { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 10px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        th { background: #F9FAFB; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>員工稽核報告</h1>
        <p>${userName}${departmentName ? ` - ${departmentName}` : ''}</p>
        <p>報告期間：${period.start.toLocaleDateString('zh-TW')} 至 ${period.end.toLocaleDateString('zh-TW')}</p>
    </div>
    
    <div class="content">
        <h2>操作統計</h2>
        
        <div class="stat-box">
            <h3>檔案操作</h3>
            <ul>
                <li>查看檔案：${statistics.filesViewed} 次</li>
                <li>下載檔案：${statistics.filesDownloaded} 次</li>
                <li>上傳檔案：${statistics.filesUploaded} 次</li>
                <li>更新檔案：${statistics.filesUpdated} 次</li>
                <li>刪除檔案：${statistics.filesDeleted} 次</li>
            </ul>
        </div>
        
        <div class="stat-box">
            <h3>Agent 操作</h3>
            <ul>
                <li>建立 Agent：${statistics.agentsCreated} 次</li>
                <li>使用 Agent 查詢：${statistics.agentsQueried} 次</li>
            </ul>
        </div>
        
        ${statistics.crossDepartmentAccess.length > 0 ? `
        <div class="stat-box">
            <h3>跨部門存取</h3>
            <table>
                <thead>
                    <tr>
                        <th>部門</th>
                        <th>存取次數</th>
                    </tr>
                </thead>
                <tbody>
                    ${statistics.crossDepartmentAccess.map(d => `
                        <tr>
                            <td>${d.departmentName}</td>
                            <td>${d.accessCount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        ${statistics.anomalies.length > 0 ? `
        <div>
            <h2>⚠️ 異常行為提醒</h2>
            ${statistics.anomalies.map(anomaly => `
                <div class="anomaly">${anomaly}</div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
}
