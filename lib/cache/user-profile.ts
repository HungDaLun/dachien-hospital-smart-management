/**
 * 使用者資料快取工具
 * 使用 React cache 來避免在同一個請求中重複查詢使用者資料
 */
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * 取得快取的使用者資料
 * 在同一個請求中，如果多個地方查詢相同使用者的資料，會重用結果
 */
export const getCachedUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('取得使用者資料失敗:', error);
    return null;
  }

  return profile;
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
