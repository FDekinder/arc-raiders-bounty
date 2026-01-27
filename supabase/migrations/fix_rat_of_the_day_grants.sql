-- ============================================================================
-- FIX: Grant table permissions for rat_of_the_day
-- ============================================================================
-- The previous migration revoked ALL permissions which also removed the base
-- table access needed for RLS policies to work. RLS policies control which
-- rows can be accessed, but table-level GRANTs are still required.
-- ============================================================================

-- Grant SELECT to both authenticated and anonymous users (for viewing)
GRANT SELECT ON rat_of_the_day TO anon, authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (RLS will restrict to admins)
GRANT INSERT, UPDATE, DELETE ON rat_of_the_day TO authenticated;
