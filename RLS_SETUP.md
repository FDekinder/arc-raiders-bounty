# Setting Up RLS Policies in Supabase

## Steps to Apply RLS Policies

### Method 1: Using Supabase Dashboard (Recommended for now)

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project: **arc-raiders-bounty**
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste the contents of `supabase/migrations/rls_policies.sql`
6. Click **"Run"** to execute

### Method 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase link --project-ref jixqdgldndtbbcqzenxl
supabase db push
```

## What These Policies Do

### Users Table

- ✅ Anonymous users can insert their data (for Steam auth signup)
- ✅ Authenticated users can view all users (for leaderboard)
- ✅ Users can only update their own profile

### Bounties Table

- ✅ Everyone can view bounties
- ✅ Authenticated users can create bounties
- ✅ Bounty creators can update their own bounties

### Bounty Claims Table

- ✅ Everyone can view claims
- ✅ Authenticated users can claim bounties
- ✅ Hunters can update their own claims
- ✅ Bounty creators can verify claims on their bounties

## Important Notes

**About Anonymous Users and Steam Auth:**

- Your current implementation uses the anonymous Supabase key for the frontend
- The first RLS policy allows anonymous users to insert their own data (needed for Steam signup)
- After you implement user authentication in your frontend, you can remove this policy
- For now, this is secure enough because users can only create/modify records that belong to them

**About Admin Verification:**

- Currently, bounty creators can verify claims on their own bounties
- For a proper admin system, you'd need:
  1. An `admin_users` table
  2. A check: `WHERE verified_by = auth.uid()::text AND user_is_admin(auth.uid())`
  3. A helper function `user_is_admin()`

## Troubleshooting

If you get errors:

1. **"Policy already exists"**: The policies already exist. Go to **Authentication → Policies** and delete old ones first, or skip and rerun with `DROP POLICY IF EXISTS` statements.

2. **"RLS conflicts"**: Make sure no other policies are enabled on these tables first.

3. **Still getting 401/406 errors**:
   - Check that the `id` column in users table is TEXT (not UUID)
   - Verify Steam ID is being stored correctly as a string
   - Run: `SELECT * FROM users LIMIT 1;` to verify data structure

## Testing

After applying policies, try logging in again:

1. Clear browser cache
2. Try Steam login on production
3. Check that user is created in Supabase
4. User should be able to view bounties and claim them

## Next Steps

Once this is working in production:

1. Implement Supabase Auth (replace anonymous key usage)
2. Add proper admin roles
3. Add policy for admins to verify all claims
