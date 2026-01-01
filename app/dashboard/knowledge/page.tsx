/**
 * 知識庫管理頁面
 * 顯示檔案列表與上傳功能
 * 遵循 EAKAP 設計系統規範
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FileList from '@/components/files/FileList';
import FileUploader from '@/components/files/FileUploader';

export default async function KnowledgePage() {
    const supabase = await createClient();

    // 檢查使用者是否已登入
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // 取得使用者資料
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, department_id')
        .eq('id', user.id)
        .single();

    // 判斷是否可以上傳
    const canUpload = profile && ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR'].includes(profile.role);

    return (
        <div className="max-w-7xl mx-auto">
            {/* 頁面標題 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">知識庫管理</h1>
                <p className="text-gray-600">
                    管理您的知識庫檔案，上傳文件並同步至 AI 系統
                </p>
            </div>

            {/* 上傳區域 */}
            {canUpload && (
                <div className="mb-8">
                    <FileUploader />
                </div>
            )}

            {/* 檔案列表 */}
            <FileList canManage={canUpload || false} />
        </div>
    );
}
