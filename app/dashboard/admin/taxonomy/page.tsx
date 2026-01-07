import React from 'react';
import Link from 'next/link';
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
        <div className="w-full p-6 xl:p-10 space-y-8 animate-in fade-in duration-700">
            {/* 返回按鈕 */}
            <div>
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                    <span>←</span>
                    <span>返回系統管理</span>
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">{dict.admin.taxonomy?.title || '統一分類表管理 (Unified Taxonomy)'}</h1>
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 opacity-60">
                        {dict.admin.taxonomy?.subtitle || '定義企業知識庫的標準分類架構。此分類將應用於所有上傳文件，並協助 AI 進行自動歸檔與權限劃分。'}
                    </p>
                </div>
            </div>

            <TaxonomyManager initialCategories={categories || []} />
        </div>
    );
}
