/**
 * Agent 詳情與編輯頁面
 */
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AgentEditor from '@/components/agents/AgentEditor';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface AgentDetailsPageProps {
    params: { id: string };
}

export default async function AgentDetailsPage({ params }: AgentDetailsPageProps) {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 1. 驗證使用者身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. 取得 Agent 資料
    const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !agent) {
        notFound();
    }

    // 3. 檢查權限 (簡易：僅建立者或 SUPER_ADMIN 可編輯)
    const isOwner = agent.created_by === user.id;

    // 取得使用者角色
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const canEdit = isOwner || profile?.role === 'SUPER_ADMIN';

    if (!canEdit) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-900">{dict.common.error}</h2>
                <p className="text-gray-600 mt-2">{dict.agents.form.access_control}</p>
                <Link href="/dashboard/agents" className="inline-block mt-6">
                    <Button variant="outline">{dict.common.back}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dict.agents.edit_agent}: {agent.name}</h1>
                    <p className="text-gray-600">{dict.dashboard_home.agent_card_desc}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/chat?agent=${agent.id}`}>
                        <Button variant="primary">{dict.dashboard_home.chat_card_btn}</Button>
                    </Link>
                </div>
            </div>

            <AgentEditor isEditing initialData={{
                id: agent.id,
                name: agent.name,
                description: agent.description || '',
                system_prompt: agent.system_prompt,
                model_version: agent.model_version,
                temperature: parseFloat(agent.temperature?.toString() || '0.7'),
            }} dict={dict} />
        </div>
    );
}
