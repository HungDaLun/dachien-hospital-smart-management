import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LoginForm from './LoginForm';
import { Metadata } from 'next';


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return {
    title: `${dict.auth.login_title} - NEXUS`,
  };
}

export default async function LoginPage() {
  // 移除 Server Component 中的 signOut 副作用，改由 Client Component (LoginForm) 處理
  // 這避免了在渲染過程中嘗試寫入 cookie 導致的潛在導航錯誤

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <LoginForm dict={dict} />;
}
