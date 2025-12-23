// src/lib/auth.ts
import type { User, UserRole } from './supabase'
import { supabase } from './supabase'

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('arc_user')
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  localStorage.removeItem('arc_user')
  window.location.href = '/login'
}

/**
 * Get current Supabase auth session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export function logout() {
  localStorage.removeItem('arc_user')
  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

// Get default avatar based on user role
export function getDefaultAvatar(gameRole?: UserRole): string {
  // Randomly select from generic avatars instead of fixed defaults
  const randomIndex = Math.floor(Math.random() * GENERIC_AVATARS.length)
  return GENERIC_AVATARS[randomIndex]
}

// Get user avatar URL or default based on role
export function getUserAvatarUrl(user: User | null): string {
  if (!user) return getDefaultAvatar()
  return user.avatar_url || getDefaultAvatar(user.game_role)
}

// Available generic avatars for selection
export const GENERIC_AVATARS = [
  '/generic1.png',
  '/generic2.png',
  '/generic3.png'
]
