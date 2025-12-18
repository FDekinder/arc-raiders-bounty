# Google SSO Setup Guide

This guide walks you through setting up Google OAuth authentication for the Arc Raiders Bounty System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Database Migration](#database-migration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google Account
- Supabase Project
- Access to your Supabase Dashboard
- Project deployed or running locally

---

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it: "Arc Raiders Bounty" (or your preferred name)
4. Click "Create"

### Step 2: Enable OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Arc Raiders Bounty System
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click "Add or Remove Scopes"
   - Select: `userinfo.email`, `userinfo.profile`, `openid`
   - Click **Update** → **Save and Continue**
7. **Test users** (optional): Add your email for testing
8. Click **Save and Continue**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Arc Raiders Web Client"
5. **Authorized redirect URIs**:
   - Click **Add URI**
   - Add: `https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`
   - Replace `[YOUR-SUPABASE-PROJECT-ID]` with your actual Supabase project ID
   - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
6. Click **Create**
7. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these next

---

## 2. Supabase Configuration

### Step 1: Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**

### Step 2: Add OAuth Credentials

1. In the Google provider settings:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
2. **Redirect URL**: This is auto-generated, copy it
   - Should look like: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
3. Click **Save**

### Step 3: Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:5173`
   - Production: `https://dont-shoot.com`
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://dont-shoot.com/auth/callback`
4. Click **Save**

---

## 3. Database Migration

### Option A: Run Migration Script (if working)

```bash
npm run tsx scripts/apply-platform-migration.ts
```

### Option B: Manual SQL (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL:

```sql
-- Add platform column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'steam';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL;

-- Update existing users to have platform = 'steam'
UPDATE users SET platform = 'steam' WHERE platform IS NULL;
```

4. Click **Run** or press `Ctrl+Enter`

### Verify Migration

Run this query to verify:

```sql
SELECT id, username, email, platform
FROM users
LIMIT 10;
```

You should see a `platform` column with values like 'steam', 'google', or 'email'.

---

## 4. Testing

### Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. You should see three sign-in options:
   - ✅ Sign in through Steam
   - ✅ Continue with Google (NEW)
   - ✅ Sign in with Email

4. Click **Continue with Google**

5. You'll be redirected to Google's OAuth consent screen

6. Sign in with your Google account

7. After approval, you'll be redirected back to `/auth/callback`

8. The app will:
   - ✅ Create your user profile automatically
   - ✅ Extract your name and profile picture from Google
   - ✅ Set `platform` to 'google'
   - ✅ Redirect you to `/bounties`

9. Check if your profile was created:
   - Go to your profile page
   - Verify your name and avatar match your Google account

### Production Testing

1. Deploy your app to production

2. Update Google Cloud Console redirect URIs to include production URL:
   - `https://dont-shoot.com/auth/callback`

3. Update Supabase redirect URLs:
   - Add production URL in Supabase → Authentication → URL Configuration

4. Test the flow on production

---

## 5. Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI in your Google Cloud Console doesn't match the one Supabase is using.

**Solution**:
1. Check the error message for the actual redirect URI being used
2. Add that exact URI to Google Cloud Console → Credentials → Your OAuth Client → Authorized redirect URIs
3. Common URIs to add:
   - `https://[PROJECT-ID].supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback`
   - `https://dont-shoot.com/auth/callback`

### Error: "User profile creation failed"

**Cause**: Database migration didn't run or user table is missing columns.

**Solution**:
1. Run the migration SQL manually (see Option B above)
2. Verify the `users` table has all required columns:
   ```sql
   \d users;
   ```

### Error: "Invalid OAuth client"

**Cause**: Wrong Client ID or Client Secret in Supabase.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Verify Client ID and Secret match what's in Supabase
4. Re-copy and paste them into Supabase

### Google Sign-In Button Not Showing

**Cause**: Frontend code not updated or import error.

**Solution**:
1. Verify `src/views/LoginView.vue` has the Google button
2. Check browser console for errors
3. Make sure `signInWithGoogle` is imported from `@/lib/auth`

### Sign-In Works But User Not Redirected

**Cause**: `AuthCallbackView.vue` has an error or route not added.

**Solution**:
1. Check browser console for errors on `/auth/callback`
2. Verify router has the route:
   ```typescript
   {
     path: '/auth/callback',
     name: 'auth-callback',
     component: () => import('../views/AuthCallbackView.vue'),
   }
   ```
3. Check Supabase logs for auth errors

### User Signs In But Profile Not Created

**Cause**: `ensureUserProfile` function error.

**Solution**:
1. Check browser console for errors
2. Verify Supabase has RLS policies allowing user creation:
   ```sql
   -- Allow users to create their own profile
   CREATE POLICY "Users can create own profile"
   ON users FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```

---

## 6. Implementation Checklist

- [x] Created `authHelpers.ts` with `ensureUserProfile()`
- [x] Added `signInWithGoogle()` to `auth.ts`
- [x] Created `AuthCallbackView.vue` component
- [x] Added Google button to `LoginView.vue`
- [x] Added `/auth/callback` route to router
- [x] Created database migration for `platform` column
- [ ] Set up Google Cloud Console OAuth
- [ ] Configure Supabase Google provider
- [ ] Run database migration
- [ ] Test local sign-in flow
- [ ] Test production sign-in flow

---

## 7. Security Notes

### What Data We Access

From Google, we only access:
- ✅ Email address
- ✅ Full name
- ✅ Profile picture URL
- ❌ **We DO NOT access**: Contacts, Drive files, Calendar, etc.

### Data Storage

- Passwords: **NOT stored** (handled by Supabase/Google)
- Email: Stored in `users` table
- Name: Stored as `username` in `users` table
- Avatar: Stored as `avatar_url` (just the URL, not the image)
- Platform: 'google' to track auth method

### RLS Policies

Ensure you have Row Level Security enabled:

```sql
-- Users can read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

---

## 8. Next Steps

Once Google SSO is working:

1. **Link Multiple Auth Methods**: Allow users to link Steam + Google to the same account
2. **Profile Settings**: Let users choose display name separate from Google name
3. **Account Unlinking**: Allow users to disconnect auth methods
4. **Email Verification**: Add email verification for Google accounts (optional)
5. **Avatar Upload**: Let users upload custom avatars instead of using Google's

---

## Support

If you run into issues:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → Auth
3. Check Google Cloud Console → APIs & Services → OAuth consent screen

Need help? The issue is most likely:
- ❌ Redirect URI mismatch (90% of issues)
- ❌ Wrong Client ID/Secret
- ❌ Database migration not run
- ❌ RLS policies blocking user creation
