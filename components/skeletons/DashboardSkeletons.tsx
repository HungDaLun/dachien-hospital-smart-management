/**
 * Dashboard 專用骨架屏元件
 * 用於 Suspense 邊界的 fallback，實現 Streaming SSR 漸進式載入
 */
import React from 'react';

/**
 * KPI 卡片骨架屏 - 四張 KPI 卡片的載入狀態
 */
export function KPICardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
                >
                    {/* 閃爍動畫效果 */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                    {/* 標題骨架 */}
                    <div className="h-4 w-24 bg-white/10 rounded mb-4 animate-pulse" />

                    {/* 數值骨架 */}
                    <div className="h-10 w-20 bg-white/10 rounded mb-2 animate-pulse" />

                    {/* 副標題骨架 */}
                    <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}

/**
 * AI 洞察區塊骨架屏
 */
export function AIInsightSkeleton() {
    return (
        <div className="glass-ai p-8 rounded-3xl flex flex-col lg:flex-row items-stretch gap-8 relative overflow-hidden">
            {/* 閃爍動畫效果 */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* 左側 AI 圖示區 */}
            <div className="flex flex-col items-center justify-center lg:w-48 gap-4 border-r border-white/5 pr-8">
                <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-white/5 rounded animate-pulse mx-auto" />
                </div>
            </div>

            {/* 右側內容區 */}
            <div className="flex-1 space-y-4">
                <div className="h-6 w-64 bg-white/10 rounded animate-pulse" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

/**
 * 部門矩陣骨架屏
 */
export function DepartmentMatrixSkeleton() {
    return (
        <div className="glass-card p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-56 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600/30 to-indigo-400/30 animate-pulse"
                                style={{ width: '60%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 風險監控牆骨架屏
 */
export function RiskMonitorSkeleton() {
    return (
        <div className="glass-danger p-8 rounded-3xl h-full relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02]">
                        <div className="mt-1 h-2 w-2 rounded-full bg-white/20 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 圖表區塊骨架屏
 */
export function ChartsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="h-5 w-5 bg-primary-400/30 rounded animate-pulse" />
                <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-96 bg-white/[0.02] rounded-3xl border border-white/5 flex items-center justify-center">
                <div className="text-white/30 text-sm animate-pulse">載入數據視覺化中心...</div>
            </div>
        </div>
    );
}

/**
 * 狀態列骨架屏
 */
export function StatusBarSkeleton() {
    return (
        <div className="flex flex-wrap gap-4 justify-end">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="h-9 w-28 rounded-full bg-white/5 border border-white/10 animate-pulse"
                />
            ))}
        </div>
    );
}
