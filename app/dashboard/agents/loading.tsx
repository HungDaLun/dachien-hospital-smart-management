/**
 * Agents 頁面載入骨架屏
 */
export default function AgentsLoading() {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* 頁面標題 */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-9 bg-gray-200 rounded-md w-48 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-72"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>

            {/* Agent 卡片網格骨架 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-soft p-6">
                        {/* Agent Icon & Name */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div>
                                <div className="h-5 bg-gray-200 rounded-md w-32 mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded-md w-20"></div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 mb-4">
                            <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <div className="h-9 bg-gray-200 rounded-md flex-1"></div>
                            <div className="h-9 bg-gray-200 rounded-md flex-1"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
