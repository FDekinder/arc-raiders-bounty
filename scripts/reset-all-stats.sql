-- Reset All Stats and Leaderboard for Clean Launch
-- Run this script to reset all user statistics and leaderboard data
-- WARNING: This will permanently delete all bounty-related data

-- =====================================================
-- PART 1: Delete all bounty-related records
-- =====================================================

-- Delete all bounty claims (must be done first due to foreign keys)
DELETE FROM bounty_claims;

-- Delete all bounty hunters
DELETE FROM bounty_hunters;

-- Delete all bounties
DELETE FROM bounties;

-- Note: activity_feed table does not exist in schema
-- If you have an activity/feed table, add: DELETE FROM <table_name>;

-- =====================================================
-- PART 2: Reset all user statistics
-- =====================================================

-- Reset all user stats to zero
UPDATE users
SET
  total_points = 0,
  bounties_completed = 0,
  times_hunted = 0,
  bounties_created = 0,
  hunts_joined = 0,
  achievements_earned = 0,
  kill_count = 0,
  created_at = NOW();  -- Reset join date to launch day

-- =====================================================
-- PART 3: Reset achievements (optional)
-- =====================================================

-- Uncomment the line below if you also want to reset all achievements
-- DELETE FROM user_achievements;

-- =====================================================
-- PART 4: Verify the reset
-- =====================================================

-- Check that everything is reset
SELECT
  'Users' as table_name,
  COUNT(*) as total_count,
  SUM(total_points) as total_points_sum,
  SUM(bounties_completed) as total_bounties_completed
FROM users

UNION ALL

SELECT
  'Bounties' as table_name,
  COUNT(*) as total_count,
  NULL as total_points_sum,
  NULL as total_bounties_completed
FROM bounties

UNION ALL

SELECT
  'Bounty Claims' as table_name,
  COUNT(*) as total_count,
  NULL as total_points_sum,
  NULL as total_bounties_completed
FROM bounty_claims

UNION ALL

SELECT
  'Bounty Hunters' as table_name,
  COUNT(*) as total_count,
  NULL as total_points_sum,
  NULL as total_bounties_completed
FROM bounty_hunters;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- If you see this, the reset was successful!
-- All stats have been wiped clean for launch day 🚀
