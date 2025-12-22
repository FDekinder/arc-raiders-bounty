-- Add popular streamers as bounties
-- Note: You'll need to replace 'YOUR_USER_ID_HERE' with an actual user ID from your database
-- Or you can use any existing PR (Proud Rat) user ID as the creator

-- First, let's create a variable to hold a creator ID
-- You can get a user ID by running: SELECT id FROM users WHERE game_role = 'PR' LIMIT 1;

DO $$
DECLARE
  creator_id UUID;
BEGIN
  -- Get the first PR user as the creator (you can change this to any specific user)
  SELECT id INTO creator_id FROM users WHERE game_role = 'PR' LIMIT 1;

  -- If no PR user exists, you might need to create one first or use a different user
  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'No PR (Proud Rat) user found. Please create a user first.';
  END IF;

  -- Insert all streamer bounties
  -- Note: Using 1 as placeholder since DB requires bounty_amount > 0
  -- The actual amount will be calculated dynamically based on hunters
  INSERT INTO bounties (target_gamertag, bounty_amount, created_by, platform, status, kill_type)
  VALUES
    ('theburntpeanut', 1, creator_id, 'steam', 'active', 'other'),
    ('shroud', 1, creator_id, 'steam', 'active', 'other'),
    ('summit1g', 1, creator_id, 'steam', 'active', 'other'),
    ('recrent', 1, creator_id, 'steam', 'active', 'other'),
    ('cohhcarnage', 1, creator_id, 'steam', 'active', 'other'),
    ('timthetatman', 1, creator_id, 'steam', 'active', 'other'),
    ('nickmercs', 1, creator_id, 'steam', 'active', 'other'),
    ('ninja', 1, creator_id, 'steam', 'active', 'other'),
    ('sxb', 1, creator_id, 'steam', 'active', 'other'),
    ('wtcn', 1, creator_id, 'steam', 'active', 'other'),
    ('zackrawrr', 1, creator_id, 'steam', 'active', 'other'),
    ('LIRIK', 1, creator_id, 'steam', 'active', 'other'),
    ('DrDisRespecT', 1, creator_id, 'steam', 'active', 'other'),
    ('sequisha', 1, creator_id, 'steam', 'active', 'other'),
    ('grimmmz', 1, creator_id, 'steam', 'active', 'other'),
    ('lost', 1, creator_id, 'steam', 'active', 'other'),
    ('sacriel', 1, creator_id, 'steam', 'active', 'other'),
    ('anthony_kongphan', 1, creator_id, 'steam', 'active', 'other'),
    ('thespudhunter', 1, creator_id, 'steam', 'active', 'other'),
    ('solidfps', 1, creator_id, 'steam', 'active', 'other'),
    ('HutchMF', 1, creator_id, 'steam', 'active', 'other'),
    ('cloakzy', 1, creator_id, 'steam', 'active', 'other'),
    ('Myth_', 1, creator_id, 'steam', 'active', 'other'),
    ('RNGingy', 1, creator_id, 'steam', 'active', 'other'),
    ('xQc', 1, creator_id, 'steam', 'active', 'other'),
    ('Nadeshot', 1, creator_id, 'steam', 'active', 'other'),
    ('Symfuhny', 1, creator_id, 'steam', 'active', 'other'),
    ('Tfue', 1, creator_id, 'steam', 'active', 'other'),
    ('Swagg', 1, creator_id, 'steam', 'active', 'other'),
    ('Aceu', 1, creator_id, 'steam', 'active', 'other'),
    ('iiTzTimmy', 1, creator_id, 'steam', 'active', 'other'),
    ('FaZeJSmooth', 1, creator_id, 'steam', 'active', 'other'),
    ('HusKerrs', 1, creator_id, 'steam', 'active', 'other'),
    ('Klean', 1, creator_id, 'steam', 'active', 'other'),
    ('Gigz', 1, creator_id, 'steam', 'active', 'other'),
    ('Astatoro', 1, creator_id, 'steam', 'active', 'other'),
    ('Phillygamer98', 1, creator_id, 'steam', 'active', 'other'),
    ('BasicallyZen', 1, creator_id, 'steam', 'active', 'other'),
    ('Phixate', 1, creator_id, 'steam', 'active', 'other'),
    ('RamenStyle', 1, creator_id, 'steam', 'active', 'other'),
    ('Bearki', 1, creator_id, 'steam', 'active', 'other'),
    ('Jesse', 1, creator_id, 'steam', 'active', 'other'),
    ('Qloud', 1, creator_id, 'steam', 'active', 'other'),
    ('ON1C', 1, creator_id, 'steam', 'active', 'other'),
    ('BoschPlays', 1, creator_id, 'steam', 'active', 'other'),
    ('MrC0d3r', 1, creator_id, 'steam', 'active', 'other'),
    ('Skulldar_', 1, creator_id, 'steam', 'active', 'other'),
    ('Paitambemjoga', 1, creator_id, 'steam', 'active', 'other'),
    ('RAIDER21', 1, creator_id, 'steam', 'active', 'other'),
    ('RiotGamesFPS', 1, creator_id, 'steam', 'active', 'other'),
    ('RogueNine', 1, creator_id, 'steam', 'active', 'other');

  RAISE NOTICE 'Successfully added 51 streamer bounties!';
END $$;

-- Verify the bounties were created
SELECT target_gamertag, bounty_amount, status, created_at
FROM bounties
WHERE target_gamertag IN (
  'theburntpeanut', 'shroud', 'summit1g', 'recrent', 'cohhcarnage',
  'timthetatman', 'nickmercs', 'ninja', 'sxb', 'wtcn',
  'zackrawrr', 'LIRIK', 'DrDisRespecT', 'sequisha', 'grimmmz',
  'lost', 'sacriel', 'anthony_kongphan', 'thespudhunter', 'solidfps',
  'HutchMF', 'cloakzy', 'Myth_', 'RNGingy', 'xQc',
  'Nadeshot', 'Symfuhny', 'Tfue', 'Swagg', 'Aceu',
  'iiTzTimmy', 'FaZeJSmooth', 'HusKerrs', 'Klean', 'Gigz',
  'Astatoro', 'Phillygamer98', 'BasicallyZen', 'Phixate', 'RamenStyle',
  'Bearki', 'Jesse', 'Qloud', 'ON1C', 'BoschPlays',
  'MrC0d3r', 'Skulldar_', 'Paitambemjoga', 'RAIDER21', 'RiotGamesFPS',
  'RogueNine'
)
ORDER BY created_at DESC;
