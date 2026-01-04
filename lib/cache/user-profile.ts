/**
 * 使用者資料快取工具
 * 使用 React cache 來避免在同一個請求中重複查詢使用者資料
 */
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 取得快取的使用者資料
 * 在同一個請求中，如果多個地方查詢相同使用者的資料，會重用結果
 * 
 * 如果查詢失敗（PGRST116: 沒有找到記錄或 RLS 阻擋），會使用 Admin client 直接查詢
 * 這樣可以繞過 RLS 限制，作為 fallback 機制
 */
export const getCachedUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();

  // Directly query the user profile
  // The supabase client is initialized with cookies, so RLS will work automatically
  const { data: profiles, error: queryError } = await supabase
    .from('user_profiles')
    .select('*, status')
    .eq('id', userId);

  // Handle successful query
  if (profiles && profiles.length > 0) {
    return profiles[0];
  }

  // Handle RLS or other errors
  if (queryError || !profiles || profiles.length === 0) {
    console.warn('User profile query failed or returned no data, attempting fallback...', {
      userId,
      error: queryError?.message
    });
  }

  // Fallback: Use Admin client to bypass RLS checks
  // This is useful if the user exists in Auth but not in user_profiles, or if RLS is strict
  try {
    // 使用 Admin 客戶端繞過 RLS 來查詢
    const adminClient = createAdminClient();

    const { data: adminProfile, error: adminQueryError } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!adminQueryError && adminProfile) {
      console.log('使用 Admin client 成功查詢到使用者資料');
      return adminProfile;
    }

    // 如果查詢失敗，嘗試建立記錄
    console.warn('Admin client 查詢失敗，嘗試建立記錄:', userId);
    const { data: authUserData } = await adminClient.auth.admin.getUserById(userId);

    if (authUserData?.user) {
      const { data: newProfile, error: insertError } = await adminClient
        .from('user_profiles')
        .insert({
          id: authUserData.user.id,
          email: authUserData.user.email || '',
          display_name: authUserData.user.user_metadata?.display_name || authUserData.user.email?.split('@')[0] || '使用者',
          role: 'USER',
          status: 'PENDING',
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        console.log('已使用 Admin client 自動建立使用者資料記錄');
        return newProfile;
      }
    }
  } catch (createError) {
    console.error('Admin client fallback 失敗:', createError);
  }

  console.error('取得使用者資料失敗:', {
    userId,
    returnedCount: profiles?.length || 0,
    queryError: queryError?.code,
    queryErrorMessage: queryError?.message
  });
  return null;
});

/**
 * 取得快取的使用者資訊（包含 auth user）
 * 在同一個請求中重用結果
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});
