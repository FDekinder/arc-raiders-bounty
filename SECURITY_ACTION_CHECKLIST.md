# 🔒 Security Action Checklist

## ✅ What's Already Done

- ✅ `.env` files are in `.gitignore`
- ✅ `.env` was never committed to git (verified)
- ✅ `.env` has been reorganized with security comments
- ✅ `.env.example` created for team reference
- ✅ Comprehensive RLS migration created
- ✅ Secure authentication system created
- ✅ CORS and rate limiting configuration created
- ✅ Secure API endpoint example created

---

## 🚨 CRITICAL ACTIONS REQUIRED (Do These NOW!)

### 1. Rotate Your Steam API Key (5 minutes)

**Why**: Your current key (`F0377775693BFC2101486CCAF56B8363`) was exposed with `VITE_` prefix, meaning it's visible in your frontend JavaScript bundle to anyone.

**How**:
1. Go to: https://steamcommunity.com/dev/apikey
2. Generate a NEW API key
3. Update your `.env` file:
   ```env
   STEAM_API_KEY=YOUR_NEW_KEY_HERE
   ```
4. **IMPORTANT**: Revoke/delete the old key in Steam dashboard
5. Restart your dev server: `npm run dev`

**Verification**:
```bash
# Check that VITE_STEAM_API_KEY no longer exists anywhere
grep -r "VITE_STEAM_API_KEY" .
# Should only show comments in .env, not actual usage
```

---

### 2. Run RLS Migration in Supabase (10 minutes)

**Why**: Your database currently allows anyone to do anything (create bounties, approve claims, promote to admin, etc.)

