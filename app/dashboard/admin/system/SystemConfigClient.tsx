'use client';

/**
 * 系統設定客戶端元件
 * 顯示系統配置狀態與 API Key 狀態
 */
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface SystemConfig {
  supabase: {
    url_configured: boolean;
    anon_key_configured: boolean;
    service_role_key_configured: boolean;
  };
  gemini: {
    api_key_configured: boolean;
    model_version: string;
  };
  storage: {
    s3_endpoint_configured: boolean;
    s3_access_key_configured: boolean;
    s3_secret_key_configured: boolean;
    s3_bucket_configured: boolean;
    s3_region_configured: boolean;
  };
  app: {
    app_url: string;
    node_env: string;
  };
}

export default function SystemConfigClient({ dict }: { dict: Dictionary }) {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 載入系統設定
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system/config');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || dict.common.error);
      }

      setConfig(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelVersionChange = async (newVersion: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/system/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gemini_model_version: newVersion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || dict.common.error);
      }

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
      <div className="bg-white rounded-lg shadow-soft p-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">{dict.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-8">
        <div className="bg-error-50 border border-error-500 rounded-md p-4">
          <p className="text-error-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Supabase 設定 */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{dict.admin.system.supabase_settings}</h2>
        <div className="space-y-3">
          <ConfigItem
            label="Project URL"
            configured={config.supabase.url_configured}
          />
          <ConfigItem
            label="Anon Key"
            configured={config.supabase.anon_key_configured}
          />
          <ConfigItem
            label="Service Role Key"
            configured={config.supabase.service_role_key_configured}
          />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {dict.admin.system.env_warning}
        </p>
      </div>

      {/* Gemini API 設定 */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{dict.admin.system.gemini_settings}</h2>
        <div className="space-y-3">
          <ConfigItem
            label="API Key"
            configured={config.gemini.api_key_configured}
            dict={dict}
          />
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{dict.admin.system.model_version}</label>
            <select
              value={config.gemini.model_version}
              onChange={(e) => handleModelVersionChange(e.target.value)}
              disabled={saving}
              className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="gemini-3-flash">gemini-3-flash</option>
              <option value="gemini-3-pro">gemini-3-pro</option>
            </select>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {dict.admin.system.gemini_warning}
        </p>
      </div>

      {/* S3/Storage 設定 */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{dict.admin.system.storage_settings}</h2>
        <div className="space-y-3">
          <ConfigItem
            label="S3 Endpoint"
            configured={config.storage.s3_endpoint_configured}
          />
          <ConfigItem
            label="S3 Access Key"
            configured={config.storage.s3_access_key_configured}
          />
          <ConfigItem
            label="S3 Secret Key"
            configured={config.storage.s3_secret_key_configured}
          />
          <ConfigItem
            label="S3 Bucket"
            configured={config.storage.s3_bucket_configured}
          />
          <ConfigItem
            label="S3 Region"
            configured={config.storage.s3_region_configured}
          />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {dict.admin.system.storage_warning}
        </p>
      </div>

      {/* 應用程式設定 */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{dict.admin.system.app_settings}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">App URL</label>
            <span className="text-sm text-gray-600">{config.app.app_url}</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Env</label>
            <span className="text-sm text-gray-600">{config.app.node_env}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 設定項目元件
 */
function ConfigItem({ label, configured, dict }: { label: string; configured: boolean; dict?: Dictionary }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        {configured ? (
          <>
            <span className="inline-block w-2 h-2 bg-success-500 rounded-full"></span>
            <span className="text-sm text-success-500">{dict?.admin.system.configured || 'Configured'}</span>
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 bg-error-500 rounded-full"></span>
            <span className="text-sm text-error-500">{dict?.admin.system.not_configured || 'Not Configured'}</span>
          </>
        )}
      </div>
    </div>
  );
}
