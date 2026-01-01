/**
 * 新建 Agent 頁面
 */
import AgentEditor from '@/components/agents/AgentEditor';

export default function NewAgentPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">建立新 Agent</h1>
                <p className="text-gray-600">定義一個專屬的 AI 助理，協助處理特定的業務領域</p>
            </div>

            <AgentEditor />
        </div>
    );
}
