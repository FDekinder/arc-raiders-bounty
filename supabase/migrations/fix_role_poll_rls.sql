-- Fix RLS policies for role_poll_votes to work with custom auth
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own vote" ON public.role_poll_votes;
DROP POLICY IF EXISTS "Users can update their own vote" ON public.role_poll_votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.role_poll_votes;

-- Allow anyone to insert votes (validation happens in app)
CREATE POLICY "Anyone can insert votes"
  ON public.role_poll_votes FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update votes (validation happens in app)
CREATE POLICY "Anyone can update votes"
  ON public.role_poll_votes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow everyone to view vote counts
CREATE POLICY "Anyone can view votes"
  ON public.role_poll_votes FOR SELECT
  TO public
  USING (true);
