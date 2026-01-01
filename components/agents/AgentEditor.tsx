/**
 * Agent 編輯器元件
 * 用於建立或編輯 Agent 設定
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Spinner } from '@/components/ui';

interface KnowledgeRule {
    id?: string;
    rule_type: 'TAG' | 'FOLDER';
    rule_value: string;
}

interface AgentData {
    id?: string;
    name: string;
    description: string;
    system_prompt: string;
    model_version: string;
    temperature: number;
    knowledge_rules?: KnowledgeRule[];
}

interface AgentEditorProps {
    initialData?: AgentData;
    isEditing?: boolean;
}

export default function AgentEditor({ initialData, isEditing = false }: AgentEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<AgentData>(initialData || {
        name: '',
        description: '',
        system_prompt: '',
        model_version: 'gemini-2.5-flash',
        temperature: 0.7,
        knowledge_rules: [],
    });

    const [newTag, setNewTag] = useState({ key: '', value: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'temperature' ? parseFloat(value) : value
        }));
    };

    const addTagRule = () => {
        if (!newTag.key || !newTag.value) return;
        const ruleValue = `${newTag.key}:${newTag.value}`;

        // 檢查是否已存在
        if (formData.knowledge_rules?.some(r => r.rule_value === ruleValue)) return;

        setFormData(prev => ({
            ...prev,
            knowledge_rules: [
                ...(prev.knowledge_rules || []),
                { rule_type: 'TAG', rule_value: ruleValue }
            ]
        }));
        setNewTag({ key: '', value: '' });
    };

    const removeRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            knowledge_rules: prev.knowledge_rules?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/agents/${formData.id}` : '/api/agents';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '儲存失敗');
            }

            router.push('/agents');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生未知錯誤');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：基本設定與知識綁定 */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">基本資訊</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agent 名稱
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="例如：法務助理、程式碼審核員"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    描述
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="簡短描述這個 Agent 的用途"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    模型版本
                                </label>
                                <select
                                    name="model_version"
                                    value={formData.model_version}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                                >
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (快速，推薦)</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (最強大)</option>
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (穩定版)</option>
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp (實驗版)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    Temperature <span>{formData.temperature}</span>
                                </label>
                                <input
                                    type="range"
                                    name="temperature"
                                    min="0"
                                    max="1.5"
                                    step="0.1"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>精確/嚴謹</span>
                                    <span>創意/隨性</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">知識庫綁定 (標籤規則)</h3>
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500">
                                設定標籤規則，讓 Agent 只能存取符合這些標籤的檔案。
                            </p>

                            {/* 已建立的規則 */}
                            <div className="flex flex-wrap gap-2">
                                {formData.knowledge_rules?.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs border border-primary-100">
                                        <span>{rule.rule_value}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeRule(idx)}
                                            className="hover:text-primary-900 ml-1 font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* 新增規則 */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key (如 dept)"
                                        value={newTag.key}
                                        onChange={(e) => setNewTag(prev => ({ ...prev, key: e.target.value }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (如 HR)"
                                        value={newTag.value}
                                        onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-primary-500"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={addTagRule}
                                >
                                    新增標籤規則
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 右側：核心邏輯 (System Prompt) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">核心邏輯 (System Prompt)</h3>
                        <div className="flex-1 flex flex-col min-h-[400px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                定義 Agent 的角色行為、回覆風格與規範
                            </label>
                            <textarea
                                name="system_prompt"
                                required
                                value={formData.system_prompt}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                placeholder="例如：您是一位資深的法律顧問。您的任務是審核合約文件，並指出潛在的風險點..."
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    取消
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                    {loading ? <Spinner size="sm" color="white" /> : (isEditing ? '更新 Agent' : '建立 Agent')}
                </Button>
            </div>
        </form>
    );
}
