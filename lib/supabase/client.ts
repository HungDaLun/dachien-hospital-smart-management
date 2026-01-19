/**
 * Supabase 瀏覽器端客戶端
 * 遵循後端中立性原則：使用環境變數，不硬編碼 URL
 */
import { createBrowserClient } from '@supabase/ssr';

/**
 * 建立 Supabase 瀏覽器客戶端
 * 用於在 Client Components 中使用
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '缺少 Supabase 環境變數：NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }
  });
}
