// src/lib/bountyExpiration.ts
import { supabase } from './supabase'

export async function checkAndExpireBounties() {
  try {
    const now = new Date().toISOString()

    // Find all active bounties that have expired
    const { data: expiredBounties, error: fetchError } = await supabase
      .from('bounties')
      .select('id, target_gamertag')
      .eq('status', 'active')
      .lt('expires_at', now)

    if (fetchError) throw fetchError

    if (!expiredBounties || expiredBounties.length === 0) {
      return { expired: 0, bounties: [] }
    }

    // Update all expired bounties to 'expired' status
    const { error: updateError } = await supabase
      .from('bounties')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', now)

    if (updateError) throw updateError

    console.log(`Expired ${expiredBounties.length} bounties`)

    return {
      expired: expiredBounties.length,
      bounties: expiredBounties,
    }
  } catch (error) {
    console.error('Error expiring bounties:', error)
    return { expired: 0, bounties: [], error }
  }
}

export async function extendBounty(bountyId: string, additionalDays: number = 7) {
  try {
    // Get current bounty
    const { data: bounty, error: fetchError } = await supabase
      .from('bounties')
      .select('expires_at, status')
      .eq('id', bountyId)
      .single()

    if (fetchError) throw fetchError

    if (bounty.status !== 'active') {
      throw new Error('Can only extend active bounties')
    }

    // Calculate new expiration date
    const currentExpiry = new Date(bounty.expires_at)
    const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000)

    // Update bounty
    const { data, error: updateError } = await supabase
      .from('bounties')
      .update({ expires_at: newExpiry.toISOString() })
      .eq('id', bountyId)
      .select()
      .single()

    if (updateError) throw updateError

    return { data, error: null }
  } catch (error: any) {
    console.error('Error extending bounty:', error)
    return { data: null, error }
  }
}

export function getTimeRemaining(expiresAt: string): {
  days: number
  hours: number
  minutes: number
  isExpired: boolean
  totalHours: number
} {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true, totalHours: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const totalHours = Math.floor(diff / (1000 * 60 * 60))

  return { days, hours, minutes, isExpired: false, totalHours }
}

export function getExpirationColor(expiresAt: string): string {
  const { totalHours, isExpired } = getTimeRemaining(expiresAt)

  if (isExpired) return 'text-gray-500'
  if (totalHours <= 24) return 'text-red-500'
  if (totalHours <= 72) return 'text-yellow-500'
  return 'text-gray-400'
}
