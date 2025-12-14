-- Add role field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(2) CHECK (role IN ('BH', 'PR'));

-- Create index for role filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.role IS 'User role: BH (Bounty Hunter) or PR (Proud Rat)';
