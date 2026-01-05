/**
 * Agent 列表頁面
 * 展示與管理所有 AI Agent
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import Link from 'next/link';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function AgentsPage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

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
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* 頁面標題 - 增強視覺 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-violet bg-clip-text text-transparent mb-2">
                        {dict.agents.title}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        {dict.dashboard_home.agent_card_desc}
                    </p>
                </div>
                <Link href="/dashboard/agents/new">
                    <Button variant="cta" size="lg">
                        <span className="mr-2 text-lg">✨</span> {dict.agents.create_new}
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
                        <h3 className="text-lg font-medium text-gray-900">{dict.common.no_data}</h3>
                        <p className="mt-1">{dict.dashboard_home.agent_card_desc}</p>
                        <Link href="/dashboard/agents/new" className="mt-6 inline-block">
                            <Button variant="outline">{dict.agents.create_new}</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <Card
                            key={agent.id}
                            interactive
                            className="group relative overflow-hidden"
                        >
                            {/* 裝飾性漸變背景 */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-violet/10 to-transparent rounded-full blur-2xl -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-0" />

                            <div className="relative space-y-4">
                                {/* 頂部資訊 */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-violet rounded-xl flex items-center justify-center text-white text-2xl shadow-neu-light group-hover:shadow-neu-hover transition-shadow">
                                            🤖
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-accent-violet transition-colors text-lg">
                                                {agent.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {agent.model_version}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={agent.is_active ? 'success' : 'default'}>
                                        {agent.is_active ? dict.common.status_normal || 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {/* 描述 */}
                                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                                    {agent.description || dict.common.no_data}
                                </p>

                                {/* 元資料 */}
                                <div className="pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        🏢 {agent.department?.name || dict.admin.users.department}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        👤 {agent.creator?.display_name || 'System'}
                                    </span>
                                </div>

                                {/* 操作按鈕 */}
                                <div className="pt-2 flex items-center gap-2">
                                    <Link href={`/dashboard/agents/${agent.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            ⚙️ {dict.common.settings}
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/chat?agent=${agent.id}`}>
                                        <Button variant="cta" size="sm">
                                            💬 {dict.dashboard_home.chat_card_btn}
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
