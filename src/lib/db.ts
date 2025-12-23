// src/lib/db.ts
import { supabase } from './supabase'
import type { TrophyStats, TopKiller, KillType } from './supabase'
import { checkAndAwardAchievements, getUserAchievements } from './achievements'

// Create a new user
export async function createUser(username: string, steamId?: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({ username, steam_id: steamId })
    .select()
    .single()

  if (error) throw error
  return data
}

// Create a bounty
export async function createBounty(
  targetGamertag: string,
  bountyAmount: number,
  createdBy: string,
  platformPlayerId?: string,
  platform?: 'steam' | 'xbox' | 'playstation',
  killType?: KillType,
  killTypeDescription?: string,
) {
  const { data, error } = await supabase
    .from('bounties')
    .insert({
      target_gamertag: targetGamertag,
      bounty_amount: bountyAmount,
      created_by: createdBy,
      steam_id: platformPlayerId, // Keep for backward compatibility
      platform: platform,
      kill_type: killType,
      kill_type_description: killTypeDescription,
    })
    .select()
    .single()

  if (error) throw error

  // Increment bounties created count
  await supabase.rpc('increment_bounties_created', { user_id: createdBy })

  // Get updated count for achievement check
  const { data: user } = await supabase
    .from('users')
    .select('bounties_created')
    .eq('id', createdBy)
    .single()

  // Check for bounty creation achievements
  if (user) {
    await checkAndAwardAchievements({
      type: 'bounty_created',
      userId: createdBy,
      data: {
        totalBountiesCreated: user.bounties_created
      }
    })
  }

  return data
}

// Check if a bounty already exists for a target
export async function checkExistingBounty(targetGamertag: string) {
  const { data, error } = await supabase
    .from('bounties')
    .select('*, created_by_user:users!bounties_created_by_fkey(username, avatar_url)')
    .eq('target_gamertag', targetGamertag)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data
}

// Get active bounties with dynamically calculated amounts
export async function getActiveBounties() {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('status', 'active')

  if (error) throw error

  // Calculate dynamic bounty amounts for each bounty
  const bountiesWithDynamicAmounts = await Promise.all(
    (data || []).map(async (bounty) => {
      const dynamicAmount = await calculateBountyAmount(bounty.target_gamertag)
      return {
        ...bounty,
        bounty_amount: dynamicAmount,
      }
    })
  )

  // Sort by dynamic amount
  bountiesWithDynamicAmounts.sort((a, b) => b.bounty_amount - a.bounty_amount)

  return bountiesWithDynamicAmounts
}

// Get most wanted with dynamically calculated bounty amounts
export async function getMostWanted() {
  const { data, error } = await supabase.rpc('get_most_wanted')

  if (error) throw error

  // Calculate dynamic bounty amounts for each target
  const dataWithDynamicBounties = await Promise.all(
    (data || []).map(async (bounty: any) => {
      const dynamicAmount = await calculateBountyAmount(bounty.target_gamertag)
      return {
        ...bounty,
        total_bounty: dynamicAmount,
      }
    })
  )

  // Sort by total_bounty (highest bounty value = #1 Most Wanted)
  dataWithDynamicBounties.sort((a, b) => b.total_bounty - a.total_bounty)

  return dataWithDynamicBounties
}

