-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL, -- e.g., 'CREATE_AGENT', 'DELETE_FILE', 'LOGIN'
  resource_type VARCHAR(50) NOT NULL, -- e.g., 'AGENT', 'FILE', 'DEPARTMENT'
  resource_id VARCHAR(100), -- ID of the affected resource (can be UUID or other format)
  details JSONB, -- Previous values, new values, or specific details
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only Super Admins and Dept Admins can view logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.role = 'SUPER_ADMIN' OR user_profiles.role = 'DEPT_ADMIN')
    )
  );

-- System can insert logs (or authenticated users performing actions)
CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance on common queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
