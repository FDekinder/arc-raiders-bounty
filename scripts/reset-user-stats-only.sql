-- Reset User Stats Only - Day 1 Fresh Start
-- This script ONLY resets user statistics to zero
-- Keeps ALL bounties, claims, hunters, and activity data intact
-- Perfect for launch day while preserving the point system

-- =====================================================
-- Reset ONLY User Statistics
-- =====================================================

-- Reset all user stats to zero (Day 1 fresh start)
UPDATE users
SET
  total_points = 0,
  bounties_completed = 0,
  times_hunted = 0,
  bounties_created = 0,
  hunts_joined = 0,
  achievements_earned = 0,
  kill_count = 0;

-- Note: This preserves:
-- ✅ All bounties (active and completed)
-- ✅ All bounty claims (history preserved)
-- ✅ All active hunters
-- ✅ All activity feed
-- ✅ User accounts and profiles
-- ✅ Avatars, usernames, clan tags
-- ✅ Account creation dates
-- ✅ The entire point system

-- =====================================================
-- Verification Query
-- =====================================================

-- Check that stats are reset but users remain
SELECT
  COUNT(*) as total_users,
  SUM(total_points) as total_points_should_be_zero,
  SUM(bounties_completed) as bounties_completed_should_be_zero,
  SUM(times_hunted) as times_hunted_should_be_zero,
  SUM(kill_count) as kill_count_should_be_zero,
  SUM(hunts_joined) as hunts_joined_should_be_zero,
  SUM(achievements_earned) as achievements_earned_should_be_zero,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as users_with_usernames,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as users_with_custom_avatars
FROM users;

-- =====================================================
-- Show preserved data counts
-- =====================================================

SELECT
  'Bounties' as data_type,
  COUNT(*) as count,
  'PRESERVED ✅' as status
FROM bounties

UNION ALL

SELECT
  'Bounty Claims' as data_type,
  COUNT(*) as count,
  'PRESERVED ✅' as status
FROM bounty_claims

UNION ALL

SELECT
  'Bounty Hunters' as data_type,
  COUNT(*) as count,
  'PRESERVED ✅' as status
FROM bounty_hunters

UNION ALL

SELECT
  'Users' as data_type,
  COUNT(*) as count,
  'STATS RESET TO 0 🔄' as status
FROM users;

-- =====================================================
-- Sample of reset users
-- =====================================================

SELECT
  username,
  game_role,
  clan_tag,
  total_points as should_be_zero,
  bounties_completed as should_be_zero,
  kill_count as should_be_zero,
  created_at as original_join_date
FROM users
ORDER BY created_at ASC
LIMIT 10;

-- =====================================================
-- SUCCESS! 🚀
-- =====================================================
-- All user stats have been reset to zero
-- Everyone starts fresh on launch day!
-- The point system and all data remain intact
