/**
 * 知識庫管理頁面
 * 顯示檔案列表與上傳功能
 * 遵循 EAKAP 設計系統規範
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FileList from '@/components/files/FileList';
import FileUploader from '@/components/files/FileUploader';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';

export default async function KnowledgePage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 檢查使用者是否已登入
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // 使用快取的查詢函數（包含 fallback 機制）
    const profile = await getCachedUserProfile(user.id);

    // 判斷是否可以上傳
    const canUpload = profile && ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR'].includes(profile.role);

    return (
        <div className="max-w-7xl mx-auto">
            {/* 頁面標題 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.knowledge.title}</h1>
                <p className="text-gray-600">
                    {dict.dashboard_home.knowledge_card_desc}
                </p>
            </div>

            {/* 上傳區域 */}
            {canUpload && (
                <div className="mb-8">
                    <FileUploader dict={dict} />
                </div>
            )}

            {/* 檔案列表 */}
            <FileList canManage={canUpload || false} dict={dict} />
        </div>
    );
}
