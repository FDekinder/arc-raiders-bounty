-- Add admin roles to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can update claims" ON bounty_claims;

-- New policies for bounty_claims
CREATE POLICY "Anyone can update claims"
ON bounty_claims FOR UPDATE
WITH CHECK (true);

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view and insert admin logs (for now)
CREATE POLICY "Anyone can view admin logs"
ON admin_logs FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert admin logs"
ON admin_logs FOR INSERT
WITH CHECK (true);



