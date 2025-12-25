-- Create rat_of_the_day table
CREATE TABLE IF NOT EXISTS rat_of_the_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  set_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE rat_of_the_day ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view the current Rat of the Day
CREATE POLICY "Anyone can view rat of the day"
  ON rat_of_the_day
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can insert/update Rat of the Day
CREATE POLICY "Only admins can manage rat of the day"
  ON rat_of_the_day
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rat_of_the_day_created_at ON rat_of_the_day(created_at DESC);

-- Create function to get the latest Rat of the Day
CREATE OR REPLACE FUNCTION get_latest_rat_of_the_day()
RETURNS TABLE (
  id UUID,
  youtube_url TEXT,
  youtube_video_id TEXT,
  creator_name TEXT,
  set_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM rat_of_the_day
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
