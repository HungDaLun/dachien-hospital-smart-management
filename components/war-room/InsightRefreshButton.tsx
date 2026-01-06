'use client';

import React, { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

interface InsightRefreshButtonProps {
    onRefresh?: (newInsight: string) => void;
}

const InsightRefreshButton: React.FC<InsightRefreshButtonProps> = ({ onRefresh }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleRefresh = async () => {
        setIsLoading(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/dashboard/refresh-insight', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                if (onRefresh) {
                    onRefresh(data.content);
                }
                // 1.5 秒後刷新頁面以顯示新內容
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setStatus('error');
                console.error('Refresh failed:', data.error);
            }
        } catch (error) {
            setStatus('error');
            console.error('Refresh error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
        transition-all duration-300 border
        ${isLoading
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 cursor-wait'
                    : status === 'success'
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : status === 'error'
                            ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400'
                }
      `}
        >
            {isLoading ? (
                <>
                    <RefreshCw size={14} className="animate-spin" />
                    AI 分析中...
                </>
            ) : status === 'success' ? (
                <>
                    <Check size={14} />
                    更新完成
                </>
            ) : status === 'error' ? (
                <>
                    <AlertCircle size={14} />
                    更新失敗
                </>
            ) : (
                <>
                    <RefreshCw size={14} />
                    立即更新
                </>
            )}
        </button>
    );
};

export default InsightRefreshButton;
