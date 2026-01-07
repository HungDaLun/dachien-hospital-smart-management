'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncIntelligenceButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/dashboard/intelligence/sync', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message || '同步完成');
                router.refresh();
            } else {
                alert(`同步失敗：${data.error || '不明錯誤'}${data.details ? '\n詳情：' + data.details : ''}`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            alert('連線失敗，請稍後再試。');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-white/10 hover:border-primary-500/50 hover:bg-primary-500/10 text-[10px] font-black uppercase tracking-widest px-4"
        >
            <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? '同步中...' : '同步最新情報'}
        </Button>
    );
}
