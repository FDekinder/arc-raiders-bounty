# Reset Scripts for Clean Launch

## Available Scripts

### 1. `reset-user-stats-only.sql` - User Stats Reset Only ⭐ **RECOMMENDED FOR LAUNCH**
**Use this to give everyone a fresh start while keeping all game data**

This script will:
- ✅ Reset ALL user statistics to 0 (total_points, bounties_completed, kills, etc.)
- ✅ **PRESERVES ALL bounties** (active and completed)
- ✅ **PRESERVES ALL bounty claims** (history intact)
- ✅ **PRESERVES ALL bounty hunters**
- ✅ **PRESERVES the entire point system**
- ✅ **Preserves user accounts, profiles, avatars, clan tags**
- ✅ **Preserves user join dates**

**Perfect for:** Launch day when you want everyone to start fresh but keep the game economy intact

### 2. `reset-all-stats.sql` - Complete Reset
**Use this if you want a completely clean slate**

This script will:
- ✅ Delete ALL bounties
- ✅ Delete ALL bounty claims
- ✅ Delete ALL bounty hunters
- ✅ Reset ALL user statistics to 0
- ✅ Reset user join dates to NOW (launch day)
- ⚠️ **Keeps user accounts, emails, and login credentials**
- ⚠️ **Keeps avatars, usernames, roles, and clan tags**

### 3. `reset-stats-keep-users.sql` - Stats + Data Reset
**Use this to wipe all game data but preserve user profiles**

This script will:
- ✅ Delete ALL bounties
- ✅ Delete ALL bounty claims
- ✅ Delete ALL bounty hunters
- ✅ Reset ALL user statistics to 0
- ✅ **Preserves user join dates (created_at)**
- ✅ **Preserves avatars, usernames, roles, and clan tags**
- ✅ **Preserves all user profile information**

## How to Run (Supabase)

### Option 1: Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the script you want to run
5. Paste into the editor
6. Click **Run**

### Option 2: Command Line
```bash
# RECOMMENDED: Reset only user stats (keeps all bounties and game data)
npx supabase db execute --file scripts/reset-user-stats-only.sql

# OR wipe game data + reset stats (keeps user profiles)
npx supabase db execute --file scripts/reset-stats-keep-users.sql

# OR complete reset (wipes everything except user accounts)
npx supabase db execute --file scripts/reset-all-stats.sql
```

### Option 3: Environment Variable Method
```bash
# Set your Supabase URL and key
set VITE_SUPABASE_URL=https://jixqdgldndtbbcqzenxl.supabase.co
set VITE_SUPABASE_ANON_KEY=your-anon-key

# Then run the recommended script
npx supabase db execute --file scripts/reset-user-stats-only.sql
```

## What Gets Reset/Preserved?

| Data Type | reset-user-stats-only.sql ⭐ | reset-stats-keep-users.sql | reset-all-stats.sql |
|-----------|---------------------------|----------------------------|---------------------|
| User Statistics | ✅ Reset to 0 | ✅ Reset to 0 | ✅ Reset to 0 |
| Bounties | ✅ **PRESERVED** | ❌ Deleted | ❌ Deleted |
| Bounty Claims | ✅ **PRESERVED** | ❌ Deleted | ❌ Deleted |
| Bounty Hunters | ✅ **PRESERVED** | ❌ Deleted | ❌ Deleted |
| Point System | ✅ **PRESERVED** | ❌ Deleted | ❌ Deleted |
| User Accounts | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Usernames | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Emails/Login | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Avatars | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Clan Tags | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Roles | ✅ Preserved | ✅ Preserved | ✅ Preserved |
| Join Date | ✅ Preserved | ✅ Preserved | ⚠️ Reset to NOW |
| Achievements | ✅ Preserved | ✅ Preserved | ⚠️ Optional |

## ⚠️ Important Notes

1. **BACKUP FIRST**: Always backup your database before running these scripts
2. **NO UNDO**: These operations are permanent and cannot be undone
3. **Test First**: Consider testing on a development database first
4. **User Impact**: Users will keep their accounts but lose all progress
5. **Achievements**: By default, achievements are preserved. Uncomment the delete line in `reset-all-stats.sql` if you want to remove them too

## 🚀 Recommended Approach for Launch Day

```bash
# 1. Backup your database (Supabase Dashboard > Database > Backups)

# 2. Run the user stats reset ONLY (keeps all game data intact)
npx supabase db execute --file scripts/reset-user-stats-only.sql

# 3. Verify the reset worked
# Check the query results to ensure all user stats are 0
# Verify that bounties, claims, and activity are still there

# 4. Everyone starts fresh with stats reset to 0! 🎯
# 5. The game economy and point system remain intact! 💰
# 6. Announce the launch to your community! 🚀
```

## Verification Queries

After running the reset, verify everything worked:

```sql
-- Check total stats are zero
SELECT
  SUM(total_points) as should_be_zero,
  SUM(bounties_completed) as should_be_zero,
  SUM(total_kills) as should_be_zero
FROM users;

-- Check all bounties are deleted
SELECT COUNT(*) as should_be_zero FROM bounties;

-- Check all claims are deleted
SELECT COUNT(*) as should_be_zero FROM bounty_claims;

-- Verify users still exist
SELECT COUNT(*) as total_users FROM users;
```

## Need Help?

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify you have the correct permissions
3. Make sure no other processes are using the database
4. Contact support with the error message

---

**Good luck with your launch! 🎯**
