-- Align knowledge_frameworks schema
-- We will keep the ID-based foreign key but rename other columns for clarity
ALTER TABLE knowledge_frameworks 
  RENAME COLUMN structure_schema TO schema;

-- Align knowledge_instances schema
ALTER TABLE knowledge_instances 
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

ALTER TABLE knowledge_instances 
  RENAME COLUMN content_data TO data;

ALTER TABLE knowledge_instances 
  RENAME COLUMN target_subject TO title;

ALTER TABLE knowledge_instances 
  RENAME COLUMN completeness_score TO completeness;

ALTER TABLE knowledge_instances 
  RENAME COLUMN confidence_score TO confidence;

-- Update RLS Policies for Department Isolation
-- We need to drop existing policies first to perform a clean update
DROP POLICY IF EXISTS "所有使用者皆可讀取知識實例" ON knowledge_instances;
DROP POLICY IF EXISTS "授權人員可管理知識實例" ON knowledge_instances;

-- New Policies
CREATE POLICY "Users can view instances in their department" 
ON knowledge_instances FOR SELECT 
TO authenticated 
USING (
  department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid()) OR
  created_by = auth.uid() OR
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

CREATE POLICY "Users can create instances in their department" 
ON knowledge_instances FOR INSERT 
TO authenticated 
WITH CHECK (
  department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid()) OR
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

CREATE POLICY "Users can update/delete instances in their department" 
ON knowledge_instances FOR ALL
TO authenticated 
USING (
  department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid()) OR
  created_by = auth.uid() OR
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);
