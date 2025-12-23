-- Add fake hunters (approved kills) for theburntpeanut to increase bounty amount
-- This simulates top killers hunting theburntpeanut

DO $$
DECLARE
  top_killer_ids UUID[];
  killer_id UUID;
  i INTEGER;
BEGIN
  -- Get the top 10 PR killers (Proud Rats with highest kill counts)
  SELECT ARRAY_AGG(id ORDER BY kill_count DESC)
  INTO top_killer_ids
  FROM users
  WHERE game_role = 'PR'
  LIMIT 10;

  -- Check if we have enough killers
  IF ARRAY_LENGTH(top_killer_ids, 1) < 5 THEN
    RAISE EXCEPTION 'Not enough PR (Proud Rat) users found. Need at least 5 killers.';
  END IF;

  -- Add kills from top 3 killers (worth 1000 points each)
  FOR i IN 1..3 LOOP
    IF i <= ARRAY_LENGTH(top_killer_ids, 1) THEN
      killer_id := top_killer_ids[i];

      -- Add 2 kills from each top 3 killer
      INSERT INTO kills (killer_id, victim_gamertag, verification_status, screenshot_url)
      VALUES
        (killer_id, 'theburntpeanut', 'approved', 'https://placeholder.com/fake-screenshot-1.jpg'),
        (killer_id, 'theburntpeanut', 'approved', 'https://placeholder.com/fake-screenshot-2.jpg');
    END IF;
  END LOOP;

  -- Add kills from killers 4-7 (worth 500 points each)
  FOR i IN 4..7 LOOP
    IF i <= ARRAY_LENGTH(top_killer_ids, 1) THEN
      killer_id := top_killer_ids[i];

      -- Add 1 kill from each
      INSERT INTO kills (killer_id, victim_gamertag, verification_status, screenshot_url)
      VALUES
        (killer_id, 'theburntpeanut', 'approved', 'https://placeholder.com/fake-screenshot.jpg');
    END IF;
  END LOOP;

  -- Add kills from 2 regular hunters (worth 150 points each)
  FOR i IN 8..9 LOOP
    IF i <= ARRAY_LENGTH(top_killer_ids, 1) THEN
      killer_id := top_killer_ids[i];

      -- Add 1 kill from each
      INSERT INTO kills (killer_id, victim_gamertag, verification_status, screenshot_url)
      VALUES
        (killer_id, 'theburntpeanut', 'approved', 'https://placeholder.com/fake-screenshot.jpg');
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully added fake hunters for theburntpeanut!';
  RAISE NOTICE 'Top 3 killers: 6 kills total (worth 6000 points)';
  RAISE NOTICE 'Top 4-10 killers: 4 kills total (worth 2000 points)';
  RAISE NOTICE 'Regular hunters: 2 kills total (worth 300 points)';
  RAISE NOTICE 'Total estimated bounty: 8300 points';
END $$;

-- Verify the kills were created and show the hunters
SELECT
  u.username,
  u.kill_count as killer_rank_score,
  COUNT(*) as kills_on_theburntpeanut
FROM kills k
JOIN users u ON k.killer_id = u.id
WHERE k.victim_gamertag = 'theburntpeanut'
  AND k.verification_status = 'approved'
GROUP BY u.id, u.username, u.kill_count
ORDER BY u.kill_count DESC;
