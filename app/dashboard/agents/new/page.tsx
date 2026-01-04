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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{dict.agents.create_new}</h1>
                <p className="text-gray-600">{dict.dashboard_home.agent_card_desc}</p>
            </div>

            <NewAgentFlow dict={dict} />
        </div>
    );
}
