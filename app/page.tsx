/**
 * 首頁元件
 * 顯示平台歡迎頁面或導向登入/儀表板
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          EAKAP
        </h1>
        <p className="text-gray-600 mb-8">
          企業 AI 知識庫平台
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            登入
          </a>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-white text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
          >
            進入儀表板
          </a>
        </div>
      </div>
    </main>
  );
}
