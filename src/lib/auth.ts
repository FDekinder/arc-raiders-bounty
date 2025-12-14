// src/lib/auth.ts
import type { User } from './supabase'

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('arc_user')
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
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
