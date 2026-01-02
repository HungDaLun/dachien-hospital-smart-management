-- Description: Add department_id to files and update agent rule types
-- Created at: 2026-01-07

-- 1. Add department_id column to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_files_department_id ON files(department_id);

-- 2. Update agent_knowledge_rules to support 'DEPARTMENT' rule type
ALTER TABLE agent_knowledge_rules 
DROP CONSTRAINT IF EXISTS agent_knowledge_rules_rule_type_check;

ALTER TABLE agent_knowledge_rules 
ADD CONSTRAINT agent_knowledge_rules_rule_type_check 
CHECK (rule_type IN ('FOLDER', 'TAG', 'DEPARTMENT'));

-- 3. Update RLS Policies for Files to enforce Department Silos

-- Policy: Users can view files from their own department
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
);

-- Policy: Dept Admins and Editors can upload to their department
CREATE POLICY "Users can upload to their own department"
ON files FOR INSERT
WITH CHECK (
  (department_id IS NOT NULL AND department_id = (
    SELECT department_id FROM user_profiles WHERE id = auth.uid()
  ))
  OR
  (
    -- Super Admins can upload to any department
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  )
);
