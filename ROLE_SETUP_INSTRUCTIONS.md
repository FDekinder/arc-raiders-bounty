# Role System Setup Instructions

## Quick Start

### Step 1: Run Database Migration

In your Supabase SQL Editor, run:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(2) CHECK (role IN ('BH', 'PR'));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;
COMMENT ON COLUMN users.role IS 'User role: BH (Bounty Hunter) or PR (Proud Rat)';
```

### Step 2: Add Character Images

You need to add two images to the `/public/` folder:

1. **`/public/bounty_hunter_cropped.png`**
   - The bounty hunter character you showed me
   - Professional law enforcer look

2. **`/public/rat_player_killer_cropped.png`**
   - The rat character you showed me
   - Chaotic player killer vibe

**IMPORTANT**: Replace the placeholder files I created with your actual character images!

The images should be:

- Portrait orientation (recommend 800x1200px)
- JPG or PNG format
- Optimized for web (<500KB each)

### Step 3: Verify TypeScript

```bash
npm run type-check
```

Should complete with no errors.

### Step 4: Test the Flow

1. Clear localStorage (or use incognito)
2. Log in via Steam
3. You should see the role selection screen
4. Click on either Bounty Hunter or Proud Rat
5. Confirm selection
6. Check that role badge appears in:
   - Navigation bar
   - Your profile
   - Leaderboard

## What Users Will See

### Role Selection Screen

- **Full-page immersive design**
- Two large character cards with:
  - Character background image
  - Role icon (Target for BH, Crosshair for PR)
  - Role title and description
  - Feature list
- Hover effects (cards scale up)
- Selection effects (glowing colored ring)
- Confirm button at bottom

### Role Display

- **Navigation**: Small badge like `[BH]` or `[PR]` with icon
- **Profile**: Large badge with full name "Bounty Hunter" or "Proud Rat"
- **Leaderboard**: Small badge next to each player

## Role Meanings

### Bounty Hunter (BH) - Green

- Hunts players with bounties on their heads
- Enforces order and justice
- Earns rewards for eliminations
- Target icon symbolizes precision

### Proud Rat (PR) - Red

- Player killer who creates chaos
- Accumulates bounties with pride
- Hunts anyone, anywhere
- Crosshair icon symbolizes always ready

## Troubleshooting

**Issue**: Images not showing

- **Solution**: Make sure you replaced `bounty_hunter_cropped.png` and `rat_player_killer_cropped.png` in `/public/` with your actual images

**Issue**: Role not saving

- **Solution**: Check database migration ran successfully, verify `role` column exists

**Issue**: Not redirected to role selection

- **Solution**: Clear localStorage and log in again, or manually visit `/select-role`

**Issue**: TypeScript errors

- **Solution**: Run `npm run type-check` to see specific errors

## Files Changed

✅ Database migration created
✅ TypeScript types updated
✅ Role selector component created
✅ Role badge component created
✅ Navigation updated
✅ Profile page updated
✅ Leaderboard updated
✅ Steam callback flow updated
✅ Router updated with new route

Everything is ready to go! Just add your character images and run the database migration.
