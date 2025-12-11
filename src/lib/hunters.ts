// src/lib/hunters.ts
import { supabase } from './supabase'
import { checkAndAwardAchievements } from './achievements'

export async function joinHunt(
  bountyId: string,
  hunterId: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Check if user already has 3 active hunts
    const { data: currentHunts, error: countError } = await supabase
      .from('bounty_hunters')
      .select('id, bounty:bounties!inner(status)')
      .eq('hunter_id', hunterId)

    if (countError) throw countError

    // Filter for active bounties only
    const activeHunts = currentHunts?.filter((hunt: any) => hunt.bounty?.status === 'active') || []

    if (activeHunts.length >= 3) {
      return {
        success: false,
        error: 'You can only hunt 3 targets at a time. Complete or abandon one first.',
      }
    }

    // Check if already hunting this bounty
    const { data: existing } = await supabase
      .from('bounty_hunters')
      .select('id')
      .eq('bounty_id', bountyId)
      .eq('hunter_id', hunterId)
      .single()

    if (existing) {
      return {
        success: false,
        error: 'You are already hunting this target',
      }
    }

    // Join the hunt
    const { error: insertError } = await supabase.from('bounty_hunters').insert({
      bounty_id: bountyId,
      hunter_id: hunterId,
    })

    if (insertError) throw insertError

    // Increment hunts joined count
    await supabase.rpc('increment_hunts_joined', { user_id: hunterId })

    // Get updated count for achievement check
    const { data: user } = await supabase
      .from('users')
      .select('hunts_joined')
      .eq('id', hunterId)
      .single()

    // Check for hunt joining achievements
    if (user) {
      await checkAndAwardAchievements({
        type: 'hunt_joined',
        userId: hunterId,
        data: {
          totalHuntsJoined: user.hunts_joined
        }
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error joining hunt:', error)
    return {
      success: false,
      error: error.message || 'Failed to join hunt',
    }
  }
}

export async function leaveHunt(
  bountyId: string,
  hunterId: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('bounty_hunters')
      .delete()
      .eq('bounty_id', bountyId)
      .eq('hunter_id', hunterId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error leaving hunt:', error)
    return {
      success: false,
      error: error.message || 'Failed to leave hunt',
    }
  }
}

export async function getHunterCount(bountyId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('bounty_hunters')
      .select('*', { count: 'exact', head: true })
      .eq('bounty_id', bountyId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting hunter count:', error)
    return 0
  }
}

export async function isHunting(bountyId: string, hunterId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('bounty_hunters')
      .select('id')
      .eq('bounty_id', bountyId)
      .eq('hunter_id', hunterId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Error checking hunt status:', error)
    return false
  }
}

export async function getMyActiveHunts(hunterId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('bounty_hunters')
      .select('id, bounty:bounties!inner(status)')
      .eq('hunter_id', hunterId)

    if (error) throw error

    const activeHunts = data?.filter((hunt: any) => hunt.bounty?.status === 'active') || []

    return activeHunts.length
  } catch (error) {
    console.error('Error getting active hunts:', error)
    return 0
  }
}
