-- Create bug_reports table for user bug reports and feature requests
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  bug_type TEXT NOT NULL CHECK (bug_type IN ('bug', 'feature', 'improvement', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_bug_type ON public.bug_reports(bug_type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone (including anonymous) to insert bug reports
CREATE POLICY "Anyone can submit bug reports"
  ON public.bug_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own bug reports
CREATE POLICY "Users can view own bug reports"
  ON public.bug_reports
  FOR SELECT
  TO public
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all bug reports
CREATE POLICY "Admins can view all bug reports"
  ON public.bug_reports
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update bug reports
CREATE POLICY "Admins can update bug reports"
  ON public.bug_reports
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can delete bug reports
CREATE POLICY "Admins can delete bug reports"
  ON public.bug_reports
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bug_report_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status IN ('resolved', 'closed', 'wont_fix') AND OLD.status NOT IN ('resolved', 'closed', 'wont_fix') THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bug_report_timestamp
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_bug_report_updated_at();
