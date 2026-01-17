/**
 * Agent 表單元件
 * 用於建立與編輯 Agent
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select, Modal } from '@/components/ui';
import type { AgentData } from './AgentCard';
import { getCategories, getDepartments } from '@/lib/actions/taxonomy';
import { DocumentCategory } from '@/types';
import TemplateSelector from './TemplateSelector';
import type { AgentTemplate } from './TemplateCard';

/**
 * Agent 表單屬性
 */
interface AgentFormProps {
    isOpen: boolean;
    onClose: () => void;
    agent?: AgentData | null;
    onSuccess?: () => void;
}

/**
 * 模型版本選項
 */
const modelOptions = [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (快速，推薦)' },
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (最強大)' },
];

/**
 * Temperature 選項
 */
const temperatureOptions = [
    { value: '0.0', label: '0.0 - 精確' },
    { value: '0.3', label: '0.3 - 保守' },
    { value: '0.5', label: '0.5 - 平衡' },
    { value: '0.7', label: '0.7 - 創意（預設）' },
    { value: '1.0', label: '1.0 - 高度創意' },
];

export default function AgentForm({ isOpen, onClose, agent, onSuccess }: AgentFormProps) {
    const isEditing = !!agent;

    // 步驟狀態: 0 = Template Selection, 1 = Edit Details
    // 如果是編輯模式，直接跳到步驟 1
    const [step, setStep] = useState(isEditing ? 1 : 0);

    // 表單狀態
    const [name, setName] = useState(agent?.name || '');
    const [description, setDescription] = useState(agent?.description || '');
    const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt || '');
    const [modelVersion, setModelVersion] = useState(agent?.model_version || 'gemini-3-flash-preview');
    const [temperature, setTemperature] = useState(String(agent?.temperature || 0.7));
    const [knowledgeRules, setKnowledgeRules] = useState<{ rule_type: string; rule_value: string }[]>(
        agent?.knowledge_rules || []
    );
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [departments, setDepartments] = useState<{ id: string; name: string; code: string | null }[]>([]);

    // Rule Input State
    const [newRuleType, setNewRuleType] = useState('DEPARTMENT');
    const [newRuleValue, setNewRuleValue] = useState('');

    // 載入狀態
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 重置表單
     */
    const resetForm = () => {
        setStep(agent ? 1 : 0);
        setName('');
        setDescription('');
        setSystemPrompt('');
        setModelVersion('gemini-3-flash-preview');
        setTemperature('0.7');
        setKnowledgeRules([]);
        setNewRuleType('DEPARTMENT');
        setNewRuleValue('');
        setError(null);
    };

    /**
     * 當選擇模板時
     */
    interface TemplateKnowledge {
        required_categories?: string[];
    }
    interface TemplateWithKnowledge extends AgentTemplate {
        system_prompt_template?: string;
        recommended_knowledge?: TemplateKnowledge;
    }

    const handleTemplateSelect = (template: AgentTemplate) => {
        const tmpl = template as TemplateWithKnowledge;
        setName(tmpl.name); // 預設使用模板名稱，使用者可改
        setDescription(tmpl.description);
        setSystemPrompt(tmpl.system_prompt_template || tmpl.system_prompt || '');

        // 解析並填入建議的知識規則
        const rules: { rule_type: string; rule_value: string }[] = [];
        if (tmpl.recommended_knowledge?.required_categories) {
            tmpl.recommended_knowledge.required_categories.forEach((catName: string) => {
                const cat = categories.find(c => c.name === catName);
                if (cat) {
                    rules.push({ rule_type: 'CATEGORY', rule_value: cat.id });
                }
            });
        }

        // 這裡可以加入更多邏輯來處理 frameworks

        setKnowledgeRules(rules);
        setStep(1); // 前進到下一步
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchOptions = async () => {
            const [catRes, deptRes] = await Promise.all([getCategories(), getDepartments()]);
            if (catRes.data) setCategories(catRes.data);
            if (deptRes.data) setDepartments(deptRes.data);
        };
        fetchOptions();

        // 重置步驟
        if (!agent) setStep(0);
        else setStep(1);

    }, [isOpen, agent]);

    const addRule = () => {
        if (!newRuleValue) return;
        // Avoid duplicates
        if (knowledgeRules.some(r => r.rule_type === newRuleType && r.rule_value === newRuleValue)) return;
        setKnowledgeRules([...knowledgeRules, { rule_type: newRuleType, rule_value: newRuleValue }]);
        setNewRuleValue('');
    };

    const removeRule = (index: number) => {
        setKnowledgeRules(knowledgeRules.filter((_, i) => i !== index));
    };

    /**
     * 處理關閉
     */
    const handleClose = () => {
        resetForm();
        onClose();
    };

    /**
     * 處理提交
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證
        if (!name.trim()) {
            setError('請輸入 Agent 名稱');
            return;
        }
        if (!systemPrompt.trim()) {
            setError('請輸入 System Prompt');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                system_prompt: systemPrompt.trim(),
                model_version: modelVersion,
                temperature: parseFloat(temperature),
                knowledge_rules: knowledgeRules,
            };

            const url = isEditing ? `/api/agents/${agent.id}` : '/api/agents';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '操作失敗');
            }

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 0: 模板選擇
    if (step === 0 && !isEditing) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="" // 隱藏標題，由 TemplateSelector 自己管理
                size="xl"
            >
                <TemplateSelector
                    onSelect={handleTemplateSelect}
                    onSkip={() => setStep(1)}
                />
            </Modal>
        );
    }

    // Step 1: 編輯詳情 (原本的表單)
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? '編輯 Agent' : '建立新 Agent'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 錯誤訊息 */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* 基本資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Agent 名稱"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例如：客服助理"
                        required
                        fullWidth
                    />

                    <Select
                        label="模型版本"
                        options={modelOptions}
                        value={modelVersion}
                        onChange={(e) => setModelVersion(e.target.value)}
                        fullWidth
                    />
                </div>

                {/* 描述 */}
                <Input
                    label="描述（選填）"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="簡短描述這個 Agent 的用途"
                    fullWidth
                />

                {/* System Prompt */}
                <Textarea
                    label="System Prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="輸入 Agent 的系統提示詞，定義其角色與行為..."
                    rows={8}
                    required
                    fullWidth
                    hint="定義 Agent 的角色、專業領域、回應風格等"
                />

                {/* 進階設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Temperature（創意程度）"
                        options={temperatureOptions}
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        fullWidth
                        hint="數值越高，回應越有創意"
                    />
                </div>

                {/* Knowledge Scope */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Knowledge Scope (RAG Silos)</h3>

                    <div className="flex gap-2 mb-3">
                        <div className="w-1/3">
                            <Select
                                value={newRuleType}
                                onChange={(e) => {
                                    setNewRuleType(e.target.value);
                                    setNewRuleValue('');
                                }}
                                options={[
                                    { value: 'DEPARTMENT', label: 'By Department' },
                                    { value: 'CATEGORY', label: 'By Category' },
                                    { value: 'TAG', label: 'By Tag (key:value)' }
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            {newRuleType === 'DEPARTMENT' ? (
                                <Select
                                    value={newRuleValue}
                                    onChange={(e) => setNewRuleValue(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Dept...' },
                                        ...departments.map(d => ({ value: d.code || d.name, label: d.name + (d.code ? ` (${d.code})` : '') }))
                                    ]}
                                />
                            ) : newRuleType === 'CATEGORY' ? (
                                <Select
                                    value={newRuleValue}
                                    onChange={(e) => setNewRuleValue(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Category...' },
                                        ...categories.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
                            ) : (
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="e.g. project:alpha"
                                    value={newRuleValue}
                                    onChange={(e) => setNewRuleValue(e.target.value)}
                                />
                            )}
                        </div>
                        <Button type="button" size="sm" onClick={addRule}>Add</Button>
                    </div>

                    <div className="space-y-2">
                        {knowledgeRules.map((rule, i) => (
                            <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${rule.rule_type === 'DEPARTMENT' ? 'bg-purple-100 text-purple-700' :
                                        rule.rule_type === 'CATEGORY' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {rule.rule_type}
                                    </span>
                                    <span className="font-mono text-gray-800">
                                        {rule.rule_type === 'CATEGORY'
                                            ? categories.find(c => c.id === rule.rule_value)?.name || rule.rule_value
                                            : rule.rule_value}
                                    </span>
                                </div>
                                <button type="button" onClick={() => removeRule(i)} className="text-gray-400 hover:text-red-500">×</button>
                            </div>
                        ))}
                        {knowledgeRules.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">Global Access (No restrictions)</p>
                        )}
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    {!isEditing && (
                        <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                            ← 上一步
                        </Button>
                    )}
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        取消
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isEditing ? '儲存變更' : '建立 Agent'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
