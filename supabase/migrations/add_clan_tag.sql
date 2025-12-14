-- Add clan tag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(5);

-- Create index for clan tag lookups
CREATE INDEX IF NOT EXISTS idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.clan_tag IS 'Optional clan tag (max 5 characters) displayed next to username';