**How**:
1. Open Supabase Dashboard
2. Go to: SQL Editor → New Query
3. Copy entire contents of: `supabase/migrations/security_fix_rls_comprehensive.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Verify no errors appear

**Verification**:
```sql
-- In Supabase SQL Editor, try to hack yourself as admin:
UPDATE users SET role = 'admin' WHERE id = auth.uid();
-- Expected: "new row violates row-level security policy"
```

---

### 3. Add Supabase Service Role Key (2 minutes)

**Why**: Needed for server-side operations that bypass RLS

**How**:
1. Go to: Supabase Dashboard → Settings → API
2. Find: `service_role key` (under "Project API keys")
3. Click "Reveal" and copy the key
4. Update `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ```
5. **NEVER** prefix this with `VITE_` - it must stay server-side only!

---

## 📋 IMPORTANT ACTIONS (Do This Week)

### 4. Update API Endpoints with CORS Config (30 minutes)

Replace all `/api/*.ts` files to use the new secure configuration.

**Files to update**:
- [ ] `api/steam-verify.ts` → Use `api/steam-verify.secure.ts` as template
- [ ] `api/xbox-verify.ts` → Apply same pattern
- [ ] `api/psn-verify.ts` → Apply same pattern
- [ ] `api/auth/steam/callback.ts` → Apply same pattern

**For each file**:
1. Import from `./cors-config`:
   ```typescript
   import { setCorsHeaders, handlePreflight, applyRateLimit } from './cors-config'
   ```

2. Add at start of handler:
   ```typescript
   if (handlePreflight(req, res)) return
   if (!setCorsHeaders(req, res)) return sendSecureError(res, 403, 'Origin not allowed')
   if (!applyRateLimit(req, res)) return
   ```

3. Update `ALLOWED_ORIGINS` in `cors-config.ts`:
   ```typescript
   const ALLOWED_ORIGINS = [
     'http://localhost:5173',
     'https://YOUR-ACTUAL-DOMAIN.com', // Add your real domain!
   ]
   ```

---

### 5. Migrate to Supabase Auth (2-4 hours)

**Why**: Current localStorage auth can be faked by anyone

**Steps**:
1. Backup current `src/lib/auth.ts`:
   ```bash
   mv src/lib/auth.ts src/lib/auth.OLD.ts
   mv src/lib/auth.secure.ts src/lib/auth.ts
   ```

2. Update components that use `getCurrentUser()`:
   - Change from sync to async: `const user = await getCurrentUser()`
   - Update all components in `src/views/` and `src/components/`

3. Test each feature:
   - [ ] Login
   - [ ] Signup
   - [ ] Logout
   - [ ] Admin access
   - [ ] Profile updates
   - [ ] Bounty creation
   - [ ] Claim submission

**Breaking Change Warning**: All existing users will need to re-login after this change!

---

### 6. Update Frontend Code Using Steam Key (15 minutes)

Find and remove any frontend usage of Steam API key:

```bash
# Search for VITE_STEAM_API_KEY usage
grep -r "VITE_STEAM_API_KEY" src/
```

**Expected**: Should find nothing (key should only be in API endpoints, not frontend)

If found, those calls need to go through your API endpoints instead of calling Steam directly from frontend.

---

### 7. Deploy Environment Variables to Vercel/Hosting (5 minutes)

If deployed on Vercel:
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these SERVER-SIDE variables:
   - `STEAM_API_KEY` = your NEW Steam key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
3. **Do NOT add** these to Vercel (already in code via VITE_):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy your app

---

## 🧪 TESTING CHECKLIST

After completing the above actions, test these security scenarios:

### Test 1: Admin Access Bypass Attempt
```javascript
// Open browser console
localStorage.setItem('arc_user', JSON.stringify({ role: 'admin' }))
// Try to access /admin route
// Expected: API calls fail with 401/403 errors
```

### Test 2: RLS Policy Enforcement
```sql
-- In Supabase SQL Editor
UPDATE users SET role = 'admin' WHERE username = 'your-username';
-- Expected: RLS policy violation error
```

### Test 3: CORS Protection
```javascript
// From a different website (jsfiddle.net)
fetch('https://your-api.vercel.app/api/steam-verify?searchQuery=test')
// Expected: CORS error
```

### Test 4: Rate Limiting
```bash
# Send 100 requests rapidly
for i in {1..100}; do
  curl https://your-api.vercel.app/api/steam-verify?searchQuery=test
done
# Expected: After ~60 requests, get "429 Too Many Requests"
```

### Test 5: Steam Key Not in Frontend
```bash
# Build production bundle
npm run build

# Search build for old key
grep -r "F0377775693BFC2101486CCAF56B8363" dist/
# Expected: Should find NOTHING
```

---

## 📊 Progress Tracker

- [ ] **CRITICAL #1**: Steam API key rotated
- [ ] **CRITICAL #2**: RLS migration applied
- [ ] **CRITICAL #3**: Service role key added
- [ ] **IMPORTANT #4**: API endpoints updated with CORS
- [ ] **IMPORTANT #5**: Supabase Auth migration complete
- [ ] **IMPORTANT #6**: Frontend Steam key usage removed
- [ ] **IMPORTANT #7**: Production environment variables set
- [ ] **TEST #1**: Admin bypass test passed
- [ ] **TEST #2**: RLS enforcement test passed
- [ ] **TEST #3**: CORS protection test passed
- [ ] **TEST #4**: Rate limiting test passed
- [ ] **TEST #5**: Key not in frontend test passed

---

## 🆘 If Something Breaks

### "All API calls return 403 Forbidden"
- Check `ALLOWED_ORIGINS` in `api/cors-config.ts`
- Add your domain to the allowed list
- Make sure you're accessing from the correct origin

### "Can't login after Supabase Auth migration"
- Check Supabase Auth is enabled: Dashboard → Authentication → Settings
- Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Clear browser localStorage and cookies
- Check browser console for specific error messages

### "RLS blocks all database operations"
- Check if you ran the migration correctly
- Verify policies exist: Dashboard → Database → Policies
- Check Supabase logs for specific policy that's failing
- Temporarily check RLS status: `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

### "Steam verification not working"
- Verify new Steam API key is correct in `.env`
- Check key is NOT prefixed with `VITE_`
- Restart dev server after changing `.env`
- Check Steam API status: https://steamstat.us/

---

## ✅ When You're Done

Your app will be secure when:
- ✅ No one can fake admin access
- ✅ Users can only modify their own data
- ✅ API keys are not visible in frontend code
- ✅ APIs reject requests from unknown origins
- ✅ Rate limiting prevents spam/abuse
- ✅ All sensitive operations require authentication
- ✅ RLS policies enforce access control at database level

**Next**: Read `SECURITY_MIGRATION_GUIDE.md` for detailed implementation steps.

---

## 📞 Questions or Issues?

Refer to:
- `SECURITY_FIXES_SUMMARY.md` - Quick reference
- `SECURITY_MIGRATION_GUIDE.md` - Detailed guide
- Supabase docs: https://supabase.com/docs/guides/auth
- Security checklist from files in this repo

Good luck! 🚀 Your app will be much more secure after these changes.
