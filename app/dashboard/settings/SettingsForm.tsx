'use client';

import { useState, FormEvent, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface ManagerInfo {
  id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
}

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
    manager_id?: string | null;
    manager?: ManagerInfo | null;
    hire_date?: string | null;
    location?: string | null;
    bio?: string | null;
    skills?: string[];
    expertise_areas?: string[];
    linkedin_url?: string | null;
    is_active?: boolean;
    last_login_at?: string | null;
  };
  email: string;
  departmentName: string | null;
  dict: Dictionary;
}

// 標籤輸入元件
function TagInput({
  tags,
  onChange,
  placeholder,
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 bg-white/5 backdrop-blur-sm transition-all">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 text-white rounded-lg text-sm font-bold border border-primary-500/40 uppercase tracking-widest shadow-glow-cyan/10"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-primary-300 transition-colors focus:outline-none"
            >
              ×
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-base text-white placeholder:text-white/30"
      />
    </div>
  );
}

export default function SettingsForm({ profile, email, departmentName, dict }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // 基本資訊
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);

  // 聯絡資訊
  const [phone, setPhone] = useState(profile.phone || '');
  const [mobile, setMobile] = useState(profile.mobile || '');

  // 專業資訊
  const [bio, setBio] = useState(profile.bio || '');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>(profile.expertise_areas || []);

  // 社群連結
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '');

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
          bio: bio.trim() || null,
          skills,
          expertise_areas: expertiseAreas,
          linkedin_url: linkedinUrl.trim() || null,
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
    bio !== (profile.bio || '') ||
    JSON.stringify(skills) !== JSON.stringify(profile.skills || []) ||
    JSON.stringify(expertiseAreas) !== JSON.stringify(profile.expertise_areas || []) ||
    linkedinUrl !== (profile.linkedin_url || '');

  // 角色顯示名稱對照
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: dict.admin.users.roles.super_admin,
    DEPT_ADMIN: dict.admin.users.roles.dept_admin,
    EDITOR: dict.admin.users.roles.editor,
    USER: dict.admin.users.roles.user,
  };

  // 格式化日期
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

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

          {/* 職稱（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.job_title_label || '職稱'}
            </label>
            <input
              type="text"
              value={profile.job_title || '-'}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 員工編號（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.employee_id_label || '員工編號'}
            </label>
            <input
              type="text"
              value={profile.employee_id || '-'}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 工作地點（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.location_label || '工作地點'}
            </label>
            <input
              type="text"
              value={profile.location || '-'}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
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

          {/* 分機號碼（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.extension_label || '分機號碼'}
            </label>
            <input
              type="text"
              value={profile.extension || '-'}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 辦公室電話 */}
          <div>
            <Input
              label={dict.settings.phone_label || '辦公室電話'}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={dict.settings.phone_placeholder || '例如：02-1234-5678'}
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
              placeholder={dict.settings.mobile_placeholder || '例如：0912-345-678'}
              disabled={isLoading}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* ===== 專業資訊區 ===== */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
          <span className="w-10 h-px bg-primary-500/40" /> {dict.settings.professional_section || '專業資訊'}
        </h3>

        {/* 個人簡介 */}
        <div>
          <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
            {dict.settings.bio_label || '個人簡介'}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={dict.settings.bio_placeholder || '簡單介紹您的專業背景 and 專長...'}
            disabled={isLoading}
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 focus:bg-white/[0.08] transition-all resize-none shadow-inner text-base"
          />
          <p className="mt-2 text-[13px] text-white/50 font-mono">
            {bio.length}/1000 {dict.settings.bio_hint || '字元'}
          </p>
        </div>

        {/* 技能標籤 */}
        <div>
          <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
            {dict.settings.skills_label || '技能標籤'}
          </label>
          <TagInput
            tags={skills}
            onChange={setSkills}
            placeholder={dict.settings.skills_placeholder || '輸入技能並按 Enter 新增'}
            disabled={isLoading}
          />
          <p className="mt-2 text-[13px] text-white/60 font-medium">
            {dict.settings.skills_hint || '加入您擅長的技能，例如：Python、資料分析、專案管理'}
          </p>
        </div>

        {/* 專業領域 */}
        <div>
          <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
            {dict.settings.expertise_areas_label || '專業領域'}
          </label>
          <TagInput
            tags={expertiseAreas}
            onChange={setExpertiseAreas}
            placeholder={dict.settings.expertise_areas_placeholder || '輸入專業領域並按 Enter 新增'}
            disabled={isLoading}
          />
          <p className="mt-2 text-[13px] text-white/60 font-medium">
            {dict.settings.expertise_areas_hint || '加入您的專業領域，例如：財務會計、人力資源、軟體開發'}
          </p>
        </div>
      </div>

      {/* ===== 社群連結區 ===== */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
          <span className="w-10 h-px bg-primary-500/40" /> {dict.settings.social_section || '社群連結'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn */}
          <div>
            <Input
              label={dict.settings.linkedin_url_label || 'LinkedIn'}
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder={dict.settings.linkedin_url_placeholder || 'https://linkedin.com/in/...'}
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

          {/* 部門（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.department_label}
            </label>
            <input
              type="text"
              value={departmentName || dict.settings.no_department}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 直屬主管（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.manager_label || '直屬主管'}
            </label>
            <input
              type="text"
              value={profile.manager?.display_name || profile.manager?.email || dict.settings.no_manager || '(未指定)'}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
          </div>

          {/* 入職日期（唯讀） */}
          <div>
            <label className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest">
              {dict.settings.hire_date_label || '入職日期'}
            </label>
            <input
              type="text"
              value={formatDate(profile.hire_date)}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
            <p className="mt-2 text-[13px] text-primary-400 font-bold uppercase tracking-wide">{dict.settings.admin_only_hint || '此欄位需由管理員修改'}</p>
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
              value={formatDateTime(profile.last_login_at)}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.05] text-white cursor-not-allowed font-medium text-base shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-semantic-danger/10 border border-semantic-danger/20 text-semantic-danger px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      {/* 成功訊息 */}
      {success && (
        <div className="bg-semantic-success/10 border border-semantic-success/20 text-semantic-success px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <span className="mr-2">🎉</span> {dict.settings.save_success}
        </div>
      )}

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
    </form>
  );
}