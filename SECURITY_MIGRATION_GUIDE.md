# Security Migration Guide

## Critical Security Issues Fixed

This guide helps you migrate from insecure localStorage authentication to proper Supabase Auth with Row Level Security.

---

## Step 1: Run the RLS Migration (CRITICAL - Do First!)

```bash
# In Supabase Dashboard → SQL Editor, run:
supabase/migrations/security_fix_rls_comprehensive.sql
```

This will:
- ✅ Enable RLS on all tables
- ✅ Remove "anyone can do anything" policies
- ✅ Require Supabase Auth for all operations
- ✅ Prevent privilege escalation
- ✅ Protect admin functions

**⚠️ WARNING**: After running this migration, your current localStorage-based auth will STOP WORKING. You must migrate to Supabase Auth immediately.

---

## Step 2: Rotate Exposed API Keys (CRITICAL!)

### Your Steam API Key is Publicly Visible

**Exposed Key**: `F0377775693BFC2101486CCAF56B8363`

**Fix**:
1. Go to https://steamcommunity.com/dev/apikey
2. Generate a NEW API key
3. Update `.env`:
   ```env
   # OLD (EXPOSED):
   # VITE_STEAM_API_KEY=F0377775693BFC2101486CCAF56B8363

   # NEW (Keep secret, never commit):
   STEAM_API_KEY=YOUR_NEW_KEY_HERE

   # DO NOT prefix with VITE_ - this exposes it to frontend!
   ```
4. Update API files to use server-side key only
5. Add `.env` to `.gitignore` (if not already)

### Check Git History for Leaked Keys

```bash
# Search git history for exposed keys
git log -p | grep "STEAM_API_KEY"
git log -p | grep "F0377775693BFC"

# If found, you MUST:
# 1. Rotate the key immediately
# 2. Consider the key compromised
# 3. Monitor Steam API usage for abuse
```

---

## Step 3: Migrate Authentication (REQUIRED)

### Current (INSECURE):
```typescript
// ❌ BAD: Anyone can modify this
localStorage.setItem('arc_user', JSON.stringify({
  id: 'fake-id',
  role: 'admin' // INSTANT ADMIN ACCESS!
}))
```

### New (SECURE):
```typescript
// ✅ GOOD: Validated by Supabase
const { data: { user } } = await supabase.auth.getUser()
// user.id comes from JWT, can't be faked
```

### Migration Steps:

1. **Update `src/lib/auth.ts`** (see new version below)
2. **Update all components** to use Supabase Auth
3. **Remove localStorage dependencies**
4. **Test thoroughly**

---

## Step 4: Fix CORS (CRITICAL!)

### Current (INSECURE):
```typescript
// ❌ BAD: Any website can call your API
res.setHeader('Access-Control-Allow-Origin', '*')
```

