-- Add admin roles to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update bounty_claims RLS policies

-- Drop old update policy
DROP POLICY IF EXISTS "Anyone can update claims" ON bounty_claims;

-- New policy: Admins can update any claim
CREATE POLICY "Admins can update any claim"
ON bounty_claims FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'admin'
  )
)
WITH CHECK (true);

-- Bounty creators can still update their own claims
CREATE POLICY "Creators can update own bounty claims"
ON bounty_claims FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM bounties 
    WHERE bounties.id = bounty_claims.bounty_id 
    AND bounties.created_by = auth.uid()::text
  )
)
WITH CHECK (true);

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view admin logs
CREATE POLICY "Admins can view admin logs"
ON admin_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'admin'
  )
);

-- Admins can insert admin logs
CREATE POLICY "Admins can insert admin logs"
ON admin_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'admin'
  )
);
