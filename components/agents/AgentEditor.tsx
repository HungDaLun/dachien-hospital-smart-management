/**
 * Agent 編輯器元件
 * 用於建立或編輯 Agent 設定
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';

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

interface PromptVersion {
    id: string;
    version_number: number;
    system_prompt: string;
    created_at: string;
    created_by_user?: { display_name: string | null };
}

interface AgentStats {
    total_sessions: number;
    total_messages: number;
}

interface AgentEditorProps {
    initialData?: AgentData;
    isEditing?: boolean;
    dict: Dictionary;
}

export default function AgentEditor({ initialData, isEditing = false, dict }: AgentEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prompt History State
    const [showHistory, setShowHistory] = useState(false);
    const [versions, setVersions] = useState<PromptVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    // Stats State
    const [stats, setStats] = useState<AgentStats | null>(null);

    const [formData, setFormData] = useState<AgentData>(initialData || {
        name: '',
        description: '',
        system_prompt: '',
        model_version: 'gemini-2.5-flash',
        temperature: 0.7,
        knowledge_rules: [],
    });

    const [newTag, setNewTag] = useState({ key: '', value: '' });

    // Fetch Stats & Versions if editing
    useEffect(() => {
        if (isEditing && formData.id) {
            // Fetch Stats
            fetch(`/api/agents/${formData.id}/stats`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setStats(data.data);
                })
                .catch(console.error);
        }
    }, [isEditing, formData.id]);

    const fetchVersions = async () => {
        if (!formData.id) return;
        setLoadingVersions(true);
        try {
            const res = await fetch(`/api/agents/${formData.id}/versions`);
            const data = await res.json();
            if (data.success) {
                setVersions(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingVersions(false);
        }
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchVersions();
        }
        setShowHistory(!showHistory);
    };

    const handleRestore = (prompt: string) => {
        if (confirm('Are you sure you want to restore this version?')) {
            setFormData(prev => ({ ...prev, system_prompt: prompt }));
            setShowHistory(false);
        }
    };

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

    const handleDelete = async () => {
        // Use default confirmation message if not in dictionary
        const confirmMsg = '確定要刪除此 Agent 嗎？此動作無法復原。';
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/agents/${formData.id}`, {
                method: 'DELETE',
            });
            const json = await res.json();

            if (json.success) {
                router.push('/dashboard/agents');
                router.refresh();
            } else {
                throw new Error(json.error?.message || dict.common.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : dict.common.error);
            setLoading(false);
        }
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
                throw new Error(result.error?.message || dict.common.error);
            }

            // Refresh to update stats or show latest info
            router.refresh(); // Refresh server components

            // Redirect to list page whether creating or editing
            router.push('/dashboard/agents');

        } catch (err) {
            setError(err instanceof Error ? err.message : dict.common.error);
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

            {/* Stats Header (Only when editing) */}
            {isEditing && stats && (
                <div className="flex gap-4 mb-4">
                    <Badge variant="default" className="bg-white border border-gray-200 text-gray-600">
                        {dict.agents.stats.total_chats}: <span className="font-bold ml-1">{stats.total_sessions}</span>
                    </Badge>
                    <Badge variant="default" className="bg-white border border-gray-200 text-gray-600">
                        {dict.agents.stats.total_messages}: <span className="font-bold ml-1">{stats.total_messages}</span>
                    </Badge>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：基本設定與知識綁定 */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">{dict.common.profile}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {dict.agents.form.name}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder={dict.agents.form.name_placeholder}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {dict.agents.form.description}
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder={dict.agents.form.description_placeholder}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {dict.agents.form.model_version}
                                </label>
                                <select
                                    name="model_version"
                                    value={formData.model_version}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                                >
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    {dict.agents.form.temperature} <span>{formData.temperature}</span>
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
                                    <span>精確</span>
                                    <span>創意</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">{dict.agents.form.knowledge_access}</h3>
                        <div className="space-y-4">
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
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={newTag.key}
                                        onChange={(e) => setNewTag(prev => ({ ...prev, key: e.target.value }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={newTag.value}
                                        onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={addTagRule}
                                >
                                    {dict.common.create} Rule
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 右側：核心邏輯 (System Prompt) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {showHistory ? dict.agents.versions : dict.agents.form.system_prompt}
                            </h3>

                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleHistory}
                                >
                                    {showHistory ? dict.common.back : '🕒 ' + dict.agents.versions}
                                </Button>
                            )}
                        </div>

                        {showHistory ? (
                            <div className="flex-1 overflow-auto space-y-4 max-h-[600px] pr-2">
                                {loadingVersions ? (
                                    <div className="text-center py-8"><Spinner /></div>
                                ) : versions.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">{dict.common.no_data}</div>
                                ) : (
                                    versions.map((ver) => (
                                        <div key={ver.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-gray-900">v{ver.version_number}</span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {new Date(ver.created_at).toLocaleString()}
                                                    </span>
                                                    {ver.created_by_user?.display_name && (
                                                        <span className="text-xs text-gray-400 ml-2">by {ver.created_by_user.display_name}</span>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRestore(ver.system_prompt)}
                                                    className="text-xs h-7"
                                                >
                                                    {dict.agents.restore}
                                                </Button>
                                            </div>
                                            <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-gray-100 max-h-24 overflow-hidden truncate">
                                                {ver.system_prompt}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-[400px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {dict.agents.form.system_prompt_placeholder}
                                </label>
                                <textarea
                                    name="system_prompt"
                                    required
                                    value={formData.system_prompt}
                                    onChange={handleChange}
                                    className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder={dict.agents.form.system_prompt}
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                {isEditing ? (
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {dict.common.delete}
                    </Button>
                ) : <div></div>}

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        {dict.common.cancel}
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                        {loading ? <Spinner size="sm" color="white" /> : (isEditing ? dict.common.save : dict.agents.create_new)}
                    </Button>
                </div>
            </div>
        </form>
    );
}
