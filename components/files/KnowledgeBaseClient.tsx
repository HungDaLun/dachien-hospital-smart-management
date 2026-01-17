'use client';

import { useState, useCallback } from 'react';
import FileList from './FileList';
import FileUploader from './FileUploader';
import { Dictionary } from '@/lib/i18n/dictionaries';
import type { FileData } from './FileCard';

interface KnowledgeBaseClientProps {
    canUpload: boolean;
    dict: Dictionary;
    initialFiles?: FileData[];
    initialTotal?: number;
}

export default function KnowledgeBaseClient({ canUpload, dict, initialFiles, initialTotal }: KnowledgeBaseClientProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <>
            {/* 上傳區域 */}
            {canUpload && (
                <div className="mb-8">
                    <FileUploader dict={dict} onUploadSuccess={handleUploadSuccess} />
                </div>
            )}

            {/* 檔案列表 */}
            <FileList
                canManage={canUpload}
                dict={dict}
                refreshTrigger={refreshTrigger}
                initialFiles={initialFiles}
                initialTotal={initialTotal}
            />
        </>
    );
}
