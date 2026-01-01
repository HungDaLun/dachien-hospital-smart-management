/**
 * 對話頁面
 * 與 Agent 對話的主要介面
 * 遵循 EAKAP 設計系統規範
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

interface ChatPageProps {
    searchParams: Promise<{ agent?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const supabase = await createClient();
    const params = await searchParams;

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
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
            <ChatInterface
                agents={agents || []}
                initialAgentId={selectedAgentId}
            />
        </div>
    );
}
