// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Make sure this line has 'export'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type UserRole = 'BH' | 'PR' // BH = Bounty Hunter, PR = Proud Rat
export type Platform = 'steam' | 'xbox' | 'playstation'
export type KillType =
  | 'friendly_fire'
  | 'back_stabber'
  | 'loot_ambush'
  | 'extract_camper'
  | 'spawn_killer'
  | 'bait_switch'
  | 'third_party'
  | 'other'

export interface User {
  id: string
  username: string
  steam_id?: string
  email?: string
  avatar_url?: string
  platform?: Platform
  total_points: number
  bounties_completed: number
  times_hunted: number
  bounties_created: number
  hunts_joined: number
  achievements_earned: number
  kill_count: number // Total confirmed kills for Proud Rats
  created_at: string
  clan_tag?: string
  game_role?: UserRole
  role?: 'admin' | 'user' // User permission role
  subscription_tier?: 'free' | 'premium' // Subscription level for ad-free experience
  subscription_expires_at?: string // When premium subscription expires
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
  kill_type?: KillType
  kill_type_description?: string
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

export interface Kill {
  id: string
  killer_id: string
  victim_gamertag: string
  screenshot_url: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verified_by?: string
  points_awarded: number
  rejection_reason?: string
  killed_at: string
  verified_at?: string
  notes?: string
}

export interface TopKiller {
  killer_id: string
  username: string
  kill_count: number
  avatar_url?: string
  clan_tag?: string
  game_role?: UserRole
  platform?: Platform
  victims?: { victim_gamertag: string; count: number }[]
}

export interface TrophyStats {
  userId: string
  username: string
  avatar_url?: string
  clan_tag?: string
  game_role?: UserRole

  // Core stats
  totalPoints: number
  bountiesSurvived: number
  highestBountyAmount: number
  bountyHuntersDefeated: number
  activeBountyStreak: number
  mostWantedRank: number | null
  totalBountiesPlaced: number

  // Achievement stats
  totalAchievements: number
  legendaryAchievements: number
  epicAchievements: number
  rareAchievements: number
  commonAchievements: number

  // Timeline stats
  memberSince: string
  lastActivity: string

  // Notoriety level
  notorietyLevel: number
  notorietyTier: 'Rookie' | 'Known' | 'Notorious' | 'Infamous' | 'Legendary'
}
