/**
 * 核心服務配置元件
 * 包含 Gemini AI 和 S3 儲存配置
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button } from '@/components/ui';
import {
  Zap,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
  Save,
  X
} from 'lucide-react';

interface SystemConfig {
  gemini: {
    api_key_configured: boolean;
    api_key_source: 'database' | 'env' | 'none';
    model_version: string;
  };
  storage: {
    s3_endpoint_configured: boolean;
    s3_endpoint_source: 'database' | 'env' | 'none';
    s3_access_key_configured: boolean;
    s3_access_key_source: 'database' | 'env' | 'none';
    s3_secret_key_configured: boolean;
    s3_secret_key_source: 'database' | 'env' | 'none';
    s3_bucket: string;
    s3_region: string;
  };
  app: {
    app_url: string;
    node_env: string;
  };
}

interface EditableFields {
  gemini_api_key?: string;
  gemini_model_version?: string;
  s3_endpoint?: string;
  s3_access_key?: string;
  s3_secret_key?: string;
  s3_bucket?: string;
  s3_region?: string;
  app_url?: string;
}

interface Props {
  dict: Dictionary;
}

export default function CoreServicesConfig({ dict }: Props) {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 編輯狀態
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableFields>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // 密碼確認 Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // 載入系統設定
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/system/config');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || dict.common.error);
      }

      setConfig(data.data);
      // 初始化編輯資料
      setEditData({
        gemini_model_version: data.data.gemini.model_version,
        s3_bucket: data.data.storage.s3_bucket,
        s3_region: data.data.storage.s3_region,
        app_url: data.data.app.app_url,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }, [dict]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async (withPassword?: string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 找出有變更的欄位
      const updates: EditableFields = {};
      if (editData.gemini_model_version !== config?.gemini.model_version) {
        updates.gemini_model_version = editData.gemini_model_version;
      }
      if (editData.gemini_api_key) {
        updates.gemini_api_key = editData.gemini_api_key;
      }
      if (editData.s3_endpoint) {
        updates.s3_endpoint = editData.s3_endpoint;
      }
      if (editData.s3_access_key) {
        updates.s3_access_key = editData.s3_access_key;
      }
      if (editData.s3_secret_key) {
        updates.s3_secret_key = editData.s3_secret_key;
      }
      if (editData.s3_bucket !== config?.storage.s3_bucket) {
        updates.s3_bucket = editData.s3_bucket;
      }
      if (editData.s3_region !== config?.storage.s3_region) {
        updates.s3_region = editData.s3_region;
      }
      if (editData.app_url !== config?.app.app_url) {
        updates.app_url = editData.app_url;
      }

      if (Object.keys(updates).length === 0) {
        setError('沒有變更需要儲存');
        return;
      }

      const response = await fetch('/api/system/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          ...(withPassword ? { confirm_password: withPassword } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 'CONFIRMATION_REQUIRED') {
          setShowPasswordModal(true);
          return;
        }
        throw new Error(data.error?.message || dict.common.error);
      }

      setSuccessMessage('設定已成功更新');
      setIsEditing(false);
      setShowPasswordModal(false);
      setConfirmPassword('');

      // 清除敏感欄位的編輯值
      setEditData(prev => ({
        ...prev,
        gemini_api_key: undefined,
        s3_endpoint: undefined,
        s3_access_key: undefined,
        s3_secret_key: undefined,
      }));

      await loadConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 訊息提示 */}
      {error && (
        <Card variant="glass" className="bg-semantic-danger/10 border-semantic-danger/20 p-4">
          <div className="flex items-center gap-3 text-semantic-danger">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      {successMessage && (
        <Card variant="glass" className="bg-semantic-success/10 border-semantic-success/20 p-4">
          <div className="flex items-center gap-3 text-semantic-success">
            <CheckCircle size={20} />
            <p className="font-medium">{successMessage}</p>
          </div>
        </Card>
      )}

      {/* 操作按鈕 */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="ghost"
          onClick={loadConfig}
          disabled={loading || saving}
          size="sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          重新載入
        </Button>
        {!isEditing ? (
          <Button
            variant="cta"
            onClick={() => setIsEditing(true)}
            size="sm"
          >
            <Zap size={16} className="mr-2" />
            編輯設定
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                loadConfig();
              }}
              size="sm"
            >
              <X size={16} className="mr-2" />
              取消
            </Button>
            <Button
              variant="cta"
              onClick={() => handleSave()}
              loading={saving}
              size="sm"
            >
              <Save size={16} className="mr-2" />
              儲存變更
            </Button>
          </div>
        )}
      </div>

      {/* 配置卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini AI 配置 */}
        <Card variant="glass" className="p-6 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <Zap size={20} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  Gemini AI 配置
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  AI 模型設定
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <SettingRow
                title="API 金鑰"
                description="Google AI Studio 獲取的 API 金鑰"
                status={config?.gemini.api_key_configured ? { configured: true, source: config.gemini.api_key_source } : { configured: false, source: 'none' }}
              >
                <div className="flex gap-2">
                  <input
                    type={showSecrets['gemini'] ? 'text' : 'password'}
                    value={editData.gemini_api_key || ''}
                    onChange={(e) => setEditData({ ...editData, gemini_api_key: e.target.value })}
                    placeholder={config?.gemini.api_key_configured && !editData.gemini_api_key ? "******** (已從來源配置)" : "輸入 API Key"}
                    disabled={!isEditing}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button
                    onClick={() => setShowSecrets({ ...showSecrets, gemini: !showSecrets['gemini'] })}
                    disabled={!isEditing}
                    className="p-3 hover:bg-white/5 rounded-xl text-text-tertiary transition-colors disabled:opacity-30"
                  >
                    {showSecrets['gemini'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </SettingRow>

              <SettingRow
                title="預設模型"
                description="系統預設使用的 Gemini 模型版本"
              >
                <select
                  value={editData.gemini_model_version || 'gemini-3-flash-preview'}
                  onChange={(e) => setEditData({ ...editData, gemini_model_version: e.target.value })}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (最快)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (最強)</option>
                </select>
              </SettingRow>
            </div>
          </div>
        </Card>

        {/* S3 儲存配置 */}
        <Card variant="glass" className="p-6 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Database size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  S3 儲存配置
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  Cloudflare R2 / AWS S3
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <SettingRow
                title="Endpoint URL"
                status={config?.storage.s3_endpoint_configured ? { configured: true, source: config.storage.s3_endpoint_source } : { configured: false, source: 'none' }}
              >
                <input
                  type="text"
                  value={editData.s3_endpoint || ''}
                  onChange={(e) => setEditData({ ...editData, s3_endpoint: e.target.value })}
                  placeholder={config?.storage.s3_endpoint_configured && !editData.s3_endpoint ? "已從來源配置" : "https://<accountid>.r2.cloudflarestorage.com"}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-mono"
                />
              </SettingRow>

              <div className="grid grid-cols-2 gap-4">
                <SettingRow
                  title="Access Key"
                  status={config?.storage.s3_access_key_configured ? { configured: true, source: config.storage.s3_access_key_source } : { configured: false, source: 'none' }}
                >
                  <input
                    type="password"
                    value={editData.s3_access_key || ''}
                    onChange={(e) => setEditData({ ...editData, s3_access_key: e.target.value })}
                    placeholder={config?.storage.s3_access_key_configured && !editData.s3_access_key ? "********" : "Access Key"}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </SettingRow>
                <SettingRow
                  title="Secret Key"
                  status={config?.storage.s3_secret_key_configured ? { configured: true, source: config.storage.s3_secret_key_source } : { configured: false, source: 'none' }}
                >
                  <input
                    type="password"
                    value={editData.s3_secret_key || ''}
                    onChange={(e) => setEditData({ ...editData, s3_secret_key: e.target.value })}
                    placeholder={config?.storage.s3_secret_key_configured && !editData.s3_secret_key ? "********" : "Secret Key"}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </SettingRow>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SettingRow title="Bucket Name">
                  <input
                    type="text"
                    value={editData.s3_bucket || ''}
                    onChange={(e) => setEditData({ ...editData, s3_bucket: e.target.value })}
                    placeholder="例如: knowledge-base"
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </SettingRow>
                <SettingRow title="Region">
                  <input
                    type="text"
                    value={editData.s3_region || ''}
                    onChange={(e) => setEditData({ ...editData, s3_region: e.target.value })}
                    placeholder="例如: auto 或 us-east-1"
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </SettingRow>
              </div>
            </div>
          </div>
        </Card>

        {/* App 通用設定 */}
        <Card variant="glass" className="p-6 border-white/10 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Zap size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  應用程式通用設定
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  系統基礎配置
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingRow title="APP URL" description="系統對外存取的基準 URL">
                <input
                  type="text"
                  value={editData.app_url || ''}
                  onChange={(e) => setEditData({ ...editData, app_url: e.target.value })}
                  placeholder="https://your-app-domain.com"
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </SettingRow>
            </div>
          </div>
        </Card>
      </div>

      {/* 密碼確認 Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card variant="glass" className="w-full max-w-md p-6 border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-primary-500">
              <Lock size={24} />
              <h3 className="text-xl font-bold">二次驗證確認</h3>
            </div>
            <p className="text-text-secondary mb-6 text-sm">
              修改敏感 API 金鑰需要輸入您的登入密碼以確保安全性。
            </p>
            <div className="space-y-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="輸入您的當前密碼"
                autoFocus
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(confirmPassword);
                }}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                  取消
                </Button>
                <Button variant="cta" className="flex-1" onClick={() => handleSave(confirmPassword)} loading={saving}>
                  確認並儲存
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// 設定行元件
function SettingRow({ title, description, status, children }: {
  title: string;
  description?: string;
  status?: { configured: boolean; source: string };
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-text-primary">
          {title}
          {status && (
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${status.configured
                ? 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20'
                : 'bg-white/5 text-text-tertiary border border-white/10'
              }`}>
              {status.configured ? `已配置 (${status.source === 'database' ? 'DB' : 'ENV'})` : '未配置'}
            </span>
          )}
        </label>
      </div>
      {children}
      {description && <p className="text-xs text-text-tertiary opacity-60">{description}</p>}
    </div>
  );
}
