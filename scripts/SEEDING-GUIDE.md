# Database Seeding Guide

This guide explains how to populate your database with fake data to test the "Most Wanted" feature and other parts of the application.

## 🎯 Problem: No "Most Wanted" Top 3 Showing?

If your homepage isn't showing the "Most Wanted" top 3 bounties, it's because your database is empty. You need to add some fake bounties to see this feature in action.

## 📝 Two Ways to Seed Fake Data

### Method 1: Using Supabase SQL Editor (Recommended)

This is the **easiest and most reliable** method:

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Open your Arc Raiders Bounty project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open the file: `scripts/seed-fake-bounties.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for it to complete (should take 5-10 seconds)
   - You'll see results showing the created data

5. **Verify**
   - Visit your website: [www.dont-shoot.com](https://www.dont-shoot.com)
   - The "Most Wanted" top 3 should now appear!

### Method 2: Using npm Script (Requires psql)

This method requires PostgreSQL's `psql` command-line tool to be installed.

**Prerequisites:**
- PostgreSQL client (`psql`) must be installed
- `DATABASE_URL` environment variable in `.env.local`

**Steps:**

1. **Add DATABASE_URL to .env.local**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

   You can find this in your Supabase project:
   - Go to Settings → Database
   - Look for "Connection string" under "Connection pooling"
   - Copy the URI and replace `[YOUR-PASSWORD]` with your database password

2. **Run the npm script**
   ```bash
   npm run db:seed-bounties
   ```

3. **Check your website**
   - Visit [www.dont-shoot.com](https://www.dont-shoot.com)
   - The "Most Wanted" should now show!

## 📊 What Gets Created

When you run the seed script, it creates:

### Fake Users (20+)
- **8 Bounty Hunters**: ShadowHunter, RaidMaster, StormBreaker, NightStalker, IronWolf, VoidWalker, CrimsonBlade, BloodHawk
- **13 Proud Rats** (bounty targets): DeadShot, PhantomKill, Reaper, SilentAssassin, GhostRider, WarMachine, Executioner, VenomStrike, IronFist, DarkPhoenix, ShadowDemon, BlazeKing, FrostByte

### Active Bounties (25+)
- Primary bounties with amounts ranging from 100-500 points
- Additional bounties on the same targets to increase total bounty values
- The top 3 targets by total bounty:
  1. **DeadShot** - ~950 total bounty
  2. **PhantomKill** - ~880 total bounty
  3. **Reaper** - ~650 total bounty

### Hunters (50+)
- 1-5 hunters assigned to each bounty
- Shows that players are actively hunting these targets

### Kill Records (80+)
- Top Proud Rats have kill counts (10-25 kills each)
- Various kill types: standard, headshot, stealth, explosive

## 🔍 Verify the Data

After seeding, you can check the data in Supabase:

1. **Check Users Table**
   ```sql
   SELECT username, game_role, platform FROM users ORDER BY created_at DESC LIMIT 20;
   ```

2. **Check Bounties**
   ```sql
   SELECT target_gamertag, SUM(bounty_amount) as total_bounty, COUNT(*) as bounty_count
   FROM bounties
   WHERE status = 'active'
   GROUP BY target_gamertag
   ORDER BY total_bounty DESC
   LIMIT 10;
   ```

3. **Check Hunters**
   ```sql
   SELECT b.target_gamertag, COUNT(h.id) as hunter_count
   FROM bounties b
   LEFT JOIN hunters h ON b.id = h.bounty_id
   WHERE b.status = 'active'
   GROUP BY b.target_gamertag
   ORDER BY hunter_count DESC;
   ```

## 🎨 What You'll See on Your Website

After seeding, your homepage will display:

### Most Wanted Section
- **Top 3 Cards** with medals (Gold, Silver, Bronze)
  - DeadShot with ~950 total bounty
  - PhantomKill with ~880 total bounty
  - Reaper with ~650 total bounty
- **Positions 4-10** in a list format
- Hunter counts for each target
- "Join the Hunt" buttons

### Top Killers Section
- Top 3 Proud Rats with most kills
- Kill counts displayed prominently
- Links to their profiles

## 🧹 Clean Up (Optional)

If you want to remove all the fake data later:

```sql
-- Delete fake users and all related data (cascades to bounties, hunters, kills)
DELETE FROM users WHERE email LIKE '%@fake.com';
```

## 🚨 Troubleshooting

### "Most Wanted" Still Not Showing?

1. **Clear your browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** - Look for errors (F12 → Console tab)
3. **Verify data was created**:
   ```sql
   SELECT COUNT(*) FROM bounties WHERE status = 'active';
   ```
   Should return 25+

### SQL Script Failed?

- Make sure you're using the **Supabase SQL Editor** (easiest method)
- Check if your database has the required tables:
  - `users`, `bounties`, `hunters`, `kills`
- If tables are missing, run migrations first:
  ```bash
  npm run db:migrate
  ```

## 📚 Related Scripts

- **seed-fake-bounties.sql** - The SQL file with all the fake data
- **run-seed-bounties.ts** - TypeScript wrapper to run the SQL (requires psql)
- **seed-fake-data.ts** - Alternative method using Supabase API (slower, more complex)

## 💡 Tips

- **Use fake data for development** - Don't seed this on production!
- **Customize the data** - Edit `seed-fake-bounties.sql` to change usernames, amounts, etc.
- **Test features** - Use fake users to test the bounty system, claiming, verification, etc.

---

**Need help?** Check the main README or open an issue on GitHub.
