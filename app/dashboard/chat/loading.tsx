/**
 * Chat 頁面載入骨架屏
 */
export default function ChatLoading() {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* 頁面標題 */}
            <div className="mb-8">
                <div className="h-9 bg-gray-200 rounded-md w-40 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md w-56"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
                {/* Agent 選擇區 */}
                <div className="bg-white rounded-lg shadow-soft p-4">
                    <div className="h-6 bg-gray-200 rounded-md w-24 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded-md w-24 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded-md w-32"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 對話區 */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-soft flex flex-col">
                    {/* 對話頭部 */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div>
                                <div className="h-5 bg-gray-200 rounded-md w-32 mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded-md w-20"></div>
                            </div>
                        </div>
                    </div>

                    {/* 對話內容 */}
                    <div className="flex-1 p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                                <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-primary-100' : 'bg-gray-100'} rounded-lg p-4`}>
                                    <div className="h-4 bg-gray-200/50 rounded-md w-48 mb-2"></div>
                                    <div className="h-4 bg-gray-200/50 rounded-md w-32"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 輸入區 */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex gap-3">
                            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
