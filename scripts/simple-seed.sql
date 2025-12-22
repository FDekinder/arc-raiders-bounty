-- Simple seed script that directly inserts fake data without auth users
-- Run this directly in Supabase SQL Editor

-- First, create UUIDs for our fake users (we'll generate them inline)
-- Create 10 Bounty Hunter users
INSERT INTO public.users (id, username, game_role, platform, kill_count, total_points, bounties_completed, times_hunted, bounties_created, hunts_joined, achievements_earned)
VALUES
  (gen_random_uuid(), 'ShadowHunter', 'BH', 'steam', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'RaidMaster', 'BH', 'xbox', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'StormBreaker', 'BH', 'playstation', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'NightStalker', 'BH', 'steam', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'IronWolf', 'BH', 'xbox', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'VoidWalker', 'BH', 'playstation', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'CrimsonBlade', 'BH', 'steam', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'BloodHawk', 'BH', 'xbox', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'ThunderFist', 'BH', 'playstation', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'DarkWolf', 'BH', 'steam', 0, 0, 0, 0, 0, 0, 0);

-- Create 10 Proud Rat users (killers)
INSERT INTO public.users (id, username, game_role, platform, clan_tag, kill_count, total_points, bounties_completed, times_hunted, bounties_created, hunts_joined, achievements_earned)
VALUES
  (gen_random_uuid(), 'DeadShot', 'PR', 'steam', 'KILL', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'PhantomKill', 'PR', 'xbox', 'SHAD', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'Reaper', 'PR', 'playstation', '', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'SilentAssassin', 'PR', 'steam', 'SNK', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'GhostRider', 'PR', 'xbox', '', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'WarMachine', 'PR', 'playstation', 'WAR', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'Executioner', 'PR', 'steam', 'EXEC', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'VenomStrike', 'PR', 'xbox', 'VNM', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'IronFist', 'PR', 'playstation', '', 0, 0, 0, 0, 0, 0, 0),
  (gen_random_uuid(), 'DarkPhoenix', 'PR', 'steam', 'PHX', 0, 0, 0, 0, 0, 0, 0);

-- Now create bounties (we need to get the IDs from the users we just created)
DO $$
DECLARE
  bh_users UUID[];
  pr_users UUID[];
  bounty_amounts INT[] := ARRAY[1000, 500, 300, 200, 150, 100, 75, 50, 40, 30];
  i INT;
  bh_username TEXT;
  random_pr_id UUID;
BEGIN
  -- Get all BH user IDs
  SELECT ARRAY_AGG(id ORDER BY username) INTO bh_users
  FROM public.users
  WHERE game_role = 'BH' AND username IN ('ShadowHunter', 'RaidMaster', 'StormBreaker', 'NightStalker', 'IronWolf', 'VoidWalker', 'CrimsonBlade', 'BloodHawk', 'ThunderFist', 'DarkWolf');

  -- Get all PR user IDs
  SELECT ARRAY_AGG(id ORDER BY username) INTO pr_users
  FROM public.users
  WHERE game_role = 'PR' AND username IN ('DeadShot', 'PhantomKill', 'Reaper', 'SilentAssassin', 'GhostRider', 'WarMachine', 'Executioner', 'VenomStrike', 'IronFist', 'DarkPhoenix');

  -- Create 10 bounties
  FOR i IN 1..10 LOOP
    -- Get the BH username for this bounty
    SELECT username INTO bh_username
    FROM public.users
    WHERE id = bh_users[i];

    -- Pick a random PR user as creator
    random_pr_id := pr_users[1 + floor(random() * array_length(pr_users, 1))::int];

    -- Insert bounty
    INSERT INTO public.bounties (target_gamertag, bounty_amount, created_by, platform, status)
    VALUES (bh_username, bounty_amounts[i], random_pr_id, 'steam', 'active');
  END LOOP;

  RAISE NOTICE 'Created 10 bounties successfully';
END $$;

-- Now create kills with the distribution: 25, 20, 18, 15, 13, 10, 8, 6, 4, 2
DO $$
DECLARE
  bh_users UUID[];
  pr_users UUID[];
  kill_counts INT[] := ARRAY[25, 20, 18, 15, 13, 10, 8, 6, 4, 2];
  i INT;
  j INT;
  pr_id UUID;
  bh_username TEXT;
  random_bh_id UUID;
BEGIN
  -- Get all BH user IDs
  SELECT ARRAY_AGG(id ORDER BY username) INTO bh_users
  FROM public.users
  WHERE game_role = 'BH' AND username IN ('ShadowHunter', 'RaidMaster', 'StormBreaker', 'NightStalker', 'IronWolf', 'VoidWalker', 'CrimsonBlade', 'BloodHawk', 'ThunderFist', 'DarkWolf');

  -- Get all PR user IDs in order
  SELECT ARRAY_AGG(id ORDER BY username) INTO pr_users
  FROM public.users
  WHERE game_role = 'PR' AND username IN ('DarkPhoenix', 'DeadShot', 'Executioner', 'GhostRider', 'IronFist', 'PhantomKill', 'Reaper', 'SilentAssassin', 'VenomStrike', 'WarMachine');

  -- For each PR user, create their kills
  FOR i IN 1..10 LOOP
    pr_id := pr_users[i];

    -- Create kills for this PR user
    FOR j IN 1..kill_counts[i] LOOP
      -- Pick a random BH user as victim
      random_bh_id := bh_users[1 + (j % array_length(bh_users, 1))];

      -- Get victim username
      SELECT username INTO bh_username
      FROM public.users
      WHERE id = random_bh_id;

      -- Insert kill
      INSERT INTO public.kills (killer_id, victim_gamertag, screenshot_url, verification_status)
      VALUES (pr_id, bh_username, 'https://fake-proof.com/screenshot.jpg', 'approved');
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created kills successfully';
END $$;

-- Finally, update the kill_count column in users table
UPDATE public.users u
SET kill_count = (
  SELECT COUNT(*)
  FROM public.kills k
  WHERE k.killer_id = u.id AND k.verification_status = 'approved'
)
WHERE u.game_role = 'PR';

-- Show the results
SELECT username, game_role, kill_count
FROM public.users
WHERE game_role IN ('BH', 'PR')
ORDER BY kill_count DESC NULLS LAST;
