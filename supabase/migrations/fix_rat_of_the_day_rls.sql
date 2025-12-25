-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view rat of the day" ON rat_of_the_day;
DROP POLICY IF EXISTS "Only admins can manage rat of the day" ON rat_of_the_day;

-- Recreate policies with correct authentication context
-- Policy: Anyone can view the current Rat of the Day
CREATE POLICY "Anyone can view rat of the day"
  ON rat_of_the_day
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can insert Rat of the Day
CREATE POLICY "Only admins can insert rat of the day"
  ON rat_of_the_day
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can update Rat of the Day
CREATE POLICY "Only admins can update rat of the day"
  ON rat_of_the_day
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete Rat of the Day
CREATE POLICY "Only admins can delete rat of the day"
  ON rat_of_the_day
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
