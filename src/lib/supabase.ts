// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Make sure this line has 'export'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  username: string
  steam_id?: string
  avatar_url?: string
  total_points: number
  bounties_completed: number
  times_hunted: number
  created_at: string
}

export interface Bounty {
  id: string
  target_gamertag: string
  steam_id?: string
  platform?: 'steam' | 'xbox' | 'playstation'
  bounty_amount: number
  created_by: string
  status: 'active' | 'completed' | 'expired'
  created_at: string
  expires_at: string
}

export interface BountyClaim {
  id: string
  bounty_id: string
  hunter_id: string
  screenshot_url: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verified_by?: string
  points_awarded: number
  rejection_reason?: string
  claimed_at: string
  verified_at?: string
}

export interface MostWanted {
  target_gamertag: string
  total_bounty: number
  bounty_count: number
  avatar_url?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'hunter' | 'creator' | 'social' | 'milestone'
  requirement_type: string
  requirement_value: number | null
  badge_color: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_reward: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress: Record<string, any>
  achievement?: Achievement // For joined queries
}
