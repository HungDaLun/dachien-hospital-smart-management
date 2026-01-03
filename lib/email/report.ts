/**
 * Email 發送功能（用於稽核報告）
 * 支援多種 Email 服務：Resend、SendGrid、AWS SES
 */
'use server';

import { formatAuditReportAsHTML } from '../actions/audit-report';
import type { AuditReportData } from '../actions/audit-report';

/**
 * Email 服務類型
 */
type EmailProvider = 'resend' | 'sendgrid' | 'ses' | 'console';

/**
 * 取得 Email 服務提供者
 */
function getEmailProvider(): EmailProvider {
    const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || 'console';

    // 檢查是否有對應的 API Key
    if (provider === 'resend' && process.env.RESEND_API_KEY) return 'resend';
    if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) return 'sendgrid';
    if (provider === 'ses' && process.env.AWS_SES_ACCESS_KEY_ID) return 'ses';

    // 預設使用 console（開發模式）
    return 'console';
}

/**
 * 使用 Resend 發送 Email
 */
async function sendViaResend(
    to: string,
    subject: string,
    html: string
): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'noreply@yourcompany.com';

    if (!apiKey) {
        throw new Error('RESEND_API_KEY 未設定');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Email 發送失敗' }));
        throw new Error(error.message || 'Email 發送失敗');
    }

    return { success: true };
}

/**
 * 使用 SendGrid 發送 Email
 */
async function sendViaSendGrid(
    to: string,
    subject: string,
    html: string
): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@yourcompany.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'EAKAP 系統';

    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY 未設定');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: to }],
            }],
            from: {
                email: fromEmail,
                name: fromName,
            },
            subject,
            content: [{
                type: 'text/html',
                value: html,
            }],
        }),
    });

    if (!response.ok) {
        const error = await response.text().catch(() => 'Email 發送失敗');
        throw new Error(error);
    }

    return { success: true };
}

/**
 * 使用 AWS SES 發送 Email
 */
async function sendViaSES(
    _to: string,
    _subject: string,
    _html: string
): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "AWS SES support is disabled due to missing dependencies (@aws-sdk/client-ses)." };
}

/**
 * 使用 Console 輸出（開發模式）
 */
async function sendViaConsole(
    to: string,
    subject: string,
    html: string
): Promise<{ success: boolean; error?: string }> {
    console.log('📧 Email（開發模式 - 未設定 Email 服務）');
    console.log('收件人:', to);
    console.log('主旨:', subject);
    console.log('內容長度:', html.length, '字元');

    // 在開發環境中，可以將 HTML 寫入檔案以便查看
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_SAVE_TO_FILE === 'true') {
        const fs = await import('fs/promises');
        const path = await import('path');
        const emailDir = path.join(process.cwd(), '.emails');
        await fs.mkdir(emailDir, { recursive: true });
        const filename = `email-${Date.now()}.html`;
        await fs.writeFile(path.join(emailDir, filename), html);
        console.log('Email 內容已儲存至:', path.join(emailDir, filename));
    }

    return { success: true };
}

/**
 * 發送單一員工的稽核報告 Email
 */
export async function sendUserAuditReportEmail(
    report: AuditReportData,
    recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const provider = getEmailProvider();
        const html = await formatAuditReportAsHTML(report);
        const subject = `稽核報告 - ${report.userName} (${report.period.start.toLocaleDateString('zh-TW')} - ${report.period.end.toLocaleDateString('zh-TW')})`;

        switch (provider) {
            case 'resend':
                return await sendViaResend(recipientEmail, subject, html);
            case 'sendgrid':
                return await sendViaSendGrid(recipientEmail, subject, html);
            case 'ses':
                return await sendViaSES(recipientEmail, subject, html);
            case 'console':
            default:
                return await sendViaConsole(recipientEmail, subject, html);
        }
    } catch (error) {
        console.error('發送 Email 失敗:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知錯誤',
        };
    }
}

/**
 * 發送公司整體稽核報告給管理層
 */
export async function sendCompanyAuditReportEmail(
    summary: {
        totalUsers: number;
        totalOperations: number;
        totalAnomalies: number;
        topUsers: Array<{ userId: string; userName: string; operationCount: number }>;
    },
    recipientEmails: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // TODO: 實作 Email 發送邏輯
        // 生成公司整體報告的 HTML

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #4F46E5; color: white; padding: 20px; }
        .content { padding: 20px; }
        .stat-box { background: #F3F4F6; padding: 15px; margin: 10px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        th { background: #F9FAFB; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>公司整體稽核報告</h1>
    </div>
    
    <div class="content">
        <div class="stat-box">
            <h2>整體統計</h2>
            <ul>
                <li>總使用者數：${summary.totalUsers}</li>
                <li>總操作次數：${summary.totalOperations}</li>
                <li>異常行為數：${summary.totalAnomalies}</li>
            </ul>
        </div>
        
        <div class="stat-box">
            <h2>操作最多的前 10 名使用者</h2>
            <table>
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>使用者</th>
                        <th>操作次數</th>
                    </tr>
                </thead>
                <tbody>
                    ${summary.topUsers.map((user, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${user.userName}</td>
                            <td>${user.operationCount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
        `;

        // 發送 Email 給所有收件人
        const provider = getEmailProvider();
        const subject = `公司整體稽核報告 (${new Date().toLocaleDateString('zh-TW')})`;

        const results = await Promise.allSettled(
            recipientEmails.map(email => {
                switch (provider) {
                    case 'resend':
                        return sendViaResend(email, subject, html);
                    case 'sendgrid':
                        return sendViaSendGrid(email, subject, html);
                    case 'ses':
                        return sendViaSES(email, subject, html);
                    case 'console':
                    default:
                        return sendViaConsole(email, subject, html);
                }
            })
        );

        // 檢查是否有失敗的發送
        const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
        if (failures.length > 0) {
            const errors = failures.map(f =>
                f.status === 'rejected' ? f.reason?.message : f.value.error
            ).filter(Boolean);

            return {
                success: false,
                error: `部分 Email 發送失敗: ${errors.join('; ')}`,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('發送 Email 失敗:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知錯誤',
        };
    }
}
