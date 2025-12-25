# Admin Panel Documentation

## Available Admin Views

Your Arc Raiders Bounty site now has a comprehensive admin panel with multiple views for managing your platform.

---

## 1. Admin Users View (NEW!)

**URL**: `/admin/users`

**Purpose**: View and manage all registered users with detailed statistics and filtering.

### Features:

#### 📊 Real-time Statistics
- **Total Users**: Overall user count
- **Today**: Users registered today
- **This Week**: Users registered in the last 7 days
- **Admins**: Number of admin users
- **Bounty Hunters**: Users with BH game role
- **Proud Rats**: Users with PR game role
- **Premium**: Premium subscribers

#### 🔍 Advanced Filtering
- **Search**: Search by username, email, or Steam ID
- **Role Filter**: Filter by admin/user permission role
- **Game Role Filter**: Filter by Bounty Hunter (BH) or Proud Rat (PR)
- **Sort Options**:
  - Newest First (default)
  - Oldest First
  - Most Active (by total activity)
  - Highest Points

#### 📋 User Information Display
Each user row shows:
- **Avatar & Username** with clan tag
- **Email address**
- **Platform** (Steam, Xbox, PlayStation)
- **Game Role** badge (BH or PR)
- **Stats**: Total points, bounties completed, kill count (for PR)
- **Subscription Tier** (Free or Premium with crown icon)
- **Join Date** (relative time: "5 minutes ago" or absolute date)

#### 🎨 Visual Indicators
- **Admin Badge**: Shield icon for admin users
- **Premium Badge**: Crown icon for premium members
- **Color-coded Platforms**:
  - Steam: Blue
  - Xbox: Green
  - PlayStation: Indigo
- **Role Badges**:
  - Bounty Hunter: Orange
  - Proud Rat: Red

### How to Access:
1. Log in as an admin user
2. Navigate to `/admin/users`
3. Or create a link in your navigation menu

---

## 2. Admin Bug Reports View

**URL**: `/admin/bug-reports`

**Purpose**: Manage and respond to user bug reports and feature requests.

### Features:
- View all submitted reports
- Filter by type (bug, feature, improvement, other)
- Filter by status (open, in progress, resolved, closed, won't fix)
- Update report status
- Add admin notes
- Track resolution timeline

---

## Admin Access Control

### How It Works:
- **Route Protection**: Admin routes are protected in the router
- **Access Check**: Only users with `role: 'admin'` can access
- **Auto Redirect**: Non-admin users are redirected to home page

### Protected Routes:
- `/verify` - Bounty verification
- `/admin/bug-reports` - Bug report management
- `/admin/users` - User management (NEW!)

### Making a User an Admin:
You need to update the user's role in the database directly:

```sql
-- Via Supabase SQL Editor
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Or use Supabase Dashboard:
1. Go to Table Editor → `users` table
2. Find your user
3. Edit the `role` column to `'admin'`

---

## Creating Admin Navigation

You can add admin links to your navigation menu. Here's an example:

```vue
<!-- In your navigation component -->
<template>
  <nav v-if="currentUser?.role === 'admin'" class="admin-nav">
    <h3>Admin Panel</h3>
    <RouterLink to="/admin/users">
      <Users :size="16" />
      User Management
    </RouterLink>
    <RouterLink to="/admin/bug-reports">
      <Bug :size="16" />
      Bug Reports
    </RouterLink>
    <RouterLink to="/verify">
      <Shield :size="16" />
      Verify Claims
    </RouterLink>
  </nav>
</template>
```

---

## Admin User Stats Overview

The Admin Users View gives you instant insights:

### Growth Metrics:
- **Daily Signups**: See how many users joined today
- **Weekly Growth**: Track weekly user acquisition
- **Total Users**: Overall platform size

### User Composition:
- **Admin Count**: How many admins you have
- **Role Distribution**: BH vs PR split
- **Premium Users**: How many paid subscribers

### Activity Metrics (via sorting):
- **Most Active Users**: Users with highest combined activity
- **Top Point Earners**: Leaderboard perspective
- **Recent Signups**: Latest user registrations

---

## Use Cases

### 1. Monitor User Growth
- Check "Today" and "This Week" stats
- Sort by "Newest First" to see recent signups
- Track growth trends over time

### 2. Identify Power Users
- Sort by "Most Active"
- Look at bounties completed and kill counts
- Consider promoting to community moderators

### 3. Manage Premium Users
- Filter to see all premium subscribers
- Check subscription status
- Plan premium features

### 4. Find Specific Users
- Search by username for support queries
- Search by email for account issues
- Search by Steam ID for platform-specific problems

### 5. Role Balance
- Check BH vs PR distribution
- Ensure balanced gameplay
- Identify trends in role selection

---

## Future Enhancements

Potential additions to the admin panel:

- **User Actions**: Ban, suspend, or warn users
- **Mass Operations**: Bulk role updates, premium grants
- **User Analytics**: Charts and graphs for growth trends
- **Email Actions**: Send notifications to users
- **Activity Log**: Track user actions and behavior
- **Export Data**: Download user lists as CSV
- **Direct Messaging**: Contact users from admin panel

---

## Security Best Practices

### ⚠️ Important:
1. **Limit Admin Accounts**: Only give admin access to trusted individuals
2. **Strong Passwords**: Admins should use strong, unique passwords
3. **2FA Recommended**: Enable two-factor authentication for admin accounts
4. **Audit Logs**: Keep track of admin actions (future enhancement)
5. **Regular Reviews**: Periodically review admin user list

### Database Security:
- Never expose `service_role` key in client code
- Admin checks happen server-side via RLS policies
- Client-side checks are for UX only, not security

---

## Quick Start

### To Access Admin Users View:

1. **Ensure you're an admin**:
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
   ```

2. **Navigate to the view**:
   ```
   https://dont-shoot.com/admin/users
   ```

3. **Start managing**:
   - View user statistics
   - Filter and search users
   - Monitor growth metrics

---

## Technical Details

### Component Location:
- File: `src/views/AdminUsersView.vue`
- Route: `/admin/users`
- Route Name: `admin-users`

### Dependencies:
- `lucide-vue-next` - Icons
- `vue-router` - Routing
- `@/composables/useToast` - Notifications
- `@/lib/auth` - User authentication
- `@/lib/supabase` - Database queries

### Data Source:
- Queries the `users` table in Supabase
- Real-time data (refreshed on page load)
- No caching (always fresh data)

### Performance:
- Loads all users at once (fine for <10,000 users)
- Client-side filtering (instant)
- Optimized with computed properties
- Responsive design for mobile/tablet

---

## Support

If you need help with the admin panel:
1. Check this documentation
2. Review the code in `src/views/AdminUsersView.vue`
3. Check the browser console for errors
4. Ensure your user has `role: 'admin'` in the database

---

**Last Updated**: 2025-12-25

Your admin panel is now ready to use! 🎉
