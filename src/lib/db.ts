// src/lib/db.ts
import { supabase } from './supabase'

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
) {
  const { data, error } = await supabase
    .from('bounties')
    .insert({
      target_gamertag: targetGamertag,
      bounty_amount: bountyAmount,
      created_by: createdBy,
      steam_id: platformPlayerId, // Keep for backward compatibility
      platform: platform,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get active bounties
export async function getActiveBounties() {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('status', 'active')
    .order('bounty_amount', { ascending: false })

  if (error) throw error
  return data
}

// Get most wanted
export async function getMostWanted() {
  const { data, error } = await supabase.rpc('get_most_wanted')

  if (error) throw error
  return data
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
