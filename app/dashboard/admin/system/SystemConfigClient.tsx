'use client';

/**
 * 系統設定客戶端元件
 * 顯示系統配置狀態並提供可編輯功能（僅 SUPER_ADMIN）
 */
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button } from '@/components/ui';
import { Eye, EyeOff, Save, RefreshCw, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

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
      }));

      // 重新載入設定
      await loadConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordConfirm = () => {
    if (!confirmPassword) {
      setError('請輸入密碼');
      return;
    }
    handleSave(confirmPassword);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Card variant="glass" className="p-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-text-tertiary">{dict.common.loading}</p>
        </div>
      </Card>
    );
  }

  if (error && !config) {
    return (
      <Card variant="glass" className="p-8">
        <div className="bg-semantic-danger/10 border border-semantic-danger/30 rounded-xl p-4">
          <p className="text-semantic-danger">{error}</p>
        </div>
      </Card>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 操作按鈕列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          <span className="text-sm text-text-tertiary font-medium">
            僅超級管理員可檢視與編輯
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfig}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            重新載入
          </Button>
          {!isEditing ? (
            <Button
              variant="cta"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              編輯設定
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    gemini_model_version: config.gemini.model_version,
                    s3_bucket: config.storage.s3_bucket,
                    s3_region: config.storage.s3_region,
                    app_url: config.app.app_url,
                  });
                }}
              >
                取消
              </Button>
              <Button
                variant="cta"
                size="sm"
                onClick={() => handleSave()}
                loading={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                儲存變更
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 成功訊息 */}
      {successMessage && (
        <div className="bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-semantic-success" />
          <p className="text-semantic-success font-medium">{successMessage}</p>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-semantic-danger/10 border border-semantic-danger/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-semantic-danger" />
          <p className="text-semantic-danger font-medium">{error}</p>
        </div>
      )}

      {/* Gemini API 設定 */}
      <Card variant="glass" className="p-6">
        <h2 className="text-xl font-black text-text-primary mb-4 uppercase tracking-tight flex items-center gap-2">
          🤖 {dict.admin.system.gemini_settings}
        </h2>
        <div className="space-y-4">
          {/* API Key */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">API Key</label>
            {isEditing ? (
              <div className="flex items-center gap-2 w-80">
                <div className="relative flex-1">
                  <input
                    type={showSecrets['gemini_api_key'] ? 'text' : 'password'}
                    value={editData.gemini_api_key || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                    placeholder="輸入新的 API Key..."
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('gemini_api_key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                  >
                    {showSecrets['gemini_api_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span title="需要密碼確認"><Lock className="w-4 h-4 text-amber-500" /></span>
              </div>
            ) : (
              <ConfigStatus
                configured={config.gemini.api_key_configured}
                source={config.gemini.api_key_source}
                dict={dict}
              />
            )}
          </div>

          {/* 模型版本 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">{dict.admin.system.model_version}</label>
            {isEditing ? (
              <select
                value={editData.gemini_model_version || config.gemini.model_version}
                onChange={(e) => setEditData(prev => ({ ...prev, gemini_model_version: e.target.value }))}
                className="px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors"
              >
                <option value="gemini-3-flash-preview">gemini-3-flash-preview (速度最快、成本較低)</option>
                <option value="gemini-3-pro-preview">gemini-3-pro-preview (推論能力最強)</option>
              </select>
            ) : (
              <span className="text-sm text-text-tertiary font-mono">{config.gemini.model_version}</span>
            )}
          </div>
        </div>
      </Card>

      {/* 儲存設定 (S3/MinIO) */}
      <Card variant="glass" className="p-6">
        <h2 className="text-xl font-black text-text-primary mb-4 uppercase tracking-tight flex items-center gap-2">
          📦 {dict.admin.system.storage_settings}
        </h2>
        <div className="space-y-4">
          {/* S3 Endpoint */}
          <SettingRow
            label="S3 Endpoint"
            isEditing={isEditing}
            configured={config.storage.s3_endpoint_configured}
            source={config.storage.s3_endpoint_source}
            value={editData.s3_endpoint || ''}
            onChange={(v) => setEditData(prev => ({ ...prev, s3_endpoint: v }))}
            placeholder="https://s3.example.com"
            isSecret
            showSecret={showSecrets['s3_endpoint']}
            onToggleSecret={() => toggleSecretVisibility('s3_endpoint')}
            dict={dict}
          />

          {/* S3 Access Key */}
          <SettingRow
            label="S3 Access Key"
            isEditing={isEditing}
            configured={config.storage.s3_access_key_configured}
            source={config.storage.s3_access_key_source}
            value={editData.s3_access_key || ''}
            onChange={(v) => setEditData(prev => ({ ...prev, s3_access_key: v }))}
            placeholder="輸入 Access Key..."
            isSecret
            showSecret={showSecrets['s3_access_key']}
            onToggleSecret={() => toggleSecretVisibility('s3_access_key')}
            dict={dict}
          />

          {/* S3 Secret Key */}
          <SettingRow
            label="S3 Secret Key"
            isEditing={isEditing}
            configured={config.storage.s3_secret_key_configured}
            source={config.storage.s3_secret_key_source}
            value={editData.s3_secret_key || ''}
            onChange={(v) => setEditData(prev => ({ ...prev, s3_secret_key: v }))}
            placeholder="輸入 Secret Key..."
            isSecret
            showSecret={showSecrets['s3_secret_key']}
            onToggleSecret={() => toggleSecretVisibility('s3_secret_key')}
            dict={dict}
          />

          {/* S3 Bucket */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">S3 Bucket</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.s3_bucket || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, s3_bucket: e.target.value }))}
                placeholder="my-bucket"
                className="w-60 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            ) : (
              <span className="text-sm text-text-tertiary font-mono">
                {config.storage.s3_bucket || '(未設定)'}
              </span>
            )}
          </div>

          {/* S3 Region */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">S3 Region</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.s3_region || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, s3_region: e.target.value }))}
                placeholder="ap-northeast-1"
                className="w-60 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            ) : (
              <span className="text-sm text-text-tertiary font-mono">
                {config.storage.s3_region || '(未設定)'}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 應用程式設定 */}
      <Card variant="glass" className="p-6">
        <h2 className="text-xl font-black text-text-primary mb-4 uppercase tracking-tight flex items-center gap-2">
          ⚙️ {dict.admin.system.app_settings}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">App URL</label>
            {isEditing ? (
              <input
                type="url"
                value={editData.app_url || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, app_url: e.target.value }))}
                placeholder="https://your-app.com"
                className="w-80 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            ) : (
              <span className="text-sm text-text-tertiary font-mono">{config.app.app_url}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-text-secondary">Env</label>
            <span className="text-sm text-text-tertiary font-mono">{config.app.node_env}</span>
          </div>
        </div>
      </Card>

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
                <p className="text-sm text-text-tertiary">修改敏感設定需要驗證您的身份</p>
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
                  if (e.key === 'Enter') {
                    handlePasswordConfirm();
                  }
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
    </div>
  );
}

/**
 * 設定狀態元件
 */
function ConfigStatus({
  configured,
  source,
  dict
}: {
  configured: boolean;
  source?: 'database' | 'env' | 'none';
  dict: Dictionary;
}) {
  if (!configured) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-semantic-danger rounded-full"></span>
        <span className="text-sm text-semantic-danger font-bold">
          {dict.admin.system.not_configured}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-2 h-2 bg-semantic-success rounded-full"></span>
      <span className="text-sm text-semantic-success font-bold">
        {dict.admin.system.configured}
      </span>
      {source && source !== 'none' && (
        <span className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-white/5 uppercase">
          {source === 'database' ? '資料庫' : '環境變數'}
        </span>
      )}
    </div>
  );
}

/**
 * 設定列元件（含敏感資料處理）
 */
function SettingRow({
  label,
  isEditing,
  configured,
  source,
  value,
  onChange,
  placeholder,
  isSecret = false,
  showSecret = false,
  onToggleSecret,
  dict,
}: {
  label: string;
  isEditing: boolean;
  configured: boolean;
  source: 'database' | 'env' | 'none';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isSecret?: boolean;
  showSecret?: boolean;
  onToggleSecret?: () => void;
  dict: Dictionary;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-bold text-text-secondary">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2 w-80">
          <div className="relative flex-1">
            <input
              type={isSecret && !showSecret ? 'password' : 'text'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 pr-10"
            />
            {isSecret && (
              <button
                type="button"
                onClick={onToggleSecret}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {isSecret && <span title="需要密碼確認"><Lock className="w-4 h-4 text-amber-500" /></span>}
        </div>
      ) : (
        <ConfigStatus configured={configured} source={source} dict={dict} />
      )}
    </div>
  );
}
