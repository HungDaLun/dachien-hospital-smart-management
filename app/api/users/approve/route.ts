/**
 * 審核使用者 API 端點
 * POST /api/users/approve
 * 管理員審核使用者並設定角色
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from '@/lib/permissions';
import { ValidationError, AuthorizationError, toApiResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // 檢查管理員權限
    const currentUser = await getCurrentUserProfile();
    if (!currentUser || !['SUPER_ADMIN', 'DEPT_ADMIN'].includes(currentUser.role)) {
      throw new AuthorizationError('此操作需要管理員權限');
    }

    const body = await request.json();
    const { userId, status, role, departmentId } = body;

    // 驗證必填欄位
    if (!userId || !status) {
      throw new ValidationError('請提供使用者 ID 和審核狀態');
    }

    // 驗證狀態值
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new ValidationError('審核狀態必須為 APPROVED 或 REJECTED');
    }

    // 如果審核通過，必須提供角色
    if (status === 'APPROVED' && !role) {
      throw new ValidationError('審核通過時必須指定角色');
    }

    // 驗證角色值
    if (role && !['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR', 'USER'].includes(role)) {
      throw new ValidationError('無效的角色');
    }

    // 只有 SUPER_ADMIN 可以設定 SUPER_ADMIN 或 DEPT_ADMIN 角色
    if (role && ['SUPER_ADMIN', 'DEPT_ADMIN'].includes(role) && currentUser.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('只有超級管理員可以設定管理員角色');
    }

    const adminClient = createAdminClient();

    // 更新使用者狀態和角色
    const updateData: {
      status: string;
      role?: string;
      department_id?: string | null;
    } = {
      status,
    };

    if (status === 'APPROVED') {
      updateData.role = role;
      if (departmentId) {
        updateData.department_id = departmentId;
      } else if (role === 'DEPT_ADMIN' || role === 'EDITOR' || role === 'USER') {
        // 如果沒有指定部門，且當前使用者是部門管理員，使用當前使用者的部門
        if (currentUser.role === 'DEPT_ADMIN' && currentUser.department_id) {
          updateData.department_id = currentUser.department_id;
        }
      }
    }

    const { data: updatedUser, error: updateError } = await adminClient
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('更新使用者狀態失敗:', updateError);
      throw new ValidationError('更新使用者狀態失敗');
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: status === 'APPROVED' 
          ? '使用者已審核通過' 
          : '使用者已拒絕',
      },
    });

  } catch (error) {
    return toApiResponse(error);
  }
}
