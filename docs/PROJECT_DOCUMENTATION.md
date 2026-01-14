# Arc Raiders Bounty System - Complete Documentation

> A multi-platform bounty system for Arc Raiders with Steam, Xbox, and PlayStation player verification.

**Last Updated**: January 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Setup & Installation](#setup--installation)
3. [Authentication Systems](#authentication-systems)
4. [Security & RLS](#security--rls)
5. [Features Documentation](#features-documentation)
6. [Theme & Design System](#theme--design-system)
7. [Database Schema](#database-schema)
8. [Deployment Guide](#deployment-guide)
9. [Testing Guide](#testing-guide)
10. [Database Management Scripts](#database-management-scripts)

---

## Project Overview

Arc Raiders Bounty System is a web application that allows players to create and claim bounties on other players across Steam, Xbox, and PlayStation platforms.

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)

### Recommended Browser Setup

**Chromium-based browsers** (Chrome, Edge, Brave):
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Turn on Custom Object Formatter](http://bit.ly/object-formatters)

**Firefox**:
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- [Turn on Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Steam OpenID
- **Deployment**: Vercel
- **Icons**: Lucide Vue Next

---

## Setup & Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd arc-raiders-bounty
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# ============================================================================
# PUBLIC VARIABLES (Exposed to frontend - safe for version control examples)
# ============================================================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ============================================================================
# PRIVATE VARIABLES (Server-side only - NEVER commit to git!)
# ============================================================================
# DO NOT use VITE_ prefix for these - keeps them server-side only

STEAM_API_KEY=your-steam-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Google Ads
VITE_ADSENSE_CLIENT_ID=ca-pub-your-id
VITE_ADSENSE_ENABLED=true
VITE_AD_SLOT_BOUNTY_LIST=slot-id-1
VITE_AD_SLOT_LEADERBOARD=slot-id-2
```

### 3. Get API Keys

#### Steam API Key (Required)
1. Visit https://steamcommunity.com/dev/apikey
2. Login with your Steam account
3. Accept the agreement and get your API key
4. Free to use with ~100,000 requests/day rate limit

#### Supabase Keys (Required)
1. Create project at https://app.supabase.com
2. Go to Settings → API
3. Copy `Project URL` and `anon public` key for public variables
4. Copy `service_role` key for private variable (⚠️ Keep secret!)

### 4. Development Server

```bash
npm run dev
```

Visit http://localhost:5173

### 5. Build for Production

```bash
npm run build
```

### 6. Type Checking

```bash
npm run type-check
```

### 7. Linting

```bash
npm run lint
```

---

## Authentication Systems

The application supports three authentication methods:

### 1. Steam Authentication

**Implementation**: OpenID 2.0 with serverless backend

**Files**:
- `api/auth/steam/callback.ts` - Serverless function for Steam OAuth
- `api/utils/steam.ts` - Steam validation and player info helpers
- `src/lib/steamAuth.ts` - Frontend Steam auth logic

**Flow**:
```
1. User clicks "Login with Steam"
2. Redirect to Steam login page
3. Steam authorizes and redirects to: /auth/steam/callback?openid.xxx=...
4. Frontend calls serverless function: /api/auth/steam/callback
5. Backend validates OpenID with Steam (server-to-server, no CORS)
6. Backend fetches player profile from Steam API
7. Backend returns player data to frontend
8. Frontend creates/updates user in Supabase
9. User logged in with platform='steam'
```

**Setup**:
1. Get Steam API key from https://steamcommunity.com/dev/apikey
2. Add to `.env` as `STEAM_API_KEY` (NOT with VITE_ prefix!)
3. Update return URL in Steam settings to match your callback URL
4. Deploy serverless functions to Vercel

**Benefits**:
- No CORS errors (server-to-server API calls)
- Steam API key never exposed to client
- Scalable with Vercel serverless functions
- Type-safe with full TypeScript support

### 2. Email/Password Authentication

**Implementation**: Supabase Auth with email verification

**Files**:
- `src/views/EmailRegisterView.vue` - Two-step registration
- `src/views/EmailLoginView.vue` - Login form
- `src/components/PlatformSelector.vue` - Platform selection UI

**Registration Flow**:
```
1. User enters email, username, password, confirm password
2. Click "Continue" (validation checks)
3. Select gaming platform (Steam/Xbox/PlayStation)
4. Click "Create Account"
5. Supabase creates auth user + users table entry
6. Redirect to role selection
```

**Login Flow**:
```
1. User enters email and password
2. Click "Login"
3. Supabase authenticates
4. Fetch user profile from database
5. If no role → redirect to /select-role
6. Otherwise → redirect to home
```

**Setup**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Set "Confirm email" preference
5. Run database migration for platform field

**Database Schema**:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(20)
  CHECK (platform IN ('steam', 'xbox', 'playstation'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ALTER COLUMN steam_id DROP NOT NULL;
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_platform ON users(platform) WHERE platform IS NOT NULL;
```

### 3. Google OAuth (SSO)

**Implementation**: Supabase Auth with Google provider

**Files**:
- `src/views/AuthCallbackView.vue` - OAuth callback handler
- `src/lib/authHelpers.ts` - User profile creation helper
- `src/lib/auth.ts` - `signInWithGoogle()` function

**Flow**:
```
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. User authorizes
4. Google redirects to /auth/callback
5. Frontend gets session from Supabase
6. Create/update user profile with Google data
7. Redirect to bounties page
```

**Google Cloud Console Setup**:
1. Create project at https://console.cloud.google.com/
2. Enable OAuth consent screen (External, 3 scopes: email, profile, openid)
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `https://[PROJECT-ID].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

**Supabase Configuration**:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add Client ID and Client Secret from Google
4. Add Site URL and Redirect URLs
5. Save configuration

**Data Accessed from Google**:
- Email address
- Full name
- Profile picture URL
- NO access to: Contacts, Drive, Calendar, etc.

### Platform Verification

- **Steam**: Full API verification with real player data
- **Xbox**: Format validation only (validates gamertag format)
- **PlayStation**: Format validation only (validates PSN ID format)

---

## Security & RLS

### Critical Security Features

The application implements multiple layers of security:

#### 1. Row Level Security (RLS) Policies

**Migration**: `supabase/migrations/security_fix_rls_comprehensive.sql`

**Key Policies**:

**Users Table**:
- Anonymous users can insert their own data (for signup)
- Authenticated users can view all users (for leaderboard)
- Users can only update their own profile
- Only admins can promote users to admin role

**Bounties Table**:
- Everyone can view bounties
- Authenticated users can create bounties
- Only bounty creators can update their own bounties

**Bounty Claims Table**:
- Everyone can view claims
- Authenticated users can submit claims
- Hunters can update their own claims
- Bounty creators and admins can verify claims

**Admin Logs Table**:
- Only admins can insert logs
- Admins can view all logs
- No updates or deletes allowed

#### 2. Secure Authentication

**Current Issues (MUST FIX)**:
```typescript
// ❌ INSECURE: localStorage can be manipulated
localStorage.setItem('arc_user', JSON.stringify({
  id: 'fake-id',
  role: 'admin' // Instant admin access!
}))
```

**Secure Approach**:
```typescript
// ✅ SECURE: JWT validated by Supabase
const { data: { user } } = await supabase.auth.getUser()
// user.id comes from JWT, cannot be faked
```

#### 3. API Security

**CORS Configuration** (`api/cors-config.ts`):
```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://your-production-domain.com'
]
```

**Features**:
- Restricts API access to specific domains
- Rate limiting (60 requests/minute per IP)
- Secure error handling (no sensitive info leaked)
- Environment variable validation

#### 4. Admin Access Control

**Database Check**:
```sql
CREATE POLICY "Only admins can update user roles"
ON users FOR UPDATE
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  AND auth.uid() != id  -- Cannot change own role
);
```

**Frontend Check** (UX only, NOT security):
```typescript
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}
```

**Making a User Admin**:
```sql
-- Via Supabase SQL Editor
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**Admin Routes**:
- `/verify` - Bounty verification
- `/admin/bug-reports` - Bug report management
- `/admin/users` - User management

#### 5. Admin Audit Logging

All admin actions are logged to `admin_logs` table:

```typescript
// View admin logs
const logs = await getAdminLogs(100)
logs.forEach((log) => {
  console.log(`[${log.created_at}] ${log.action}`)
  console.log(`  On: ${log.target_table}.${log.target_id}`)
  console.log(`  Changes:`, log.changes)
})
```

### Security Action Checklist

**CRITICAL (Do Immediately)**:
- [ ] Rotate Steam API key (current key was exposed with VITE_ prefix)
- [ ] Run RLS migration in Supabase
- [ ] Add Supabase service role key to `.env`

**IMPORTANT (Do This Week)**:
- [ ] Update API endpoints with CORS configuration
- [ ] Migrate to Supabase Auth (replace localStorage)
- [ ] Remove frontend usage of Steam API key
- [ ] Deploy environment variables to production

**Testing**:
- [ ] Try to promote yourself to admin (should fail with RLS)
- [ ] Try to access admin routes without auth (should redirect)
- [ ] Try CORS from different origin (should fail)
- [ ] Test rate limiting (should block after 60 requests)

### Security Best Practices

1. **Limit Admin Accounts**: Only trusted individuals
2. **Strong Passwords**: Enforce 12+ characters minimum
3. **2FA Recommended**: Enable for admin accounts
4. **Regular Reviews**: Periodically review admin user list
5. **Never Expose Service Role Key**: Keep server-side only
6. **Rotate Keys**: If exposed, rotate immediately
7. **Monitor Logs**: Track admin actions and violations

---

## Features Documentation

### 1. Admin Panel

**Access**: `/admin/users` (admin only)

**Purpose**: Manage all registered users with detailed statistics and filtering

**Features**:
- Real-time statistics (total users, today, this week, admins, roles, premium)
- Advanced filtering (search, role, game role, sort options)
- User information display (avatar, username, email, platform, stats, tier, join date)
- Visual indicators (badges for admin, premium, platforms, roles)

**Statistics Displayed**:
- Total Users
- Users registered today
- Users registered this week
- Number of admins
- Bounty Hunters count
- Proud Rats count
- Premium subscribers count

**Sort Options**:
- Newest First (default)
- Oldest First
- Most Active (by total activity)
- Highest Points

**Filters**:
- Search by username, email, or Steam ID
- Filter by permission role (admin/user)
- Filter by game role (BH/PR)

**User Information Shown**:
- Avatar & Username with clan tag
- Email address
- Platform (Steam, Xbox, PlayStation)
- Game Role badge (BH or PR)
- Stats: Total points, bounties completed, kill count
- Subscription tier (Free or Premium with crown icon)
- Join date (relative or absolute)

### 2. Bug Reporting System

**Access**: `/report-bug` (public, no login required)

**Purpose**: Allow users to report bugs, request features, and provide feedback

**Report Types**:
- Bug Report (something is broken)
- Feature Request (suggest new feature)
- Improvement (suggest enhancement)
- Other (general feedback)

**Form Fields**:
- Title (required, max 200 characters)
- Description (required, min 20, max 2000 characters)
- Steps to Reproduce (optional, for bugs)
- Expected vs Actual Behavior (optional, for bugs)
- Browser info (automatically captured)

**Features**:
- Anonymous reporting allowed
- Success confirmation with redirect
- Browser/system information auto-captured
- Status tracking (open, in progress, resolved, closed, won't fix)

**Database Schema**:
```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY,
  user_id UUID,
  username TEXT NOT NULL,
  bug_type TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info TEXT,
  status TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

**Admin Management**:
```sql
-- View all bug reports
SELECT * FROM bug_reports ORDER BY created_at DESC;

-- Filter by status
SELECT * FROM bug_reports WHERE status = 'open';

-- Update status
UPDATE bug_reports
SET status = 'resolved',
    admin_notes = 'Fixed in version X.Y.Z',
    resolved_at = NOW()
WHERE id = '<report-id>';

-- Statistics
SELECT bug_type, COUNT(*) as count
FROM bug_reports
GROUP BY bug_type;
```

### 3. Bounty System

**Create Bounty** (`/create-bounty`):
- Target player selection
- Bounty amount
- Description/reason
- Evidence upload (optional)
- Platform verification

**Bounty Display**:
- Creator information (avatar, username, clan tag)
- Target details
- Bounty amount
- Time remaining
- Number of hunters
- Claim button

**Bounty Claims**:
- Upload proof screenshot
- Add description
- Submit for verification
- Admin/creator approval required

**Bounty Lifecycle**:
```
Created → Active → Claimed → Verified → Completed
                  ↓
                Expired (if not claimed)
```

### 4. Role System

**Two Roles**:
- **Bounty Hunter (BH)**: Hunt players with bounties
- **Proud Rat (PR)**: Player Killers who accumulate bounties

**Role Selection Flow**:
```
1. New user logs in
2. Redirect to /select-role
3. Full-page role selector with character images
4. User selects role (card expands with glow)
5. Confirm selection
6. Save to database and localStorage
7. Redirect to home
```

**Role Display**:
- Navigation: Small badge `[BH]` or `[PR]` with icon
- Profile: Large badge with full label
- Leaderboard: Small badge next to each player

**Database**:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(2) CHECK (role IN ('BH', 'PR'));
CREATE INDEX idx_users_role ON users(role) WHERE role IS NOT NULL;
```

**Character Images Required**:
- `/public/bounty_hunter_cropped.png` (800x1200px, <500KB)
- `/public/rat_player_killer_cropped.png` (800x1200px, <500KB)

**RoleBadge Component**:
```vue
<RoleBadge :role="user.role" size="sm" />
<RoleBadge :role="user.role" size="md" :show-label="true" />
<RoleBadge :role="user.role" size="lg" :show-label="true" />
```

### 5. Clan Tags

**Setup**: 5-character clan tags displayed next to usernames

**Features**:
- Max 5 characters
- Letters and numbers only (A-Z, 0-9)
- Comprehensive profanity/slur filtering
- Displayed throughout app (navigation, profiles, leaderboard)

**Database**:
```sql
ALTER TABLE users ADD COLUMN clan_tag VARCHAR(5);
CREATE INDEX idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;
```

**Validation** (`src/lib/clanTagValidator.ts`):
```typescript
validateClanTag(tag: string): { valid: boolean; error?: string }
```

**Blocks**:
- Racial slurs (direct and leetspeak)
- Homophobic/transphobic terms
- Ableist slurs
- Profanity
- Sexual content
- Hate group symbols (88, 1488, KKK, etc.)
- Violence references
- Drug references
- Repeated characters (AAAAA)

**Editor Component** (`ClanTagEditor.vue`):
- Inline editing on profile page
- Real-time validation
- Visual feedback
- Remove button
- Auto-save

### 6. Achievements System

**17 Achievements** across 3 categories:

**Hunter Achievements**:
- First Blood (Common) - Complete 1 bounty
- Sharpshooter (Rare) - Complete 10 bounties
- Veteran Hunter (Epic) - Complete 50 bounties
- Legendary Hunter (Legendary) - Complete 100 bounties
- Hot Streak (Rare) - Complete 5 bounties within 24 hours
- Speed Demon (Epic) - Complete a bounty within 1 hour
- Big Game Hunter (Epic) - Complete a 1000+ point bounty

**Creator Achievements**:
- Getting Started (Common) - Create 1 bounty
- Generous Hunter (Rare) - Create 10 bounties
- Bounty Lord (Epic) - Create 50 bounties
- Master Benefactor (Legendary) - Create 100 bounties

**Milestone Achievements**:
- Point Collector (Rare) - Earn 500 points
- Point Master (Epic) - Earn 2,500 points
- Point Legend (Legendary) - Earn 10,000 points
- Apex Predator (Legendary) - Reach #1 on leaderboard

**Rarity System**:
- Common (gray)
- Rare (blue)
- Epic (purple)
- Legendary (gold with glow effect)

**Database**:
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT,
  points INTEGER,
  requirement_type TEXT,
  requirement_value INTEGER
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ
);
```

**Display**:
- Profile page: Top achievements section + expandable grid
- Leaderboard: Top 3 badges per hunter
- Toast notifications when unlocked
- Progress tracking
- Filters by earned/locked/rarity

### 7. Google Ads Integration

**Setup**: GDPR-compliant Google AdSense with consent management

**Features**:
- Google Funding Choices (CMP) for EU consent
- 3-choice consent dialog (Accept, Reject, Manage)
- TCF v2.2 compliant
- Premium users see no ads
- Responsive ad units

**Ad Placements**:
- Bounties page: After every 10th bounty
- Leaderboard: Bottom of page

**Environment Variables**:
```env
VITE_ADSENSE_CLIENT_ID=ca-pub-your-id
VITE_ADSENSE_ENABLED=true
VITE_AD_SLOT_BOUNTY_LIST=slot-id
VITE_AD_SLOT_LEADERBOARD=slot-id
```

**AdSense Setup**:
1. Sign up at https://www.google.com/adsense/
2. Enable Funding Choices (EU Consent)
3. Configure 3-choice consent message
4. Add site and wait for approval (1-2 weeks)
5. Create ad units and copy slot IDs
6. Update `.env` with slot IDs
7. Deploy and test

**Revenue Expectations**:
- Initial: $2-25/month (500-1000 visitors/month)
- Growth: $10-125/month (2000-5000 visitors/month)
- Factors: Traffic, consent rate, engagement, ad placement

### 8. Welcome Modal

**Purpose**: Daily community guidelines reminder

**Features**:
- Shows once per day per device
- Cannot be closed by clicking overlay
- Requires checkbox agreement
- Version tracking (force re-show on updates)
- Heartbeat animation
- Responsive design

**Routes**:
- Modal: Shows on every page (once daily)
- `/community-guidelines`: Full guidelines page (public)

**Version Control**:
```typescript
const GUIDELINES_VERSION = '1.0'
// Update to force re-show to all users
```

**localStorage Keys**:
- `welcome_modal_last_shown` - Date of last view
- `welcome_modal_version` - Version user has seen

**Testing**:
```javascript
// Force modal to show
localStorage.removeItem('welcome_modal_last_shown')
localStorage.removeItem('welcome_modal_version')
location.reload()
```

---

## Theme & Design System

### Color Palette

**All-Dark Theme** matching official Arc Raiders website:

**Background Colors**:
- Main Background: `#16161f` (arc-dark)
- Card/Panel Background: `#1e1e2d` (arc-navy)
- Nested Elements: `#252538` (arc-purple)

**Text Colors**:
- Primary: White (#ffffff)
- Secondary: White at 80% opacity
- Muted: White at 60% opacity

**Accent Colors**:
- Arc Red: `#ff3355` - Primary actions, highlights
- Arc Green: `#00ff88` - Success states
- Arc Yellow: `#ffd500` - Warnings, badges
- Arc Cyan: `#00d4ff` - Info, links

### Tactical/Angular Design

**Design Philosophy**:
1. Angular over rounded corners
2. Function over form
3. Consistent clip-path angles
4. Subtle accents (corner brackets, lines)
5. Game-inspired UI (HUD interfaces)

**Card Component** (`Card.vue`):
```vue
<!-- Default angled card -->
<Card variant="default">Content</Card>

<!-- With gradient line -->
<Card variant="angled">Content</Card>

<!-- With corner brackets (HUD style) -->
<Card variant="bordered" :corners="true">Content</Card>

<!-- Hover effect -->
<Card :hover="true">Clickable content</Card>
```

**Variants**:
- `default` - Angled corners with subtle border
- `angled` - Angled corners with gradient top line
- `bordered` - Thick border with angled corners
- `glass` - Glassmorphism with angled corners
- `flat` - Minimal style with small angles

**TacticalButton Component**:
```vue
<TacticalButton variant="primary">Create Bounty</TacticalButton>
<TacticalButton variant="secondary">View Targets</TacticalButton>
<TacticalButton variant="danger" size="lg">Delete</TacticalButton>
<TacticalButton variant="outline" :fullWidth="true">Full Width</TacticalButton>
```

**Button Variants**:
- `primary` - Brown filled
- `secondary` - Cyan accent
- `danger` - Red accent
- `ghost` - Transparent
- `outline` - Border only

**Button Sizes**:
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

### Custom Icons

**Angular Icon Set** (`src/components/icons/`):

- `IconTarget.vue` - Crosshair/target with angular frame
- `IconBounty.vue` - Hexagonal bounty/money icon
- `IconHunter.vue` - Tactical helmet/visor icon
- `IconTrophy.vue` - Trophy with angular base

**Usage**:
```vue
<IconTarget :size="32" className="text-arc-red" />
<IconBounty :size="32" className="text-arc-yellow" />
<IconHunter :size="32" className="text-arc-brown" />
<IconTrophy :size="32" className="text-arc-yellow" />
```

### Utility Classes

```css
/* Backgrounds */
bg-arc-dark      /* #16161f - Main dark background */
bg-arc-navy      /* #1e1e2d - Cards/panels */
bg-arc-purple    /* #252538 - Nested elements */

/* Text */
text-white       /* Primary text */
text-white/80    /* Secondary text */
text-white/60    /* Muted text */

/* Borders */
border-white/10  /* Subtle borders */
border-white/20  /* More visible borders */

/* Accents */
text-arc-red
text-arc-green
text-arc-yellow
text-arc-cyan
bg-arc-red
bg-arc-green
bg-arc-yellow
bg-arc-cyan
```

### Contrast Ratios (WCAG AA)

All combinations meet accessibility standards:
- White on arc-dark: 14.2:1 ✅
- White on arc-navy: 12.1:1 ✅
- Arc Red on arc-dark: 5.1:1 ✅
- Arc Green on arc-dark: 7.8:1 ✅
- Arc Yellow on arc-dark: 8.9:1 ✅
- Arc Cyan on arc-dark: 6.9:1 ✅

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  steam_id TEXT,
  email TEXT,
  avatar_url TEXT,
  platform TEXT CHECK (platform IN ('steam', 'xbox', 'playstation', 'google', 'email')),
  total_points INTEGER DEFAULT 0,
  bounties_completed INTEGER DEFAULT 0,
  bounties_created INTEGER DEFAULT 0,
  times_hunted INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clan_tag VARCHAR(5),
  role VARCHAR(2) CHECK (role IN ('BH', 'PR')),
  game_role TEXT,
  permission_role TEXT CHECK (permission_role IN ('user', 'admin')) DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free'
);
```

#### bounties
```sql
CREATE TABLE bounties (
  id UUID PRIMARY KEY,
  target_gamertag TEXT NOT NULL,
  bounty_amount INTEGER NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  platform TEXT,
  evidence_url TEXT
);
```

#### bounty_claims
```sql
CREATE TABLE bounty_claims (
  id UUID PRIMARY KEY,
  bounty_id UUID REFERENCES bounties(id),
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  proof_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  points_awarded INTEGER
);
```

#### achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 0,
  requirement_type TEXT,
  requirement_value INTEGER
);
```

#### user_achievements
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### bug_reports
```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY,
  user_id UUID,
  username TEXT NOT NULL,
  bug_type TEXT CHECK (bug_type IN ('bug', 'feature', 'improvement', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info TEXT,
  status TEXT DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

#### admin_logs
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY,
  admin_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_platform ON users(platform) WHERE platform IS NOT NULL;
CREATE INDEX idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;
CREATE INDEX idx_users_role ON users(role) WHERE role IS NOT NULL;
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounty_claims_status ON bounty_claims(status);
```

---

## Deployment Guide

### Vercel Deployment

#### 1. Connect Repository

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your repository
4. Select project: arc-raiders-bounty

#### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Public Variables** (available to frontend):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADSENSE_CLIENT_ID=ca-pub-your-id
VITE_ADSENSE_ENABLED=true
VITE_AD_SLOT_BOUNTY_LIST=slot-id
VITE_AD_SLOT_LEADERBOARD=slot-id
```

**Private Variables** (server-side only):
```
STEAM_API_KEY=your-steam-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3. Deploy

```bash
git add .
git commit -m "Deploy to production"
git push
```

Vercel will auto-deploy on push.

#### 4. Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add custom domain: `dont-shoot.com`
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

### Post-Deployment Checklist

- [ ] Verify Steam auth callback URL matches production domain
- [ ] Test all authentication methods
- [ ] Run RLS migration in production database
- [ ] Test admin access and verification
- [ ] Verify CORS settings allow production domain
- [ ] Test file uploads and storage
- [ ] Enable and test Google Ads consent
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Monitor error logs
- [ ] Test mobile responsiveness

---

## Testing Guide

### Unit Tests

```bash
npm run test:unit
```

### End-to-End Tests

```bash
# Build first for CI
npm run build

# Run all tests
npm run test:e2e

# Chrome only
npm run test:e2e -- --env chrome

# Specific file
npm run test:e2e -- tests/e2e/example.ts

# Debug mode
npm run test:e2e -- --debug
```

### Achievement Testing

**Setup**:
```bash
# Run migration
# In Supabase SQL Editor, execute:
# supabase/migrations/add_achievements.sql

# Verify
SELECT COUNT(*) FROM achievements; -- Should return 17
```

**Test Scenarios**:

1. **First Blood** - Complete 1 bounty, check toast notification
2. **Sharpshooter** - Complete 10 bounties, verify rare badge
3. **Hot Streak** - Complete 5 bounties within 24 hours
4. **Speed Demon** - Complete bounty within 1 hour of joining
5. **Apex Predator** - Reach #1 on leaderboard

**Manual Award**:
```sql
-- Find achievement
SELECT id, name FROM achievements WHERE name = 'First Blood';

-- Award it
INSERT INTO user_achievements (user_id, achievement_id)
VALUES ('YOUR_USER_ID', 'ACHIEVEMENT_ID');
```

**Reset for Re-testing**:
```sql
-- Delete earned achievements
DELETE FROM user_achievements WHERE user_id = 'YOUR_USER_ID';

-- Reset stats
UPDATE users
SET bounties_completed = 0,
    bounties_created = 0,
    total_points = 0
WHERE id = 'YOUR_USER_ID';
```

### Security Testing

**Test Admin Bypass**:
```javascript
// Open browser console
localStorage.setItem('arc_user', JSON.stringify({ role: 'admin' }))
// Try to access /admin
// Expected: API calls fail with unauthorized error
```

**Test RLS Enforcement**:
```sql
-- Try to promote yourself to admin
UPDATE users SET role = 'admin' WHERE id = auth.uid();
-- Expected: RLS policy violation error
```

**Test CORS**:
```javascript
// From different website (jsfiddle.net)
fetch('https://your-api.vercel.app/api/steam-verify?searchQuery=test')
// Expected: CORS error
```

**Test Rate Limiting**:
```bash
# Send 100 requests rapidly
for i in {1..100}; do
  curl https://your-api.vercel.app/api/steam-verify?searchQuery=test
done
# Expected: 429 Too Many Requests after ~60 requests
```

### Welcome Modal Testing

**First Visit**:
1. Navigate to site
2. Modal should appear immediately
3. Try clicking outside → should NOT close
4. Try clicking "I Agree" without checkbox → button disabled
5. Check checkbox and click "I Agree"
6. Modal closes and saves to localStorage

**Same Day**:
1. Refresh page → modal does NOT appear
2. Navigate to different pages → still no modal

**Next Day**:
1. Open DevTools → Application → Local Storage
2. Delete `welcome_modal_last_shown`
3. Refresh → modal appears again

**Version Update**:
1. Change `GUIDELINES_VERSION` from '1.0' to '1.1'
2. Refresh → modal appears again

---

## Database Management Scripts

### Setup

Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Security**: Never commit this key! It bypasses RLS.

### Available Commands

#### Seed Achievements
```bash
npm run db:seed-achievements
```
Populates achievements table with all 17 achievements.

#### Grant All Achievements
```bash
npm run db:grant-achievements <username>
```
Example: `npm run db:grant-achievements CoDeBarS`

Awards all achievements to a user for testing.

#### Run Migration
```bash
npm run db:migrate <migration-file>
```
Example: `npm run db:migrate add_achievements.sql`

Executes SQL migration from `supabase/migrations/`.

### Reset Scripts

#### Reset User Stats Only (Recommended for Launch)
```bash
npx supabase db execute --file scripts/reset-user-stats-only.sql
```

**Resets**:
- All user statistics to 0
- Points, bounties completed, kills, etc.

**Preserves**:
- ALL bounties (active and completed)
- ALL bounty claims
- ALL bounty hunters
- Entire point system
- User accounts, profiles, avatars, clan tags
- User join dates

**Perfect for**: Launch day - everyone starts fresh but game economy intact

#### Complete Reset
```bash
npx supabase db execute --file scripts/reset-all-stats.sql
```

**Resets**:
- Deletes ALL bounties
- Deletes ALL claims
- Deletes ALL hunters
- Resets ALL user stats to 0
- Resets join dates to NOW

**Preserves**:
- User accounts and login credentials
- Avatars, usernames, roles, clan tags

---

## SEO Optimization

### Implemented

- Meta tags and descriptions
- Open Graph (Facebook) tags
- Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD schema)
- `robots.txt` and `sitemap.xml`
- Dynamic SEO composable (`useSEO.ts`)

### Setup Tasks

**Create OG Image**:
- Create `public/og-image.png` (1200x630px)
- Include logo/branding
- Add text: "Don't Shoot - Arc Raiders Bounty System"
- Use Arc Raiders themed colors

**Submit to Search Engines**:
1. Google Search Console: https://search.google.com/search-console
2. Bing Webmaster Tools: https://www.bing.com/webmasters
3. Submit sitemap: `https://dont-shoot.com/sitemap.xml`

**Google Analytics**:
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Key Metrics to Track**:
- Organic search traffic
- Bounce rate
- Time on site
- Pages per session
- Keyword rankings
- Conversion rate (sign-ups, bounty creations)

---

## Support & Troubleshooting

### Common Issues

**Steam auth not working**:
- Verify Steam API key is correct and NOT prefixed with `VITE_`
- Check callback URL matches Steam settings
- Restart dev server after changing `.env`

**Database errors**:
- Run RLS migration in Supabase
- Check Supabase logs for specific errors
- Verify service role key is set correctly

**Achievements not unlocking**:
- Run achievements migration
- Verify RPC functions exist in database
- Check browser console for errors

**Ads not displaying**:
- Wait for AdSense approval (1-2 weeks)
- Update `.env` with real slot IDs
- Rebuild and deploy
- Test with EU VPN for consent dialog

**CORS errors**:
- Add your domain to `ALLOWED_ORIGINS` in `cors-config.ts`
- Redeploy serverless functions

### Getting Help

1. Check browser console for errors
2. Review Supabase logs
3. Verify environment variables
4. Test in incognito mode
5. Check this documentation

---

**Documentation maintained by**: Development Team
**Last comprehensive update**: January 2026
**Version**: 2.0

For questions or updates, please submit a bug report through the application.
