import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';
import SettingsForm from './SettingsForm';
import { Card } from '@/components/ui';


export default async function SettingsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // 檢查使用者是否已登入
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // 取得使用者資料
  const profile = await getCachedUserProfile(user.id);

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          無法載入使用者資料，請重新整理頁面或聯繫管理員。
        </div>
      </div>
    );
  }

  // 取得部門資訊（如果有的話）
  let departmentName: string | null = null;
  if (profile.department_id) {
    const { data: department } = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single();
    departmentName = department?.name || null;
  }

  return (
    <div className="w-full p-4 md:p-6 bg-background-primary text-text-primary min-h-screen">

      <Card variant="glass">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">{dict.settings.profile_section}</h2>
          <SettingsForm
            profile={profile}
            email={user.email || ''}
            departmentName={departmentName}
            dict={dict}
          />
        </div>
      </Card>
    </div>
  );
}