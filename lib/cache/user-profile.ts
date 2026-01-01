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
  
  // 先驗證使用者身份並確保認證狀態正確
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser || authUser.id !== userId) {
    console.error('身份驗證失敗:', { userId, authError, authUserId: authUser?.id });
    return null;
  }
  
  // 關鍵修復：確保 session 已正確載入，這樣 RLS 政策中的 auth.uid() 才能正確運作
  // 先取得 session 來確保 JWT token 已載入到 Supabase client
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Session 載入失敗:', { userId, sessionError });
    return null;
  }
  
  // 確保認證狀態已正確設定（這對於 RLS 政策很重要）
  // 在查詢前先確認 auth.uid() 會返回正確的值
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 查詢使用者資料:', {
      userId,
      authUserId: authUser.id,
      sessionUserId: session.user.id,
      email: authUser.email,
      hasAccessToken: !!session.access_token
    });
  }
  
  // 關鍵診斷：先不使用 .single()，檢查實際返回的記錄數
  // 這樣可以診斷是返回 0 筆（RLS 阻擋）還是多筆（重複記錄）
  const { data: profiles, error: queryError, count } = await supabase
    .from('user_profiles')
    .select('*, status', { count: 'exact' })
    .eq('id', userId);
  
  // 診斷：檢查返回的記錄數
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 RLS 查詢診斷:', {
      userId,
      returnedCount: profiles?.length || 0,
      totalCount: count || 0,
      hasError: !!queryError,
      errorCode: queryError?.code,
      errorMessage: queryError?.message,
      // 診斷：如果返回 0 筆，表示 RLS 阻擋（auth.uid() 返回 NULL）
      // 如果返回多筆，表示有重複記錄
      diagnosis: profiles?.length === 0 
        ? '❌ RLS 阻擋：auth.uid() 可能返回 NULL（JWT token 未正確傳遞到資料庫）' 
        : profiles?.length === 1 
        ? '✅ 查詢成功' 
        : `⚠️ 發現 ${profiles?.length} 筆重複記錄`
    });
  }
  
  // 處理查詢結果
  if (queryError) {
    // 查詢失敗，觸發 fallback
    console.warn('查詢失敗，觸發 fallback:', {
      userId,
      errorCode: queryError.code,
      errorMessage: queryError.message
    });
    // 繼續 fallback 邏輯
  } else if (profiles && profiles.length === 1) {
    // 成功返回 1 筆記錄
    return profiles[0];
  } else if (profiles && profiles.length > 1) {
    // 發現多筆記錄（不應該發生，但處理它）
    console.warn('⚠️ 發現多筆記錄，返回第一筆:', { userId, count: profiles.length });
    return profiles[0];
  } else if (profiles && profiles.length === 0) {
    // 返回 0 筆，表示 RLS 阻擋
    console.warn('❌ RLS 阻擋：查詢返回 0 筆記錄，auth.uid() 可能返回 NULL');
    // 觸發 fallback
  }
  
  // Fallback：使用 Admin client 查詢
  // 這表示 RLS 阻擋了查詢，或查詢失敗
  console.warn('使用者資料查詢失敗（可能是 RLS 限制），嘗試使用 Admin client:', {
    userId,
    authUserId: authUser?.id,
    sessionUserId: session?.user?.id,
    sessionExists: !!session,
    hasAccessToken: !!session?.access_token,
    returnedCount: profiles?.length || 0,
    // 檢查 auth.uid() 是否正確設定
    authUidMatch: authUser?.id === userId && session?.user?.id === userId,
    // 如果 session 存在但查詢仍失敗，可能是 JWT 未正確傳遞到資料庫
    possibleIssue: !session?.access_token 
      ? 'JWT token 不存在' 
      : profiles?.length === 0
      ? 'RLS 阻擋：auth.uid() 返回 NULL（JWT token 未正確傳遞到資料庫層面）'
      : '其他問題'
  });
  
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
