/**
 * 知識庫管理頁面
 * 顯示檔案列表與上傳功能
 * 遵循 EAKAP 設計系統規範
 */
import { redirect } from 'next/navigation';
import KnowledgeBaseClient from '@/components/files/KnowledgeBaseClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile, getCachedUser } from '@/lib/cache/user-profile';

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
    const { createClient } = await import('@/lib/supabase/server');
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

    return (
        <div className="max-w-7xl mx-auto">
            {/* 頁面標題 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.knowledge.title}</h1>
                <p className="text-gray-600">
                    {dict.dashboard_home.knowledge_card_desc}
                </p>
            </div>

            <KnowledgeBaseClient
                canUpload={canUpload || false}
                dict={dict}
                initialFiles={initialFiles || []}
                initialTotal={initialTotal || 0}
            />
        </div>
    );
}
