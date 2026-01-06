/**
 * 新建 Agent 頁面
 */
import NewAgentFlow from '@/components/agents/NewAgentFlow';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function NewAgentPage() {
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    return (
        <div className="max-w-6xl mx-auto space-y-10 p-6 text-text-primary">
            <div className="border-b border-white/5 pb-8">
                <h1 className="text-3xl font-black text-text-primary mb-2 uppercase tracking-tight">{dict.agents.create_new}</h1>
                <p className="text-text-secondary font-medium">{dict.dashboard_home.agent_card_desc}</p>
            </div>

            <NewAgentFlow dict={dict} />
        </div>
    );
}
