# Email Authentication Setup Guide

## Overview

The app now supports two authentication methods:
1. **Steam Login** - OAuth via Steam OpenID
2. **Email/Password** - Supabase Auth with email

## What Was Implemented

### Database Changes

**Migration: `supabase/migrations/add_user_platform.sql`**
- Added `platform` field (steam/xbox/playstation)
- Added `email` field for email users
- Made `steam_id` optional (email users won't have it)
- Created indexes for performance

### New Components

**`src/components/PlatformSelector.vue`**
- Three-button selector for Steam, Xbox, PlayStation
- Color-coded with hover effects
- Integrates into email registration flow

### New Views

**`src/views/EmailRegisterView.vue`**
- Two-step registration process:
  1. **Step 1 - Credentials**: Email, username, password, confirm password
  2. **Step 2 - Platform**: Select gaming platform (Steam/Xbox/PlayStation)
- Full validation with real-time feedback
- Creates Supabase auth user + users table entry
- Redirects to role selection after completion

**`src/views/EmailLoginView.vue`**
- Simple email/password login form
- Fetches user profile after authentication
- Redirects to role selection if no role set
- Links to registration page

### Updated Files

**`src/views/LoginView.vue`**
- Now shows both Steam and Email login options
- Added "OR" divider between options
- Email login button in cyan color
- Register link at bottom

**`src/router/index.ts`**
- Added `/register` route → EmailRegisterView
- Added `/email-login` route → EmailLoginView
- Updated public pages to include email auth routes

**`src/lib/supabase.ts`**
- Added `Platform` type: 'steam' | 'xbox' | 'playstation'
- Updated `User` interface with:
  - `email?: string`
  - `platform?: Platform`

**`src/lib/steamAuth.ts`**
- Steam users now automatically get `platform: 'steam'`
- Both new and existing Steam users have platform set

## User Flows

### Steam Authentication Flow
1. Click "Sign in through Steam"
2. Redirect to Steam OAuth
3. Return to callback → Create/update user with `platform: 'steam'`
4. If new user or no role → Redirect to `/select-role`
5. Otherwise → Redirect to home

### Email Registration Flow
1. Click "Register here" on login page
2. Enter email, username, password, confirm password
3. Click "Continue"
4. Select platform (Steam/Xbox/PlayStation)
5. Click "Create Account"
6. Account created → Redirect to `/select-role`
7. Select role (BH/PR)
8. Redirect to home

### Email Login Flow
1. Click "Sign in with Email"
2. Enter email and password
3. Click "Login"
4. If no role → Redirect to `/select-role`
5. Otherwise → Redirect to home

## Setup Instructions

### Step 1: Run Database Migration

In your Supabase SQL Editor, run:

```sql
-- Add platform field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(15) CHECK (platform IN ('steam', 'xbox', 'playstation'));

-- Make steam_id optional since email users won't have it
ALTER TABLE users ALTER COLUMN steam_id DROP NOT NULL;

-- Add email field for email authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Create index for platform
CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.platform IS 'Gaming platform: steam, xbox, or playstation';
COMMENT ON COLUMN users.email IS 'Email address for email authentication users';
```

### Step 2: Enable Email Auth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates if desired
5. Set **Confirm email** to your preference (can disable for testing)

### Step 3: Test the Implementation

Run type check:
```bash
npm run type-check
```

Start dev server:
```bash
npm run dev
```

Test the flows:
1. **Email Registration**:
   - Go to login page → Click "Register here"
   - Fill in credentials → Select platform → Create account
   - Verify role selection appears → Select role
   - Check home page displays correctly

2. **Email Login**:
   - Logout → Go to login page → Click "Sign in with Email"
   - Enter credentials → Login
   - Verify redirect to home

3. **Steam Login** (still works):
   - Logout → Click "Sign in through Steam"
   - Complete Steam OAuth
   - Verify Steam users get `platform: 'steam'`

## Database Schema

```typescript
interface User {
  id: string
  username: string
  steam_id?: string          // Optional - only for Steam users
  email?: string             // Optional - only for email users
  avatar_url?: string
  platform?: Platform        // 'steam' | 'xbox' | 'playstation'
  total_points: number
  bounties_completed: number
  times_hunted: number
  created_at: string
  clan_tag?: string
  role?: UserRole            // 'BH' | 'PR'
}
```

## Platform Field Usage

The `platform` field indicates which gaming platform the user plays on:

- **Steam users**: Automatically set to `'steam'` during Steam login
- **Email users**: User selects during registration (steam/xbox/playstation)

This allows:
- Cross-platform bounty tracking
- Platform-specific leaderboards (future feature)
- Platform filtering in bounty searches (future feature)

## Security Notes

- Passwords are handled by Supabase Auth (bcrypt hashing)
- All auth routes are public in router guard
- User data stored in localStorage after login
- Steam OAuth uses OpenID 2.0 protocol
- Email validation on client and server side

## Files Changed

### New Files
- `src/views/EmailRegisterView.vue`
- `src/views/EmailLoginView.vue`
- `src/components/PlatformSelector.vue`
- `supabase/migrations/add_user_platform.sql`
- `EMAIL_AUTH_SETUP.md` (this file)

### Modified Files
- `src/views/LoginView.vue` - Added email login option
- `src/router/index.ts` - Added email auth routes
- `src/lib/supabase.ts` - Added Platform type and fields
- `src/lib/steamAuth.ts` - Set platform='steam' for Steam users

## Troubleshooting

**Issue**: Email registration fails
- **Solution**: Check Supabase email provider is enabled

**Issue**: Can't login with email
- **Solution**: Verify user exists in Supabase Auth dashboard

**Issue**: Platform not saving
- **Solution**: Check migration ran successfully, verify column exists

**Issue**: Redirect loop
- **Solution**: Clear localStorage and check router guard logic

**Issue**: TypeScript errors
- **Solution**: Run `npm run type-check` to see specific errors

## Next Steps (Optional Future Enhancements)

1. **Password Reset**: Add forgot password flow
2. **Email Verification**: Require email confirmation before login
3. **Profile Updates**: Allow users to change email/password
4. **Platform Display**: Show platform badges on profiles
5. **Platform Filtering**: Filter bounties/leaderboard by platform
6. **Social Login**: Add Discord, Xbox, PlayStation OAuth

## Summary

Email authentication is now fully integrated with:
- ✅ Two-step registration (credentials → platform selection)
- ✅ Email login for returning users
- ✅ Platform selection for email users
- ✅ Steam users auto-set to platform='steam'
- ✅ Updated login page with both options
- ✅ Router configured for email auth routes
- ✅ Database schema updated
- ✅ TypeScript types updated

Users can now register and login with email/password while specifying their gaming platform!
