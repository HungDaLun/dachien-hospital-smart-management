/**
 * Agent 列表頁面
 * 展示與管理所有 AI Agent
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import Link from 'next/link';

export default async function AgentsPage() {
    const supabase = await createClient();

    // 1. 驗證使用者身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. 取得 Agent 列表
    const { data: agents } = await supabase
        .from('agents')
        .select(`
      *,
      creator:user_profiles!agents_created_by_fkey(display_name),
      department:departments(name)
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agent 管理</h1>
                    <p className="text-gray-600">建立與管理您的 AI Agent 工廠</p>
                </div>
                <Link href="/agents/new">
                    <Button>
                        <span className="mr-2 text-lg">+</span> 建立新 Agent
                    </Button>
                </Link>
            </div>

            {/* Agent 列表 */}
            {(!agents || agents.length === 0) ? (
                <Card>
                    <div className="text-center py-16 text-gray-500">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                            🤖
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">尚無 Agent</h3>
                        <p className="mt-1">開始建立您的第一個 AI Agent 來協助處理業務吧！</p>
                        <Link href="/agents/new" className="mt-6 inline-block">
                            <Button variant="outline">立即建立</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <Card key={agent.id} className="group hover:shadow-lg transition-shadow duration-200">
                            <div className="space-y-4">
                                {/* 頂部資訊 */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-sm">
                                            🤖
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {agent.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {agent.model_version}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={agent.is_active ? 'success' : 'default'}>
                                        {agent.is_active ? '運行中' : '已停用'}
                                    </Badge>
                                </div>

                                {/* 描述 */}
                                <p className="text-sm text-gray-600 line-clamp-2 h-10">
                                    {agent.description || '暫無描述'}
                                </p>

                                {/* 元資料 */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span>🏢 {agent.department?.name || '跨部門'}</span>
                                        <span>👤 {agent.creator?.display_name || '系統'}</span>
                                    </div>
                                </div>

                                {/* 操作按鈕 */}
                                <div className="pt-2 flex items-center gap-2">
                                    <Link href={`/agents/${agent.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            管理設定
                                        </Button>
                                    </Link>
                                    <Link href={`/chat?agent=${agent.id}`}>
                                        <Button size="sm">
                                            開始對話
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
