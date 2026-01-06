// This file replaces the insecure localStorage-based authentication
// with proper Supabase Auth session management

import type { User, UserRole } from './supabase'
import { supabase } from './supabase'
import type { Session, AuthError } from '@supabase/supabase-js'

/**
 * Get current authenticated user from Supabase session
 * SECURE: Uses Supabase Auth JWT, cannot be faked by client
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get the current session from Supabase Auth
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    // Fetch user profile from database
    // The user's ID comes from the JWT token (auth.uid())
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get current Supabase auth session
 * SECURE: Session managed by Supabase, stored in httpOnly cookie
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Sign in with Google OAuth
 * SECURE: Uses Supabase Auth provider
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
 * Sign in with email and password
 * SECURE: Uses Supabase Auth
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign up with email and password
 * SECURE: New users automatically get 'user' role via RLS policy
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
  gameRole: UserRole = 'BH'
) {
  // Validate password strength
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters long')
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        game_role: gameRole,
      },
    },
  })

  if (authError) throw authError

  if (!authData.user) {
    throw new Error('Failed to create user account')
  }

  // Create user profile
  // RLS policy ensures role is always 'user' for new signups
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    username,
    game_role: gameRole,
    role: 'user', // CRITICAL: Always 'user', never 'admin'
    tier: 'free',
  })

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw profileError
  }

  return authData
}

/**
 * Sign out current user
 * SECURE: Clears Supabase session
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  // Clear any localStorage remnants (from old system)
  localStorage.removeItem('arc_user')

  window.location.href = '/login'
}

/**
 * Check if user is authenticated
 * SECURE: Checks Supabase session
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession()
  return session !== null
}

/**
 * Check if current user is admin
 * SECURE: Reads role from database, validated by RLS
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Check if current user is a Proud Rat
 * SECURE: Reads game_role from database
 */
export async function isProudRat(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user?.game_role === 'PR'
  } catch {
    return false
  }
}

/**
 * Get default avatar based on user role
 */
export function getDefaultAvatar(gameRole?: UserRole): string {
  const randomIndex = Math.floor(Math.random() * GENERIC_AVATARS.length)
  const avatar = GENERIC_AVATARS[randomIndex]
  return avatar ?? '/generic1.png'
}

/**
 * Get user avatar URL or default based on role
 */
export function getUserAvatarUrl(user: User | null): string {
  if (!user) return getDefaultAvatar()
  return user.avatar_url || getDefaultAvatar(user.game_role)
}

/**
 * Available generic avatars for selection
 */
export const GENERIC_AVATARS = ['/generic1.png', '/generic2.png', '/generic3.png']

/**
 * Listen to auth state changes
 * SECURE: Subscribes to Supabase Auth events
 */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

/**
 * MIGRATION NOTE:
 *
 * Old (INSECURE) code that should be REMOVED:
 *
 * ❌ localStorage.getItem('arc_user')
 * ❌ localStorage.setItem('arc_user', ...)
 * ❌ JSON.parse(userJson)
 * ❌ Trusting user object from localStorage
 *
 * New (SECURE) code to use instead:
 *
 * ✅ const user = await getCurrentUser()
 * ✅ const { session } = await getSession()
 * ✅ const isAdmin = await isAdmin()
 * ✅ await signOut()
 *
 * ALL user data now comes from Supabase Auth (JWT tokens)
 * which cannot be forged or modified by the client.
 */
