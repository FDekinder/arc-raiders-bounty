-- Reset Stats Only - Keep User Accounts and Profiles
-- This version preserves user accounts, avatars, roles, and clan tags
-- Only resets statistics and game data

-- =====================================================
-- PART 1: Delete all bounty-related records
-- =====================================================

-- Delete all bounty claims
DELETE FROM bounty_claims;

-- Delete all bounty hunters
DELETE FROM bounty_hunters;

-- Delete all bounties
DELETE FROM bounties;

-- Note: activity_feed table does not exist in schema
-- If you have an activity/feed table, add: DELETE FROM <table_name>;

-- =====================================================
-- PART 2: Reset ONLY statistics (keep user profiles)
-- =====================================================

-- Reset only stats columns, preserve everything else
UPDATE users
SET
  total_points = 0,
  bounties_completed = 0,
  times_hunted = 0,
  bounties_created = 0,
  hunts_joined = 0,
  achievements_earned = 0,
  kill_count = 0;
  -- Note: NOT resetting created_at, username, email, role, game_role,
  -- avatar_url, clan_tag, or any other profile data

-- =====================================================
-- PART 3: Verify the reset
-- =====================================================

SELECT
  COUNT(*) as total_users,
  SUM(total_points) as total_points_should_be_zero,
  SUM(bounties_completed) as bounties_completed_should_be_zero,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as users_with_usernames,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as users_with_custom_avatars,
  COUNT(CASE WHEN clan_tag IS NOT NULL THEN 1 END) as users_with_clan_tags
FROM users;

-- =====================================================
-- Show sample of preserved user data
-- =====================================================

SELECT
  username,
  email,
  game_role,
  clan_tag,
  created_at as account_created,
  total_points,
  bounties_completed,
  total_kills
FROM users
ORDER BY created_at ASC
LIMIT 10;
