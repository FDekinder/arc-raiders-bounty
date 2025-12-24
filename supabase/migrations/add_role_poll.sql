-- Add role poll votes table
CREATE TABLE IF NOT EXISTS public.role_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('good_guy', 'proud_rat')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.role_poll_votes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own vote
CREATE POLICY "Users can insert their own vote"
  ON public.role_poll_votes FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vote
CREATE POLICY "Users can update their own vote"
  ON public.role_poll_votes FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view vote counts
CREATE POLICY "Anyone can view votes"
  ON public.role_poll_votes FOR SELECT
  TO public
  USING (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_role_poll_votes_user_id ON public.role_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_role_poll_votes_vote ON public.role_poll_votes(vote);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_role_poll_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_poll_votes_updated_at
  BEFORE UPDATE ON public.role_poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_role_poll_votes_updated_at();
