# Role System - Bounty Hunter vs Proud Rat

## Overview

The role system allows users to choose their identity in Arc Raiders Bounty:

- **Bounty Hunter (BH)**: Hunt down players with bounties
- **Proud Rat (PR)**: Player Killers who accumulate bounties

## Features Implemented

### 1. Database Schema

- Added `role` field to users table (VARCHAR(2))
- Constraint: Only accepts 'BH' or 'PR'
- Indexed for performance

**Migration:** `supabase/migrations/add_user_role.sql`

### 2. Role Selection Flow

#### New User Experience

1. User logs in via Steam
2. If no role selected → Redirect to `/select-role`
3. User sees full-page role selector with character images
4. User clicks on either Bounty Hunter or Proud Rat card
5. Card expands and shows selection indicator
6. User confirms selection
7. Role is saved to database and localStorage
8. Redirect to home page

#### Existing User Experience

- Users with roles go directly to home after login
- Can change role later (future feature)

### 3. Visual Components

#### RoleSelector Component

- **Full-page immersive experience**
- Two large character cards side-by-side
- **Bounty Hunter Card**:
  - Green color scheme
  - Target icon
  - Background image: `/bounty_hunter_cropped.png`
  - Description emphasizes hunting bounties

- **Proud Rat Card**:
  - Red color scheme
  - Crosshair icon
  - Background image: `/rat_player_killer_cropped.png`
  - Description emphasizes chaos and PvP

#### Features:

- Hover effects with scale animation
- Selected state with colored ring glow
- Background images with gradient overlays
- Feature lists for each role
- Responsive design

#### RoleBadge Component

- Small, reusable badge component
- Shows role abbreviation (BH/PR) with icon
- Three sizes: `sm`, `md`, `lg`
- Optional full label display
- Color-coded: Green for BH, Red for PR

### 4. Display Integration

Role badges appear in:

1. **Navigation Bar**: Small badge next to username
2. **User Profiles**: Large badge next to name with full label
3. **Leaderboard**: Small badge next to each player's name

Format: `[BH]` or `[PR]` with colored background and icon

### 5. Character Images

You need to add two character images to `/public/`:

**`/public/bounty_hunter_cropped.png`**

- Use the bounty hunter character image you provided
- Professional, law-enforcer vibe
- Should convey: justice, skill, tracking

**`/public/rat_player_killer_cropped.png`**

- Use the rat character image you provided
- Chaotic, rebellious vibe
- Should convey: danger, unpredictability, PvP focus

**Recommended specs:**

- Size: 800x1200px or similar portrait ratio
- Format: JPG or PNG
- Optimized for web (<500KB)

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Add role field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(2) CHECK (role IN ('BH', 'PR'));

-- Create index for role filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.role IS 'User role: BH (Bounty Hunter) or PR (Proud Rat)';
```

## File Structure

### New Files

- `supabase/migrations/add_user_role.sql` - Database migration
- `src/components/RoleSelector.vue` - Full-page role selection UI
- `src/components/RoleBadge.vue` - Reusable role badge component
- `src/views/RoleSelectionView.vue` - Role selection page view
- `ROLE_SYSTEM.md` - This documentation

### Modified Files

- `src/lib/supabase.ts` - Added UserRole type
- `src/lib/steamAuth.ts` - Returns isNewUser flag
- `src/router/index.ts` - Added /select-role route
- `src/views/SteamCallbackView.vue` - Redirects based on role
- `src/views/UserProfileView.vue` - Shows role badge
- `src/views/LeaderboardView.vue` - Shows role badges
- `src/App.vue` - Shows role badge in navigation

## Usage

### TypeScript Types

```typescript
import type { UserRole } from '@/lib/supabase'

// UserRole = 'BH' | 'PR'
```

### Using RoleBadge Component

```vue
<RoleBadge :role="user.role" size="sm" />
<RoleBadge :role="user.role" size="md" :show-label="true" />
<RoleBadge :role="user.role" size="lg" :show-label="true" />
```

### Checking User Role

```typescript
const user = getCurrentUser()
if (user.role === 'BH') {
  // Bounty Hunter logic
} else if (user.role === 'PR') {
  // Proud Rat logic
}
```

## Future Enhancements

### Planned Features

1. **Role-specific features**:
   - BH: Bonus rewards for completing bounties
   - PR: Bonus points for accumulating bounties

2. **Role-based leaderboards**:
   - Separate leaderboards for BH and PR
   - Role-specific achievements

3. **Role changing**:
   - Allow users to change role (with cooldown?)
   - Track role change history

4. **Role statistics**:
   - Track performance by role
   - Show role-specific stats on profile

5. **Visual enhancements**:
   - Role-specific profile themes
   - Animated role badges
   - Role-specific sound effects

## Design Philosophy

### Bounty Hunter (BH)

- **Identity**: Law enforcement, justice, order
- **Goal**: Hunt down bounties, maintain order
- **Colors**: Green (success, completion)
- **Symbolism**: Target icon = precision, focus

### Proud Rat (PR)

- **Identity**: Chaos, freedom, rebellion
- **Goal**: Create havoc, accumulate bounties
- **Colors**: Red (danger, aggression)
- **Symbolism**: Crosshair = always hunting, always ready

Both roles are equally valid and celebrated in the game!

## Technical Notes

- Role is optional (undefined) for backward compatibility
- New users MUST select a role before continuing
- Existing users without roles will be prompted on next login
- Role is stored in both database and localStorage
- Role selection cannot be bypassed (enforced by routing)

## Testing

1. Log out if currently logged in
2. Log in via Steam
3. Should be redirected to `/select-role`
4. Click on either character card
5. Confirm selection
6. Verify redirect to home
7. Check navigation shows role badge
8. Check profile shows role badge
9. Check leaderboard shows role badges

## Summary

The role system adds player identity and personality to Arc Raiders Bounty. Users choose to be either hunters of bounties or proud chaos agents, with visual representation throughout the app. The full-page selection experience makes the choice feel meaningful and impactful.
