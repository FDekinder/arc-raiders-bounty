# Fixed: Role Constraint Conflict

## The Problem

Your database already had a `role` column for user permissions (admin/user), which conflicted with the game role system (BH/PR) we were trying to add.

**Error:** `new row for relation "users" violates check constraint "users_role_check"`

## The Solution

Renamed the game role column from `role` to `game_role` to avoid conflict.

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add game_role column for Bounty Hunter vs Proud Rat
ALTER TABLE users ADD COLUMN IF NOT EXISTS game_role VARCHAR(2) CHECK (game_role IN ('BH', 'PR'));

-- Create index for game_role filtering
CREATE INDEX IF NOT EXISTS idx_users_game_role ON users(game_role) WHERE game_role IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.game_role IS 'Game role: BH (Bounty Hunter) or PR (Proud Rat)';
```

## What Changed in Code

### TypeScript Interface
```typescript
export interface User {
  // ... other fields
  game_role?: UserRole  // Changed from 'role' to 'game_role'
}
```

### Files Updated
- ✅ `src/lib/supabase.ts` - User interface
- ✅ `src/views/RoleSelectionView.vue` - Saves game_role
- ✅ `src/views/SteamCallbackView.vue` - Checks game_role
- ✅ `src/views/EmailLoginView.vue` - Checks game_role
- ✅ `src/App.vue` - Displays game_role badge
- ✅ `src/views/UserProfileView.vue` - Displays game_role badge
- ✅ `src/views/LeaderboardView.vue` - Displays game_role badge
- ✅ `supabase/migrations/add_user_role.sql` - Migration updated

## Database Structure Now

```
users table:
├── role (text)          - User permission: 'admin' or 'user'
├── game_role (varchar)  - Game role: 'BH' or 'PR'
├── platform (varchar)   - Gaming platform: 'steam', 'xbox', or 'playstation'
└── ... other fields
```

## After Running Migration

1. Run the SQL migration above
2. Test role selection - should work now!
3. All TypeScript already updated and type-checks pass ✅

The game role system (Bounty Hunter vs Proud Rat) now uses `game_role` column and won't conflict with your existing admin/user permission system.
