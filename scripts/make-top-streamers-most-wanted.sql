-- Make specific streamers the most wanted by adding multiple bounties for them
-- This will increase their bounty_count, making them appear at the top of Most Wanted

DO $$
DECLARE
  creator_id UUID;
BEGIN
  -- Get the first PR user as the creator
  SELECT id INTO creator_id FROM users WHERE game_role = 'PR' LIMIT 1;

  -- If no PR user exists, you might need to create one first or use a different user
  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'No PR (Proud Rat) user found. Please create a user first.';
  END IF;

  -- Add 20 bounties for theburntpeanut (#1 MOST WANTED)
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  SELECT 'theburntpeanut', 1, creator_id, 'steam', 'active', 'other'
  FROM generate_series(1, 20);

  -- Add 9 bounties for shroud
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  SELECT 'shroud', 1, creator_id, 'steam', 'active', 'other'
  FROM generate_series(1, 9);

  -- Add 8 bounties for summit1g
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  SELECT 'summit1g', 1, creator_id, 'steam', 'active', 'other'
  FROM generate_series(1, 8);

  -- Add 7 bounties for recrent
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  SELECT 'recrent', 1, creator_id, 'steam', 'active', 'other'
  FROM generate_series(1, 7);

  -- Add 6 bounties for timthetatman
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  SELECT 'timthetatman', 1, creator_id, 'steam', 'active', 'other'
  FROM generate_series(1, 6);

  RAISE NOTICE 'Successfully added multiple bounties for top 5 streamers!';
  RAISE NOTICE 'theburntpeanut: 20 additional bounties (#1 MOST WANTED)';
  RAISE NOTICE 'shroud: 9 additional bounties';
  RAISE NOTICE 'summit1g: 8 additional bounties';
  RAISE NOTICE 'recrent: 7 additional bounties';
  RAISE NOTICE 'timthetatman: 6 additional bounties';
END $$;

-- Verify the bounty counts
SELECT
  target_gamertag,
  COUNT(*) as bounty_count,
  MIN(created_at) as first_bounty,
  MAX(created_at) as latest_bounty
FROM bounties
WHERE target_gamertag IN ('theburntpeanut', 'shroud', 'summit1g', 'recrent', 'timthetatman')
  AND status = 'active'
GROUP BY target_gamertag
ORDER BY bounty_count DESC;
