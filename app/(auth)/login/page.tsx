import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LoginForm from './LoginForm';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return {
    title: `${dict.auth.login_title} - EAKAP`,
  };
}

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <LoginForm dict={dict} />;
}
