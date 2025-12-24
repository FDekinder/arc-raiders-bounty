# Bug Reporting System

This application includes a comprehensive bug reporting system that allows users to report bugs, request features, suggest improvements, and provide general feedback.

## Features

### For Users
- **Easy Access**: Bug reporting is available via the navigation menu ("Report Bug" link)
- **Multiple Report Types**:
  - 🐛 **Bug Report**: Something is broken or not working
  - 💡 **Feature Request**: Suggest a new feature
  - ⚡ **Improvement**: Suggest an enhancement
  - 📝 **Other**: General feedback or question

- **Detailed Forms**:
  - Title (required, up to 200 characters)
  - Description (required, minimum 20 characters, up to 2000 characters)
  - Steps to Reproduce (optional, for bugs)
  - Expected vs Actual Behavior (optional, for bugs)
  - Browser info (automatically captured)

- **Anonymous Reporting**: Users can submit reports even without being logged in
- **Confirmation**: Success message and automatic redirect after submission

### For Admins
- All bug reports are stored in the `bug_reports` table
- Reports include:
  - User information (if logged in)
  - Report type and details
  - Browser/system information
  - Timestamps
  - Status tracking

## Database Schema

```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY,
  user_id UUID (nullable - allows anonymous reports),
  username TEXT NOT NULL,
  bug_type TEXT ('bug', 'feature', 'improvement', 'other'),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT (optional),
  expected_behavior TEXT (optional),
  actual_behavior TEXT (optional),
  browser_info TEXT,
  status TEXT ('open', 'in_progress', 'resolved', 'closed', 'wont_fix'),
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

## Setup

1. **Run the migration**:
   ```bash
   npx supabase db execute --file supabase/migrations/add_bug_reports.sql
   ```

2. **Access the bug report page**:
   - Users can navigate to `/report-bug`
   - Link is available in the main navigation menu

## Admin Workflows

### Viewing Bug Reports

To view all bug reports, query the database:

```sql
SELECT * FROM bug_reports
ORDER BY created_at DESC;
```

### Filtering by Status

```sql
-- View open reports
SELECT * FROM bug_reports
WHERE status = 'open'
ORDER BY created_at DESC;

-- View bugs only
SELECT * FROM bug_reports
WHERE bug_type = 'bug' AND status IN ('open', 'in_progress')
ORDER BY created_at DESC;
```

### Updating Report Status

```sql
-- Mark as in progress
UPDATE bug_reports
SET status = 'in_progress',
    admin_notes = 'Working on this issue',
    updated_at = NOW()
WHERE id = '<report-id>';

-- Mark as resolved
UPDATE bug_reports
SET status = 'resolved',
    admin_notes = 'Fixed in version X.Y.Z',
    resolved_at = NOW()
WHERE id = '<report-id>';
```

### Statistics

```sql
-- Get report counts by type
SELECT bug_type, COUNT(*) as count
FROM bug_reports
GROUP BY bug_type
ORDER BY count DESC;

-- Get report counts by status
SELECT status, COUNT(*) as count
FROM bug_reports
GROUP BY status
ORDER BY count DESC;

-- Get average time to resolve
SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours_to_resolve
FROM bug_reports
WHERE resolved_at IS NOT NULL;
```

## Row Level Security (RLS)

The bug_reports table has RLS enabled with the following policies:

1. **Anyone can submit**: All users (including anonymous) can insert bug reports
2. **View own reports**: Users can view their own bug reports
3. **Admin access**: Admins can view, update, and delete all bug reports

## Integration Points

### Navigation
- Desktop menu: Top navigation bar
- Mobile menu: Hamburger menu

### Public Access
- The `/report-bug` route is public (no authentication required)
- Listed in `publicPages` array in router configuration

### User Experience
- Form validation with clear error messages
- Character counters for text fields
- Contextual fields (e.g., "Steps to Reproduce" only shown for bug reports)
- Auto-filled browser information
- Success confirmation and redirect

## Future Enhancements

Potential improvements for the bug reporting system:

1. **Admin Dashboard**: Create a dedicated admin page to view and manage bug reports
2. **Email Notifications**: Send emails to admins when new reports are submitted
3. **User Notifications**: Notify users when their reports are updated/resolved
4. **File Uploads**: Allow users to attach screenshots or files
5. **Voting System**: Let users upvote existing bug reports
6. **Duplicate Detection**: Suggest similar reports before submission
7. **Public Bug Tracker**: Display resolved bugs in a public changelog
8. **GitHub Integration**: Automatically create GitHub issues from bug reports

## Best Practices

1. **Regular Review**: Check new bug reports daily
2. **Quick Triage**: Categorize and prioritize reports promptly
3. **User Feedback**: Add admin notes to keep users informed
4. **Analytics**: Track common issues to identify systemic problems
5. **Close Loop**: Mark reports as resolved and include fix version

## Support

For questions about the bug reporting system, contact the development team or check the main README.
