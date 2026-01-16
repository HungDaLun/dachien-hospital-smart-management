/**
 * Dashboard 圖表區塊 - 獨立 Server Component
 * 用於 Suspense Streaming SSR
 */
import React from 'react';
import dynamic from 'next/dynamic';
import { WarRoomDataProvider } from '@/lib/war-room/kpi/war-room-data-provider';
import { Activity } from 'lucide-react';

const DashboardCharts = dynamic(() => import('@/components/war-room/charts/DashboardCharts'), {
    loading: () => <div className="w-full h-96 flex items-center justify-center text-white/50">載入圖表數據中...</div>,
    ssr: false
});

interface ChartsSectionProps {
    userId: string;
}

export async function ChartsSection({ userId }: ChartsSectionProps) {
    const dataProvider = new WarRoomDataProvider();
    const dashboardData = await dataProvider.fetchAllData(userId);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <Activity size={20} className="text-primary-400" />
                <h2 className="text-xl font-bold tracking-widest uppercase text-text-primary">全維度數據可視化中心</h2>
                <span className="text-xs text-text-tertiary ml-4">30+ 核心監控指標</span>
            </div>
            <DashboardCharts data={dashboardData} />
        </div>
    );
}
