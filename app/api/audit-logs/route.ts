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

        // 部門過濾：DEPT_ADMIN 只能看到自己部門的記錄
        // 此功能已透過 RLS 政策實作（migration: 20260127000000_fix_audit_logs_schema.sql）
        // RLS 政策會自動根據 audit_logs.department_id 過濾記錄
        // 因此這裡不需要額外的應用層過濾邏輯

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
