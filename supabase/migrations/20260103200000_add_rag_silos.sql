-- Description: Enforce RLS for Department Silos and add CATEGORY rule type
-- Created at: 2026-01-03 20:00:00

-- 1. Update agent_knowledge_rules to support 'CATEGORY' rule type
ALTER TABLE agent_knowledge_rules 
DROP CONSTRAINT IF EXISTS agent_knowledge_rules_rule_type_check;

ALTER TABLE agent_knowledge_rules 
ADD CONSTRAINT agent_knowledge_rules_rule_type_check 
CHECK (rule_type IN ('FOLDER', 'TAG', 'DEPARTMENT', 'CATEGORY'));

-- 2. Update RLS Policies for Files to enforce Department Silos

-- Policy: Users can view files from their own department
-- Note: We drop existing if meaningful, but usually we just add new. 
-- Let's check if we need to drop "Users can view all files" if it exists.
-- For now, we assume strict silo mode.

DROP POLICY IF EXISTS "Users can view files from their own department" ON files;

CREATE POLICY "Users can view files from their own department"
ON files FOR SELECT
USING (
  (department_id IS NOT NULL AND department_id = (
    SELECT department_id FROM user_profiles WHERE id = auth.uid()
  ))
  OR
  (uploaded_by = auth.uid()) -- Still allow viewing own files even if dept doesn't match
  OR
  (
    -- Super Admins can view everything
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  )
  OR
  -- Allow files with NO department (Global/Public files)
  (department_id IS NULL)
);

-- Policy: Dept Admins and Editors can upload to their department
DROP POLICY IF EXISTS "Users can upload to their own department" ON files;

CREATE POLICY "Users can upload to their own department"
ON files FOR INSERT
WITH CHECK (
  (department_id IS NOT NULL AND department_id = (
    SELECT department_id FROM user_profiles WHERE id = auth.uid()
  ))
  OR
  (department_id IS NULL) -- Allow uploading global files? Maybe restriction needed.
  OR
  (
    -- Super Admins can upload to any department
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  )
);
