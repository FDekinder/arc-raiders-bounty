// src/lib/adminUtils.ts
import { supabase } from './supabase'

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) return false
    return data?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function promoteUserToAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)

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
    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId)

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
): Promise<boolean> {
  try {
    const { data: claim, error: claimError } = await supabase
      .from('bounty_claims')
      .select('bounty_id, hunter_id')
      .eq('id', claimId)
      .single()

    if (claimError) throw claimError

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

    // Log the action
    await logAdminAction('approve_claim', 'bounty_claims', claimId, {
      status: 'approved',
      points_awarded: pointsAwarded,
    })

    return true
  } catch (error) {
    console.error('Error approving claim:', error)
    return false
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
