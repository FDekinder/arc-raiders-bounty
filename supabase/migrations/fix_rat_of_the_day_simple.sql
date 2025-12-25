-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can manage rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can insert rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can update rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can delete rat of the day" ON rat_of_the_day;

-- Disable RLS on this table since we're using custom auth (not Supabase Auth)
ALTER TABLE rat_of_the_day DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated and anon users
GRANT SELECT ON rat_of_the_day TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON rat_of_the_day TO authenticated, anon;

-- Note: Admin role checking will be handled at the application level
-- since this project uses custom authentication stored in localStorage
-- rather than Supabase Auth