// Get top hunters leaderboard
export async function getTopHunters() {
  const { data, error } = await supabase
    .from('users')
    .select('username, total_points, bounties_completed, avatar_url')
    .order('total_points', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}

// Submit a bounty claim
export async function submitClaim(bountyId: string, hunterId: string, screenshotUrl: string) {
  const { data, error } = await supabase
    .from('bounty_claims')
    .insert({
      bounty_id: bountyId,
      hunter_id: hunterId,
      screenshot_url: screenshotUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Upload screenshot
export async function uploadScreenshot(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('bounty-screenshots')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('bounty-screenshots').getPublicUrl(filePath)

  return data.publicUrl
}

// Get user by username
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url, game_role')
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

// Calculate notoriety tier based on stats
function calculateNotorietyTier(level: number): 'Rookie' | 'Known' | 'Notorious' | 'Infamous' | 'Legendary' {
  if (level >= 80) return 'Legendary'
  if (level >= 60) return 'Infamous'
  if (level >= 40) return 'Notorious'
  if (level >= 20) return 'Known'
  return 'Rookie'
}

// Calculate notoriety level (0-100) based on various stats
function calculateNotorietyLevel(stats: {
  totalPoints: number
  bountiesSurvived: number
  highestBountyAmount: number
  totalBountiesPlaced: number
  totalAchievements: number
  legendaryAchievements: number
}): number {
  let level = 0

  // Points contribution (max 25 points)
  level += Math.min(25, stats.totalPoints / 200)

  // Bounties survived (max 20 points)
  level += Math.min(20, stats.bountiesSurvived * 2)

  // Highest bounty amount (max 15 points)
  level += Math.min(15, stats.highestBountyAmount / 1000)

  // Total bounties placed (max 15 points)
  level += Math.min(15, stats.totalBountiesPlaced * 1.5)

  // Achievements (max 20 points)
  level += Math.min(15, stats.totalAchievements * 0.5)
  level += Math.min(5, stats.legendaryAchievements * 2)

  return Math.min(100, Math.round(level))
}

// Get trophy stats for a user
export async function getTrophyStats(userId: string): Promise<TrophyStats | null> {
  try {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) return null

    // Get all bounties placed on this user
    const { data: bountiesOnUser } = await supabase
      .from('bounties')
      .select('bounty_amount, status')
      .eq('target_gamertag', user.username)

    // Calculate bounties survived (active bounties they haven't been claimed for)
    const activeBounties = bountiesOnUser?.filter(b => b.status === 'active').length || 0
    const expiredBounties = bountiesOnUser?.filter(b => b.status === 'expired').length || 0
    const bountiesSurvived = expiredBounties

    // Get highest bounty amount
    const highestBountyAmount = bountiesOnUser?.reduce((max, b) =>
      Math.max(max, b.bounty_amount), 0) || 0

    // Get total bounties placed on them
    const totalBountiesPlaced = bountiesOnUser?.length || 0

    // Get all claims made on bounties for this user
    const { data: claimsAgainstUser } = await supabase
      .from('bounty_claims')
      .select('verification_status')
      .in('bounty_id',
        bountiesOnUser?.map(b => b.bounty_amount.toString()) || []
      )

    // Count rejected claims as "bounty hunters defeated"
    const bountyHuntersDefeated = claimsAgainstUser?.filter(
      c => c.verification_status === 'rejected'
    ).length || 0

    // Calculate active bounty streak (number of consecutive active bounties)
    const activeBountyStreak = activeBounties

    // Get most wanted rank
    const { data: mostWanted } = await supabase.rpc('get_most_wanted')
    const mostWantedRank = mostWanted?.findIndex(
      (mw: any) => mw.target_gamertag === user.username
    ) ?? -1
    const rank = mostWantedRank >= 0 ? mostWantedRank + 1 : null

    // Get achievement stats
    const userAchievements = await getUserAchievements(userId)
    const achievementsByRarity = {
      legendary: userAchievements.filter(a => a.achievement?.rarity === 'legendary').length,
      epic: userAchievements.filter(a => a.achievement?.rarity === 'epic').length,
      rare: userAchievements.filter(a => a.achievement?.rarity === 'rare').length,
      common: userAchievements.filter(a => a.achievement?.rarity === 'common').length,
    }

    // Get last activity (most recent claim or bounty created)
    const { data: recentClaims } = await supabase
      .from('bounty_claims')
      .select('claimed_at')
      .eq('hunter_id', userId)
      .order('claimed_at', { ascending: false })
      .limit(1)

    const { data: recentBounties } = await supabase
      .from('bounties')
      .select('created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastClaimDate = recentClaims?.[0]?.claimed_at
    const lastBountyDate = recentBounties?.[0]?.created_at
    const lastActivity = [lastClaimDate, lastBountyDate]
      .filter(Boolean)
      .sort()
      .reverse()[0] || user.created_at

    // Calculate notoriety level
    const totalAchievements = userAchievements.length
    const notorietyLevel = calculateNotorietyLevel({
      totalPoints: user.total_points,
      bountiesSurvived,
      highestBountyAmount,
      totalBountiesPlaced,
      totalAchievements,
      legendaryAchievements: achievementsByRarity.legendary,
    })

    const trophyStats: TrophyStats = {
      userId: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      clan_tag: user.clan_tag,
      game_role: user.game_role,

      totalPoints: user.total_points,
      bountiesSurvived,
      highestBountyAmount,
      bountyHuntersDefeated,
      activeBountyStreak,
      mostWantedRank: rank,
      totalBountiesPlaced,

      totalAchievements,
      legendaryAchievements: achievementsByRarity.legendary,
      epicAchievements: achievementsByRarity.epic,
      rareAchievements: achievementsByRarity.rare,
      commonAchievements: achievementsByRarity.common,

      memberSince: user.created_at,
      lastActivity,

      notorietyLevel,
      notorietyTier: calculateNotorietyTier(notorietyLevel),
    }

    return trophyStats
  } catch (error) {
    console.error('Error fetching trophy stats:', error)
    return null
  }
}

// Submit a kill claim
export async function submitKill(killerId: string, victimGamertag: string, screenshotUrl: string) {
  const { data, error } = await supabase
    .from('kills')
    .insert({
      killer_id: killerId,
      victim_gamertag: victimGamertag,
      screenshot_url: screenshotUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Upload kill screenshot
export async function uploadKillScreenshot(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('kill-screenshots')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('kill-screenshots').getPublicUrl(filePath)

  return data.publicUrl
}

// Get top killers leaderboard
export async function getTopKillers(limit: number = 3): Promise<TopKiller[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, kill_count, avatar_url, clan_tag, game_role, platform')
    .eq('game_role', 'PR')
    .order('kill_count', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(user => ({
    killer_id: user.id,
    username: user.username,
    kill_count: user.kill_count,
    avatar_url: user.avatar_url,
    clan_tag: user.clan_tag,
    game_role: user.game_role,
    platform: user.platform,
  }))
}

// Calculate dynamic bounty amount based on hunters who joined the hunt
export async function calculateBountyAmount(targetGamertag: string): Promise<number> {
  try {
    // Get all active bounties for this target
    const { data: bounties, error: bountyError } = await supabase
      .from('bounties')
      .select('id')
      .eq('target_gamertag', targetGamertag)
      .eq('status', 'active')

    if (bountyError) throw bountyError
    if (!bounties || bounties.length === 0) return 0

    // Get all hunters who joined these bounties
    const bountyIds = bounties.map(b => b.id)
    const { data: hunters, error: huntersError } = await supabase
      .from('bounty_hunters')
      .select('hunter_id')
      .in('bounty_id', bountyIds)

    if (huntersError) throw huntersError

    // Get unique hunter IDs
    const uniqueHunterIds = [...new Set(hunters?.map(h => h.hunter_id) || [])]

    if (uniqueHunterIds.length === 0) {
      return 0 // No hunters yet
    }

    // Get all top killers (top 10) to determine hunter rankings
    const topKillers = await getTopKillers(10)
    const topKillerIds = topKillers.map(k => k.killer_id)

    let totalBounty = 0

    // Calculate bounty based on each hunter's rank
    for (const hunterId of uniqueHunterIds) {
      const hunterRank = topKillerIds.indexOf(hunterId)

      if (hunterRank === -1) {
        // Regular hunter (not in top 10)
        totalBounty += 150
      } else if (hunterRank >= 0 && hunterRank <= 2) {
        // Top 1-3 killer
        totalBounty += 1000
      } else if (hunterRank >= 3 && hunterRank <= 9) {
        // Top 4-10 killer
        totalBounty += 500
      }
    }

    return totalBounty
  } catch (error) {
    console.error('Error calculating bounty amount:', error)
    return 0
  }
}

// Get kills for a specific user
export async function getUserKills(userId: string) {
  const { data, error } = await supabase
    .from('kills')
    .select('*')
    .eq('killer_id', userId)
    .order('killed_at', { ascending: false })

  if (error) throw error
  return data
}

// Get victim breakdown for a killer (grouped by victim with kill counts)
export async function getKillerVictimBreakdown(killerId: string): Promise<{ victim_gamertag: string; count: number }[]> {
  const { data, error } = await supabase
    .from('kills')
    .select('victim_gamertag')
    .eq('killer_id', killerId)
    .eq('verification_status', 'approved')

  if (error) throw error
  if (!data) return []

  // Group by victim and count
  const victimCounts: Record<string, number> = {}
  data.forEach((kill) => {
    const victim = kill.victim_gamertag
    victimCounts[victim] = (victimCounts[victim] || 0) + 1
  })

  // Convert to array and sort by count descending
  return Object.entries(victimCounts)
    .map(([victim_gamertag, count]) => ({ victim_gamertag, count }))
    .sort((a, b) => b.count - a.count)
}

// Get hunter count for a specific target (number of unique hunters who joined the hunt)
export async function getHunterCount(targetGamertag: string): Promise<number> {
  try {
    // Get all active bounties for this target
    const { data: bounties, error: bountyError } = await supabase
      .from('bounties')
      .select('id')
      .eq('target_gamertag', targetGamertag)
      .eq('status', 'active')

    if (bountyError) throw bountyError
    if (!bounties || bounties.length === 0) return 0

    // Get unique hunters across all bounties for this target
    const bountyIds = bounties.map(b => b.id)
    const { data: hunters, error: huntersError } = await supabase
      .from('bounty_hunters')
      .select('hunter_id')
      .in('bounty_id', bountyIds)

    if (huntersError) throw huntersError

    // Count unique hunters
    const uniqueHunters = new Set(hunters?.map(h => h.hunter_id) || [])
    return uniqueHunters.size
  } catch (error) {
    console.error('Error getting hunter count:', error)
    return 0
  }
}

// Check if a user is already hunting a specific target
export async function isUserHunting(targetGamertag: string, userId: string): Promise<boolean> {
  try {
    // Get all active bounties for this target
    const { data: bounties, error: bountyError } = await supabase
      .from('bounties')
      .select('id')
      .eq('target_gamertag', targetGamertag)
      .eq('status', 'active')

    if (bountyError) throw bountyError
    if (!bounties || bounties.length === 0) return false

    // Check if user is hunting any of these bounties
    const bountyIds = bounties.map(b => b.id)
    const { data, error } = await supabase
      .from('bounty_hunters')
      .select('id')
      .in('bounty_id', bountyIds)
      .eq('hunter_id', userId)
      .limit(1)

    if (error) throw error

    return (data && data.length > 0)
  } catch (error) {
    console.error('Error checking if user is hunting:', error)
    return false
  }
}
