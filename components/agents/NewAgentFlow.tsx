'use client';

import { useState } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import AgentEditor from '@/components/agents/AgentEditor';
import SkillsMarketplace from '@/components/skills/SkillsMarketplace';
import { Button } from '@/components/ui';

interface NewAgentFlowProps {
    dict: Dictionary;
}

export default function NewAgentFlow({ dict }: NewAgentFlowProps) {
    const [step, setStep] = useState<'marketplace' | 'editor'>('marketplace');
    const [initialAgentData, setInitialAgentData] = useState<any>(undefined);

    const handleSelectSkill = (skill: any) => {
        // Map Skill to AgentData
        const agentData = {
            name: skill.name,
            description: skill.description,
            system_prompt: skill.system_prompt_template,
            model_version: skill.model_config?.preferred_model || 'gemini-3-flash-preview',
            temperature: skill.model_config?.temperature || 0.7,
            knowledge_rules: [] as { rule_type: string; rule_value: string }[],
            knowledge_files: []
        };

        // Map Department Scope to Knowledge Rules
        if (skill.department_scope && Array.isArray(skill.department_scope)) {
            skill.department_scope.forEach((dept: string) => {
                agentData.knowledge_rules.push({
                    rule_type: 'DEPARTMENT',
                    rule_value: dept
                });
            });
        }

        setInitialAgentData(agentData);
        setStep('editor');
    };

    const handleSkip = () => {
        setInitialAgentData(undefined);
        setStep('editor');
    };

    return (
        <div className="space-y-6">
            {step === 'marketplace' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Step 1: 選擇 Agent 模板 (Skill)</h2>
                            <p className="text-sm text-gray-500">從模板庫選擇一個起點，或直接建立空白 Agent</p>
                        </div>
                        <Button variant="ghost" onClick={handleSkip}>
                            跳過，建立空白 Agent &rarr;
                        </Button>
                    </div>

                    <SkillsMarketplace onSelectSkill={handleSelectSkill} />

                    <div className="flex justify-center pt-8 border-t border-gray-100">
                        <p className="text-sm text-gray-400">
                            找不到適合的？你可以 <button onClick={handleSkip} className="text-primary-600 hover:underline">從頭開始建立</button>
                        </p>
                    </div>
                </div>
            )}

            {step === 'editor' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="sm" onClick={() => setStep('marketplace')}>
                            &larr; 返回模板庫
                        </Button>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">Step 2: 自訂與部署</span>
                    </div>

                    <AgentEditor
                        dict={dict}
                        initialData={initialAgentData}
                        isEditing={false}
                    />
                </div>
            )}
        </div>
    );
}
