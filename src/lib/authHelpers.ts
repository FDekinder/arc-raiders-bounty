import { supabase } from './supabase'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

/**
 * Ensures a user profile exists in the users table
 * If not, creates one automatically from auth user data
 */
export async function ensureUserProfile(authUser: SupabaseAuthUser) {
  try {
    // Check if user exists in users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // If user already exists, return it
    if (existingUser && !fetchError) {
      return { data: existingUser, error: null }
    }

    // Determine platform from auth metadata
    let platform = 'google'
    if (authUser.app_metadata?.provider === 'steam') {
      platform = 'steam'
    } else if (authUser.app_metadata?.provider === 'email') {
      platform = 'email'
    }

    // Extract username from auth data
    let username = authUser.email?.split('@')[0] || 'User'
    if (authUser.user_metadata?.full_name) {
      username = authUser.user_metadata.full_name
    } else if (authUser.user_metadata?.name) {
      username = authUser.user_metadata.name
    } else if (authUser.user_metadata?.personaname) {
      // Steam username
      username = authUser.user_metadata.personaname
    }

    // Extract avatar URL from auth data
    let avatarUrl = null
    if (authUser.user_metadata?.avatar_url) {
      avatarUrl = authUser.user_metadata.avatar_url
    } else if (authUser.user_metadata?.picture) {
      // Google profile picture
      avatarUrl = authUser.user_metadata.picture
    } else if (authUser.user_metadata?.avatarfull) {
      // Steam avatar
      avatarUrl = authUser.user_metadata.avatarfull
    }

    // Create new user profile
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        username: username,
        avatar_url: avatarUrl,
        platform: platform,
        steam_id: authUser.user_metadata?.steamid || null,
        total_points: 0,
        bounties_completed: 0,
        times_hunted: 0,
        bounties_created: 0,
        hunts_joined: 0,
        achievements_earned: 0,
        kill_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return { data: null, error: insertError }
    }

    return { data: newUser, error: null }
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error)
    return { data: null, error }
  }
}

/**
 * Get user profile from database by auth ID
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

/**
 * Safe user update type - only fields users are allowed to update themselves
 */
type SafeUserUpdate = Partial<{
  avatar_url: string | null
  clan_tag: string | null
  username: string
}>

/**
 * Update user profile data
 * Only allows specific fields to be updated to prevent privilege escalation
 */
export async function updateUserProfile(userId: string, updates: SafeUserUpdate) {
  // Explicitly pick only allowed fields to prevent privilege escalation
  const safeUpdates: SafeUserUpdate = {}
  if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url
  if (updates.clan_tag !== undefined) safeUpdates.clan_tag = updates.clan_tag
  if (updates.username !== undefined) safeUpdates.username = updates.username

  const { data, error } = await supabase
    .from('users')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

/**
 * Internal system update type - for server-side operations only
 * This should NOT be exposed to client-side user input
 */
type SystemUserUpdate = Partial<{
  platform: string
}>

/**
 * Internal function to update user system fields
 * Only for server-side operations (e.g., linking auth providers)
 */
async function updateUserSystemFields(userId: string, updates: SystemUserUpdate) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

/**
 * Link auth provider to existing account
 * This allows users to sign in with multiple methods
 */
export async function linkAuthProvider(userId: string, provider: string, providerId: string) {
  // This would require custom logic depending on your use case
  // For now, we just track the platform in the users table
  return updateUserSystemFields(userId, { platform: provider })
}
