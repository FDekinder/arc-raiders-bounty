-- Supabase RLS Policies for Arc Raiders Bounty
-- Run this in Supabase SQL Editor

-- ===== USERS TABLE =====

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert during auth" ON users;
DROP POLICY IF EXISTS "Everyone can view users" ON users;

-- Policy: Allow anonymous users to insert their own user data during signup/Steam auth
CREATE POLICY "Allow insert during auth" 
ON users FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy: Allow all users to view all user profiles (needed for leaderboard, etc)
CREATE POLICY "Everyone can view users" 
ON users FOR SELECT 
USING (true);

-- ===== BOUNTIES TABLE =====

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view bounties" ON bounties;
DROP POLICY IF EXISTS "Anyone can create bounties" ON bounties;

-- Anyone can view active bounties
CREATE POLICY "Anyone can view bounties"
ON bounties FOR SELECT
USING (true);

-- Anyone can create bounties for now (no auth requirement)
CREATE POLICY "Anyone can create bounties"
ON bounties FOR INSERT
WITH CHECK (true);

-- ===== BOUNTY_CLAIMS TABLE =====

ALTER TABLE bounty_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view claims" ON bounty_claims;
DROP POLICY IF EXISTS "Anyone can create claims" ON bounty_claims;
DROP POLICY IF EXISTS "Anyone can update claims" ON bounty_claims;

-- Anyone can view claims
CREATE POLICY "Anyone can view claims"
ON bounty_claims FOR SELECT
USING (true);

-- Anyone can create claims for now (no auth requirement)
CREATE POLICY "Anyone can create claims"
ON bounty_claims FOR INSERT
WITH CHECK (true);

-- Anyone can update claims for now
CREATE POLICY "Anyone can update claims"
ON bounty_claims FOR UPDATE
USING (true)
WITH CHECK (true);



