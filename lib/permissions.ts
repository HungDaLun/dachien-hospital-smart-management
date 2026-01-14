/**
 * 權限檢查工具函式庫
 * 遵循 EAKAP 權限矩陣規範
 */
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import type { UserRole } from '@/types';

/**
 * 使用者資料介面（包含角色與部門資訊）
 */
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * 取得當前使用者的完整資料（包含角色與部門）
 * 使用 React cache 確保同一請求中多次呼叫只執行一次查詢
 * 如果查詢失敗，會使用 Admin client 作為 fallback
 */
export const getCurrentUserProfile = cache(async (): Promise<UserProfile> => {
  const supabase = await createClient();

  // 驗證使用者身份
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new AuthenticationError();
  }

  // 取得使用者資料（包含狀態）
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, role, department_id, status')
    .eq('id', user.id)
    .single();

  // 如果查詢失敗，使用 Admin client 作為 fallback
  if (error || !profile) {
    // 無論錯誤代碼是什麼，都嘗試使用 Admin client 作為 fallback
    console.warn('getCurrentUserProfile: 查詢失敗，使用 Admin client fallback:', {
      userId: user.id,
      errorCode: error?.code,
      errorMessage: error?.message
    });

    try {
      const adminClient = createAdminClient();
      const { data: adminProfile, error: adminError } = await adminClient
        .from('user_profiles')
        .select('id, role, department_id, status')
        .eq('id', user.id)
        .single();

      if (!adminError && adminProfile) {
        console.log('getCurrentUserProfile: Admin client fallback 成功');
        return {
          id: adminProfile.id,
          email: user.email!,
          role: adminProfile.role as UserRole,
          department_id: adminProfile.department_id,
          status: adminProfile.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
        };
      } else {
        console.error('getCurrentUserProfile: Admin client fallback 查詢失敗:', {
          adminError: adminError?.code,
          adminErrorMessage: adminError?.message
        });
      }
    } catch (fallbackError) {
      console.error('getCurrentUserProfile: Admin client fallback 異常:', fallbackError);
    }

    throw new AuthenticationError('無法取得使用者資料');
  }

  return {
    id: profile.id,
    email: user.email!,
    role: profile.role as UserRole,
    department_id: profile.department_id,
    status: profile.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
  };
});

/**
 * 檢查使用者是否具有指定角色
 */
export function hasRole(profile: UserProfile, roles: UserRole[]): boolean {
  return roles.includes(profile.role);
}

/**
 * 檢查使用者是否已審核通過
 */
export function isApproved(profile: UserProfile): boolean {
  return profile.status === 'APPROVED';
}

/**
 * 檢查使用者是否待審核
 */
export function isPending(profile: UserProfile): boolean {
  return profile.status === 'PENDING';
}

/**
 * 檢查使用者是否為管理員（SUPER_ADMIN 或 DEPT_ADMIN）
 */
export function isAdmin(profile: UserProfile): boolean {
  return hasRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN']);
}

/**
 * 檢查使用者是否為超級管理員
 */
export function isSuperAdmin(profile: UserProfile): boolean {
  return profile.role === 'SUPER_ADMIN';
}

/**
 * 檢查使用者是否為部門管理員
 */
export function isDeptAdmin(profile: UserProfile): boolean {
  return profile.role === 'DEPT_ADMIN';
}

/**
 * 檢查使用者是否為知識維護者
 */
export function isEditor(profile: UserProfile): boolean {
  return profile.role === 'EDITOR';
}

/**
 * 檢查使用者是否可以存取指定部門的資源
 * SUPER_ADMIN 可以存取所有部門
 * DEPT_ADMIN 只能存取自己的部門
 */
