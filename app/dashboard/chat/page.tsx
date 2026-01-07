/**
 * 對話頁面
 * 與 Agent 對話的主要介面
 * 遵循 EAKAP 設計系統規範
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import PageHeader from '@/components/layout/PageHeader';
import { MessageSquare } from 'lucide-react';


interface ChatPageProps {
    searchParams: Promise<{ agent?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const supabase = await createClient();
    const params = await searchParams;
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 檢查使用者是否已登入
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // 取得可用的 Agent 列表
    const { data: agents } = await supabase
        .from('agents')
        .select('id, name, description, avatar_url')
        .eq('is_active', true)
        .order('name');

    // 如果 URL 有指定 agent，驗證是否存在
    const selectedAgentId = params.agent || null;

    return (
        <div className="w-full p-6 xl:p-10 h-[calc(100vh-120px)] flex flex-col bg-background-primary">
            <PageHeader
                title="智能對話"
                icon={MessageSquare}
            />
            <div className="flex-1 overflow-hidden">
                <ChatInterface
                    agents={agents || []}
                    initialAgentId={selectedAgentId}
                    dict={dict}
                />
            </div>
        </div>

    );
}
