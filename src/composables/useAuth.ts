import { ref, computed } from 'vue'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Global reactive user state
const currentUser = ref<User | null>(null)

// Initialize from localStorage
const userJson = localStorage.getItem('arc_user')
if (userJson) {
  try {
    currentUser.value = JSON.parse(userJson)
  } catch {
    currentUser.value = null
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  function setUser(user: User | null) {
    currentUser.value = user
    if (user) {
      localStorage.setItem('arc_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('arc_user')
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }

    setUser(null)
    window.location.href = '/login'
  }

  async function refreshUser() {
    const userJson = localStorage.getItem('arc_user')
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        currentUser.value = user
      } catch {
        currentUser.value = null
      }
    }
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isAdmin,
    setUser,
    logout,
    refreshUser
  }
}
