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
    // 新增欄位
    employee_id?: string | null;
    job_title?: string | null;
    phone?: string | null;
    mobile?: string | null;
    extension?: string | null;
    location?: string | null;
    is_active?: boolean;
    last_login_at?: string | null;
  };
  email: string;
  departmentName: string | null;
  dict: Dictionary;
  lastLoginAt?: string;
  departments: { id: string; name: string }[];
}



export default function SettingsForm({ profile, email, dict, lastLoginAt, departments }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // 基本資訊
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);

  // 聯絡資訊
  const [phone, setPhone] = useState(profile.phone || '');
  const [mobile, setMobile] = useState(profile.mobile || '');
  const [extension, setExtension] = useState(profile.extension || '');
  const [departmentId, setDepartmentId] = useState(profile.department_id || '');
  const [jobTitle, setJobTitle] = useState(profile.job_title || '');
  const [employeeId, setEmployeeId] = useState(profile.employee_id || '');
  const [location, setLocation] = useState(profile.location || '');



  // 狀態
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
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      // 路徑格式必須符合 RLS 政策: user/<user_id>/avatar.<extension>
      const filePath = `user/${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage (upsert 模式會自動覆蓋舊檔案)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

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

    } catch (err: unknown) {
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
          phone: phone.trim() || null,
          mobile: mobile.trim() || null,
          extension: extension.trim() || null,
          job_title: jobTitle.trim() || null,
          employee_id: employeeId.trim() || null,
          location: location.trim() || null,
          department_id: departmentId || null,
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

  const hasChanges =
    displayName !== (profile.display_name || '') ||
    phone !== (profile.phone || '') ||
    mobile !== (profile.mobile || '') ||
    extension !== (profile.extension || '') ||
    jobTitle !== (profile.job_title || '') ||
    employeeId !== (profile.employee_id || '') ||
    location !== (profile.location || '') ||
    departmentId !== (profile.department_id || '');

  // 角色顯示名稱對照
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: dict.admin.users.roles.super_admin,
    DEPT_ADMIN: dict.admin.users.roles.dept_admin,
    EDITOR: dict.admin.users.roles.editor,
    USER: dict.admin.users.roles.user,
  };

  // 格式化日期


  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ===== 個人頭像區 ===== */}
      <div className="flex items-center gap-8 group/avatar">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10 shadow-glow-cyan/5 group-hover/avatar:border-primary-500/50 transition-all duration-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center text-primary-400 text-4xl font-black border-2 border-white/10 shadow-inner group-hover/avatar:border-primary-500/50 transition-all duration-500">
              {(displayName?.[0] || email?.[0] || 'U').toUpperCase()}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-2 -right-2 bg-background-tertiary border border-white/10 p-2.5 rounded-2xl shadow-floating hover:bg-white/10 focus:outline-none transition-all hover:scale-110 active:scale-95 group/btn"
            title="更換大頭照"
          >
            {isUploading ? (
              <span className="block w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <span className="text-xl group-hover/btn:rotate-12 transition-transform block">📷</span>
            )}
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
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">個人頭像</h3>
          <p className="text-sm text-white/60 mt-2 font-medium tracking-wide">
            支援 .JPG, .PNG 格式。建議尺寸 400x400PX。
          </p>
        </div>
      </div>

      {/* ===== 基本資訊區 ===== */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
          <span className="w-10 h-px bg-primary-500/40" /> {dict.settings.basic_info_section || '基本資訊'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* 職稱 */}
          <div>
            <Input
              label={dict.settings.job_title_label || '職稱'}
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={'例如：資深工程師'}
              disabled={isLoading}
              fullWidth
            />
          </div>

          {/* 員工編號 */}
          <div>
            <Input
              label={dict.settings.employee_id_label || '員工編號'}
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder={'例如：EMP-001'}
              disabled={isLoading}
              fullWidth
            />
          </div>

          {/* 工作地點 */}
          <div>
            <Input
              label={dict.settings.location_label || '工作地點'}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={'例如：台北總部'}
              disabled={isLoading}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* ===== 聯絡資訊區 ===== */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
          <span className="w-10 h-px bg-primary-500/40" /> {dict.settings.contact_section || '聯絡資訊'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* 分機號碼 */}
          <div>
            <Input
              label={dict.settings.extension_label || '分機號碼'}
              type="text"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              placeholder={'例如：#1234'}
              disabled={isLoading}
              fullWidth
            />
          </div>

          {/* 辦公室電話 */}
          <div>
            <Input
              label={dict.settings.phone_label || '辦公室電話'}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={dict.settings.phone_placeholder || '例如：0212345678'}
              disabled={isLoading}
              fullWidth
            />
          </div>

          {/* 手機號碼 */}
          <div>
            <Input
              label={dict.settings.mobile_label || '手機號碼'}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={dict.settings.mobile_placeholder || '例如：0912345678'}
              disabled={isLoading}
              fullWidth
            />
          </div>
        </div>
      </div>



      {/* ===== 帳戶資訊區 ===== */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
          <span className="w-10 h-px bg-primary-500/40" /> {dict.settings.account_section || '帳戶資訊'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 角色（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.role_label}
            </label>
            <input
              type="text"
              value={roleLabels[profile.role] || profile.role}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 部門 */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.department_label}
            </label>
            <div className="relative">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 focus:bg-white/[0.08] transition-all shadow-inner appearance-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="bg-background-tertiary text-text-secondary">
                  {dict.settings.no_department || '(未選取)'}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-background-tertiary text-text-primary">
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                ▼
              </div>
            </div>
          </div>

          {/* 建立時間（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.created_at_label}
            </label>
            <input
              type="text"
              value={formatDateTime(profile.created_at)}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
          </div>

          {/* 最後登入（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.last_login_label || '最後登入'}
            </label>
            <input
              type="text"
              value={formatDateTime(lastLoginAt || profile.last_login_at)}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
          </div>
        </div>
      </div>


      {/* 錯誤訊息 */}
      {
        error && (
          <div className="bg-semantic-danger/10 border border-semantic-danger/20 text-semantic-danger px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )
      }

      {/* 成功訊息 */}
      {
        success && (
          <div className="bg-semantic-success/10 border border-semantic-success/20 text-semantic-success px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <span className="mr-2">🎉</span> {dict.settings.save_success}
          </div>
        )
      }

      {/* 儲存按鈕 */}
      <div className="flex justify-end gap-3 pt-8 border-t border-white/5">
        <Button
          type="submit"
          variant="cta"
          size="lg"
          disabled={!hasChanges || isLoading}
          loading={isLoading}
          className="px-10 h-12 shadow-glow-cyan"
        >
          {isLoading ? dict.settings.updating : dict.common.save}
        </Button>
      </div>
    </form >
  );
}