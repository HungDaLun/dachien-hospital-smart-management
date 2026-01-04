import React from 'react';
import { getCategories } from '@/lib/actions/taxonomy';
import TaxonomyManager from '@/components/admin/taxonomy/TaxonomyManager';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';

export default async function TaxonomyPage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 檢查權限（與其他管理頁面一致）
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const profile = await getCachedUserProfile(user.id);

    // 檢查是否為 SUPER_ADMIN（分類管理需要 SUPER_ADMIN 權限）
    if (!profile || profile.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {dict.common.error}: {!profile ? '無法取得使用者資料' : '需要 SUPER_ADMIN 權限'}
                </div>
            </div>
        );
    }

    const { data: categories, error } = await getCategories();

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" />
                    讀取分類失敗: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">統一分類表管理 (Unified Taxonomy)</h1>
                <p className="text-gray-600">
                    定義企業知識庫的標準分類架構。此分類將應用於所有上傳文件，並協助 AI 進行自動歸檔與權限劃分。
                </p>
            </div>

            <TaxonomyManager initialCategories={categories || []} />
        </div>
    );
}
