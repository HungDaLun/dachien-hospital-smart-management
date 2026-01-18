/**
 * MCP 設定元件
 * 獨立管理 MCP Servers 與 MCP API Keys
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button, Input, Select, ConfirmDialog } from '@/components/ui';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Server,
    Key,
    Eye,
    EyeOff,
    Save,
    X,
    Globe
} from 'lucide-react';

interface MCPServer {
    id: string;
    name: string;
    display_name: string;
    description?: string;
    server_url: string;
    server_type: 'http' | 'websocket' | 'stdio';
    api_key?: string;
    capabilities: string[];
    is_active: boolean;
    last_health_check?: string;
    created_at: string;
    updated_at: string;
}

interface MCPApiKeys {
    web_search_api_key?: { configured: boolean; source: string };
    cron_secret?: { configured: boolean; source: string };
}

interface Props {
    dict: Dictionary;
}

type SubSection = 'mcp-servers' | 'mcp-api-keys';

export default function MCPSettings({ dict: _dict }: Props) {
    const [activeSection, setActiveSection] = useState<SubSection>('mcp-servers');

    // MCP Servers 狀態
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
    const [mcpLoading, setMcpLoading] = useState(true);
    const [mcpError, setMcpError] = useState<string | null>(null);

    // MCP API Keys 狀態
    const [mcpApiKeys, setMcpApiKeys] = useState<MCPApiKeys | null>(null);
    const [apiKeysLoading, setApiKeysLoading] = useState(true);
    const [apiKeysError, setApiKeysError] = useState<string | null>(null);
    const [isEditingApiKeys, setIsEditingApiKeys] = useState(false);
    const [apiKeysEditData, setApiKeysEditData] = useState({
        web_search_api_key: '',
        cron_secret: ''
    });
    const [showApiKeySecrets, setShowApiKeySecrets] = useState<Record<string, boolean>>({});

    // MCP Server 編輯狀態
    const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [formData, setFormData] = useState<Partial<MCPServer>>({
        name: '',
        display_name: '',
        description: '',
        server_url: '',
        server_type: 'http',
        api_key: '',
        capabilities: [],
        is_active: true
    });
    const [newCapability, setNewCapability] = useState('');

    // 成功訊息
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // 載入 MCP Servers
    useEffect(() => {
        if (activeSection === 'mcp-servers') {
            loadMCPServers();
        }
    }, [activeSection]);

    // 載入 MCP API Keys
    useEffect(() => {
        if (activeSection === 'mcp-api-keys') {
            loadMCPApiKeys();
        }
    }, [activeSection]);

    const loadMCPServers = async () => {
        try {
            setMcpLoading(true);
            setMcpError(null);
            const response = await fetch('/api/system/mcp-servers');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '載入失敗');
            setMcpServers(data.data || []);
        } catch (err) {
            setMcpError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setMcpLoading(false);
        }
    };

    const loadMCPApiKeys = async () => {
        try {
            setApiKeysLoading(true);
            setApiKeysError(null);
            const response = await fetch('/api/system/config');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '載入失敗');
            setMcpApiKeys({
                web_search_api_key: data.data?.mcp?.web_search_api_key,
                cron_secret: data.data?.mcp?.cron_secret
            });
        } catch (err) {
            setApiKeysError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setApiKeysLoading(false);
        }
    };

    const handleSaveMCPApiKeys = async () => {
        try {
            setSaving(true);
            setApiKeysError(null);
            const updates: Record<string, string> = {};
            if (apiKeysEditData.web_search_api_key) {
                updates.web_search_api_key = apiKeysEditData.web_search_api_key;
            }
            if (apiKeysEditData.cron_secret) {
                updates.cron_secret = apiKeysEditData.cron_secret;
            }

            if (Object.keys(updates).length === 0) {
                setApiKeysError('沒有變更需要儲存');
                return;
            }

            const response = await fetch('/api/system/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '儲存失敗');

            setSuccessMessage('MCP API Keys 已成功更新');
            setIsEditingApiKeys(false);
            setApiKeysEditData({ web_search_api_key: '', cron_secret: '' });
            await loadMCPApiKeys();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setApiKeysError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = () => {
        setEditingServer(null);
        setFormData({
            name: '',
            display_name: '',
            description: '',
            server_url: '',
            server_type: 'http',
            api_key: '',
            capabilities: [],
            is_active: true
        });
        setShowCreateForm(true);
    };

    const handleEdit = (server: MCPServer) => {
        setEditingServer(server);
        setFormData({
            name: server.name,
            display_name: server.display_name,
            description: server.description,
            server_url: server.server_url,
            server_type: server.server_type,
            api_key: '',
            capabilities: [...server.capabilities],
            is_active: server.is_active
        });
        setShowCreateForm(true);
    };

    const handleSaveServer = async () => {
        try {
            setSaving(true);
            setMcpError(null);

            const payload: Record<string, unknown> = {
                ...formData,
                capabilities: formData.capabilities || []
            };

            // 如果是編輯，需要將 id 包含在 payload 中
            if (editingServer) {
                payload.id = editingServer.id;
            }

            const url = '/api/system/mcp-servers';
            const method = editingServer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '儲存失敗');

            setSuccessMessage(editingServer ? 'MCP Server 已更新' : 'MCP Server 已建立');
            setShowCreateForm(false);
            setEditingServer(null);
            await loadMCPServers();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setMcpError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteServer = async (serverId: string) => {
        try {
            setSaving(true);
            const response = await fetch(`/api/system/mcp-servers?id=${serverId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '刪除失敗');
            setSuccessMessage('MCP Server 已刪除');
            await loadMCPServers();
            setShowDeleteConfirm(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setMcpError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setSaving(false);
        }
    };

    const addCapability = () => {
        if (newCapability.trim() && !formData.capabilities?.includes(newCapability.trim())) {
            setFormData({
                ...formData,
                capabilities: [...(formData.capabilities || []), newCapability.trim()]
            });
            setNewCapability('');
        }
    };

    const removeCapability = (cap: string) => {
        setFormData({
            ...formData,
            capabilities: formData.capabilities?.filter(c => c !== cap) || []
        });
    };

    const sections: { id: SubSection; label: string; icon: React.ReactNode; description: string }[] = [
        {
            id: 'mcp-servers',
            label: 'MCP Servers',
            icon: <Server size={18} />,
            description: '註冊與管理 MCP 伺服器'
        },
        {
            id: 'mcp-api-keys',
            label: 'MCP API Keys',
            icon: <Key size={18} />,
            description: 'Web Search、Cron 等 MCP 工具的 API 金鑰'
        }
    ];

    return (
        <div className="space-y-6">
            {/* 子 Tab 導航 */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-1 backdrop-blur-xl">
                <div className="flex gap-1">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                        : 'text-text-tertiary hover:text-text-primary hover:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                {section.icon}
                                <span>{section.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 成功訊息 */}
            {successMessage && (
                <Card variant="glass" className="bg-semantic-success/10 border-semantic-success/20 p-4">
                    <div className="flex items-center gap-3 text-semantic-success">
                        <CheckCircle size={20} />
                        <p className="font-medium">{successMessage}</p>
                    </div>
                </Card>
            )}

            {/* MCP Servers 區塊 */}
            {activeSection === 'mcp-servers' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                                MCP Servers 管理
                            </h3>
                            <p className="text-xs text-text-tertiary uppercase tracking-widest mt-1 opacity-60">
                                註冊的 MCP Servers 可供超級管家和 Agent 使用
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={loadMCPServers} disabled={mcpLoading}>
                                <RefreshCw size={16} className={mcpLoading ? 'animate-spin' : ''} />
                            </Button>
                            <Button variant="cta" size="sm" onClick={handleCreate}>
                                <Plus size={16} className="mr-2" />
                                新增 Server
                            </Button>
                        </div>
                    </div>

                    {mcpError && (
                        <Card variant="glass" className="bg-semantic-danger/10 border-semantic-danger/20 p-4">
                            <div className="flex items-center gap-3 text-semantic-danger">
                                <AlertCircle size={20} />
                                <p className="font-medium">{mcpError}</p>
                            </div>
                        </Card>
                    )}

                    {mcpLoading ? (
                        <Card variant="glass" className="p-6">
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
                            </div>
                        </Card>
                    ) : mcpServers.length === 0 ? (
                        <Card variant="glass" className="p-6">
                            <div className="text-center py-8 text-text-tertiary">
                                <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>目前沒有註冊的 MCP Servers</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {mcpServers.map((server) => (
                                <Card key={server.id} variant="glass" className="p-4 border-white/10">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Server size={18} className="text-primary-400" />
                                            <h4 className="font-bold text-text-primary">{server.display_name}</h4>
                                            {!server.is_active && (
                                                <span className="px-2 py-0.5 bg-white/5 text-xs text-text-tertiary rounded">已停用</span>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(server)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(server.id)}>
                                                <Trash2 size={14} className="text-semantic-danger" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-tertiary mb-2">{server.description || '無描述'}</p>
                                    <div className="text-xs text-text-tertiary space-y-1">
                                        <p><span className="font-bold">URL:</span> <span className="font-mono">{server.server_url}</span></p>
                                        <p><span className="font-bold">類型:</span> {server.server_type}</p>
                                        {server.capabilities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {server.capabilities.map(cap => (
                                                    <span key={cap} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded">
                                                        {cap}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* 建立/編輯表單 */}
                    {showCreateForm && (
                        <Card variant="glass" className="p-6 border-primary-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-text-primary">
                                    {editingServer ? '編輯 MCP Server' : '新增 MCP Server'}
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setShowCreateForm(false);
                                    setEditingServer(null);
                                }}>
                                    <X size={16} />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">
                                            名稱 (Name) <span className="text-semantic-danger">*</span>
                                        </label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="gmail, slack"
                                            disabled={!!editingServer}
                                            className="bg-black/20 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">
                                            顯示名稱 <span className="text-semantic-danger">*</span>
                                        </label>
                                        <Input
                                            value={formData.display_name || ''}
                                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                            placeholder="Gmail MCP Server"
                                            className="bg-black/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">描述</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="此 MCP Server 的用途與功能說明..."
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px] resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">
                                            Server URL <span className="text-semantic-danger">*</span>
                                        </label>
                                        <Input
                                            value={formData.server_url || ''}
                                            onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                                            placeholder="https://api.example.com/mcp"
                                            className="bg-black/20 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Server Type</label>
                                        <Select
                                            value={formData.server_type || 'http'}
                                            onChange={(e) => setFormData({ ...formData, server_type: e.target.value as 'http' | 'websocket' | 'stdio' })}
                                            options={[
                                                { value: 'http', label: 'HTTP' },
                                                { value: 'websocket', label: 'WebSocket' },
                                                { value: 'stdio', label: 'Stdio' }
                                            ]}
                                            className="bg-black/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">API Key (選填)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={formData.api_key || ''}
                                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                            placeholder="輸入 API Key"
                                            className="flex-1 bg-black/20 font-mono"
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Capabilities</label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={newCapability}
                                            onChange={(e) => setNewCapability(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                                            placeholder="輸入能力標籤"
                                            className="flex-1 bg-black/20"
                                        />
                                        <Button variant="ghost" size="sm" onClick={addCapability}>
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.capabilities?.map(cap => (
                                            <span key={cap} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded flex items-center gap-1">
                                                {cap}
                                                <button onClick={() => removeCapability(cap)} className="hover:text-semantic-danger">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="ghost" className="flex-1" onClick={() => {
                                        setShowCreateForm(false);
                                        setEditingServer(null);
                                    }}>
                                        取消
                                    </Button>
                                    <Button variant="cta" className="flex-1" onClick={handleSaveServer} loading={saving}>
                                        <Save size={16} className="mr-2" />
                                        儲存
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* 刪除確認 */}
                    <ConfirmDialog
                        open={!!showDeleteConfirm}
                        onCancel={() => setShowDeleteConfirm(null)}
                        onConfirm={() => showDeleteConfirm && handleDeleteServer(showDeleteConfirm)}
                        title="確認刪除"
                        description="確定要刪除此 MCP Server 嗎？此操作無法復原。"
                        confirmText="刪除"
                        cancelText="取消"
                        variant="danger"
                    />
                </div>
            )}

            {/* MCP API Keys 區塊 */}
            {activeSection === 'mcp-api-keys' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                                MCP API Keys
                            </h3>
                            <p className="text-xs text-text-tertiary uppercase tracking-widest mt-1 opacity-60">
                                Web Search、Cron 等 MCP 擴充工具所需的 API 金鑰
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={loadMCPApiKeys} disabled={apiKeysLoading}>
                                <RefreshCw size={16} className={apiKeysLoading ? 'animate-spin' : ''} />
                            </Button>
                            {!isEditingApiKeys ? (
                                <Button variant="cta" size="sm" onClick={() => setIsEditingApiKeys(true)}>
                                    <Edit2 size={16} className="mr-2" />
                                    編輯
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setIsEditingApiKeys(false);
                                        setApiKeysEditData({ web_search_api_key: '', cron_secret: '' });
                                    }}>
                                        <X size={16} className="mr-2" />
                                        取消
                                    </Button>
                                    <Button variant="cta" size="sm" onClick={handleSaveMCPApiKeys} loading={saving}>
                                        <Save size={16} className="mr-2" />
                                        儲存
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {apiKeysError && (
                        <Card variant="glass" className="bg-semantic-danger/10 border-semantic-danger/20 p-4">
                            <div className="flex items-center gap-3 text-semantic-danger">
                                <AlertCircle size={20} />
                                <p className="font-medium">{apiKeysError}</p>
                            </div>
                        </Card>
                    )}

                    {apiKeysLoading ? (
                        <Card variant="glass" className="p-6">
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card variant="glass" className="p-6 border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Globe size={20} className="text-cyan-400" />
                                    <div>
                                        <h4 className="font-bold text-text-primary">Web Search API Key</h4>
                                        <p className="text-xs text-text-tertiary">用於網路搜尋功能</p>
                                    </div>
                                </div>
                                {isEditingApiKeys ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKeySecrets['web_search'] ? 'text' : 'password'}
                                            value={apiKeysEditData.web_search_api_key}
                                            onChange={(e) => setApiKeysEditData({ ...apiKeysEditData, web_search_api_key: e.target.value })}
                                            placeholder={mcpApiKeys?.web_search_api_key?.configured ? "******** (已配置)" : "輸入 Web Search API Key"}
                                            className="flex-1 bg-black/20 font-mono"
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => setShowApiKeySecrets({ ...showApiKeySecrets, web_search: !showApiKeySecrets['web_search'] })}>
                                            {showApiKeySecrets['web_search'] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-text-tertiary">
                                            {mcpApiKeys?.web_search_api_key?.configured ? '已配置' : '未配置'}
                                        </span>
                                        {mcpApiKeys?.web_search_api_key?.configured && (
                                            <span className="text-xs px-2 py-0.5 bg-semantic-success/10 text-semantic-success rounded">
                                                {mcpApiKeys.web_search_api_key.source === 'database' ? 'DB' : 'ENV'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Card>

                            <Card variant="glass" className="p-6 border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Key size={20} className="text-purple-400" />
                                    <div>
                                        <h4 className="font-bold text-text-primary">Cron Secret</h4>
                                        <p className="text-xs text-text-tertiary">用於定時任務功能</p>
                                    </div>
                                </div>
                                {isEditingApiKeys ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKeySecrets['cron'] ? 'text' : 'password'}
                                            value={apiKeysEditData.cron_secret}
                                            onChange={(e) => setApiKeysEditData({ ...apiKeysEditData, cron_secret: e.target.value })}
                                            placeholder={mcpApiKeys?.cron_secret?.configured ? "******** (已配置)" : "輸入 Cron Secret"}
                                            className="flex-1 bg-black/20 font-mono"
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => setShowApiKeySecrets({ ...showApiKeySecrets, cron: !showApiKeySecrets['cron'] })}>
                                            {showApiKeySecrets['cron'] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-text-tertiary">
                                            {mcpApiKeys?.cron_secret?.configured ? '已配置' : '未配置'}
                                        </span>
                                        {mcpApiKeys?.cron_secret?.configured && (
                                            <span className="text-xs px-2 py-0.5 bg-semantic-success/10 text-semantic-success rounded">
                                                {mcpApiKeys.cron_secret.source === 'database' ? 'DB' : 'ENV'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
