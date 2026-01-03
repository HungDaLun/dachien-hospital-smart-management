/**
 * Brain/Galaxy Graph 頁面載入狀態
 */
export default function BrainLoading() {
    return (
        <div className="h-[calc(100vh-4rem)] -m-6 flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
            {/* 頁面標題區 */}
            <div className="border-b px-6 py-3 bg-white flex justify-between items-center shadow-sm z-10">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded-md w-48 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-64"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            </div>

            {/* Galaxy 載入動畫 */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* 星空背景效果 */}
                <div
                    className="absolute inset-0 opacity-50"
                    style={{
                        backgroundImage: `
                            radial-gradient(2px 2px at 20% 30%, rgba(6, 182, 212, 0.6), transparent),
                            radial-gradient(2px 2px at 60% 70%, rgba(14, 165, 233, 0.6), transparent),
                            radial-gradient(1.5px 1.5px at 50% 50%, rgba(16, 185, 129, 0.5), transparent),
                            radial-gradient(1.5px 1.5px at 80% 10%, rgba(139, 92, 246, 0.6), transparent)
                        `,
                    }}
                />

                {/* 載入指示器 */}
                <div className="flex flex-col items-center gap-4 z-10">
                    {/* 脈動圓環 */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-accent-cyan/30 animate-ping absolute"></div>
                        <div className="w-20 h-20 rounded-full border-4 border-accent-cyan animate-spin border-t-transparent"></div>
                    </div>

                    <span className="text-gray-300 font-medium animate-pulse text-lg">
                        🌌 Mapping Neural Galaxy...
                    </span>

                    <p className="text-gray-500 text-sm">
                        正在載入知識網絡視覺化
                    </p>
                </div>
            </div>
        </div>
    );
}
