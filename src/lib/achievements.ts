// src/lib/achievements.ts
import { supabase, type Achievement, type UserAchievement } from './supabase'

// Achievement event types
export type AchievementEvent = {
  type: 'bounty_completed' | 'bounty_created' | 'hunt_joined' | 'points_earned' | 'leaderboard_updated' | 'speed_completion'
  userId: string
  data?: {
    bountyValue?: number
    totalPoints?: number
    totalBountiesCompleted?: number
    totalBountiesCreated?: number
    totalHuntsJoined?: number
    leaderboardRank?: number
    completionTimeMinutes?: number
    recentCompletions?: number
  }
}

/**
 * Get all achievements from the database
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('rarity', { ascending: true })
    .order('requirement_value', { ascending: true })

  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }

  return data || []
}

/**
 * Get a user's earned achievements with full achievement data
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }

  return data || []
}

/**
 * Get achievement progress for a specific user
 */
export async function getAchievementProgress(userId: string): Promise<{
  earned: UserAchievement[]
  available: Achievement[]
  earnedCount: number
  totalCount: number
  byRarity: { common: number; rare: number; epic: number; legendary: number }
}> {
  const [earned, allAchievements] = await Promise.all([
    getUserAchievements(userId),
    getAllAchievements()
  ])

  const earnedIds = new Set(earned.map(ua => ua.achievement_id))
  const available = allAchievements.filter(a => !earnedIds.has(a.id))

  const byRarity = { common: 0, rare: 0, epic: 0, legendary: 0 }
  earned.forEach(ua => {
    if (ua.achievement) {
      byRarity[ua.achievement.rarity]++
    }
  })

  return {
    earned,
    available,
    earnedCount: earned.length,
    totalCount: allAchievements.length,
    byRarity
  }
}

/**
 * Award an achievement to a user
 */
async function awardAchievement(userId: string, achievementId: string): Promise<boolean> {
  // Check if user already has this achievement
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single()

  if (existing) {
    return false // Already earned
  }

  // Award the achievement
  const { error: insertError } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString()
    })

  if (insertError) {
    console.error('Error awarding achievement:', insertError)
    return false
  }

  // Get achievement details for points reward
  const { data: achievement } = await supabase
    .from('achievements')
    .select('points_reward, name')
    .eq('id', achievementId)
    .single()

  if (achievement && achievement.points_reward > 0) {
    // Award points using the RPC function
    await supabase.rpc('increment_hunter_points', {
      hunter_id: userId,
      points: achievement.points_reward
    })
  }

  // Update user's achievement count
  await supabase.rpc('increment_user_achievements', { user_id: userId })

  return true
}

/**
 * Check and award achievements based on an event
 * Returns array of newly earned achievement names
 */
export async function checkAndAwardAchievements(event: AchievementEvent): Promise<string[]> {
  const newlyEarned: string[] = []

  // Get user's current stats
  const { data: user } = await supabase
    .from('users')
    .select('total_points, bounties_completed')
    .eq('id', event.userId)
    .single()

  if (!user) return newlyEarned

  // Get all achievements the user hasn't earned yet
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', event.userId)

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')

  if (!allAchievements) return newlyEarned

  // Check each unearnedachievement
  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue

    let shouldAward = false

    switch (achievement.requirement_type) {
      case 'bounties_completed':
        if (event.type === 'bounty_completed') {
          const completedCount = event.data?.totalBountiesCompleted ?? user.bounties_completed
          shouldAward = completedCount >= (achievement.requirement_value || 0)
        }
        break

      case 'bounties_created':
        if (event.type === 'bounty_created') {
          shouldAward = (event.data?.totalBountiesCreated || 0) >= (achievement.requirement_value || 0)
        }
        break

      case 'hunts_joined':
        if (event.type === 'hunt_joined') {
          shouldAward = (event.data?.totalHuntsJoined || 0) >= (achievement.requirement_value || 0)
        }
        break

      case 'points_earned':
        if (event.type === 'points_earned' || event.type === 'bounty_completed') {
          const totalPoints = event.data?.totalPoints ?? user.total_points
          shouldAward = totalPoints >= (achievement.requirement_value || 0)
        }
        break

      case 'single_bounty_value':
        if (event.type === 'bounty_completed') {
          shouldAward = (event.data?.bountyValue || 0) >= (achievement.requirement_value || 0)
        }
        break

      case 'leaderboard_rank':
        if (event.type === 'leaderboard_updated') {
          shouldAward = (event.data?.leaderboardRank || 999) <= (achievement.requirement_value || 1)
        }
        break

      case 'speed_completion':
        if (event.type === 'speed_completion') {
          shouldAward = (event.data?.completionTimeMinutes || 999) <= 60 // Within 1 hour
        }
        break

      case 'streak_24h':
        if (event.type === 'bounty_completed') {
          shouldAward = (event.data?.recentCompletions || 0) >= (achievement.requirement_value || 0)
        }
        break
    }

    if (shouldAward) {
      const awarded = await awardAchievement(event.userId, achievement.id)
      if (awarded) {
        newlyEarned.push(achievement.name)
      }
    }
  }

  return newlyEarned
}

/**
 * Get recently earned achievements across all users (for activity feed)
 */
export async function getRecentAchievements(limit: number = 10): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*),
      user:users(username, avatar_url)
    `)
    .order('earned_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent achievements:', error)
    return []
  }

  return data || []
}

/**
 * Get top achievements for a user (for leaderboard/profile display)
 * Returns the highest rarity achievements
 */
export async function getTopAchievements(userId: string, limit: number = 3): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement:achievements(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top achievements:', error)
    return []
  }

  const achievements = data?.map(d => d.achievement).filter(Boolean) as Achievement[]

  // Sort by rarity (legendary > epic > rare > common)
  const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
  return achievements.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
}

/**
 * Helper to check for 24-hour streak
 */
export async function checkStreak24h(userId: string): Promise<number> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('bounty_claims')
    .select('id')
    .eq('hunter_id', userId)
    .eq('verification_status', 'approved')
    .gte('verified_at', twentyFourHoursAgo)

  if (error) {
    console.error('Error checking streak:', error)
    return 0
  }

  return data?.length || 0
}

/**
 * Helper to calculate completion time for speed achievements
 */
export function calculateCompletionTime(claimedAt: string, joinedAt: string): number {
  const claimed = new Date(claimedAt).getTime()
  const joined = new Date(joinedAt).getTime()
  return Math.floor((claimed - joined) / (1000 * 60)) // Minutes
}

/**
 * Get leaderboard rank for a user
 */
export async function getUserLeaderboardRank(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('users')
    .select('id, total_points')
    .order('total_points', { ascending: false })

  if (error || !data) return 999

  const rank = data.findIndex(u => u.id === userId)
  return rank >= 0 ? rank + 1 : 999
}
