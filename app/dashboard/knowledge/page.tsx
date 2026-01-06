import { redirect } from 'next/navigation';
import ControlCenter from '@/components/knowledge/ControlCenter';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile, getCachedUser } from '@/lib/cache/user-profile';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import { Library } from 'lucide-react';


export default async function KnowledgePage() {
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 檢查使用者是否已登入
    const user = await getCachedUser();

    if (!user) {
        redirect('/login');
    }

    // 使用快取的查詢函數（包含 fallback 機制）
    const profile = await getCachedUserProfile(user.id);

    // 判斷是否可以上傳
    const canUpload = profile && ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR'].includes(profile.role);

    // --- SSR: 預先抓取第一頁檔案資料 ---
    const supabase = await createClient();

    let query = supabase
        .from('files')
        .select(`
            *,
            file_tags (id, tag_key, tag_value),
            user_profiles (display_name, email)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // 權限過濾 (EDITOR 只能看自己)
    if (profile?.role === 'EDITOR') {
        query = query.eq('uploaded_by', user.id);
    }

    // 預設抓取第 1 頁，每頁 50 筆
    const { data: initialFiles, count: initialTotal } = await query.range(0, 49);

    // --- SSR: 抓取部門資料 (For Graph Filter) ---
    // 即使不是 SUPER_ADMIN，也抓取部門以便標示
    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    return (
        <div className="w-full h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-background-primary px-6 xl:px-10 py-6">
            <PageHeader
                title="知識管理"
                icon={Library}
            />
            <div className="flex-1 overflow-hidden relative">
                <ControlCenter
                    canUpload={canUpload || false}
                    dict={dict}
                    initialFiles={initialFiles || []}
                    initialTotal={initialTotal || 0}
                    initialDepartments={departments || []}
                    currentUserRole={profile?.role}
                />
            </div>
        </div>
    );
}

