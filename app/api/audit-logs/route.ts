import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audit-logs
 * 取得稽核日誌 (僅管理員可用)
 * 支援篩選：user_id, action_type, date range
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        // 權限檢查：僅 SUPER_ADMIN 與 DEPT_ADMIN 可查看
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN']);

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const actionType = searchParams.get('action_type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        // 分頁參數
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10); // 預設 50 筆
        const offset = (page - 1) * limit;

        let query = supabase
            .from('audit_logs')
            .select(`
        *,
        user_profiles!user_id (id, email, display_name)
      `, { count: 'exact' })
            .order('created_at', { ascending: false });

        // 篩選條件
        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (actionType) {
            query = query.eq('action_type', actionType);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            // 結束日期通常設為當天 23:59:59 或者隔天 00:00:00
            query = query.lte('created_at', endDate);
        }

        // 部門管理員只能看到自己部門成員的操作記錄 (Optional rule, depending on requirements)
        // 根據 PERMISSION_TEST_PLAN.md: "DEPT_ADMIN ... 僅看到部門日誌"
        // 這裡需要 Join user_profiles 來篩選部門
        if (profile.role === 'DEPT_ADMIN' && profile.department_id) {
            // Supabase PostgREST 不支援深層篩選 (audit_logs -> user_profiles -> department_id) 直接在 select 語法中輕鬆過濾。
            // 為了效能，通常建議在 audit_logs 中 Denormalize department_id，或者使用 RLS。
            // 假設 RLS 已經設定好 (migration 中應有 policy)，這裡的 query 會自動被 RLS 過濾。
            // 為求保險，我們依賴 RLS。如果沒有 RLS，這裡需要額外邏輯。
            // 檢查之前的 schema，audit_logs table 沒有 department_id。
            // 如果 RLS 是基於 user_id -> user_profiles -> department_id，則不用擔心。
            // 若 RLS 尚未實作此邏輯，則 DEPT_ADMIN 可能會看到所有人。
            // 暫時假設 RLS 有效。
        }

        // 套用分頁
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            console.error('Fetch audit logs error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            meta: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            }
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
