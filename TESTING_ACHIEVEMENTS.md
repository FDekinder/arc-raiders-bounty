# Achievement Testing Guide

## Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/add_achievements.sql`
3. Verify tables created:
   ```sql
   SELECT COUNT(*) FROM achievements; -- Should return 17
   ```

## Test Scenarios

### 🎯 Hunter Achievements

**First Blood** (Common)
- ✅ Complete 1 bounty
- Expected: Toast notification + badge appears on profile

**Sharpshooter** (Rare)
- ✅ Complete 10 bounties
- Check: Profile shows rare (blue) badge

**Veteran Hunter** (Epic)
- ✅ Complete 50 bounties
- Check: Profile shows epic (purple) badge

**Legendary Hunter** (Legendary)
- ✅ Complete 100 bounties
- Check: Profile shows legendary (gold) badge with glow effect

**Hot Streak** (Rare)
- ✅ Complete 5 bounties within 24 hours
- This tests the streak detection logic

**Speed Demon** (Epic)
- ✅ Join a hunt, then complete it within 1 hour
- Tests completion time tracking

**Big Game Hunter** (Epic)
- ✅ Complete a bounty worth 1000+ points
- Tests single bounty value checking

### 💼 Creator Achievements

**Getting Started** (Common)
- ✅ Create 1 bounty

**Generous Hunter** (Rare)
- ✅ Create 10 bounties

**Bounty Lord** (Epic)
- ✅ Create 50 bounties

**Master Benefactor** (Legendary)
- ✅ Create 100 bounties

### 📈 Milestone Achievements

**Point Collector** (Rare)
- ✅ Earn 500 total points

**Point Master** (Epic)
- ✅ Earn 2,500 total points

**Point Legend** (Legendary)
- ✅ Earn 10,000 total points

**Apex Predator** (Legendary)
- ✅ Reach #1 on leaderboard
- This automatically checks when points are awarded

## Quick Test Commands (SQL)

### Manually award achievement for testing:
```sql
-- Find achievement ID
SELECT id, name FROM achievements WHERE name = 'First Blood';

-- Award it to a user
INSERT INTO user_achievements (user_id, achievement_id)
VALUES ('YOUR_USER_ID', 'ACHIEVEMENT_ID');
```

### Check if achievement logic works:
```sql
-- Simulate a bounty completion (run this after approving a claim)
SELECT
  u.username,
  u.bounties_completed,
  u.total_points,
  COUNT(ua.id) as achievements_earned
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.id = 'YOUR_USER_ID'
GROUP BY u.id;
```

### Reset achievements for re-testing:
```sql
-- WARNING: This deletes all earned achievements
DELETE FROM user_achievements WHERE user_id = 'YOUR_USER_ID';

-- Reset stats
UPDATE users
SET bounties_completed = 0,
    bounties_created = 0,
    hunts_joined = 0,
    achievements_earned = 0,
    total_points = 0
WHERE id = 'YOUR_USER_ID';
```

## UI Testing Checklist

- [ ] Profile page shows top achievements
- [ ] "View All" button expands full achievement grid
- [ ] Achievement grid shows earned/locked badges correctly
- [ ] Earned badges have color and glow effect
- [ ] Locked badges are grayscale
- [ ] Hover tooltips show achievement details
- [ ] Filters work (All/Earned/Locked, Rarity filters)
- [ ] Progress bar shows correct percentage
- [ ] Rarity breakdown stats are accurate
- [ ] Leaderboard shows top 3 badges per hunter
- [ ] Toast notifications appear when achievement unlocked
- [ ] Achievement notification shows correct achievement name

## Common Issues

### Achievements not unlocking?
1. Check that migration ran successfully
2. Verify RPC functions exist:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name LIKE 'increment%';
   ```
3. Check browser console for errors

### Badges not displaying?
1. Make sure `getTopAchievements()` is returning data
2. Check browser console for component errors
3. Verify achievement icons exist in Lucide icon library

### Stats not incrementing?
1. Verify RPC functions are being called
2. Check Supabase logs for errors
3. Make sure user ID is being passed correctly
