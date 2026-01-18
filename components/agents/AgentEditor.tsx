/**
 * Agent 編輯器元件
 * 用於建立或編輯 Agent 設定
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Spinner, Badge, Input, Select, ConfirmDialog } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import ArchitectChat from './ArchitectModal';
import FilePickerModal from './FilePickerModal';
import SkillPickerModal from './SkillPickerModal';
import ToolPickerModal from './ToolPickerModal';
// 移除手動選擇器，改由 AI 代理架構師自動推薦 (現已恢復手動管理作為輔助)
// import { ToolSelector } from './ToolSelector';
// import { SkillSelector } from './SkillSelector';
import {
    Users,
    MessageSquare,
    History,
    Trash2,
    ChevronLeft,
    ArrowRight,
    FileText,
    Plus,
    X,
    Cpu,
    Target,
    Zap,
    AlertCircle,
    Database,
    BrainCircuit,
    Wrench
} from 'lucide-react';

interface KnowledgeRule {
    id?: string;
    rule_type: 'TAG' | 'FOLDER' | 'DEPARTMENT';
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
    knowledge_files?: string[];
    mcp_config?: string;
    enabled_tools?: string[];
    enabled_skills?: string[];
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
        knowledge_files: [],
        mcp_config: (initialData as AgentData | undefined)?.mcp_config || '{}',
        enabled_tools: (initialData as AgentData | undefined)?.enabled_tools || [],
        enabled_skills: (initialData as AgentData | undefined)?.enabled_skills || [],
    });

    const [fileNames, setFileNames] = useState<Record<string, string>>({});
    const [toolNames, setToolNames] = useState<Record<string, string>>({});
    const [skillNames, setSkillNames] = useState<Record<string, string>>({});
    interface FileItem { id: string; filename: string; }
    interface SkillItem { id: string; name: string; display_name?: string; }
    interface DepartmentItem { id: string; name: string; code: string; }
    const [allFiles, setAllFiles] = useState<FileItem[]>([]);
    const [allSkills, setAllSkills] = useState<SkillItem[]>([]); // 新增：保存所有技能以供名稱轉 ID
    const [departments, setDepartments] = useState<DepartmentItem[]>([]);

    const [newTag, setNewTag] = useState({ key: '', value: '' });
    const [newDept, setNewDept] = useState('');
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [showSkillPicker, setShowSkillPicker] = useState(false);
    const [showToolPicker, setShowToolPicker] = useState(false);

    // Confirm Dialog States
    const [restorePrompt, setRestorePrompt] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDepartments(data.data);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (isEditing && formData.id) {
            fetch(`/api/agents/${formData.id}/stats`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setStats(data.data);
                })
                .catch(console.error);
        }
    }, [isEditing, formData.id]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Fetch Files
                const filesRes = await fetch('/api/files');
                const filesData = await filesRes.json();
                if (filesData.success) {
                    setAllFiles(filesData.data);
                    const mapping: Record<string, string> = {};
                    filesData.data.forEach((f: FileItem) => {
                        mapping[f.id] = f.filename;
                    });
                    setFileNames(mapping);
                }

                // Fetch Tools
                const toolsRes = await fetch('/api/tools');
                const toolsData = await toolsRes.json();
                if (toolsData.success) {
                    interface ToolItem { name: string; display_name: string; }
                    const mapping: Record<string, string> = {};
                    toolsData.data.forEach((t: ToolItem) => {
                        mapping[t.name] = t.display_name;
                    });
                    setToolNames(mapping);
                }

                // Fetch Skills
                const skillsRes = await fetch('/api/skills');
                const skillsData = await skillsRes.json();
                if (skillsData.success) {
                    setAllSkills(skillsData.data); // 保存完整物件
                    const mapping: Record<string, string> = {};
                    skillsData.data.forEach((s: SkillItem) => {
                        mapping[s.name] = s.display_name || s.name;
                    });
                    setSkillNames(mapping);
                }
            } catch (error) {
                console.error('Failed to fetch metadata:', error);
            }
        };
        fetchMetadata();
    }, []);

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

    const handleRestoreClick = (prompt: string) => {
        setRestorePrompt(prompt);
    };

    const handleRestoreConfirm = () => {
        if (restorePrompt) {
            setFormData(prev => ({ ...prev, system_prompt: restorePrompt }));
            setShowHistory(false);
            setRestorePrompt(null);
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

    interface ArchitectBlueprint {
        name?: string;
        description?: string;
        system_prompt?: string;
        suggested_knowledge_rules?: KnowledgeRule[];
        suggested_knowledge_files?: string[];
        mcp_config?: Record<string, unknown>;
        suggested_tools?: string[];
        suggested_skills?: string[];
    }

    const handleArchitectApply = (blueprint: ArchitectBlueprint) => {
        setFormData(prev => {
            // Knowledge Rules: If suggested, REPLACE existing. If undefined, KEEP existing.
            const newRules = blueprint.suggested_knowledge_rules !== undefined
                ? blueprint.suggested_knowledge_rules
                : (prev.knowledge_rules || []);

            // Knowledge Files: If suggested, REPLACE existing. If undefined, KEEP existing.
            let newFiles = prev.knowledge_files || [];
            if (blueprint.suggested_knowledge_files !== undefined) {
                newFiles = blueprint.suggested_knowledge_files.map((item: string) => {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item);
                    if (!isUuid) {
                        const found = allFiles.find(f => f.filename === item);
                        return found ? found.id : null;
                    }
                    return item;
                }).filter((item): item is string => item !== null);
            }

            // Tools: If suggested, REPLACE existing. If undefined, KEEP existing.
            const newTools = blueprint.suggested_tools !== undefined
                ? blueprint.suggested_tools
                : (prev.enabled_tools || []);

            // Skills: If suggested, REPLACE existing. If undefined, KEEP existing.
            let newSkills = prev.enabled_skills || [];
            if (blueprint.suggested_skills !== undefined) {
                newSkills = blueprint.suggested_skills.map((sName: string) => {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sName);
                    if (!isUuid) {
                        const found = allSkills.find(s => s.name === sName);
                        return found ? found.id : null;
                    }
                    return sName;
                }).filter((item): item is string => item !== null);
            }

            return {
                ...prev,
                name: blueprint.name || prev.name,
                description: blueprint.description || prev.description,
                system_prompt: blueprint.system_prompt || prev.system_prompt,
                knowledge_rules: newRules,
                knowledge_files: newFiles,
                mcp_config: (blueprint.mcp_config && Object.keys(blueprint.mcp_config as object).length > 0)
                    ? JSON.stringify(blueprint.mcp_config, null, 2)
                    : prev.mcp_config,
                enabled_tools: newTools,
                enabled_skills: newSkills
            };
        });
    };

    const removeRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            knowledge_rules: prev.knowledge_rules?.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
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
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/agents/${formData.id}` : '/api/agents';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = { ...formData };
            try {
                if (typeof payload.mcp_config === 'string') {
                    payload.mcp_config = JSON.parse(payload.mcp_config);
                }
            } catch {
                throw new Error('Invalid JSON in Skills Configuration');
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || dict.common.error);
            }
            router.refresh();
            router.push('/dashboard/agents');
        } catch (err) {
            setError(err instanceof Error ? err.message : dict.common.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 bg-semantic-danger/10 border border-semantic-danger/20 text-semantic-danger rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    </div>
                )}

                {/* Stats Header */}
                {isEditing && stats && (
                    <div className="flex gap-4 p-1 bg-white/[0.02] border border-white/5 rounded-2xl inline-flex mb-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                            <Users size={14} className="text-primary-400" />
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{dict.agents.stats.total_chats}</span>
                            <span className="text-xs font-black text-text-primary tabular-nums ml-2">{stats.total_sessions}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                            <MessageSquare size={14} className="text-secondary-400" />
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{dict.agents.stats.total_messages}</span>
                            <span className="text-xs font-black text-text-primary tabular-nums ml-2">{stats.total_messages}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8">
                    {/* Identification Layer */}
                    <Card variant="glass" className="p-8 border-white/10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-glow-cyan/5">
                                <Target size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Agent 身份辨識 <span className="opacity-30">|</span> IDENTITY</h3>
                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">定義此 Agent 在戰情室中的權限與特徵</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <Input
                                    label={dict.agents.form.name}
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={dict.agents.form.name_placeholder}
                                    className="bg-black/20"
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">{dict.agents.form.description}</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-text-secondary focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 outline-none transition-all placeholder:text-text-tertiary/30"
                                        placeholder={dict.agents.form.description_placeholder}
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <Select
                                    label={dict.agents.form.model_version}
                                    name="model_version"
                                    value={formData.model_version}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'gemini-3-flash-preview', label: 'GEMINI-3 FLASH • 高速響應' },
                                        { value: 'gemini-3-pro-preview', label: 'GEMINI-3 PRO • 深度推理' }
                                    ]}
                                    className="bg-black/20"
                                />

                                <div className="space-y-6 pt-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                                            {dict.agents.form.temperature} <span className="text-primary-400 ml-2 font-mono tabular-nums">{formData.temperature}</span>
                                        </label>
                                        <div className="flex gap-4 text-[9px] font-black text-text-tertiary uppercase tracking-tighter opacity-40">
                                            <span>PRECISION</span>
                                            <span>CREATIVE</span>
                                        </div>
                                    </div>
                                    <div className="relative h-6 flex items-center group/slider">
                                        <div className="absolute inset-0 bg-white/5 rounded-full h-1 my-auto" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full h-1 my-auto shadow-glow-cyan" style={{ width: `${(formData.temperature / 1.5) * 100}%` }} />
                                        <input
                                            type="range"
                                            name="temperature"
                                            min="0"
                                            max="1.5"
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={handleChange}
                                            className="w-full h-full bg-transparent appearance-none cursor-pointer z-10 accent-primary-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-glow-cyan [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Logic & Directive Layer */}
                    <Card variant="glass" className="p-8 border-white/10 group/prompt">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-secondary-500/10 text-secondary-400 border border-secondary-500/20 shadow-glow-purple/5 group-hover/prompt:shadow-glow-purple/20 transition-all duration-500">
                                    <Cpu size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                                        {showHistory ? '提示詞演進紀錄' : '核心任務指令庫'} <span className="opacity-30">|</span> {showHistory ? 'VERSIONS' : 'DIRECTIVES'}
                                    </h3>
                                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">定義 Agent 的行為底盤與邏輯樹狀</p>
                                </div>
                            </div>

                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleHistory}
                                    className="border-white/10 hover:bg-white/5 h-9 px-4 rounded-xl text-[10px] font-black"
                                >
                                    {showHistory ? (
                                        <span className="flex items-center gap-2"><ChevronLeft size={14} /> {dict.common.back}</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><History size={14} /> {dict.agents.versions}</span>
                                    )}
                                </Button>
                            )}
                        </div>

                        {showHistory ? (
                            <div className="space-y-4 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
                                {loadingVersions ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Spinner />
                                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Rewinding Logic Stream...</span>
                                    </div>
                                ) : versions.length === 0 ? (
                                    <div className="text-center py-20 text-text-tertiary bg-white/[0.01] rounded-3xl border border-dashed border-white/5 uppercase tracking-widest text-xs font-black opacity-40">
                                        {dict.common.no_data}
                                    </div>
                                ) : (
                                    versions.map((ver) => (
                                        <div key={ver.id} className="group/version border border-white/5 rounded-[24px] p-6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-500/20 text-secondary-400 text-xs font-black border border-secondary-500/20">v{ver.version_number}</span>
                                                    <div>
                                                        <span className="text-[10px] font-black text-text-primary uppercase tracking-wider block">
                                                            {new Date(ver.created_at).toLocaleString()}
                                                        </span>
                                                        {ver.created_by_user?.display_name && (
                                                            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Commit by {ver.created_by_user.display_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleRestoreClick(ver.system_prompt)}
                                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                                >
                                                    回溯應用
                                                </Button>
                                            </div>
                                            <div className="text-xs text-text-tertiary font-mono bg-black/40 p-4 rounded-xl border border-white/5 max-h-32 overflow-hidden relative group-hover/version:border-primary-500/30 transition-all">
                                                {ver.system_prompt}
                                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <textarea
                                    name="system_prompt"
                                    required
                                    value={formData.system_prompt}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-[32px] p-8 font-mono text-sm leading-relaxed text-text-secondary focus:ring-4 focus:ring-secondary-500/5 focus:border-secondary-500/30 outline-none transition-all placeholder:text-text-tertiary/20 min-h-[500px] shadow-inner custom-scrollbar"
                                    placeholder="Enter system prompt instructions..."
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-text-tertiary uppercase tracking-widest backdrop-blur-md">SYSTEM_PROMPT.md</div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Knowledge Integration Layer */}
                    <Card variant="glass" className="p-8 border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/[0.03] blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-cyan/5">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">知識矩陣掛載 <span className="opacity-30">|</span> DATA KERNEL</h3>
                                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">設定 Agent 的核心知識資源與動態匹配規則</p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="cta"
                                size="sm"
                                onClick={() => setShowFilePicker(true)}
                                className="h-10 px-6 rounded-xl shadow-glow-cyan/10"
                            >
                                <Plus size={16} className="mr-2" />
                                掛載知識資產
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Static Assets (2/3 width) */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-3 bg-primary-500 rounded-full" />
                                        靜態掛載資產 <span className="text-[9px] text-text-tertiary opacity-40 italic ml-2">STATIC_ASSETS</span>
                                    </label>
                                    <span className="text-[9px] font-black text-text-tertiary tabular-nums tabular-nums uppercase opacity-40">Mounted: {formData.knowledge_files?.length || 0}</span>
                                </div>
                                <div className="bg-black/20 rounded-[32px] border border-white/5 p-6 min-h-[200px] flex flex-wrap gap-3 content-start shadow-inner">
                                    {formData.knowledge_files && formData.knowledge_files.length > 0 ? (
                                        formData.knowledge_files.map((fileId, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className="bg-white/5 border-white/10 text-text-secondary pl-3 pr-2 py-1.5 gap-3 group/tag rounded-xl hover:border-primary-500/30 transition-all font-black"
                                            >
                                                <FileText size={12} className="opacity-40" />
                                                {fileNames[fileId] || `ASSET::${fileId.slice(0, 8)}`}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        knowledge_files: prev.knowledge_files?.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="opacity-30 hover:opacity-100 hover:text-semantic-danger transition-all p-0.5 rounded-md hover:bg-semantic-danger/10"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="w-full flex flex-col items-center justify-center gap-4 opacity-40">
                                            <div className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center">
                                                <Database size={24} className="text-text-tertiary" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Matrix Empty: Awaiting Asset Link</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Rules (1/3 width) */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                                        <div className="w-1 h-3 bg-secondary-400 rounded-full" />
                                        動態動能規則 <span className="text-[9px] text-text-tertiary opacity-40 italic ml-2">KERNEL_RULES</span>
                                    </label>

                                    <div className="space-y-4">
                                        {/* Dept Rule */}
                                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3">
                                            <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-secondary-400" />
                                                掛載部門全量 <span className="text-[8px] italic opacity-40 font-bold">DEPT_LINK</span>
                                            </span>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Select
                                                        value={newDept}
                                                        onChange={(e) => setNewDept(e.target.value)}
                                                        className="bg-black/40"
                                                        selectSize="sm"
                                                        options={[
                                                            { value: '', label: '-- 選擇部門掛載 --' },
                                                            ...departments.map(dept => ({ value: dept.name, label: `${dept.name} (${dept.code})` }))
                                                        ]}
                                                    />
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={addDeptRule} disabled={!newDept} className="h-10 px-4 rounded-xl border-white/10">
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Tag Rule */}
                                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3">
                                            <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary-500" />
                                                元數據模式推薦 <span className="text-[8px] italic opacity-40 font-bold">TAG_RECON</span>
                                            </span>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newTag.key}
                                                    onChange={e => setNewTag(p => ({ ...p, key: e.target.value }))}
                                                    placeholder="KEY: Domain"
                                                    className="bg-black/40"
                                                    inputSize="sm"
                                                />
                                                <Input
                                                    value={newTag.value}
                                                    onChange={e => setNewTag(p => ({ ...p, value: e.target.value }))}
                                                    placeholder="VAL: Tech"
                                                    className="bg-black/40"
                                                    inputSize="sm"
                                                />
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={addTagRule} disabled={!newTag.key || !newTag.value} className="w-full h-9 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                                新增匹配鏈
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Active Rules List */}
                                    {formData.knowledge_rules && formData.knowledge_rules.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {formData.knowledge_rules.map((rule, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`rounded-lg py-1 px-3 gap-2 font-bold uppercase tracking-tight ${rule.rule_type === 'DEPARTMENT'
                                                        ? 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20'
                                                        : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                                        }`}
                                                >
                                                    {rule.rule_value}
                                                    <button onClick={() => removeRule(idx)} className="opacity-40 hover:opacity-100 hover:text-semantic-danger">
                                                        <X size={12} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Capabilities Layer (Tools & Skills) */}
                    <Card variant="glass" className="p-8 border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/[0.03] blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-glow-purple/5">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">功能與技能 <span className="opacity-30">|</span> CAPABILITIES</h3>
                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">賦予 Agent 執行任務與專業技能的能力</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Tools Section */}
                            <div className="space-y-4 pb-8 border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <Wrench size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">
                                                啟用功能 (Tools)
                                            </h4>
                                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                                                系統原生能力模組
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowToolPicker(true)}
                                        className="h-8 px-3 text-[10px] border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                                    >
                                        <Plus size={12} className="mr-1.5" />
                                        管理功能
                                    </Button>
                                </div>

                                {formData.enabled_tools && formData.enabled_tools.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.enabled_tools.map((toolId) => (
                                            <Badge
                                                key={toolId}
                                                variant="outline"
                                                className="px-3 py-1.5 bg-blue-500/10 border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl pr-2"
                                            >
                                                <Zap size={12} className="mr-1.5" />
                                                {toolNames[toolId] || toolId}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        enabled_tools: prev.enabled_tools?.filter(t => t !== toolId)
                                                    }))}
                                                    className="ml-2 opacity-40 hover:opacity-100 hover:text-white transition-opacity p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-white/[0.02] rounded-xl border border-dashed border-white/10 text-xs text-text-tertiary">
                                        未啟用任何工具
                                    </div>
                                )}
                            </div>

                            {/* Skills Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            <BrainCircuit size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">
                                                裝備技能 (Skills)
                                            </h4>
                                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                                                專業領域知識與流程
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSkillPicker(true)}
                                        className="h-8 px-3 text-[10px] border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                                    >
                                        <Plus size={12} className="mr-1.5" />
                                        管理技能
                                    </Button>
                                </div>

                                {formData.enabled_skills && formData.enabled_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.enabled_skills.map((skillId) => {
                                            const skillName = skillNames[skillId] || allSkills.find(s => s.id === skillId || s.name === skillId)?.display_name || skillId;
                                            return (
                                                <Badge
                                                    key={skillId}
                                                    variant="outline"
                                                    className="px-3 py-1.5 bg-purple-500/10 border-purple-500/20 text-purple-400 text-xs font-bold rounded-xl pr-2"
                                                >
                                                    <BrainCircuit size={12} className="mr-1.5" />
                                                    {skillName}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            enabled_skills: prev.enabled_skills?.filter(s => s !== skillId)
                                                        }))}
                                                        className="ml-2 opacity-40 hover:opacity-100 hover:text-white transition-opacity p-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-white/[0.02] rounded-xl border border-dashed border-white/10 text-xs text-text-tertiary">
                                        未裝備任何技能
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer Command Bar (Static) */}
                <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
                    {isEditing ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDeleteClick}
                            disabled={loading}
                            className="border-semantic-danger/30 text-semantic-danger hover:bg-semantic-danger/10 px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            <Trash2 size={16} className="mr-2" />
                            {dict.common.delete}
                        </Button>
                    ) : <div />}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            disabled={loading}
                            className="text-text-tertiary hover:text-text-primary px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            <ChevronLeft size={16} className="mr-2" />
                            {dict.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-500 hover:bg-primary-600 text-black font-black px-12 h-12 rounded-2xl shadow-glow-cyan/20 min-w-[200px]"
                        >
                            {loading ? <Spinner size="sm" color="black" /> : (
                                <span className="flex items-center gap-2">
                                    <Zap size={18} />
                                    {isEditing ? '更新系統配置' : '佈署 Agent'}
                                    <ArrowRight size={16} className="ml-2" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            <ArchitectChat
                onApply={handleArchitectApply}
                currentState={formData as unknown as Record<string, unknown>}
                dict={dict}
                fileNames={fileNames}
                toolNames={toolNames}
                skillNames={skillNames}
            />

            <FilePickerModal
                isOpen={showFilePicker}
                onClose={() => setShowFilePicker(false)}
                selectedFiles={formData.knowledge_files || []}
                onConfirm={(fileIds) => {
                    setFormData(prev => ({ ...prev, knowledge_files: fileIds }));
                }}
            />

            <SkillPickerModal
                isOpen={showSkillPicker}
                onClose={() => setShowSkillPicker(false)}
                selectedSkills={formData.enabled_skills || []}
                onConfirm={(skillIds) => {
                    setFormData(prev => ({ ...prev, enabled_skills: skillIds }));
                }}
            />

            <ToolPickerModal
                isOpen={showToolPicker}
                onClose={() => setShowToolPicker(false)}
                selectedTools={formData.enabled_tools || []}
                onConfirm={(toolIds) => {
                    setFormData(prev => ({ ...prev, enabled_tools: toolIds }));
                }}
            />

            <ConfirmDialog
                open={!!restorePrompt}
                title="回溯 Prompt 版本"
                description="確定要回溯到此版本嗎？當前的編輯內容將會被覆蓋。"
                onConfirm={handleRestoreConfirm}
                onCancel={() => setRestorePrompt(null)}
                confirmText="確認回溯"
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="刪除 Agent"
                description="確定要刪除此 Agent 嗎？此動作無法復原。"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="確認刪除"
                variant="danger"
            />
        </div>
    );
}
