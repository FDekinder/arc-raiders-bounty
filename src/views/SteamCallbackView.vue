<!-- src/views/SteamCallbackView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createOrUpdateUser } from '@/lib/steamAuth'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { success, error: showError } = useToast()
const { setUser } = useAuth()
const status = ref('Verifying Steam login...')

onMounted(async () => {
  try {
    // Get all URL parameters to send to backend
    const params = new URLSearchParams(window.location.search)

    status.value = 'Verifying with Steam...'

    // Call backend API to validate and get Steam profile
    // The backend handles CORS and Steam API authentication
    const response = await fetch(`/api/auth/steam/callback?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Steam authentication failed')
    }

    const { success: authSuccess, player } = await response.json()

    if (!authSuccess || !player) {
      throw new Error('No player data returned from Steam')
    }

    status.value = 'Creating your account...'

    // Create or update user in database
    const { data: user, error: dbError, isNewUser } = await createOrUpdateUser(
      player.steamId,
      player.username,
      player.avatarUrl,
    )

    if (dbError) throw dbError

    // Update reactive user state
    setUser(user)

    success('Successfully logged in!')

    // Redirect based on whether user has selected a game role
    setTimeout(() => {
      if (isNewUser || !user.game_role) {
        // New user or no game role selected - go to role selection
        router.push('/select-role')
      } else {
        // Existing user with game role - go to home
        router.push('/')
      }
    }, 1000)
  } catch (error: unknown) {
    console.error('Steam auth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    showError(errorMessage)
    status.value = 'Login failed. Redirecting...'

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="spinner"></div>
      <p class="status-text">{{ status }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-gray-100 text-white flex items-center justify-center;
}

.content-wrapper {
  @apply text-center;
}

.spinner {
  @apply animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4;
}

.status-text {
  @apply text-xl;
}
</style>
