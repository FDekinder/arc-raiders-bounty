// src/lib/adminUtils.ts
import { supabase } from './supabase'
import { checkAndAwardAchievements, checkStreak24h, calculateCompletionTime } from './achievements'

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single()

    if (error) return false
    return data?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function promoteUserToAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').update({ role: 'admin' }).eq('id', userId)

    if (error) {
      console.error('Error promoting user:', error)
      return false
    }

    // Log the action
    await logAdminAction('promote_user', 'users', userId, { role: 'admin' })
    return true
  } catch (error) {
    console.error('Error in promoteUserToAdmin:', error)
    return false
  }
}

export async function demoteAdminToUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').update({ role: 'user' }).eq('id', userId)

    if (error) {
      console.error('Error demoting user:', error)
      return false
    }

    // Log the action
    await logAdminAction('demote_user', 'users', userId, { role: 'user' })
    return true
  } catch (error) {
    console.error('Error in demoteAdminToUser:', error)
    return false
  }
}

export async function approveBountyClaim(
  claimId: string,
  verifierId: string,
  pointsAwarded: number,
): Promise<{ success: boolean; achievements?: string[] }> {
  try {
    const { data: claim, error: claimError } = await supabase
      .from('bounty_claims')
      .select('bounty_id, hunter_id, claimed_at')
      .eq('id', claimId)
      .single()

    if (claimError) throw claimError

    // Get bounty details and join time
    const { data: bounty } = await supabase
      .from('bounties')
      .select('bounty_amount')
      .eq('id', claim.bounty_id)
      .single()

    const { data: hunter } = await supabase
      .from('bounty_hunters')
      .select('started_hunting_at')
      .eq('bounty_id', claim.bounty_id)
      .eq('hunter_id', claim.hunter_id)
      .single()

    // Update claim status
    const { error: updateError } = await supabase
      .from('bounty_claims')
      .update({
        verification_status: 'approved',
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
        points_awarded: pointsAwarded,
      })
      .eq('id', claimId)

    if (updateError) throw updateError

    // Update bounty to completed
    const { error: bountyError } = await supabase
      .from('bounties')
      .update({ status: 'completed' })
      .eq('id', claim.bounty_id)

    if (bountyError) throw bountyError

    // Award points to hunter
    const { error: pointsError } = await supabase.rpc('increment_hunter_points', {
      hunter_id: claim.hunter_id,
      points: pointsAwarded,
    })

    if (pointsError) console.warn('Could not increment points:', pointsError)

    // Get updated user stats for achievements
    const { data: user } = await supabase
      .from('users')
      .select('total_points, bounties_completed')
      .eq('id', claim.hunter_id)
      .single()

    // Check for 24h streak
    const recentCompletions = await checkStreak24h(claim.hunter_id)

    // Calculate completion time for speed achievement
    let completionTimeMinutes = 999
    if (hunter?.started_hunting_at) {
      completionTimeMinutes = calculateCompletionTime(claim.claimed_at, hunter.started_hunting_at)
    }

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements({
      type: 'bounty_completed',
      userId: claim.hunter_id,
      data: {
        bountyValue: bounty?.bounty_amount || 0,
        totalPoints: user?.total_points || 0,
        totalBountiesCompleted: user?.bounties_completed || 0,
        recentCompletions,
        completionTimeMinutes
      }
    })

    // Check for speed completion separately if applicable
    if (completionTimeMinutes <= 60) {
      const speedAchievements = await checkAndAwardAchievements({
        type: 'speed_completion',
        userId: claim.hunter_id,
        data: { completionTimeMinutes }
      })
      newAchievements.push(...speedAchievements)
    }

    // Log the action
    await logAdminAction('approve_claim', 'bounty_claims', claimId, {
      status: 'approved',
      points_awarded: pointsAwarded,
    })

    return { success: true, achievements: newAchievements }
  } catch (error) {
    console.error('Error approving claim:', error)
    return { success: false }
  }
}

export async function rejectBountyClaim(
  claimId: string,
  verifierId: string,
  reason: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bounty_claims')
      .update({
        verification_status: 'rejected',
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', claimId)

    if (error) throw error

    // Log the action
    await logAdminAction('reject_claim', 'bounty_claims', claimId, {
      status: 'rejected',
      reason,
    })

    return true
  } catch (error) {
    console.error('Error rejecting claim:', error)
    return false
  }
}

export async function logAdminAction(
  action: string,
  targetTable: string,
  targetId: string,
  changes: Record<string, unknown>,
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    await supabase.from('admin_logs').insert({
      admin_id: user.user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      changes,
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

export async function getAdminLogs(limit = 50): Promise<
  Array<{
    id: string
    admin_id: string
    action: string
    target_table: string
    target_id: string
    changes: Record<string, unknown>
    created_at: string
  }>
> {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return []
  }
}