export function canAccessDepartment(
  profile: UserProfile,
  targetDepartmentId: string | null
): boolean {
  // SUPER_ADMIN 可以存取所有部門
  if (isSuperAdmin(profile)) {
    return true;
  }

  // 如果目標沒有部門限制，所有人都可以存取
  if (!targetDepartmentId) {
    return true;
  }

  // DEPT_ADMIN 只能存取自己的部門
  if (isDeptAdmin(profile)) {
    return profile.department_id === targetDepartmentId;
  }

  // 其他角色依部門判斷
  return profile.department_id === targetDepartmentId;
}

/**
 * 檢查使用者是否可以修改指定使用者
 * SUPER_ADMIN 可以修改所有人（除了其他 SUPER_ADMIN）
 * DEPT_ADMIN 只能修改同部門的使用者（且不能修改 SUPER_ADMIN）
 */
export async function canModifyUser(
  profile: UserProfile,
  targetUserId: string
): Promise<boolean> {
  // 不能修改自己（透過其他機制處理）
  if (profile.id === targetUserId) {
    return false;
  }

  // SUPER_ADMIN 可以修改所有人（除了其他 SUPER_ADMIN）
  if (isSuperAdmin(profile)) {
    const supabase = await createClient();
    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', targetUserId)
      .single();

    // 不能修改其他 SUPER_ADMIN
    return targetProfile?.role !== 'SUPER_ADMIN';
  }

  // DEPT_ADMIN 只能修改同部門的使用者
  if (isDeptAdmin(profile)) {
    const supabase = await createClient();
    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('role, department_id')
      .eq('id', targetUserId)
      .single();

    // 不能修改 SUPER_ADMIN 或其他部門的使用者
    if (!targetProfile || targetProfile.role === 'SUPER_ADMIN') {
      return false;
    }

    return targetProfile.department_id === profile.department_id;
  }

  // 其他角色不能修改使用者
  return false;
}

/**
 * 檢查使用者是否可以存取指定檔案
 * SUPER_ADMIN 可存取所有
 * DEPT_ADMIN 可存取部門內
 * EDITOR/USER 可存取自己上傳或授權標籤的
 */
export async function canAccessFile(
  profile: UserProfile,
  fileId: string
): Promise<boolean> {
  const supabase = await createClient();

  // SUPER_ADMIN 可以看所有檔案
  if (isSuperAdmin(profile)) {
    return true;
  }

  // 取得檔案資訊
  const { data: file } = await supabase
    .from('files')
    .select('uploaded_by, file_tags(tag_key, tag_value)')
    .eq('id', fileId)
    .single();

  if (!file) {
    return false;
  }

  // 自己上傳的
  if (file.uploaded_by === profile.id) {
    return true;
  }

  // 檢查標籤權限 (部門標籤)
  const tags = file.file_tags as Array<{ tag_key: string; tag_value: string }>;

  // DEPT_ADMIN 檢查部門
  if (isDeptAdmin(profile)) {
    // 我們需要獲取部門名稱來匹配標籤
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single();

    if (dept) {
      const hasDeptTag = tags.some(tag => tag.tag_key === 'department' && tag.tag_value === dept.name);
      if (hasDeptTag) return true;
    }
  }

  // 檢查 EDITOR 的標籤權限
  const hasTagPermission = await EXISTS_TAG_PERM(profile.id, tags);
  if (hasTagPermission) return true;

  return false;
}

/**
 * 檢查使用者是否可以修改指定檔案
 */
export async function canUpdateFile(
  profile: UserProfile,
  fileId: string
): Promise<boolean> {
  // 邏輯基本上跟刪除類似，只有 EDITOR 限制較嚴格
  return canDeleteFile(profile, fileId);
}

/**
 * 檢查使用者是否可以刪除指定檔案
 * SUPER_ADMIN 可以刪除所有檔案
 * DEPT_ADMIN 可以刪除部門檔案
 * EDITOR 只能刪除自己上傳的檔案
 */
