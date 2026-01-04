'use client';

import { Dictionary } from '@/lib/i18n/dictionaries';
import AgentEditor from '@/components/agents/AgentEditor';

interface NewAgentFlowProps {
    dict: Dictionary;
}

export default function NewAgentFlow({ dict }: NewAgentFlowProps) {
    return (
        <div className="space-y-6">
            <AgentEditor
                dict={dict}
                isEditing={false}
            />
        </div>
    );
}
