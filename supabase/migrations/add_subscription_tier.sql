-- Add subscription_tier and subscription_expires_at columns to users table
-- This migration enables premium subscriptions that hide ads

-- Add subscription_tier column (default: 'free')
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free'
CHECK (subscription_tier IN ('free', 'premium'));

-- Add subscription_expires_at column (NULL for free tier)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add index for faster queries on subscription tier
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Add index for subscription expiration queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at)
WHERE subscription_expires_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free (shows ads) or premium (no ads)';
COMMENT ON COLUMN users.subscription_expires_at IS 'Timestamp when premium subscription expires (NULL for free tier or lifetime premium)';
