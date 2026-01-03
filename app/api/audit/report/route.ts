/**
 * 稽核報告 API
 * 生成並發送稽核報告
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';
import { generateUserAuditReport, generateCompanyAuditReport } from '@/lib/actions/audit-report';
import { sendUserAuditReportEmail, sendCompanyAuditReportEmail } from '@/lib/email/report';
import { toApiResponse } from '@/lib/errors';

/**
 * GET /api/audit/report
 * 生成稽核報告（不發送 Email）
 */
export async function GET(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN']);

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const scope = searchParams.get('scope') || 'user'; // 'user' | 'company'

        if (!startDate || !endDate) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: '請提供 start_date 和 end_date' } },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (scope === 'company') {
            // 公司整體報告（僅 SUPER_ADMIN）
            requireRole(profile, ['SUPER_ADMIN']);
            const report = await generateCompanyAuditReport(start, end);
            return NextResponse.json({ success: true, data: report });
        } else {
            // 單一使用者報告
            const targetUserId = userId || profile.id;
            
            // DEPT_ADMIN 只能查看自己部門的報告
            if (profile.role === 'DEPT_ADMIN' && targetUserId !== profile.id) {
                // 檢查目標使用者是否屬於同一部門
                const { createClient } = await import('@/lib/supabase/server');
                const supabase = await createClient();
                const { data: targetUser } = await supabase
                    .from('user_profiles')
                    .select('department_id')
                    .eq('id', targetUserId)
                    .single();

                if (targetUser?.department_id !== profile.department_id) {
                    return NextResponse.json(
                        { success: false, error: { code: 'PERMISSION_DENIED', message: '無權限查看其他部門的報告' } },
                        { status: 403 }
                    );
                }
            }

            const report = await generateUserAuditReport(targetUserId, start, end);
            if (!report) {
                return NextResponse.json(
                    { success: false, error: { code: 'NOT_FOUND', message: '找不到使用者' } },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: report });
        }
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/audit/report
 * 生成並發送稽核報告 Email
 */
export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN']); // 僅 SUPER_ADMIN 可以發送報告

        const body = await request.json();
        const { user_id, start_date, end_date, recipient_emails, scope } = body;

        if (!start_date || !end_date) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: '請提供 start_date 和 end_date' } },
                { status: 400 }
            );
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        if (scope === 'company') {
            // 公司整體報告
            const report = await generateCompanyAuditReport(start, end);
            const emails = recipient_emails || [profile.email];
            
            await sendCompanyAuditReportEmail(report.summary, emails);
            
            return NextResponse.json({
                success: true,
                message: `已發送公司整體稽核報告給 ${emails.length} 位收件人`,
            });
        } else {
            // 單一使用者報告
            if (!user_id) {
                return NextResponse.json(
                    { success: false, error: { code: 'VALIDATION_ERROR', message: '請提供 user_id' } },
                    { status: 400 }
                );
            }

            const report = await generateUserAuditReport(user_id, start, end);
            if (!report) {
                return NextResponse.json(
                    { success: false, error: { code: 'NOT_FOUND', message: '找不到使用者' } },
                    { status: 404 }
                );
            }

            const emails = recipient_emails || [report.userEmail];
            await sendUserAuditReportEmail(report, emails[0]);

            return NextResponse.json({
                success: true,
                message: `已發送 ${report.userName} 的稽核報告`,
            });
        }
    } catch (error) {
        return toApiResponse(error);
    }
}
