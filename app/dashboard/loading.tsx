export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* 歡迎區塊 Skeleton */}
            <div className="mb-8">
                <div className="h-9 bg-gray-200 rounded-md w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-md w-48"></div>
            </div>

            {/* 快速操作卡片 Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-soft p-6">
                        <div className="h-6 bg-gray-200 rounded-md w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-32 mb-4"></div>
                        <div className="h-9 bg-gray-200 rounded-md w-24"></div>
                    </div>
                ))}
            </div>

            {/* 系統狀態 Skeleton */}
            <div className="bg-white rounded-lg shadow-soft p-6">
                <div className="h-6 bg-gray-200 rounded-md w-32 mb-4"></div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                        <div className="h-5 bg-gray-200 rounded-md w-16"></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                        <div className="h-5 bg-gray-200 rounded-md w-16"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
