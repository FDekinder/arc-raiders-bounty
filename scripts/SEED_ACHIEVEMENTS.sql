-- Run this SQL in your Supabase SQL Editor to seed achievements
-- Then run the grant-achievements.ts script

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
('Master Benefactor', 'Create 100 bounties', 'Coins', 'creator', 'bounties_created', 100, '#00d4ff', 'legendary', 500)
ON CONFLICT DO NOTHING;
