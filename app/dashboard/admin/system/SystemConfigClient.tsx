'use client';

/**
 * 系統設定客戶端元件
 * 顯示系統配置狀態並提供可編輯功能（僅 SUPER_ADMIN）
 */
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button } from '@/components/ui';
import { Eye, EyeOff, RefreshCw, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfigStatus {
  configured: boolean;
  source: 'database' | 'env' | 'none';
}

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
  // 新增：Email 服務設定
  email: {
    provider: string;
    resend_api_key: ConfigStatus;
    sendgrid_api_key: ConfigStatus;
  };
  // 新增：新聞與情資設定
  news: {
    news_api_key: ConfigStatus;
  };
  // 新增：即時通知設定
  notification: {
    line_channel_token: ConfigStatus;
    slack_webhook_url: ConfigStatus;
  };
  // 新增：MCP 工具設定
  mcp: {
    web_search_api_key: ConfigStatus;
    cron_secret: ConfigStatus;
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
  // 新增設定項目
  email_provider?: string;
  resend_api_key?: string;
  sendgrid_api_key?: string;
  news_api_key?: string;
  line_channel_token?: string;
  slack_webhook_url?: string;
  web_search_api_key?: string;
  cron_secret?: string;
}

export default function SystemConfigClient({ dict }: { dict: Dictionary }) {
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
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
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
        email_provider: data.data.email?.provider || 'resend',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  };

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
      // 新增：Email 服務設定
      if (editData.email_provider !== config?.email?.provider) {
        updates.email_provider = editData.email_provider;
      }
      if (editData.resend_api_key) {
        updates.resend_api_key = editData.resend_api_key;
      }
      if (editData.sendgrid_api_key) {
        updates.sendgrid_api_key = editData.sendgrid_api_key;
      }
      // 新增：新聞與情資設定
      if (editData.news_api_key) {
        updates.news_api_key = editData.news_api_key;
      }
      // 新增：即時通知設定
      if (editData.line_channel_token) {
        updates.line_channel_token = editData.line_channel_token;
      }
      if (editData.slack_webhook_url) {
        updates.slack_webhook_url = editData.slack_webhook_url;
      }
      // 新增：MCP 工具設定
      if (editData.web_search_api_key) {
        updates.web_search_api_key = editData.web_search_api_key;
      }
      if (editData.cron_secret) {
        updates.cron_secret = editData.cron_secret;
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
        // 需要密碼確認
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
        resend_api_key: undefined,
        sendgrid_api_key: undefined,
        news_api_key: undefined,
        line_channel_token: undefined,
        slack_webhook_url: undefined,
        web_search_api_key: undefined,
        cron_secret: undefined,
      }));

      // 重新載入設定
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Shield className="text-purple-500" />
            系統核心配置
          </h1>
          <p className="text-text-tertiary mt-1">管理 API 金鑰、儲存空間與全域應用程式設定</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={loadConfig}
            disabled={loading || saving}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          {!isEditing ? (
            <Button
              variant="cta"
              onClick={() => setIsEditing(true)}
            >
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
              >
                取消
              </Button>
              <Button
                variant="cta"
                onClick={() => handleSave()}
                loading={saving}
              >
                儲存變更
              </Button>
            </div>
          )}
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gemini 配置 */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="text-purple-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Gemini AI 配置</h2>
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
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    onClick={() => setShowSecrets({ ...showSecrets, gemini: !showSecrets['gemini'] })}
                    className="p-3 hover:bg-white/5 rounded-xl text-text-tertiary transition-colors"
                  >
                    {showSecrets['gemini'] ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (最快)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (最強)</option>
                </select>
              </SettingRow>
            </div>
          </Card>

          {/* S3 儲存配置 */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="text-blue-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">S3 儲存配置 (Cloudflare R2/AWS)</h2>
            </div>

            <div className="space-y-6">
              <SettingRow title="Endpoint URL" status={config?.storage.s3_endpoint_configured ? { configured: true, source: config.storage.s3_endpoint_source } : { configured: false, source: 'none' }}>
                <input
                  type="text"
                  value={editData.s3_endpoint || ''}
                  onChange={(e) => setEditData({ ...editData, s3_endpoint: e.target.value })}
                  placeholder={config?.storage.s3_endpoint_configured && !editData.s3_endpoint ? "已從來源配置" : "https://<accountid>.r2.cloudflarestorage.com"}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </SettingRow>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingRow title="Access Key" status={config?.storage.s3_access_key_configured ? { configured: true, source: config.storage.s3_access_key_source } : { configured: false, source: 'none' }}>
                  <input
                    type="password"
                    value={editData.s3_access_key || ''}
                    onChange={(e) => setEditData({ ...editData, s3_access_key: e.target.value })}
                    placeholder={config?.storage.s3_access_key_configured && !editData.s3_access_key ? "********" : "Access Key"}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </SettingRow>
                <SettingRow title="Secret Key" status={config?.storage.s3_secret_key_configured ? { configured: true, source: config.storage.s3_secret_key_source } : { configured: false, source: 'none' }}>
                  <input
                    type="password"
                    value={editData.s3_secret_key || ''}
                    onChange={(e) => setEditData({ ...editData, s3_secret_key: e.target.value })}
                    placeholder={config?.storage.s3_secret_key_configured && !editData.s3_secret_key ? "********" : "Secret Key"}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </SettingRow>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingRow title="Bucket Name">
                  <input
                    type="text"
                    value={editData.s3_bucket || ''}
                    onChange={(e) => setEditData({ ...editData, s3_bucket: e.target.value })}
                    placeholder="例如: knowledge-base"
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </SettingRow>
                <SettingRow title="Region">
                  <input
                    type="text"
                    value={editData.s3_region || ''}
                    onChange={(e) => setEditData({ ...editData, s3_region: e.target.value })}
                    placeholder="例如: auto 或 us-east-1"
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </SettingRow>
              </div>
            </div>
          </Card>
        </div>

        {/* 其他服務配置 */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Shield className="text-pink-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">第三方服務整合</h2>
            </div>

            <div className="space-y-8">
              {/* Email 設定 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Email 服務</h3>
                <div className="space-y-4">
                  <SettingRow title="服務供應商">
                    <select
                      value={editData.email_provider || 'resend'}
                      onChange={(e) => setEditData({ ...editData, email_provider: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                    >
                      <option value="resend">Resend (推薦)</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </SettingRow>
                  {editData.email_provider === 'resend' ? (
                    <SettingRow title="Resend API Key" status={config?.email.resend_api_key}>
                      <input
                        type="password"
                        value={editData.resend_api_key || ''}
                        onChange={(e) => setEditData({ ...editData, resend_api_key: e.target.value })}
                        placeholder={config?.email.resend_api_key.configured && !editData.resend_api_key ? "********" : "輸入 Resend API Key"}
                        disabled={!isEditing}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </SettingRow>
                  ) : (
                    <SettingRow title="SendGrid API Key" status={config?.email.sendgrid_api_key}>
                      <input
                        type="password"
                        value={editData.sendgrid_api_key || ''}
                        onChange={(e) => setEditData({ ...editData, sendgrid_api_key: e.target.value })}
                        placeholder={config?.email.sendgrid_api_key.configured && !editData.sendgrid_api_key ? "********" : "輸入 SendGrid API Key"}
                        disabled={!isEditing}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </SettingRow>
                  )}
                </div>
              </div>

              {/* 新聞設定 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">新聞與精資</h3>
                <SettingRow title="NewsAPI Key" description="用於獲取最新行業動態" status={config?.news.news_api_key}>
                  <input
                    type="password"
                    value={editData.news_api_key || ''}
                    onChange={(e) => setEditData({ ...editData, news_api_key: e.target.value })}
                    placeholder={config?.news.news_api_key.configured && !editData.news_api_key ? "********" : "輸入 NewsAPI Key"}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </SettingRow>
              </div>

              {/* 即時通知設定 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">即時通知頻道</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingRow title="Line Token" status={config?.notification.line_channel_token}>
                    <input
                      type="password"
                      value={editData.line_channel_token || ''}
                      onChange={(e) => setEditData({ ...editData, line_channel_token: e.target.value })}
                      placeholder={config?.notification.line_channel_token.configured && !editData.line_channel_token ? "********" : "Line Token"}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </SettingRow>
                  <SettingRow title="Slack Webhook" status={config?.notification.slack_webhook_url}>
                    <input
                      type="password"
                      value={editData.slack_webhook_url || ''}
                      onChange={(e) => setEditData({ ...editData, slack_webhook_url: e.target.value })}
                      placeholder={config?.notification.slack_webhook_url.configured && !editData.slack_webhook_url ? "********" : "Slack URL"}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </SettingRow>
                </div>
              </div>

              {/* MCP 設定 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">MCP 擴充工具</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingRow title="Web Search Key" status={config?.mcp.web_search_api_key}>
                    <input
                      type="password"
                      value={editData.web_search_api_key || ''}
                      onChange={(e) => setEditData({ ...editData, web_search_api_key: e.target.value })}
                      placeholder={config?.mcp.web_search_api_key.configured && !editData.web_search_api_key ? "********" : "輸入 Search Key"}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </SettingRow>
                  <SettingRow title="Cron Secret" status={config?.mcp.cron_secret}>
                    <input
                      type="password"
                      value={editData.cron_secret || ''}
                      onChange={(e) => setEditData({ ...editData, cron_secret: e.target.value })}
                      placeholder={config?.mcp.cron_secret.configured && !editData.cron_secret ? "********" : "輸入 Secret"}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </SettingRow>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Shield className="text-orange-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">應用程式通用設定</h2>
            </div>
            <div className="space-y-6">
              <SettingRow title="APP URL" description="系統對外存取的基準 URL">
                <input
                  type="text"
                  value={editData.app_url || ''}
                  onChange={(e) => setEditData({ ...editData, app_url: e.target.value })}
                  placeholder="https://your-app-domain.com"
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </SettingRow>
            </div>
          </Card>
        </div>
      </div>

      {/* 密碼確認 Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card variant="glass" className="w-full max-w-md p-6 border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-purple-500">
              <Lock size={24} />
              <h3 className="text-xl font-bold">二次驗證確認</h3>
            </div>
            <p className="text-text-secondary mb-6 text-sm">
              修改敏感 API 金鑰需要輸入您的登入密碼以確授權安全性。
            </p>
            <div className="space-y-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="輸入您的當前密碼"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${status.configured
              ? 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20'
              : 'bg-white/5 text-text-tertiary border border-white/10'
              }`}>
              {status.configured ? `已配置 (${status.source === 'database' ? 'DB' : 'ENV'})` : '未配置'}
            </span>
          )}
        </label>
      </div>
      {children}
      {description && <p className="text-xs text-text-tertiary">{description}</p>}
    </div>
  );
}
