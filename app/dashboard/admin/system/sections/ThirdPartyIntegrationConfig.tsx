/**
 * 第三方整合服務配置元件
 * 包含新聞、通知等外部服務配置
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button } from '@/components/ui';
import {
  Newspaper,
  Bell,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
  Save,
  X,
  Sparkles
} from 'lucide-react';

interface ConfigStatus {
  configured: boolean;
  source: 'database' | 'env' | 'none';
}

interface SystemConfig {
  news: {
    news_api_key: ConfigStatus;
  };
  notification: {
    line_channel_id: ConfigStatus;
    line_channel_token: ConfigStatus;
    line_channel_secret: ConfigStatus;
    line_webhook_enabled: ConfigStatus;
    slack_webhook_url: ConfigStatus;
  };
  google_oauth: {
    client_id: ConfigStatus;
    client_secret: ConfigStatus;
    redirect_uri: { value: string; source: 'database' | 'env' | 'none' };
  };
  livekit: {
    url: { value: string; source: 'database' | 'env' | 'none' };
    api_key: ConfigStatus;
    api_secret: ConfigStatus;
  };
  openai: {
    api_key: ConfigStatus;
  };
}

interface EditableFields {
  news_api_key?: string;
  line_channel_id?: string;
  line_channel_token?: string;
  line_channel_secret?: string;
  line_webhook_enabled?: string;
  google_oauth_client_id?: string;
  google_oauth_client_secret?: string;
  google_oauth_redirect_uri?: string;
  livekit_url?: string;
  livekit_api_key?: string;
  livekit_api_secret?: string;
  openai_api_key?: string;
}

interface Props {
  dict: Dictionary;
}

export default function ThirdPartyIntegrationConfig({ dict }: Props) {
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
      setEditData({}); // 初始化空編輯數據
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

      const updates: EditableFields = {};
      if (editData.news_api_key) {
        updates.news_api_key = editData.news_api_key;
      }
      if (editData.line_channel_id) {
        updates.line_channel_id = editData.line_channel_id;
      }
      if (editData.line_channel_token) {
        updates.line_channel_token = editData.line_channel_token;
      }
      if (editData.line_channel_secret) {
        updates.line_channel_secret = editData.line_channel_secret;
      }
      if (editData.line_webhook_enabled !== undefined) {
        updates.line_webhook_enabled = editData.line_webhook_enabled;
      }
      if (editData.line_webhook_enabled !== undefined) {
        updates.line_webhook_enabled = editData.line_webhook_enabled;
      }
      if (editData.google_oauth_client_id) {
        updates.google_oauth_client_id = editData.google_oauth_client_id;
      }
      if (editData.google_oauth_client_secret) {
        updates.google_oauth_client_secret = editData.google_oauth_client_secret;
      }
      if (editData.google_oauth_redirect_uri) {
        updates.google_oauth_redirect_uri = editData.google_oauth_redirect_uri;
      }
      if (editData.livekit_url) {
        updates.livekit_url = editData.livekit_url;
      }
      if (editData.livekit_api_key) {
        updates.livekit_api_key = editData.livekit_api_key;
      }
      if (editData.livekit_api_secret) {
        updates.livekit_api_secret = editData.livekit_api_secret;
      }
      if (editData.openai_api_key) {
        updates.openai_api_key = editData.openai_api_key;
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

      // 清除敏感欄位
      setEditData(prev => ({
        ...prev,
        news_api_key: undefined,
        line_channel_id: undefined,
        line_channel_token: undefined,
        line_channel_secret: undefined,
        line_webhook_enabled: undefined,
        google_oauth_client_id: undefined,
        google_oauth_client_secret: undefined,
        google_oauth_redirect_uri: undefined,
        livekit_url: undefined,
        livekit_api_key: undefined,
        livekit_api_secret: undefined,
        openai_api_key: undefined,
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
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
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
            <Globe size={16} className="mr-2" />
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
        {/* 新聞與情資 */}
        <Card variant="glass" className="p-6 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Newspaper size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  新聞與情資
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  行業動態獲取
                </p>
              </div>
            </div>

            <SettingRow
              title="NewsAPI Key"
              description="用於獲取最新行業動態"
              status={config?.news.news_api_key}
            >
              <SecretInput
                value={editData.news_api_key || ''}
                onChange={(value) => setEditData(prev => ({ ...prev, news_api_key: value }))}
                placeholder={config?.news.news_api_key.configured && !editData.news_api_key ? "********" : "輸入 NewsAPI Key"}
                disabled={!isEditing}
                showSecret={showSecrets['news']}
                onToggleSecret={() => setShowSecrets({ ...showSecrets, news: !showSecrets['news'] })}
              />
            </SettingRow>
          </div>
        </Card>

        {/* 即時通知 */}
        <Card variant="glass" className="p-6 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <Bell size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  即時通知頻道
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  Line 整合
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SettingRow
                title="Line Channel ID"
                description="Line Developers Console 中的 Channel ID"
                status={config?.notification.line_channel_id}
              >
                <input
                  value={editData.line_channel_id || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditData(prev => ({ ...prev, line_channel_id: val }));
                  }}
                  autoComplete="off"
                  placeholder={config?.notification.line_channel_id?.configured && !editData.line_channel_id ? "********" : "輸入 Channel ID"}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  type="text"
                />
              </SettingRow>
              <SettingRow
                title="Line Channel Token"
                description="Line Messaging API 的 Channel Access Token"
                status={config?.notification.line_channel_token}
              >
                <SecretInput
                  value={editData.line_channel_token || ''}
                  onChange={(value) => setEditData(prev => ({ ...prev, line_channel_token: value }))}
                  placeholder={config?.notification.line_channel_token.configured && !editData.line_channel_token ? "********" : "輸入 Line Token"}
                  disabled={!isEditing}
                  showSecret={showSecrets['line']}
                  onToggleSecret={() => setShowSecrets({ ...showSecrets, line: !showSecrets['line'] })}
                />
              </SettingRow>
              <SettingRow
                title="Line Channel Secret"
                description="用於驗證 Webhook 簽章"
                status={config?.notification.line_channel_secret}
              >
                <SecretInput
                  value={editData.line_channel_secret || ''}
                  onChange={(value) => setEditData(prev => ({ ...prev, line_channel_secret: value }))}
                  placeholder={config?.notification.line_channel_secret?.configured && !editData.line_channel_secret ? "********" : "輸入 Line Channel Secret"}
                  disabled={!isEditing}
                  showSecret={showSecrets['line_secret']}
                  onToggleSecret={() => setShowSecrets({ ...showSecrets, line_secret: !showSecrets['line_secret'] })}
                />
              </SettingRow>
              <SettingRow
                title="Line Webhook"
                description="啟用後可透過 Line 與超級管家對話"
                status={config?.notification.line_webhook_enabled}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setEditData(prev => ({
                      ...prev,
                      line_webhook_enabled: prev.line_webhook_enabled === 'true' ? 'false' : 'true'
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${(editData.line_webhook_enabled === 'true' ||
                      (editData.line_webhook_enabled === undefined && config?.notification.line_webhook_enabled?.configured))
                      ? 'bg-green-500'
                      : 'bg-white/10'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(editData.line_webhook_enabled === 'true' ||
                        (editData.line_webhook_enabled === undefined && config?.notification.line_webhook_enabled?.configured))
                        ? 'translate-x-6'
                        : 'translate-x-1'
                        }`}
                    />
                  </button>
                  <span className="text-sm text-text-secondary">
                    {(editData.line_webhook_enabled === 'true' ||
                      (editData.line_webhook_enabled === undefined && config?.notification.line_webhook_enabled?.configured))
                      ? '已啟用' : '已停用'}
                  </span>
                </div>
              </SettingRow>
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-text-tertiary">
                  📌 Webhook URL: <code className="bg-black/30 px-2 py-0.5 rounded">/api/integrations/line/webhook</code>
                </p>
              </div>
            </div>
          </div>
        </Card >

        {/* Google OAuth 設定 */}
        < Card variant="glass" className="p-6 border-white/10 relative overflow-hidden" >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Globe size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  Google OAuth
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  行事曆同步授權
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SettingRow
                title="Client ID"
                status={config?.google_oauth.client_id}
              >
                <input
                  value={editData.google_oauth_client_id || ''}
                  onChange={(e) => setEditData({ ...editData, google_oauth_client_id: e.target.value })}
                  placeholder={config?.google_oauth.client_id.configured && !editData.google_oauth_client_id ? "********" : "輸入 Client ID"}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  type="text"
                />
              </SettingRow>
              <SettingRow
                title="Client Secret"
                status={config?.google_oauth.client_secret}
              >
                <SecretInput
                  value={editData.google_oauth_client_secret || ''}
                  onChange={(value) => setEditData({ ...editData, google_oauth_client_secret: value })}
                  placeholder={config?.google_oauth.client_secret.configured && !editData.google_oauth_client_secret ? "********" : "輸入 Client Secret"}
                  disabled={!isEditing}
                  showSecret={showSecrets['google']}
                  onToggleSecret={() => setShowSecrets({ ...showSecrets, google: !showSecrets['google'] })}
                />
              </SettingRow>
              <SettingRow
                title="Redirect URI"
                description="需與 Google Console 設定一致"
              >
                <div className="flex gap-2">
                  <input
                    value={editData.google_oauth_redirect_uri || config?.google_oauth.redirect_uri.value || ''}
                    onChange={(e) => setEditData({ ...editData, google_oauth_redirect_uri: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    type="text"
                  />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full self-center whitespace-nowrap ${config?.google_oauth.redirect_uri.source === 'database' ? 'bg-semantic-success/10 text-semantic-success' : 'bg-white/5 text-text-tertiary'}`}>
                    {config?.google_oauth.redirect_uri.source === 'database' ? 'DB' : 'ENV'}
                  </span>
                </div>
              </SettingRow>
            </div>
          </div>
        </Card >

        {/* LiveKit Server 設定 */}
        < Card variant="glass" className="p-6 border-white/10 relative overflow-hidden" >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <RefreshCw size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  LiveKit Server
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  語音通訊伺服器
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SettingRow
                title="Server URL"
                description="WebSocket 連線地址 (wss://...)"
              >
                <div className="flex gap-2">
                  <input
                    value={editData.livekit_url || config?.livekit.url.value || ''}
                    onChange={(e) => setEditData({ ...editData, livekit_url: e.target.value })}
                    disabled={!isEditing}
                    placeholder="wss://..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    type="text"
                  />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full self-center whitespace-nowrap ${config?.livekit.url.source === 'database' ? 'bg-semantic-success/10 text-semantic-success' : 'bg-white/5 text-text-tertiary'}`}>
                    {config?.livekit.url.source === 'database' ? 'DB' : 'ENV'}
                  </span>
                </div>
              </SettingRow>
              <SettingRow
                title="API Key"
                status={config?.livekit.api_key}
              >
                <input
                  value={editData.livekit_api_key || ''}
                  onChange={(e) => setEditData({ ...editData, livekit_api_key: e.target.value })}
                  placeholder={config?.livekit.api_key.configured && !editData.livekit_api_key ? "********" : "輸入 API Key"}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  type="text"
                />
              </SettingRow>
              <SettingRow
                title="API Secret"
                status={config?.livekit.api_secret}
              >
                <SecretInput
                  value={editData.livekit_api_secret || ''}
                  onChange={(value) => setEditData({ ...editData, livekit_api_secret: value })}
                  placeholder={config?.livekit.api_secret.configured && !editData.livekit_api_secret ? "********" : "輸入 API Secret"}
                  disabled={!isEditing}
                  showSecret={showSecrets['livekit']}
                  onToggleSecret={() => setShowSecrets({ ...showSecrets, livekit: !showSecrets['livekit'] })}
                />
              </SettingRow>
            </div>
          </div>
        </Card >

        {/* AI 語音服務 (OpenAI) */}
        < Card variant="glass" className="p-6 border-white/10 relative overflow-hidden" >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <Sparkles size={20} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                  AI 語音服務 (OpenAI)
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  STT / TTS 引擎
                </p>
              </div>
            </div>

            <SettingRow
              title="OpenAI API Key"
              description="用於語音轉文字 (Whisper) 與文字轉語音"
              status={config?.openai.api_key}
            >
              <SecretInput
                value={editData.openai_api_key || ''}
                onChange={(value) => setEditData({ ...editData, openai_api_key: value })}
                placeholder={config?.openai.api_key.configured && !editData.openai_api_key ? "********" : "輸入 API Key"}
                disabled={!isEditing}
                showSecret={showSecrets['openai_key']}
                onToggleSecret={() => setShowSecrets({ ...showSecrets, openai_key: !showSecrets['openai_key'] })}
              />
            </SettingRow>
          </div>
        </Card >

      </div >

      {/* 密碼確認 Modal */}
      {
        showPasswordModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="glass" className="w-full max-w-md p-6 border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-purple-500">
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
        )
      }
    </div >
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

// 密碼輸入元件
function SecretInput({
  value,
  onChange,
  placeholder,
  disabled,
  showSecret,
  onToggleSecret
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSecret: boolean;
  onToggleSecret: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type={showSecret ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
      />
      <button
        onClick={onToggleSecret}
        disabled={disabled}
        className="p-3 hover:bg-white/5 rounded-xl text-text-tertiary transition-colors disabled:opacity-30"
      >
        {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