### Fix:
```typescript
// ✅ GOOD: Only your domain
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-production-domain.com'
]

const origin = req.headers.origin
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

Apply this to ALL files in `/api/*`:
- `api/steam-verify.ts`
- `api/xbox-verify.ts`
- `api/psn-verify.ts`
- `api/auth/steam/callback.ts`

---

## Step 5: Add Server-Side Authorization

### Current (INSECURE):
```typescript
// ❌ BAD: Admin check in frontend only
export async function promoteUserToAdmin(userId: string) {
  await supabase.from('users').update({ role: 'admin' }).eq('id', userId)
}
```

### Fix:
```typescript
// ✅ GOOD: Database enforces admin-only via RLS
// The RLS policy will automatically check if auth.uid() is an admin
// No code change needed - RLS handles it!

// But you should still add frontend validation for UX:
export async function promoteUserToAdmin(userId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if current user is admin
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  // This will also be checked by RLS, but we check early for better UX
  const { error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) throw error
}
```

---

## Step 6: Secure File Uploads

### Add Server-Side Validation

Create Supabase Edge Function:

```typescript
// supabase/functions/upload-screenshot/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

serve(async (req) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    // Validate MIME type (server-side!)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400 }
      )
    }

    // Verify actual file content matches MIME type
    const buffer = await file.arrayBuffer()
    const arr = new Uint8Array(buffer)

    // Check magic bytes for image verification
    const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF
    const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47

    if (!isJPEG && !isPNG) {
      return new Response(
        JSON.stringify({ error: 'File content does not match type' }),
        { status: 400 }
      )
    }

    // Upload with sanitized filename
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const userId = req.headers.get('user-id')
    const fileName = `${userId}-${Date.now()}.${file.type.split('/')[1]}`

    const { data, error } = await supabase.storage
      .from('bounty-screenshots')
      .upload(fileName, file)

    if (error) throw error

    return new Response(JSON.stringify({ path: data.path }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

---

## Step 7: Environment Variable Security

### Create Proper `.env` Structure:

```env
# ============================================================================
# PUBLIC VARIABLES (Exposed to frontend - OK to commit to git as examples)
# ============================================================================
VITE_SUPABASE_URL=https://jixqdgldndtbbcqzenxl.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================================================
# PRIVATE VARIABLES (Server-side only - NEVER commit to git!)
# ============================================================================
# These should NOT have VITE_ prefix
STEAM_API_KEY=your-new-steam-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PSN_API_KEY=your-psn-key-here
XBOX_API_KEY=your-xbox-key-here
```

### Update `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Sensitive files
**/credentials.json
**/service-account.json
```

### Create `.env.example` for Team:

```env
# Copy to .env and fill in your keys
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=get-from-supabase-dashboard

STEAM_API_KEY=get-from-https://steamcommunity.com/dev/apikey
SUPABASE_SERVICE_ROLE_KEY=get-from-supabase-dashboard
```

---

## Step 8: Testing Security

### Test RLS Policies:

```sql
-- Try to promote yourself to admin (should FAIL)
UPDATE users SET role = 'admin' WHERE id = auth.uid();
-- Expected: RLS policy violation

-- Try to approve your own claim (should FAIL)
UPDATE bounty_claims
SET status = 'approved'
WHERE claimed_by = auth.uid();
-- Expected: RLS policy violation

-- Try to modify another user's bounty (should FAIL)
UPDATE bounties
SET amount = 99999
WHERE created_by != auth.uid();
-- Expected: RLS policy violation
```

### Test Authentication:

```typescript
// Test 1: Try to access admin route without auth
// Expected: Redirect to login

// Test 2: Try to modify localStorage and access admin route
localStorage.setItem('arc_user', JSON.stringify({ role: 'admin' }))
// Expected: API calls fail with "unauthorized" error

// Test 3: Login as admin and access admin route
// Expected: Success
```

---

## Step 9: Deployment Checklist

Before deploying to production:

- [ ] RLS migration applied to production database
- [ ] All API keys rotated and secured
- [ ] `.env` files not committed to git
- [ ] CORS restricted to production domain
- [ ] Supabase Auth fully implemented
- [ ] localStorage authentication removed
- [ ] File upload validation working
- [ ] Admin functions secured
- [ ] All tests passing
- [ ] Security scan completed

---

## Step 10: Monitor for Security Issues

### Set Up Alerts:

1. **Supabase Dashboard → Database → Policies**
   - Monitor failed auth attempts
   - Watch for policy violations

2. **Supabase Dashboard → Authentication → Users**
   - Monitor user registrations
   - Watch for suspicious activity

3. **Application Logs**
   - Log all admin actions
   - Monitor API rate limits
   - Track failed file uploads

---

## Emergency Response Plan

If security breach detected:

1. **Immediate**:
   - Rotate ALL API keys
   - Disable compromised user accounts
   - Review admin_logs table for unauthorized actions

2. **Within 1 hour**:
   - Identify scope of breach
   - Notify affected users
   - Restore from backup if needed

3. **Within 24 hours**:
   - Patch vulnerability
   - Re-deploy with fix
   - Post-mortem analysis

---

## Questions?

If you encounter issues during migration:

1. Check Supabase logs for RLS policy violations
2. Verify JWT token in browser DevTools → Application → Storage
3. Test policies in Supabase SQL Editor with `auth.uid()`
4. Review this guide for missed steps

**Remember**: Security is not optional. Complete ALL steps before launching to production.
