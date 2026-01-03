/**
 * 檔案預覽 Modal
 * 顯示檔案原始內容（MD, CSV, Text 等）
 */
'use client';

import { Modal, Button, Spinner } from '@/components/ui';
import { useState, useEffect } from 'react';
import { FileData } from './FileCard';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileData;
    dict: Dictionary;
}

export default function FilePreviewModal({ isOpen, onClose, file, dict }: FilePreviewModalProps) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && file) {
            fetchContent();
        }
    }, [isOpen, file]);

    const fetchContent = async () => {
        setLoading(true);
        setError(null);
        try {
            // 如果已有 markdown_content 則優先使用 (這是已經 ETL 過的乾淨內容)
            if ((file as any).markdown_content) {
                setContent((file as any).markdown_content);
                setLoading(false);
                return;
            }

            // 否則從下載連結抓取內容
            const dlRes = await fetch(`/api/files/${file.id}/download`);
            const dlData = await dlRes.json();

            if (dlRes.ok && dlData.data?.url) {
                const res = await fetch(dlData.data.url);
                const text = await res.text();
                setContent(text);
            } else {
                throw new Error('無法取得檔案內容');
            }
        } catch (e) {
            console.error(e);
            setError('內容載入失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${dict.common.view || '預覽'}: ${file.filename}`}
            size="lg"
        >
            <div className="min-h-[400px] max-h-[70vh] overflow-auto bg-gray-50 rounded-lg p-4 font-mono text-sm border border-gray-200">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Spinner size="lg" />
                        <p className="text-gray-400">正在讀取原始資料...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        {error}
                    </div>
                ) : (
                    <pre className="whitespace-pre-wrap break-all text-gray-800 leading-relaxed">
                        {content}
                    </pre>
                )}
            </div>
            <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                    {dict.common.close || '關閉'}
                </Button>
            </div>
        </Modal>
    );
}
