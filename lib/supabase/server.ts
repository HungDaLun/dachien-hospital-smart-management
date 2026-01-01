/**
 * Supabase 伺服器端客戶端
 * 用於 Server Components 和 API Routes
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 建立 Supabase 伺服器客戶端
 * 用於在 Server Components 和 API Routes 中使用
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '缺少 Supabase 環境變數：NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 在 Server Actions 中可能無法設定 cookies
        }
      },
    },
  });
}