export async function canDeleteFile(
  profile: UserProfile,
  fileId: string
): Promise<boolean> {
  const supabase = await createClient();

  // 取得檔案資訊
  const { data: file } = await supabase
    .from('files')
    .select('uploaded_by, file_tags(tag_key, tag_value)')
    .eq('id', fileId)
    .single();

  if (!file) {
    return false;
  }

  // SUPER_ADMIN 可以刪除所有檔案
  if (isSuperAdmin(profile)) {
    return true;
  }

  // DEPT_ADMIN 可以刪除部門檔案
  if (isDeptAdmin(profile)) {
    // 我們需要獲取部門名稱來匹配標籤
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single();

    const departmentTag = (file.file_tags as Array<{ tag_key: string; tag_value: string }>)
      .find(tag => tag.tag_key === 'department');

    if (dept && departmentTag && departmentTag.tag_value === dept.name) {
      return true;
    }
  }

  // EDITOR 只能刪除自己上傳的檔案
  if (isEditor(profile)) {
    return file.uploaded_by === profile.id;
  }

  return false;
}

// 輔助函式：檢查是否有標籤權限
async function EXISTS_TAG_PERM(userId: string, tags: Array<{ tag_key: string; tag_value: string }>): Promise<boolean> {
  if (tags.length === 0) return false;

  const supabase = await createClient();

  // ✅ 修復：單一批次查詢
  const tagConditions = tags.map(tag =>
    `and(tag_key.eq.${tag.tag_key},tag_value.eq.${tag.tag_value})`
  ).join(',');

  const { data, error } = await supabase
    .from('user_tag_permissions')
    .select('id')
    .eq('user_id', userId)
    .or(tagConditions)
    .limit(1);

  if (error) {
    console.error('[Permission] Tag permission check failed:', error);
    return false;
  }

  return !!(data && data.length > 0);
}

/**
 * 檢查使用者是否可以存取指定 Agent
 * 需要檢查 Agent 的存取控制規則
 */
export async function canAccessAgent(
  profile: UserProfile,
  agentId: string
): Promise<boolean> {
  const supabase = await createClient();

  // SUPER_ADMIN 可以存取所有 Agent
  if (isSuperAdmin(profile)) {
    return true;
  }

  // 取得 Agent 資訊
  const { data: agent } = await supabase
    .from('agents')
    .select('department_id, agent_access_control(*)')
    .eq('id', agentId)
    .single();

  if (!agent) {
    return false;
  }

  // DEPT_ADMIN 可以存取部門的 Agent
  if (isDeptAdmin(profile)) {
    if (agent.department_id === profile.department_id) {
      return true;
    }
  }

  // 檢查 Agent 存取控制規則
  const accessControls = agent.agent_access_control as Array<{
    user_id: string | null;
    department_id: string | null;
    can_access: boolean;
  }>;

  // 檢查使用者層級的存取控制
  const userAccess = accessControls.find(ac => ac.user_id === profile.id);
  if (userAccess) {
    return userAccess.can_access;
  }

  // 檢查部門層級的存取控制
  if (profile.department_id) {
    const deptAccess = accessControls.find(ac => ac.department_id === profile.department_id);
    if (deptAccess) {
      return deptAccess.can_access;
    }
  }

  // 預設：USER 角色需要明確授權，其他角色可以存取
  return profile.role !== 'USER';
}

/**
 * 要求使用者必須具有指定角色（否則拋出錯誤）
 */
export function requireRole(profile: UserProfile, roles: UserRole[]): void {
  if (!hasRole(profile, roles)) {
    throw new AuthorizationError(
      `此操作需要以下角色之一：${roles.join(', ')}`
    );
  }
}

/**
 * 要求使用者必須為管理員（否則拋出錯誤）
 */
export function requireAdmin(profile: UserProfile): void {
  if (!isAdmin(profile)) {
    throw new AuthorizationError('此操作需要管理員權限');
  }
}

/**
 * 要求使用者必須為超級管理員（否則拋出錯誤）
 */
export function requireSuperAdmin(profile: UserProfile): void {
  if (!isSuperAdmin(profile)) {
    throw new AuthorizationError('此操作需要超級管理員權限');
  }
}
