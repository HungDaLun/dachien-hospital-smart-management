-- 為 audit_reports 和 meeting_feedback 啟用 RLS 並建立政策
-- Created: 2026-01-27

-- ============================================
-- 1. 啟用 RLS
-- ============================================

ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. audit_reports 表的 RLS 政策
-- ============================================

-- 政策：使用者可建立自己的審計報告
CREATE POLICY "使用者可建立自己的審計報告"
ON audit_reports
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- 政策：使用者可讀取自己建立的審計報告
CREATE POLICY "使用者可讀取自己建立的審計報告"
ON audit_reports
FOR SELECT
USING (created_by = auth.uid());

-- 政策：管理員可讀取所有審計報告
CREATE POLICY "管理員可讀取所有審計報告"
ON audit_reports
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
);

-- 政策：管理員可刪除審計報告
CREATE POLICY "管理員可刪除審計報告"
ON audit_reports
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
);

-- ============================================
-- 3. meeting_feedback 表的 RLS 政策
-- ============================================

-- 政策：使用者可建立自己的回饋
CREATE POLICY "使用者可建立自己的會議回饋"
ON meeting_feedback
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 政策：使用者可讀取自己的回饋
CREATE POLICY "使用者可讀取自己的會議回饋"
ON meeting_feedback
FOR SELECT
USING (user_id = auth.uid());

-- 政策：使用者可更新自己的回饋
CREATE POLICY "使用者可更新自己的會議回饋"
ON meeting_feedback
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 政策：使用者可讀取自己參與的會議的回饋
-- （透過 meeting_messages 關聯到 meetings）
CREATE POLICY "使用者可讀取自己會議的回饋"
ON meeting_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM meeting_messages mm
        JOIN meetings m ON mm.meeting_id = m.id
        WHERE mm.id = meeting_feedback.message_id
        AND m.user_id = auth.uid()
    )
);

-- 政策：管理員可讀取所有回饋
CREATE POLICY "管理員可讀取所有會議回饋"
ON meeting_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
);

-- ============================================
-- 4. 註解說明
-- ============================================

COMMENT ON POLICY "使用者可建立自己的審計報告" ON audit_reports IS 
'允許使用者建立自己建立的審計報告';

COMMENT ON POLICY "管理員可讀取所有審計報告" ON audit_reports IS 
'允許 SUPER_ADMIN 和 DEPT_ADMIN 讀取所有審計報告';

COMMENT ON POLICY "使用者可建立自己的會議回饋" ON meeting_feedback IS 
'允許使用者為會議訊息建立回饋';

COMMENT ON POLICY "使用者可讀取自己會議的回饋" ON meeting_feedback IS 
'允許使用者讀取自己參與的會議的回饋';
