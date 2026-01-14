'use client';

/**
 * MCP 工具 API Key 設定元件
 * 動態讀取需要 API Key 的工具，並顯示對應的設定欄位
 */
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button } from '@/components/ui';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Settings2, RefreshCw } from 'lucide-react';

interface ToolApiKeyConfig {
    key: string;
    name: string;
    description: string;
    placeholder?: string;
    required_for?: string[];
}

interface ToolWithApiKeyRequirement {
    id: string;
    name: string;
    display_name: string;
    icon: string;
    category: string;
    api_key_config: Record<string, ToolApiKeyConfig>;
    configured_keys: Record<string, { configured: boolean; source: 'database' | 'env' | 'none' }>;
}

interface Props {
    dict: Dictionary;
}

export default function ToolApiKeysConfig({ dict }: Props) {
    const [tools, setTools] = useState<ToolWithApiKeyRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 編輯狀態
    const [editingKey, setEditingKey] = useState<{ toolName: string; configKey: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    // 密碼確認
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/system/tool-api-keys');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || '載入失敗');
            }

            setTools(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (toolName: string, configKey: string) => {
        setEditingKey({ toolName, configKey });
        setEditValue('');
        setShowSecret(false);
    };

    const handleCancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
        setShowSecret(false);
    };

    const handleSave = async () => {
        if (!editingKey) return;

        if (!confirmPassword) {
            setShowPasswordModal(true);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const response = await fetch('/api/system/tool-api-keys', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool_name: editingKey.toolName,
                    config_key: editingKey.configKey,
                    api_key: editValue,
                    confirm_password: confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error?.code === 'CONFIRMATION_REQUIRED') {
                    setShowPasswordModal(true);
                    return;
                }
                throw new Error(data.error?.message || '儲存失敗');
            }

            setSuccessMessage('API Key 已成功更新');
            setEditingKey(null);
            setEditValue('');
            setConfirmPassword('');
            setShowPasswordModal(false);

            // 重新載入
            await loadTools();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordConfirm = () => {
        if (!confirmPassword) {
            setError('請輸入密碼');
            return;
        }
        setShowPasswordModal(false);
        handleSave();
    };

    // 按分類分組工具
    const toolsByCategory = tools.reduce((acc, tool) => {
        const category = tool.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(tool);
        return acc;
    }, {} as Record<string, ToolWithApiKeyRequirement[]>);

    const categoryLabels: Record<string, string> = {
        communication: '📢 通訊工具',
        external: '🌐 外部服務',
        data: '📊 資料工具',
        knowledge: '📚 知識工具',
        export: '📤 匯出工具',
        task: '✅ 任務工具',
        general: '⚙️ 一般工具',
    };

    if (loading) {
        return (
            <Card variant="glass" className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-text-tertiary">載入工具設定...</span>
                </div>
            </Card>
        );
    }

    if (tools.length === 0) {
        return (
            <Card variant="glass" className="p-6">
                <h2 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tight flex items-center gap-2">
                    🔌 MCP 工具 API 設定
                </h2>
                <p className="text-sm text-text-tertiary mb-4">動態管理各工具需要的 API 密鑰</p>
                <div className="text-center py-8 text-text-tertiary">
                    <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>目前沒有需要 API Key 的工具</p>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                        🔌 MCP 工具 API 設定
                    </h2>
                    <p className="text-sm text-text-tertiary mt-1">動態管理各工具需要的 API 密鑰</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadTools} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    重新載入
                </Button>
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

            <div className="space-y-6">
                {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                    <div key={category}>
                        <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wide">
                            {categoryLabels[category] || category}
                        </h3>
                        <div className="space-y-3">
                            {categoryTools.map(tool => (
                                <div
                                    key={tool.id}
                                    className="border border-white/10 rounded-xl p-4 bg-white/[0.02]"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{tool.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-text-primary">{tool.display_name}</h4>
                                            <p className="text-xs text-text-tertiary font-mono">{tool.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 ml-9">
                                        {Object.entries(tool.api_key_config).map(([configKey, config]) => {
                                            const isEditing = editingKey?.toolName === tool.name && editingKey?.configKey === config.key;
                                            const status = tool.configured_keys[configKey];

                                            return (
                                                <div key={configKey} className="flex items-center justify-between py-2 border-t border-white/5">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-text-secondary">{config.name}</span>
                                                            {config.required_for && (
                                                                <span className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-white/5">
                                                                    {config.required_for.join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-tertiary mt-0.5">{config.description}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="relative">
                                                                    <input
                                                                        type={showSecret ? 'text' : 'password'}
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        placeholder={config.placeholder || '輸入 API Key...'}
                                                                        className="w-64 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 pr-10"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowSecret(!showSecret)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                                                                    >
                                                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                                <Button
                                                                    variant="cta"
                                                                    size="sm"
                                                                    onClick={handleSave}
                                                                    loading={saving}
                                                                >
                                                                    儲存
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    取消
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {status?.configured ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="inline-block w-2 h-2 bg-semantic-success rounded-full"></span>
                                                                        <span className="text-sm text-semantic-success font-medium">
                                                                            {dict.admin.system.configured}
                                                                        </span>
                                                                        <span className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-white/5 uppercase">
                                                                            {status.source === 'database' ? '資料庫' : '環境變數'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="inline-block w-2 h-2 bg-semantic-danger rounded-full"></span>
                                                                        <span className="text-sm text-semantic-danger font-medium">
                                                                            {dict.admin.system.not_configured}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(tool.name, config.key)}
                                                                    className="text-xs"
                                                                >
                                                                    {status?.configured ? '更新' : '設定'}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 密碼確認 Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card variant="glass" className="p-6 w-full max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary">安全驗證</h3>
                                <p className="text-sm text-text-tertiary">修改 API Key 需要驗證您的身份</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-text-secondary mb-2">
                                請輸入您的密碼
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="輸入密碼..."
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handlePasswordConfirm();
                                }}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setConfirmPassword('');
                                }}
                            >
                                取消
                            </Button>
                            <Button
                                variant="cta"
                                className="flex-1"
                                onClick={handlePasswordConfirm}
                                loading={saving}
                            >
                                確認
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </Card>
    );
}
