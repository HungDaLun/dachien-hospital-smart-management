import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LoginForm from './LoginForm';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return {
    title: `${dict.auth.login_title} - EAKAP`,
  };
}

export default async function LoginPage() {
  // 重要：在伺服器端清除任何殘留的 session
  // 這樣可以確保使用者訪問登入頁面時，不會因為有 session 而被重定向
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // 如果有 session，清除它，強制使用者重新登入
  if (session) {
    await supabase.auth.signOut();
  }

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <LoginForm dict={dict} />;
}
