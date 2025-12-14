-- Add game_role field to users table (renamed from 'role' to avoid conflict with admin role)
ALTER TABLE users ADD COLUMN IF NOT EXISTS game_role VARCHAR(2) CHECK (game_role IN ('BH', 'PR'));

-- Create index for game_role filtering
CREATE INDEX IF NOT EXISTS idx_users_game_role ON users(game_role) WHERE game_role IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.game_role IS 'Game role: BH (Bounty Hunter) or PR (Proud Rat)';
