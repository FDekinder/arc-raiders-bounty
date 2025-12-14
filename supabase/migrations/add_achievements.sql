-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hunter', 'creator', 'social', 'milestone'
  requirement_type VARCHAR(50) NOT NULL, -- 'bounties_completed', 'points_earned', 'streak', 'leaderboard_rank', etc.
  requirement_value INTEGER,
  badge_color VARCHAR(20), -- hex color for badge theming
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{}', -- for tracking partial progress
  UNIQUE(user_id, achievement_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all)
CREATE POLICY "Anyone can view achievements"
ON achievements FOR SELECT
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Anyone can view user achievements"
ON user_achievements FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert user achievements"
ON user_achievements FOR INSERT
WITH CHECK (true);

-- Seed initial achievements data
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, badge_color, rarity, points_reward) VALUES
-- Common Achievements (Beginner)
('First Blood', 'Complete your first bounty hunt', 'Target', 'hunter', 'bounties_completed', 1, '#00ff88', 'common', 10),
('Getting Started', 'Create your first bounty', 'CircleDollarSign', 'creator', 'bounties_created', 1, '#00d4ff', 'common', 5),
('Hunter Initiate', 'Join your first hunt', 'Crosshair', 'hunter', 'hunts_joined', 1, '#00d4ff', 'common', 5),

-- Rare Achievements (Intermediate)
('Sharpshooter', 'Complete 10 bounty hunts', 'Crosshair', 'hunter', 'bounties_completed', 10, '#00ff88', 'rare', 50),
('Hot Streak', 'Complete 5 bounties in 24 hours', 'Flame', 'hunter', 'streak_24h', 5, '#ff3355', 'rare', 100),
('Generous Hunter', 'Create 10 bounties', 'Gift', 'creator', 'bounties_created', 10, '#ffd500', 'rare', 50),
('Point Collector', 'Earn 500 total points', 'TrendingUp', 'milestone', 'points_earned', 500, '#ffd500', 'rare', 75),

-- Epic Achievements (Advanced)
('Veteran Hunter', 'Complete 50 bounty hunts', 'Award', 'hunter', 'bounties_completed', 50, '#ff3355', 'epic', 200),
('Big Game Hunter', 'Complete a bounty worth 1000+ points', 'Trophy', 'hunter', 'single_bounty_value', 1000, '#ff3355', 'epic', 150),
('Speed Demon', 'Complete a bounty within 1 hour of claiming', 'Zap', 'hunter', 'speed_completion', 1, '#ffd500', 'epic', 150),
('Point Master', 'Earn 2500 total points', 'Medal', 'milestone', 'points_earned', 2500, '#ffd500', 'epic', 250),
('Bounty Lord', 'Create 50 bounties', 'Crown', 'creator', 'bounties_created', 50, '#00d4ff', 'epic', 200),

-- Legendary Achievements (Expert)
('Legendary Hunter', 'Complete 100 bounty hunts', 'Crown', 'hunter', 'bounties_completed', 100, '#ffd500', 'legendary', 500),
('Point Legend', 'Earn 10000 total points', 'Star', 'milestone', 'points_earned', 10000, '#ffd500', 'legendary', 1000),
('Apex Predator', 'Reach #1 on the leaderboard', 'Trophy', 'milestone', 'leaderboard_rank', 1, '#ff3355', 'legendary', 500),
('Untouchable', 'Spend 30 consecutive days without an active bounty on you', 'Shield', 'social', 'safe_streak', 30, '#00ff88', 'legendary', 750),
('Master Benefactor', 'Create 100 bounties', 'Coins', 'creator', 'bounties_created', 100, '#00d4ff', 'legendary', 500);

-- Add achievement count, bounties created, and hunts joined to users stats
ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements_earned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bounties_created INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hunts_joined INTEGER DEFAULT 0;

-- Create RPC function to increment user achievements count
CREATE OR REPLACE FUNCTION increment_user_achievements(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET achievements_earned = achievements_earned + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to increment bounties created
CREATE OR REPLACE FUNCTION increment_bounties_created(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET bounties_created = bounties_created + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to increment hunts joined
CREATE OR REPLACE FUNCTION increment_hunts_joined(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET hunts_joined = hunts_joined + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
