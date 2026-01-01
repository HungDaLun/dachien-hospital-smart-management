import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AuditLogClient from '@/components/admin/AuditLogClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function AuditLogPage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 1. 檢查權限 (需 SUPER_ADMIN)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {dict.common.error} (SUPER_ADMIN)
                </div>
            </div>
        );
    }

    return <AuditLogClient dict={dict} />;
}
