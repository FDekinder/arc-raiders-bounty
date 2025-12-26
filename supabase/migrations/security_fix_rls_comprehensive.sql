-- ============================================================================
-- SECURITY FIX: Comprehensive Row Level Security (RLS) Policies
-- ============================================================================
-- This migration fixes critical security vulnerabilities by:
-- 1. Enabling RLS on all tables
-- 2. Dropping overly permissive policies
-- 3. Creating secure, role-based policies
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Everyone can view users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles (for leaderboards, bounties, etc.)
CREATE POLICY "users_select_all"
  ON users FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));
  -- Critical: Prevents role escalation - user cannot change their own role

-- Policy: Only admins can promote users or change roles
CREATE POLICY "users_admin_role_update"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: New users can create their profile (signup)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'user');
  -- Critical: New users are always 'user' role, not 'admin'

-- ============================================================================
-- BOUNTIES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view bounties" ON bounties;
DROP POLICY IF EXISTS "Anyone can create bounties" ON bounties;
DROP POLICY IF EXISTS "Anyone can update bounties" ON bounties;

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view bounties
CREATE POLICY "bounties_select_all"
  ON bounties FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only authenticated users can create bounties
CREATE POLICY "bounties_insert_authenticated"
  ON bounties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);
  -- Critical: User can only create bounties as themselves

-- Policy: Users can update their own bounties (if not claimed)
CREATE POLICY "bounties_update_own"
  ON bounties FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'open')
  WITH CHECK (auth.uid() = created_by);

-- Policy: Admins can update any bounty
CREATE POLICY "bounties_admin_update"
  ON bounties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- BOUNTY_CLAIMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view claims" ON bounty_claims;
DROP POLICY IF EXISTS "Anyone can create claims" ON bounty_claims;
DROP POLICY IF EXISTS "Anyone can update claims" ON bounty_claims;

ALTER TABLE bounty_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own claims and public approved claims
CREATE POLICY "claims_select_own_or_approved"
  ON bounty_claims FOR SELECT
  TO authenticated
  USING (
    hunter_id = auth.uid()
    OR verification_status = 'approved'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Anon users can only see approved claims
CREATE POLICY "claims_select_approved_anon"
  ON bounty_claims FOR SELECT
  TO anon
  USING (verification_status = 'approved');

-- Policy: Authenticated users can create claims for themselves
CREATE POLICY "claims_insert_own"
  ON bounty_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = hunter_id AND verification_status = 'pending');
  -- Critical: Claims always start as 'pending', not 'approved'

-- Policy: Only admins can approve/reject claims
CREATE POLICY "claims_admin_update"
  ON bounty_claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Users can delete their own pending claims
CREATE POLICY "claims_delete_own_pending"
  ON bounty_claims FOR DELETE
  TO authenticated
  USING (hunter_id = auth.uid() AND verification_status = 'pending');

-- ============================================================================
-- HUNTERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view hunters" ON hunters;
DROP POLICY IF EXISTS "Anyone can join hunts" ON hunters;
DROP POLICY IF EXISTS "Anyone can leave hunts" ON hunters;

ALTER TABLE hunters ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view who's hunting (for counter displays)
CREATE POLICY "hunters_select_all"
  ON hunters FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Users can join hunts
CREATE POLICY "hunters_insert_own"
  ON hunters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can leave their own hunts
CREATE POLICY "hunters_delete_own"
  ON hunters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- RAT_OF_THE_DAY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can manage rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can insert rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can update rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can delete rat of the day" ON rat_of_the_day;

-- CRITICAL: Re-enable RLS (it was disabled in fix_rat_of_the_day_simple.sql)
ALTER TABLE rat_of_the_day ENABLE ROW LEVEL SECURITY;

-- Revoke public permissions that were granted
REVOKE ALL ON rat_of_the_day FROM anon, authenticated;

-- Policy: Anyone can view
CREATE POLICY "rat_of_day_select_all"
  ON rat_of_the_day FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can insert
CREATE POLICY "rat_of_day_admin_insert"
  ON rat_of_the_day FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can update
CREATE POLICY "rat_of_day_admin_update"
  ON rat_of_the_day FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete
CREATE POLICY "rat_of_day_admin_delete"
  ON rat_of_the_day FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- BUG_REPORTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own bug reports" ON bug_reports;
DROP POLICY IF EXISTS "Users can create bug reports" ON bug_reports;
DROP POLICY IF EXISTS "Admins can view all bug reports" ON bug_reports;
DROP POLICY IF EXISTS "Admins can update bug reports" ON bug_reports;

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "bug_reports_select_own"
  ON bug_reports FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());

-- Policy: Admins can view all reports
CREATE POLICY "bug_reports_admin_select"
  ON bug_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Authenticated users can create reports
CREATE POLICY "bug_reports_insert_own"
  ON bug_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by AND status = 'open');

-- Policy: Only admins can update reports
CREATE POLICY "bug_reports_admin_update"
  ON bug_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- ADMIN_LOGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view admin logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can create admin logs" ON admin_logs;

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view logs
CREATE POLICY "admin_logs_select_admin"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can create logs
CREATE POLICY "admin_logs_insert_admin"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own achievements
CREATE POLICY "achievements_select_own"
  ON achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: System can create achievements (via backend function)
-- Note: Should be called from a secure backend function, not directly from client
CREATE POLICY "achievements_insert_system"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STREAMER_KILLS TABLE
-- ============================================================================

ALTER TABLE streamer_kills ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view streamer kills (for leaderboard)
CREATE POLICY "streamer_kills_select_all"
  ON streamer_kills FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only Proud Rats can submit kills
CREATE POLICY "streamer_kills_insert_proud_rat"
  ON streamer_kills FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.game_role = 'PR'
    )
  );

-- Policy: Users can update their own pending kills
CREATE POLICY "streamer_kills_update_own"
  ON streamer_kills FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND verified = false)
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can verify kills
CREATE POLICY "streamer_kills_admin_verify"
  ON streamer_kills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all tables have RLS enabled
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'users', 'bounties', 'bounty_claims', 'hunters',
      'rat_of_the_day', 'bug_reports', 'admin_logs',
      'achievements', 'streamer_kills'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- NOTES FOR DEVELOPERS
-- ============================================================================

-- CRITICAL SECURITY REQUIREMENTS:
--
-- 1. The application MUST use Supabase Auth (auth.uid()) for authentication
--    - DO NOT rely on localStorage for user identity
--    - DO NOT trust client-side role claims
--
-- 2. Admin functions MUST check the user's role in the database
--    - Use EXISTS queries like shown above
--    - Never trust role from client
--
-- 3. All new tables MUST have RLS enabled with appropriate policies
--
-- 4. Test policies by attempting to:
--    - Promote yourself to admin (should fail)
--    - Approve your own claims (should fail)
--    - Modify other users' data (should fail)
--    - Insert data with wrong user_id (should fail)
