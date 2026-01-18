/**
 * MCP Servers 與 Skills 管理元件
 * 供 SUPER_ADMIN 管理系統層級的 MCP Servers 和 Skills
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
    BrainCircuit,
    Eye,
    EyeOff,
    Save,
    X
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

interface Props {
    dict: Dictionary;
}

export default function MCPSkillsConfig({ dict: _dict }: Props) {
    // MCP Servers 狀態
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 編輯狀態
    const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    // 表單資料
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

    // 新增能力輸入
    const [newCapability, setNewCapability] = useState('');

    useEffect(() => {
        loadMCPServers();
    }, []);

    const loadMCPServers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/system/mcp-servers');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || '載入失敗');
            }

            setMcpServers(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setLoading(false);
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
        setNewCapability('');
        setShowCreateForm(true);
    };

    const handleEdit = (server: MCPServer) => {
        setEditingServer(server);
        setFormData({
            name: server.name,
            display_name: server.display_name,
            description: server.description || '',
            server_url: server.server_url,
            server_type: server.server_type,
            api_key: '', // 不顯示實際的 API Key，讓使用者重新輸入
            capabilities: [...server.capabilities],
            is_active: server.is_active
        });
        setNewCapability('');
        setShowCreateForm(true);
    };

    const handleCancel = () => {
        setShowCreateForm(false);
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
        setNewCapability('');
    };

    const addCapability = () => {
        if (!newCapability.trim()) return;
        const caps = formData.capabilities || [];
        if (!caps.includes(newCapability.trim())) {
            setFormData({
                ...formData,
                capabilities: [...caps, newCapability.trim()]
            });
        }
        setNewCapability('');
    };

    const removeCapability = (cap: string) => {
        const caps = formData.capabilities || [];
        setFormData({
            ...formData,
            capabilities: caps.filter(c => c !== cap)
        });
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const payload = {
                ...formData,
                capabilities: formData.capabilities || []
            };

            // 如果沒有輸入新的 API Key，就不包含在更新中
            if (editingServer && !formData.api_key) {
                delete payload.api_key;
            }

            const url = editingServer
                ? '/api/system/mcp-servers'
                : '/api/system/mcp-servers';
            const method = editingServer ? 'PUT' : 'POST';
            const body = editingServer
                ? { id: editingServer.id, ...payload }
                : payload;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || '儲存失敗');
            }

            setSuccessMessage(editingServer ? 'MCP Server 已更新' : 'MCP Server 已建立');
            setShowCreateForm(false);
            setEditingServer(null);
            await loadMCPServers();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/system/mcp-servers?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || '刪除失敗');
            }

            setSuccessMessage('MCP Server 已刪除');
            setShowDeleteConfirm(null);
            await loadMCPServers();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        }
    };

    if (loading) {
        return (
            <Card variant="glass" className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-text-tertiary">載入 MCP Servers...</span>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                            <Server size={20} className="text-primary-400" />
                            🔌 MCP Servers 管理
                        </h2>
                        <p className="text-sm text-text-tertiary mt-1">
                            註冊的 MCP Servers 可同時供「超級管家」和「Agent 建立」使用
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadMCPServers}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            重新載入
                        </Button>
                        <Button
                            variant="cta"
                            size="sm"
                            onClick={handleCreate}
                        >
                            <Plus size={16} className="mr-2" />
                            新增 MCP Server
                        </Button>
                    </div>
                </div>

                {/* 成功訊息 */}
                {successMessage && (
                    <div className="bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-semantic-success" />
                        <span className="text-sm text-semantic-success font-medium">{successMessage}</span>
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-semantic-danger/10 border border-semantic-danger/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-semantic-danger" />
                        <span className="text-sm text-semantic-danger font-medium">{error}</span>
                    </div>
                )}

                {/* MCP Servers 列表 */}
                {mcpServers.length === 0 ? (
                    <div className="text-center py-12 text-text-tertiary">
                        <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium mb-2">目前沒有註冊的 MCP Servers</p>
                        <p className="text-xs opacity-60">點擊「新增 MCP Server」開始註冊</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mcpServers.map(server => (
                            <div
                                key={server.id}
                                className="border border-white/10 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-2 h-2 rounded-full ${server.is_active ? 'bg-semantic-success' : 'bg-semantic-danger'}`} />
                                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                                                {server.display_name}
                                            </h3>
                                            <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-text-tertiary font-mono">
                                                {server.name}
                                            </span>
                                        </div>
                                        {server.description && (
                                            <p className="text-sm text-text-secondary mb-2">{server.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-text-tertiary mt-2">
                                            <span className="flex items-center gap-1">
                                                <Server size={12} />
                                                {server.server_url}
                                            </span>
                                            <span className="px-2 py-0.5 bg-white/5 rounded uppercase">
                                                {server.server_type}
                                            </span>
                                            {server.last_health_check && (
                                                <span className="text-[10px] opacity-60">
                                                    最後檢查: {new Date(server.last_health_check).toLocaleString('zh-TW')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(server)}
                                        >
                                            <Edit2 size={14} className="mr-1" />
                                            編輯
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(server.id)}
                                            className="text-semantic-danger hover:bg-semantic-danger/10 border-semantic-danger/30"
                                        >
                                            <Trash2 size={14} className="mr-1" />
                                            刪除
                                        </Button>
                                    </div>
                                </div>

                                {/* Capabilities */}
                                {server.capabilities && server.capabilities.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BrainCircuit size={14} className="text-purple-400" />
                                            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                                                能力 (Capabilities)
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {server.capabilities.map(cap => (
                                                <span
                                                    key={cap}
                                                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-lg"
                                                >
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* 新增/編輯表單 Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card variant="glass" className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {editingServer ? '編輯 MCP Server' : '新增 MCP Server'}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* 基本資訊 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">
                                        名稱 (Name) <span className="text-semantic-danger">*</span>
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="gmail, slack, notion"
                                        className="bg-black/20 font-mono"
                                        disabled={!!editingServer} // 編輯時不可修改名稱
                                    />
                                    <p className="text-xs text-text-tertiary mt-1">唯一識別名，用於程式碼中引用</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">
                                        顯示名稱 <span className="text-semantic-danger">*</span>
                                    </label>
                                    <Input
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                        placeholder="Gmail MCP Server"
                                        className="bg-black/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">
                                    描述
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="此 MCP Server 的用途與功能說明..."
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px] resize-none"
                                />
                            </div>

                            {/* 連接資訊 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">
                                        Server URL <span className="text-semantic-danger">*</span>
                                    </label>
                                    <Input
                                        value={formData.server_url}
                                        onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                                        placeholder="https://api.example.com/mcp"
                                        className="bg-black/20 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">
                                        Server Type
                                    </label>
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

                            {/* API Key */}
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">
                                    API Key {editingServer && '(留空則不更新)'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={formData.api_key}
                                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                        placeholder="輸入 API Key (可選)"
                                        className="bg-black/20 font-mono pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                                    >
                                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Capabilities */}
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">
                                    能力 (Capabilities)
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={newCapability}
                                        onChange={(e) => setNewCapability(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addCapability();
                                            }
                                        }}
                                        placeholder="輸入能力名稱後按 Enter"
                                        className="bg-black/20 flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addCapability}
                                    >
                                        <Plus size={14} />
                                    </Button>
                                </div>
                                {formData.capabilities && formData.capabilities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.capabilities.map(cap => (
                                            <span
                                                key={cap}
                                                className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-lg flex items-center gap-2"
                                            >
                                                {cap}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCapability(cap)}
                                                    className="hover:text-semantic-danger"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 狀態 */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active ?? true}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-black/20 text-primary-500 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm font-bold text-text-secondary">
                                        啟用 (Active)
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                            >
                                取消
                            </Button>
                            <Button
                                variant="cta"
                                className="flex-1"
                                onClick={handleSave}
                                disabled={!formData.name || !formData.display_name || !formData.server_url}
                            >
                                <Save size={16} className="mr-2" />
                                {editingServer ? '更新' : '建立'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* 刪除確認 Dialog */}
            <ConfirmDialog
                open={!!showDeleteConfirm}
                title="刪除 MCP Server"
                description="確定要刪除此 MCP Server 嗎？此動作無法復原，且可能會影響使用此 Server 的 Agent。"
                onConfirm={() => {
                    if (showDeleteConfirm) {
                        handleDelete(showDeleteConfirm);
                    }
                }}
                onCancel={() => setShowDeleteConfirm(null)}
                confirmText="確認刪除"
                variant="danger"
            />
        </>
    );
}
