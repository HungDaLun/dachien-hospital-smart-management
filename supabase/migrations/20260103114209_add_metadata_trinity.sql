-- Create document_categories table
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES document_categories(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add code column to departments
ALTER TABLE departments ADD COLUMN code VARCHAR(20) UNIQUE;

-- Add category_id and department_id to files
ALTER TABLE files ADD COLUMN category_id UUID REFERENCES document_categories(id);
ALTER TABLE files ADD COLUMN department_id UUID REFERENCES departments(id);

-- Enable RLS for document_categories
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for document_categories
CREATE POLICY "Everyone can view categories" ON document_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON document_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.role = 'SUPER_ADMIN' OR user_profiles.role = 'DEPT_ADMIN' OR is_super_admin())
    )
  );

-- Create trigger for document_categories updated_at
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON document_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
