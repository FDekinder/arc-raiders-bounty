<!-- src/views/SteamCallbackView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createOrUpdateUser } from '@/lib/steamAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()
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

    // Store user in localStorage
    localStorage.setItem('arc_user', JSON.stringify(user))

    success('Successfully logged in!')

    // Redirect based on whether user has selected a role
    setTimeout(() => {
      if (isNewUser || !user.role) {
        // New user or no role selected - go to role selection
        router.push('/select-role')
      } else {
        // Existing user with role - go to home
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
  <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"
      ></div>
      <p class="text-xl">{{ status }}</p>
    </div>
  </div>
</template>
