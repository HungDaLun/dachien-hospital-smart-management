/**
 * Admin 管理頁面載入骨架屏
 */
export default function AdminLoading() {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* 頁面標題 */}
            <div className="mb-8">
                <div className="h-9 bg-gray-200 rounded-md w-40 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md w-64"></div>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-soft p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded-md w-20 mb-2"></div>
                                <div className="h-7 bg-gray-200 rounded-md w-12"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 管理區塊 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 使用者列表 */}
                <div className="bg-white rounded-lg shadow-soft p-6">
                    <div className="h-6 bg-gray-200 rounded-md w-32 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded-md w-32 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded-md w-40"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 部門列表 */}
                <div className="bg-white rounded-lg shadow-soft p-6">
                    <div className="h-6 bg-gray-200 rounded-md w-32 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
