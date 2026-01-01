import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AuditLogClient from '@/components/admin/AuditLogClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';

export default async function AuditLogPage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 1. 檢查權限（直接依賴 RLS 政策）
    // 使用 getCachedUserProfile 來查詢自己的資料（可能需要自動建立記錄）
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const profile = await getCachedUserProfile(user.id);

    // 檢查是否為 SUPER_ADMIN（RLS 會確保只有 SUPER_ADMIN 可以查詢稽核日誌）
    if (!profile || profile.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {dict.common.error}: {!profile ? '無法取得使用者資料' : '需要 SUPER_ADMIN 權限'}
                </div>
            </div>
        );
    }

    return <AuditLogClient dict={dict} />;
}
