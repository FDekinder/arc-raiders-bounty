# Admin-Only Access to Verify Page

## Summary

The `/verify` page is now restricted to admin users only. Non-admin users will be redirected to the home page if they try to access it.

## Implementation

### 1. User Interface Update

Added `role` field to the User interface to track admin permissions:

```typescript
export interface User {
  // ... other fields
  role?: 'admin' | 'user' // User permission role
  game_role?: UserRole     // Game role: BH or PR
}
```

**Note:** We now have two separate role concepts:
- `role` - User permission (admin/user) - controls access to admin features
- `game_role` - Game identity (BH/PR) - Bounty Hunter vs Proud Rat

### 2. Admin Check Utility

Added `isAdmin()` function in [src/lib/auth.ts](src/lib/auth.ts):

```typescript
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}
```

### 3. Router Protection

Updated router guard in [src/router/index.ts](src/router/index.ts:91-98) to check admin status:

```typescript
// Check admin-only routes
const adminOnlyRoutes = ['/verify']
if (adminOnlyRoutes.includes(to.path)) {
  if (!currentUser || currentUser.role !== 'admin') {
    // Redirect non-admins to home
    return next('/')
  }
}
```

### 4. Navigation Update

Updated [src/App.vue](src/App.vue:66) to hide the Verify link from non-admin users:

```vue
<RouterLink
  v-if="currentUser?.role === 'admin'"
  to="/verify"
>
  Verify
</RouterLink>
```

### 5. Existing View Protection

The [VerificationView.vue](src/views/VerificationView.vue) already had admin checks using `isUserAdmin()` from `adminUtils.ts`, which queries the database to verify admin status.

## How It Works

1. **Navigation**: Non-admin users don't see the "Verify" link in the navigation bar
2. **Router Guard**: If a non-admin tries to access `/verify` directly (via URL), they're redirected to `/`
3. **View-Level Check**: Even if they somehow reach the page, the view itself checks admin status and hides admin actions

## Making a User an Admin

To grant admin access to a user, update their `role` field in the database:

```sql
-- Make a user an admin
UPDATE users
SET role = 'admin'
WHERE id = 'user-uuid-here';

-- Or by email
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';
```

Or use the existing admin utility function (if you're already an admin):

```typescript
import { promoteUserToAdmin } from '@/lib/adminUtils'

await promoteUserToAdmin(userId)
```

## Testing

1. **As Regular User:**
   - Login as a regular user
   - Verify link should NOT appear in navigation
   - Trying to access `/verify` redirects to `/`

2. **As Admin:**
   - Login as admin user (role = 'admin' in database)
   - Verify link SHOULD appear in navigation
   - Can access `/verify` page and see all claims

## Files Changed

- ✅ [src/lib/supabase.ts](src/lib/supabase.ts#L27) - Added `role` field to User interface
- ✅ [src/lib/auth.ts](src/lib/auth.ts#L24-L27) - Added `isAdmin()` function
- ✅ [src/router/index.ts](src/router/index.ts#L91-L98) - Added admin route protection
- ✅ [src/App.vue](src/App.vue#L66) - Hide verify link for non-admins
- ✅ TypeScript compiles with no errors

## Security Layers

The verify page is protected by **three layers**:

1. **UI Layer**: Navigation link hidden from non-admins
2. **Router Layer**: Route guard redirects non-admins
3. **View Layer**: VerificationView checks admin status via database query

This ensures even if someone bypasses the client-side checks, they still can't perform admin actions without proper database permissions.
