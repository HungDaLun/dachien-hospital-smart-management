-- ============================================
-- 修復 tool_executions_log 表的 RLS 政策安全性
-- 建立日期: 2026-01-30
-- 目的: 
--   1. 加強 INSERT 政策的 WITH CHECK 條件
--   2. 確保只有已認證使用者可以插入記錄，且 user_id 必須匹配
--   3. 允許 Service Role 透過 bypass RLS 插入（系統層級操作）
-- ============================================

-- ============================================
-- 1. 刪除舊的過於寬鬆的 INSERT 政策
-- ============================================
DROP POLICY IF EXISTS "系統可寫入工具執行記錄" ON tool_executions_log;

-- ============================================
-- 2. 建立新的更嚴格的 INSERT 政策
-- ============================================

-- 政策 1: 已認證使用者可以插入自己的工具執行記錄
-- 條件：user_id 必須匹配 auth.uid()，確保使用者只能記錄自己的操作
CREATE POLICY "使用者可插入自己的工具執行記錄" ON tool_executions_log
    FOR INSERT
    WITH CHECK (
        -- 必須是已認證使用者
        auth.uid() IS NOT NULL
        -- user_id 必須匹配當前使用者（防止偽造）
        AND (
            user_id = auth.uid()
            OR user_id IS NULL  -- 允許系統操作（user_id 為 NULL 的情況）
        )
        -- 確保 agent_id 和 session_id 的關聯性（如果提供）
        AND (
            -- 如果提供了 agent_id，確保該 agent 存在
            (agent_id IS NULL OR EXISTS (
                SELECT 1 FROM agents WHERE id = agent_id
            ))
            -- 如果提供了 session_id，確保該 session 存在且屬於當前使用者
            AND (session_id IS NULL OR EXISTS (
                SELECT 1 FROM chat_sessions 
                WHERE id = session_id 
                AND user_id = auth.uid()
            ))
        )
    );

-- 政策 2: 管理員可以插入任何使用者的工具執行記錄（用於系統操作）
-- 此政策允許 DEPT_ADMIN 和 SUPER_ADMIN 為其部門或系統插入記錄
CREATE POLICY "管理員可插入工具執行記錄" ON tool_executions_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
        )
    );

-- ============================================
-- 3. 確保 RLS 已啟用
-- ============================================
ALTER TABLE tool_executions_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 註解說明
-- ============================================
COMMENT ON POLICY "使用者可插入自己的工具執行記錄" ON tool_executions_log IS 
    '允許已認證使用者插入自己的工具執行記錄，確保 user_id 匹配 auth.uid() 以防止偽造';

COMMENT ON POLICY "管理員可插入工具執行記錄" ON tool_executions_log IS 
    '允許管理員插入工具執行記錄，用於系統層級的操作記錄';

-- ============================================
-- Migration 完成
-- ============================================
