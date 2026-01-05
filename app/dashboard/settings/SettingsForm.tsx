'use client';

import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface SettingsFormProps {
  profile: {
    id: string;
    display_name: string | null;
    email: string;
    role: string;
    department_id: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  email: string;
  departmentName: string | null;
  dict: Dictionary;
}

export default function SettingsForm({ profile, email, departmentName, dict }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      setIsUploading(true);
      setError(null);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Update profile immediately with new avatar
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      router.refresh(); // Refresh to update header

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('圖片上傳失敗，請稍後再試');
    } finally {
      setIsUploading(false);
    }
  };

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
          // avatar_url is already updated on upload, but we can verify here if needed
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
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-gray-100 shadow-sm">
              {(displayName?.[0] || email?.[0] || 'U').toUpperCase()}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 focus:outline-none transition-transform hover:scale-105"
            title="更換大頭照"
          >
            {isUploading ? '⌛' : '📷'}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">個人頭像</h3>
          <p className="text-sm text-gray-500 mt-1">
            支援 .jpg, .png 格式。建議尺寸 200x200px。
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-gray-100">
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