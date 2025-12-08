# Admin Roles Implementation Guide

## Overview

Admin roles have been implemented to:
- ✅ Control who can verify/approve bounty claims
- ✅ Track all admin actions with audit logs
- ✅ Provide admin badge in the UI
- ✅ Restrict verification to admins only

## Database Changes

### New Column: `users.role`
- Default: `'user'`
- Options: `'user'` | `'admin'`
- Constraint: CHECK (role IN ('user', 'admin'))

### New Table: `admin_logs`
Audit trail for admin actions:
```
- id (UUID)
- admin_id (TEXT) → references users(id)
- action (TEXT) - the action performed
- target_table (TEXT) - which table was affected
- target_id (TEXT) - which record was affected
- changes (JSONB) - what changed
- created_at (TIMESTAMP)
```

## Backend Functions

### `src/lib/adminUtils.ts`

**`isUserAdmin(userId: string): Promise<boolean>`**
- Check if a user is an admin

**`promoteUserToAdmin(userId: string): Promise<boolean>`**
- Make a user an admin
- Logs the action

**`demoteAdminToUser(userId: string): Promise<boolean>`**
- Remove admin rights from a user
- Logs the action

**`approveBountyClaim(claimId, verifierId, pointsAwarded): Promise<boolean>`**
- Approve a claim
- Award points to hunter
- Mark bounty as completed
- Logs the action

**`rejectBountyClaim(claimId, verifierId, reason): Promise<boolean>`**
- Reject a claim with a reason
- Logs the action

**`logAdminAction(action, targetTable, targetId, changes): Promise<void>`**
- Manual logging of admin actions

**`getAdminLogs(limit = 50): Promise<AdminLog[]>`**
- Retrieve admin action logs

## Updated Views

### `src/views/VerificationView.vue`

Now:
- ✅ Checks if user is admin on mount
- ✅ Shows "Admin" badge if user is admin
- ✅ Uses `approveBountyClaim()` and `rejectBountyClaim()` from adminUtils
- ✅ Admin actions are automatically logged

## RLS Policies

Updated policies in `supabase/migrations/add_admin_roles.sql`:

```sql
-- Admins can approve any claim
CREATE POLICY "Admins can update any claim"
ON bounty_claims FOR UPDATE
USING (user_is_admin(auth.uid()))

-- Bounty creators can approve their own claims
CREATE POLICY "Creators can update own bounty claims"
ON bounty_claims FOR UPDATE
USING (creator_of_bounty = auth.uid())
```

## Making Users Admin

### Option 1: Direct Database Update (Quick)
```sql
UPDATE users SET role = 'admin' WHERE id = 'user_id_here';
```

### Option 2: Create Admin Management Page

Frontend button to promote users (requires admin rights):
```typescript
import { promoteUserToAdmin } from '@/lib/adminUtils'

async function makeUserAdmin(userId: string) {
  const success = await promoteUserToAdmin(userId)
  if (success) console.log('User promoted to admin')
}
```

### Option 3: Create Admin Invite System

Generate admin tokens for trusted users to self-promote.

## Audit Trail

All admin actions are logged to `admin_logs` table:

```typescript
// View admin logs
const logs = await getAdminLogs(100)
logs.forEach(log => {
  console.log(`[${log.created_at}] ${log.action}`)
  console.log(`  On: ${log.target_table}.${log.target_id}`)
  console.log(`  Changes:`, log.changes)
})
```

## Testing Admin Features

1. **Make yourself admin in database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 'your_id';
   ```

2. **Go to verification page** - You should see the "Admin" badge

3. **Approve/reject claims** - Watch them get processed and logged

4. **Check admin logs:**
   ```sql
   SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 10;
   ```

## Future Improvements

- [ ] Create admin dashboard with user management
- [ ] Add role-based dashboard (admin-only features)
- [ ] Email notifications when claims are verified
- [ ] Admin approval workflow for other admins
- [ ] Temporary admin access with expiration
- [ ] Two-factor authentication for admins
- [ ] Activity heatmap showing verification patterns
