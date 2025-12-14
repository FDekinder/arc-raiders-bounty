-- Add platform field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(15) CHECK (platform IN ('steam', 'xbox', 'playstation'));

-- Make steam_id optional since email users won't have it
ALTER TABLE users ALTER COLUMN steam_id DROP NOT NULL;

-- Add email field for email authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Create index for platform
CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.platform IS 'Gaming platform: steam, xbox, or playstation';
COMMENT ON COLUMN users.email IS 'Email address for email authentication users';
