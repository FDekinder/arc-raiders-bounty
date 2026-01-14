-- Script to seed fake data directly into the database for testing
-- This creates fake users, bounties, hunters, and kills to populate the Most Wanted section

-- ============================================
-- PART 1: Create Fake Users
-- ============================================

-- Insert fake Bounty Hunter users
INSERT INTO users (id, username, email, game_role, platform, avatar_url, created_at)
VALUES
  (gen_random_uuid(), 'ShadowHunter', 'shadowhunter@fake.com', 'BH', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowHunter', NOW()),
  (gen_random_uuid(), 'RaidMaster', 'raidmaster@fake.com', 'BH', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=RaidMaster', NOW()),
  (gen_random_uuid(), 'StormBreaker', 'stormbreaker@fake.com', 'BH', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=StormBreaker', NOW()),
  (gen_random_uuid(), 'NightStalker', 'nightstalker@fake.com', 'BH', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=NightStalker', NOW()),
  (gen_random_uuid(), 'IronWolf', 'ironwolf@fake.com', 'BH', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=IronWolf', NOW()),
  (gen_random_uuid(), 'VoidWalker', 'voidwalker@fake.com', 'BH', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoidWalker', NOW()),
  (gen_random_uuid(), 'CrimsonBlade', 'crimsonblade@fake.com', 'BH', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CrimsonBlade', NOW()),
  (gen_random_uuid(), 'BloodHawk', 'bloodhawk@fake.com', 'BH', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BloodHawk', NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert fake Proud Rat users (targets for bounties)
INSERT INTO users (id, username, email, game_role, platform, avatar_url, clan_tag, created_at)
VALUES
  (gen_random_uuid(), 'DeadShot', 'deadshot@fake.com', 'PR', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeadShot', 'KILL', NOW()),
  (gen_random_uuid(), 'PhantomKill', 'phantomkill@fake.com', 'PR', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhantomKill', 'SHAD', NOW()),
  (gen_random_uuid(), 'Reaper', 'reaper@fake.com', 'PR', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reaper', '', NOW()),
  (gen_random_uuid(), 'SilentAssassin', 'silentassassin@fake.com', 'PR', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SilentAssassin', 'SNK', NOW()),
  (gen_random_uuid(), 'GhostRider', 'ghostrider@fake.com', 'PR', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GhostRider', '', NOW()),
  (gen_random_uuid(), 'WarMachine', 'warmachine@fake.com', 'PR', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=WarMachine', 'WAR', NOW()),
  (gen_random_uuid(), 'Executioner', 'executioner@fake.com', 'PR', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Executioner', 'EXEC', NOW()),
  (gen_random_uuid(), 'VenomStrike', 'venomstrike@fake.com', 'PR', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VenomStrike', 'VNM', NOW()),
  (gen_random_uuid(), 'IronFist', 'ironfist@fake.com', 'PR', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=IronFist', '', NOW()),
  (gen_random_uuid(), 'DarkPhoenix', 'darkphoenix@fake.com', 'PR', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DarkPhoenix', 'PHX', NOW()),
  (gen_random_uuid(), 'ShadowDemon', 'shadowdemon@fake.com', 'PR', 'steam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowDemon', 'DMN', NOW()),
  (gen_random_uuid(), 'BlazeKing', 'blazeking@fake.com', 'PR', 'xbox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BlazeKing', 'FIRE', NOW()),
  (gen_random_uuid(), 'FrostByte', 'frostbyte@fake.com', 'PR', 'playstation', 'https://api.dicebear.com/7.x/avataaars/svg?seed=FrostByte', 'ICE', NOW())
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- PART 2: Create Bounties on Proud Rats
-- ============================================

-- Create bounties with varying amounts
DO $$
DECLARE
  bh_user_id UUID;
  target_user_id UUID;
  target_name TEXT;
  bounty_amount INT;
BEGIN
  -- Get a Bounty Hunter user ID
  SELECT id INTO bh_user_id FROM users WHERE game_role = 'BH' LIMIT 1;

  -- Create high-value bounties (for top 3)
  FOR target_name, bounty_amount IN
    SELECT * FROM (VALUES
      ('DeadShot', 500),
      ('PhantomKill', 450),
      ('Reaper', 400),
      ('SilentAssassin', 350),
      ('GhostRider', 300),
      ('WarMachine', 280),
      ('Executioner', 250),
      ('VenomStrike', 220),
      ('IronFist', 200),
      ('DarkPhoenix', 180),
      ('ShadowDemon', 150),
      ('BlazeKing', 120),
      ('FrostByte', 100)
    ) AS t(name, amount)
  LOOP
    -- Get target user ID
    SELECT id INTO target_user_id FROM users WHERE username = target_name;

    IF target_user_id IS NOT NULL AND bh_user_id IS NOT NULL THEN
      -- Insert bounty
      INSERT INTO bounties (
        created_by,
        target_gamertag,
        bounty_amount,
        status,
        expires_at,
        created_at,
        platform
      )
      VALUES (
        bh_user_id,
        target_name,
        bounty_amount,
        'active',
        NOW() + INTERVAL '30 days',
        NOW() - (random() * INTERVAL '7 days'), -- Random creation time within last 7 days
        'steam'
      )
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Created bounty on % for % points', target_name, bounty_amount;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- PART 3: Add Multiple Bounties on Same Targets
-- ============================================

-- Add additional bounties on top targets (to increase total bounty value)
DO $$
DECLARE
  bh_user_id UUID;
  target_name TEXT;
  bounty_amount INT;
  i INT;
BEGIN
  -- Add 3-5 more bounties on the top 5 targets
  FOR target_name, bounty_amount IN
    SELECT * FROM (VALUES
      ('DeadShot', 100),
      ('DeadShot', 150),
      ('DeadShot', 200),
      ('PhantomKill', 120),
      ('PhantomKill', 130),
      ('PhantomKill', 180),
      ('Reaper', 100),
      ('Reaper', 150),
      ('SilentAssassin', 80),
      ('SilentAssassin', 120),
      ('GhostRider', 100),
      ('GhostRider', 90)
    ) AS t(name, amount)
  LOOP
    -- Get a random Bounty Hunter user ID
    SELECT id INTO bh_user_id FROM users WHERE game_role = 'BH' ORDER BY RANDOM() LIMIT 1;

    IF bh_user_id IS NOT NULL THEN
      -- Insert bounty
      INSERT INTO bounties (
        created_by,
        target_gamertag,
        bounty_amount,
        status,
        expires_at,
        created_at,
        platform
      )
      VALUES (
        bh_user_id,
        target_name,
        bounty_amount,
        'active',
        NOW() + INTERVAL '30 days',
        NOW() - (random() * INTERVAL '7 days'),
        CASE
          WHEN random() < 0.33 THEN 'steam'
          WHEN random() < 0.66 THEN 'xbox'
          ELSE 'playstation'
        END
      )
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Added additional bounty on % for % points', target_name, bounty_amount;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- PART 4: Add Bounty Claims (Hunters Joining)
-- ============================================

-- Add bounty claims to show hunters are actively hunting
DO $$
DECLARE
  bounty_rec RECORD;
  hunter_id UUID;
  num_claims INT;
  i INT;
BEGIN
  -- For each bounty, add 1-3 claims
  FOR bounty_rec IN (SELECT id FROM bounties WHERE status = 'active')
  LOOP
    num_claims := floor(random() * 3 + 1)::INT; -- Random 1-3 claims

    FOR i IN 1..num_claims LOOP
      -- Get a random Bounty Hunter user ID
      SELECT id INTO hunter_id FROM users WHERE game_role = 'BH' ORDER BY RANDOM() LIMIT 1;

      IF hunter_id IS NOT NULL THEN
        INSERT INTO bounty_claims (id, bounty_id, hunter_id, screenshot_url, verification_status, claimed_at)
        VALUES (
          gen_random_uuid(),
          bounty_rec.id,
          hunter_id,
          'https://placeholder.com/claim-proof-' || bounty_rec.id || '-' || i || '.png',
          CASE
            WHEN random() < 0.7 THEN 'pending'
            WHEN random() < 0.9 THEN 'approved'
            ELSE 'rejected'
          END,
          NOW() - (random() * INTERVAL '7 days')
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;

    RAISE NOTICE 'Added % claims to bounty %', num_claims, bounty_rec.id;
  END LOOP;
END $$;

-- ============================================
-- PART 5: Add Some Completed Kills (Optional)
-- ============================================

-- Add some kills to make Proud Rats have kill counts
DO $$
DECLARE
  pr_user_id UUID;
  pr_username TEXT;
  bh_user_id UUID;
  bh_username TEXT;
  kill_count INT;
  i INT;
BEGIN
  FOR pr_username, kill_count IN
    SELECT * FROM (VALUES
      ('DeadShot', 25),
      ('PhantomKill', 18),
      ('Reaper', 15),
      ('SilentAssassin', 12),
      ('GhostRider', 10)
    ) AS t(name, kills)
  LOOP
    -- Get PR user ID
    SELECT id INTO pr_user_id FROM users WHERE username = pr_username;

    IF pr_user_id IS NOT NULL THEN
      FOR i IN 1..kill_count LOOP
        -- Get a random BH user ID (victim)
        SELECT id INTO bh_user_id FROM users WHERE game_role = 'BH' ORDER BY RANDOM() LIMIT 1;

        IF bh_user_id IS NOT NULL THEN
          -- Get BH username
          SELECT username INTO bh_username FROM users WHERE id = bh_user_id;

          IF bh_username IS NOT NULL THEN
            INSERT INTO kills (
              killer_id,
              victim_gamertag,
              screenshot_url,
              verification_status,
              killed_at
            )
            VALUES (
              pr_user_id,
              bh_username,
              'https://placeholder.com/proof' || i || '.png',
              'approved',
              NOW() - (random() * INTERVAL '14 days')
            );
          END IF;
        END IF;
      END LOOP;

      RAISE NOTICE 'Added % kills for %', kill_count, pr_username;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- VERIFICATION: Show Results
-- ============================================

-- Show total bounty value for each target (Top 10)
SELECT
  target_gamertag,
  COUNT(*) as bounty_count,
  SUM(bounty_amount) as total_bounty,
  COUNT(DISTINCT created_by) as unique_creators
FROM bounties
WHERE status = 'active'
GROUP BY target_gamertag
ORDER BY total_bounty DESC
LIMIT 10;

-- Show claim counts per bounty
SELECT
  b.target_gamertag,
  COUNT(bc.id) as claim_count
FROM bounties b
LEFT JOIN bounty_claims bc ON b.id = bc.bounty_id
WHERE b.status = 'active'
GROUP BY b.target_gamertag
ORDER BY claim_count DESC
LIMIT 10;

-- Show kill counts
SELECT
  u.username,
  u.game_role,
  COUNT(k.id) as kill_count
FROM users u
LEFT JOIN kills k ON u.id = k.killer_id
WHERE u.game_role = 'PR'
GROUP BY u.id, u.username, u.game_role
ORDER BY kill_count DESC
LIMIT 10;

RAISE NOTICE '====================================';
RAISE NOTICE 'Fake data seeding completed!';
RAISE NOTICE '====================================';
RAISE NOTICE 'You should now see:';
RAISE NOTICE '- 20+ fake users (BH and PR)';
RAISE NOTICE '- 25+ active bounties';
RAISE NOTICE '- Bounty claims from hunters';
RAISE NOTICE '- Kill records for top Proud Rats';
RAISE NOTICE '';
RAISE NOTICE 'Visit your homepage to see the Most Wanted Top 3!';
