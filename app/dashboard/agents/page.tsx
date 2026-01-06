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
import PageHeader from '@/components/layout/PageHeader';
import { Bot, Sparkles } from 'lucide-react';


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
        <div className="w-full px-6 xl:px-10 py-6 space-y-6 bg-background-primary text-text-primary min-h-screen">
            {/* 頁面標題 - 使用統一組件 */}
            <PageHeader
                title="智能代理"
                icon={Bot}
                actions={
                    <Link href="/dashboard/agents/new">
                        <Button variant="cta" size="lg">
                            <Sparkles size={18} className="mr-2" /> {dict.agents.create_new}
                        </Button>
                    </Link>
                }
            />


            {/* Agent 列表 */}
            {(!agents || agents.length === 0) ? (
                <Card variant="glass" className="border-dashed border-white/5">
                    <div className="text-center py-16 text-text-tertiary">
                        <div className="w-20 h-20 mx-auto mb-6 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center text-4xl shadow-inner">
                            🤖
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">{dict.common.no_data}</h3>
                        <p className="text-sm">{dict.dashboard_home.agent_card_desc}</p>
                        <Link href="/dashboard/agents/new" className="mt-8 inline-block">
                            <Button variant="outline">{dict.agents.create_new}</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:border-primary-500/50 transition-all">
                                            🤖
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-primary group-hover:text-primary-400 transition-colors text-lg">
                                                {agent.name}
                                            </h3>
                                            <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider">
                                                {agent.model_version}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={agent.is_active ? 'success' : 'default'}>
                                        {agent.is_active ? dict.common.status_normal || 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {/* 描述 */}
                                <p className="text-sm text-text-secondary line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                    {agent.description || dict.common.no_data}
                                </p>

                                {/* 元資料 */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03]">
                                        🏢 {agent.department?.name || dict.admin.users.department}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03]">
                                        👤 {agent.creator?.display_name?.split(' ')[0] || 'System'}
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
