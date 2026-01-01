-- ============================================
-- 設定 SUPER_ADMIN 的 SQL 語法
-- ============================================
-- 使用方式：在 Supabase Dashboard → SQL Editor 中執行

-- 方法 1：如果您知道使用者 ID（推薦）
-- 將 'YOUR_USER_ID' 替換為您的實際使用者 ID
INSERT INTO user_profiles (id, email, display_name, role)
VALUES (
  '82eb6660-cc05-44f2-aa57-61ab33511d15',  -- 您的使用者 ID
  'siriue0@gmail.com',
  '系統管理員',
  'SUPER_ADMIN'
)
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = 'SUPER_ADMIN',
  updated_at = NOW();

-- 方法 2：如果您不知道使用者 ID，可以先查詢
-- 步驟 1：查詢您的使用者 ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'siriue0@gmail.com';

-- 步驟 2：使用查詢到的 ID 執行上面的 INSERT 語法

-- 方法 3：使用 Email 自動查詢並設定（如果 user_profiles 不存在）
INSERT INTO user_profiles (id, email, display_name, role)
SELECT 
  id,
  email,
  '系統管理員',
  'SUPER_ADMIN'
FROM auth.users
WHERE email = 'siriue0@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET
  role = 'SUPER_ADMIN',
  updated_at = NOW();

-- ============================================
-- 驗證設定結果
-- ============================================
SELECT 
  id, 
  email, 
  display_name, 
  role, 
  created_at,
  updated_at
FROM user_profiles
WHERE email = 'siriue0@gmail.com';

-- 應該會看到 role = 'SUPER_ADMIN'
