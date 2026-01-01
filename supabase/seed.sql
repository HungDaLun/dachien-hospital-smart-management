-- EAKAP 種子資料
-- 用於開發環境初始化

-- ============================================
-- 1. 建立預設部門
-- ============================================
INSERT INTO departments (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', '資訊部', '資訊技術部門'),
  ('00000000-0000-0000-0000-000000000002', '行銷部', '行銷與業務部門'),
  ('00000000-0000-0000-0000-000000000003', '人資部', '人力資源部門')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 注意事項
-- ============================================
-- 1. 使用者資料需透過 Supabase Auth 建立
-- 2. 建立使用者後，需手動在 user_profiles 中設定 role
-- 3. 建議使用 Supabase Dashboard 或 API 建立第一個 SUPER_ADMIN 使用者
-- 
-- 範例 SQL（需在 Supabase Dashboard 的 SQL Editor 執行）：
-- 
-- -- 假設已透過 Auth 建立使用者，user_id 為 'xxx-xxx-xxx'
-- INSERT INTO user_profiles (id, email, display_name, role, department_id)
-- VALUES (
--   'xxx-xxx-xxx',  -- 替換為實際的 auth.users.id
--   'admin@example.com',
--   '系統管理員',
--   'SUPER_ADMIN',
--   NULL
-- );
