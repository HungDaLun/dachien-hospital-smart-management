'use client';

/**
 * 使用者設定表單
 * 讓使用者可以編輯自己的個人資料
 */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface SettingsFormProps {
  profile: {
    id: string;
    display_name: string | null;
    email: string;
    role: string;
    department_id: string | null;
    created_at: string;
  };
  email: string;
  departmentName: string | null;
  dict: Dictionary;
}

export default function SettingsForm({ profile, email, departmentName, dict }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || dict.settings.save_error);
        return;
      }

      setSuccess(true);
      // 重新整理頁面以顯示更新後的資料
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('更新失敗:', err);
      setError(dict.settings.save_error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = displayName !== (profile.display_name || '');

  // 角色顯示名稱對照
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: dict.admin.users.roles.super_admin,
    DEPT_ADMIN: dict.admin.users.roles.dept_admin,
    EDITOR: dict.admin.users.roles.editor,
    USER: dict.admin.users.roles.user,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 顯示名稱 */}
      <div>
        <Input
          label={dict.settings.display_name_label}
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={dict.settings.display_name_placeholder}
          disabled={isLoading}
          fullWidth
        />
      </div>

      {/* 電子郵件（唯讀） */}
      <div>
        <Input
          label={dict.settings.email_label}
          type="email"
          value={email}
          disabled
          fullWidth
          hint={dict.settings.email_readonly}
        />
      </div>

      {/* 角色（唯讀） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {dict.settings.role_label}
        </label>
        <input
          type="text"
          value={roleLabels[profile.role] || profile.role}
          disabled
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1.5 text-sm text-gray-500">
          角色無法自行修改，如需更改請聯繫管理員
        </p>
      </div>

      {/* 部門（唯讀） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {dict.settings.department_label}
        </label>
        <input
          type="text"
          value={departmentName || dict.settings.no_department}
          disabled
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1.5 text-sm text-gray-500">
          部門無法自行修改，如需更改請聯繫管理員
        </p>
      </div>

      {/* 建立時間（唯讀） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {dict.settings.created_at_label}
        </label>
        <input
          type="text"
          value={new Date(profile.created_at).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
          disabled
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 成功訊息 */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {dict.settings.save_success}
        </div>
      )}

      {/* 儲存按鈕 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          disabled={!hasChanges || isLoading}
          loading={isLoading}
        >
          {isLoading ? dict.settings.updating : dict.common.save}
        </Button>
      </div>
    </form>
  );
}