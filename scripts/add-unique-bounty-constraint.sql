-- Add unique constraint to ensure only one active bounty per target
-- This enforces that each player can only have ONE bounty on them at a time

-- First, remove any duplicate active bounties (keep the oldest one for each target)
DELETE FROM bounties
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY target_gamertag, status
        ORDER BY created_at ASC
      ) as rn
    FROM bounties
    WHERE status = 'active'
  ) sub
  WHERE rn > 1
);

-- Now add the unique constraint using a partial unique index
-- This ensures only one active bounty can exist per target_gamertag
CREATE UNIQUE INDEX unique_active_bounty_per_target
ON bounties (target_gamertag)
WHERE status = 'active';

-- Note: This is a partial unique index that only applies to active bounties
-- Multiple expired/claimed bounties for the same target are still allowed

-- Verify the index was added
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname = 'unique_active_bounty_per_target';
