/**
 * Knowledge 頁面載入骨架屏
 */
export default function KnowledgeLoading() {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* 頁面標題 */}
            <div className="mb-8">
                <div className="h-9 bg-gray-200 rounded-md w-48 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md w-64"></div>
            </div>

            {/* 上傳區域骨架 */}
            <div className="bg-white rounded-lg shadow-soft p-6 mb-6 border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-40"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-32"></div>
                </div>
            </div>

            {/* 檔案列表骨架 */}
            <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                {/* 表頭 */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded-md w-24"></div>
                        <div className="flex gap-2">
                            <div className="h-9 bg-gray-200 rounded-md w-32"></div>
                            <div className="h-9 bg-gray-200 rounded-md w-24"></div>
                            <div className="h-9 bg-gray-200 rounded-md w-24"></div>
                        </div>
                    </div>
                </div>

                {/* 表格列 */}
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded-md w-48 mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded-md w-32"></div>
                            </div>
                            <div className="h-5 bg-gray-200 rounded-md w-20"></div>
                            <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
