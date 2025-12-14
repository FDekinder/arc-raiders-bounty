# Clan Tag Feature - Setup Instructions

## ✅ What's Been Implemented

1. **Database Migration** - [add_clan_tag.sql](supabase/migrations/add_clan_tag.sql)
2. **TypeScript Types** - Updated User interface in [supabase.ts](src/lib/supabase.ts)
3. **Validation System** - Comprehensive filter in [clanTagValidator.ts](src/lib/clanTagValidator.ts)
4. **UI Component** - Editable clan tag in [ClanTagEditor.vue](src/components/ClanTagEditor.vue)
5. **Display Integration** - Shows in navigation, profiles, and leaderboard

## 🔧 Setup Status

### ✅ Step 1: Database Migration - COMPLETED

The database migration has already been applied! The `clan_tag` column exists in your users table.

If you need to run it manually in the future:

```sql
-- Add clan tag column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(5);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;

-- Optional: Add description comment
COMMENT ON COLUMN users.clan_tag IS 'Optional clan tag (max 5 characters) displayed next to username';
```

### Step 2: Verify Migration

Run this test to verify the migration worked:

```bash
npx tsx scripts/test-clan-tag.ts
```

Expected output:
```
✅ clan_tag column exists
✅ Found X users
```

### Step 3: Test Validation

Run the validation test suite to ensure the filter is working:

```bash
npx tsx scripts/test-clan-validation.ts
```

Expected output:
```
✅ Passed: 51/51
📈 Success Rate: 100%
🎉 All tests passed!
```

### Step 4: Deploy

Once the database migration is complete, deploy your app:

```bash
npm run build
```

## 🎮 How Users Will Use It

1. **Adding a Clan Tag:**
   - User visits their own profile
   - Clicks the edit icon next to their username
   - Types a clan tag (max 5 characters)
   - Clicks save (✓)
   - Validation runs automatically

2. **Clan Tag Display:**
   - Navigation bar: `[CLAN] Username`
   - Profile page: `[CLAN] Username`
   - Leaderboard: `[CLAN] Username`

3. **Removing a Clan Tag:**
   - User clicks edit icon
   - Clicks the remove button (X)
   - Clan tag is deleted

## 🛡️ Validation Rules

The system blocks:

✅ **Max 5 characters**
✅ **Letters and numbers only** (A-Z, 0-9)
✅ **Racial slurs** (direct and leetspeak)
✅ **Homophobic/transphobic terms**
✅ **Ableist slurs**
✅ **Profanity**
✅ **Sexual content**
✅ **Hate group symbols** (88, 1488, KKK, etc.)
✅ **Violence references**
✅ **Drug references**
✅ **Repeated characters** (AAAAA)

See [CLAN_TAG_VALIDATION.md](CLAN_TAG_VALIDATION.md) for complete details.

## 📁 Files Created/Modified

### New Files
- `supabase/migrations/add_clan_tag.sql` - Database migration
- `src/lib/clanTagValidator.ts` - Validation logic
- `src/components/ClanTagEditor.vue` - UI component
- `scripts/test-clan-tag.ts` - Database test
- `scripts/test-clan-validation.ts` - Validation test
- `scripts/apply-clan-migration.ts` - Helper script
- `CLAN_TAG_VALIDATION.md` - Documentation
- `CLAN_TAG_SETUP.md` - This file

### Modified Files
- `src/lib/supabase.ts` - Added `clan_tag` to User interface
- `src/views/UserProfileView.vue` - Added ClanTagEditor component
- `src/views/LeaderboardView.vue` - Display clan tags
- `src/App.vue` - Display clan tag in navigation

## 🚀 Future Enhancements

As you mentioned, you can later add:

1. **Clan Pages** - Dedicated pages for clans
2. **Clan Management** - Create clans, invite members
3. **Clan Stats** - Track clan achievements and rankings
4. **Clan Battles** - Competitive features between clans

The foundation is now in place with individual clan tags!

## 🐛 Troubleshooting

**Issue: "clan_tag column does not exist"**
- Solution: Run the database migration SQL (Step 1)

**Issue: Validation not working**
- Solution: Check browser console for errors
- Verify `clanTagValidator.ts` is imported correctly

**Issue: Clan tag not showing in UI**
- Solution: Make sure user has a clan tag set
- Check that the user object includes the `clan_tag` field in queries

**Issue: Type errors**
- Solution: Run `npm run type-check` to identify issues
- Ensure all User type references include the optional `clan_tag` field

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the database migration completed
3. Run the test scripts to diagnose
4. Review the validation logic in `clanTagValidator.ts`

## ✨ Summary

The clan tag feature is fully implemented and tested! Just run the database migration and you're ready to go. Users will be able to add 5-character clan tags that appear throughout your Arc Raiders Bounty app, with comprehensive filtering to keep the community safe and respectful.
