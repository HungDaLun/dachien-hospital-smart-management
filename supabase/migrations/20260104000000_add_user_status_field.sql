-- ============================================
-- 添加 user_profiles.status 欄位
-- 用於註冊審核系統
-- ============================================

-- 1. 添加 status 欄位
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING'
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- 2. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- 3. 將現有使用者的狀態設為 APPROVED（已審核通過）
-- 這樣現有使用者不會被鎖定
UPDATE public.user_profiles
SET status = 'APPROVED'
WHERE status IS NULL OR status = 'PENDING';

-- 4. 註解說明
COMMENT ON COLUMN public.user_profiles.status IS '使用者審核狀態：PENDING（待審核）、APPROVED（已通過）、REJECTED（已拒絕）';
