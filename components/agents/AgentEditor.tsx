/**
 * Agent 編輯器元件
 * 用於建立或編輯 Agent 設定
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import ArchitectChat from './ArchitectModal';
import FilePickerModal from './FilePickerModal';

interface KnowledgeRule {
    id?: string;
    rule_type: 'TAG' | 'FOLDER' | 'DEPARTMENT'; // Updated type
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
    knowledge_files?: string[];  // 新增：直接綁定檔案 ID 列表
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
        model_version: 'gemini-3-flash-preview',
        temperature: 0.7,
        knowledge_rules: [],
        knowledge_files: [],  // 新增：預設空陣列
    });

    const [newTag, setNewTag] = useState({ key: '', value: '' });
    const [newDept, setNewDept] = useState(''); // State for new department rule
    const [showFilePicker, setShowFilePicker] = useState(false); // File picker modal state

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

    const addDeptRule = () => {
        if (!newDept) return;
        // Check if already exists
        if (formData.knowledge_rules?.some(r => r.rule_type === 'DEPARTMENT' && r.rule_value === newDept)) return;

        setFormData(prev => ({
            ...prev,
            knowledge_rules: [
                ...(prev.knowledge_rules || []),
                { rule_type: 'DEPARTMENT', rule_value: newDept }
            ]
        }));
        setNewDept('');
    };

    const handleArchitectApply = (blueprint: any) => {
        setFormData(prev => ({
            ...prev,
            name: blueprint.name,
            description: blueprint.description,
            system_prompt: blueprint.system_prompt,
            knowledge_rules: [
                ...(prev.knowledge_rules || []),
                ...(blueprint.suggested_knowledge_rules || [])
            ],
            knowledge_files: [
                ...(prev.knowledge_files || []),
                ...(blueprint.suggested_knowledge_files || [])
            ]
        }));
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
        <>
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

                {/* 單欄佈局 - 更平衡的視覺比例 */}
                <div className="space-y-6">
                    {/* Agent 基本資料 */}
                    <Card>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Agent 基本資料</h3>
                            <p className="text-sm text-gray-500 mt-1">定義 Agent 的身份與行為模式</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* 左欄 */}
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

                            {/* 右欄 */}
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
                                    <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                                    <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                                </select>
                            </div>
                        </div>

                        {/* 完整寬度的描述欄位 */}
                        <div className="mt-4">
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

                        {/* 創意度滑桿 */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {dict.agents.form.temperature} <span className="text-primary-600 font-semibold">{formData.temperature}</span>
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
                    </Card>

                    {/* 系統提示詞 */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {showHistory ? dict.agents.versions : dict.agents.form.system_prompt}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">定義 Agent 的角色、任務與行為準則</p>
                            </div>

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
                            <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
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
                            <textarea
                                name="system_prompt"
                                required
                                value={formData.system_prompt}
                                onChange={handleChange}
                                className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none min-h-[400px]"
                                placeholder={dict.agents.form.system_prompt}
                            />
                        )}
                    </Card>

                    {/* 知識庫來源（永遠顯示） */}
                    <Card>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">知識庫來源</h3>
                            <p className="text-sm text-gray-500 mt-1">選擇此 Agent 可存取的檔案與知識範圍</p>
                        </div>

                        {/* AI 助手提示 */}
                        <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                            <p className="text-sm text-violet-700">
                                💡 <strong>提示：</strong>使用右下角的 🤖 AI 助手，可根據 Agent 描述自動推薦相關知識來源
                            </p>
                        </div>

                        {/* 已選檔案 */}
                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium text-gray-700">已選檔案</label>
                            {formData.knowledge_files && formData.knowledge_files.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.knowledge_files.map((fileId, idx) => (
                                        <Badge
                                            key={idx}
                                            className="bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        >
                                            📄 檔案 ID: {fileId.slice(0, 8)}...
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    knowledge_files: prev.knowledge_files?.filter((_, i) => i !== idx)
                                                }))}
                                                className="ml-2 hover:text-emerald-900 font-bold"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">尚未選擇任何檔案</p>
                            )}
                        </div>

                        {/* 手動選擇檔案按鈕 */}
                        <div className="mb-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilePicker(true)}
                            >
                                📂 手動選擇檔案
                            </Button>
                        </div>

                        {/* 動態規則（摺疊） */}
                        <details className="group">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors mb-2">
                                🔧 進階：動態規則（選用）
                            </summary>
                            <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                                {/* 已設定的規則 */}
                                {formData.knowledge_rules && formData.knowledge_rules.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.knowledge_rules.map((rule, idx) => (
                                            <Badge
                                                key={idx}
                                                className={`${rule.rule_type === 'DEPARTMENT'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                                }`}
                                            >
                                                {rule.rule_type === 'DEPARTMENT' ? '🏢' : '🏷️'} {rule.rule_value}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRule(idx)}
                                                    className="ml-2 hover:text-gray-900 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Tag 規則輸入 */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500">依標籤綁定</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="鍵（例如：Product）"
                                            value={newTag.key}
                                            onChange={(e) => setNewTag(prev => ({ ...prev, key: e.target.value }))}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="值（例如：Origins）"
                                            value={newTag.value}
                                            onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs px-2"
                                            onClick={addTagRule}
                                        >
                                            新增
                                        </Button>
                                    </div>
                                </div>

                                {/* Department 規則輸入 */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500">依部門綁定</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="部門名稱（例如：財務部）"
                                            value={newDept}
                                            onChange={(e) => setNewDept(e.target.value)}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs px-2"
                                            onClick={addDeptRule}
                                        >
                                            新增
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </Card>
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

            {/* 將 AI 架構師移到表單外部，避免 Enter 事件干擾主表單 */}
            <ArchitectChat
                onApply={handleArchitectApply}
                dict={dict}
            />

            {/* 檔案選擇器 Modal */}
            <FilePickerModal
                isOpen={showFilePicker}
                onClose={() => setShowFilePicker(false)}
                selectedFiles={formData.knowledge_files || []}
                onConfirm={(fileIds) => {
                    setFormData(prev => ({ ...prev, knowledge_files: fileIds }));
                }}
            />
        </>
    );
}
