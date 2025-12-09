-- Add platform field to bounties table for multi-platform support
-- This allows tracking bounties across Steam, Xbox, and PlayStation

ALTER TABLE bounties
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('steam', 'xbox', 'playstation'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bounties_platform ON bounties(platform);

-- Add comment for documentation
COMMENT ON COLUMN bounties.platform IS 'Gaming platform for the target player (steam, xbox, playstation)';
