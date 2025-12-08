<!-- src/views/SteamCallbackView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { extractSteamId, getSteamProfile, createOrUpdateUser } from '@/lib/steamAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()
const status = ref('Verifying Steam login...')

// Steam API key from environment
const STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY || ''

onMounted(async () => {
  try {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search)

    // Extract Steam ID
    const claimedId = params.get('openid.claimed_id')
    if (!claimedId) {
      throw new Error('No Steam ID found')
    }

    const steamId = extractSteamId(claimedId)
    if (!steamId) {
      throw new Error('Invalid Steam ID')
    }

    // Steam already verified the login when redirecting back to us
    status.value = 'Loading Steam profile...'

    // Get Steam profile info
    const profile = await getSteamProfile(steamId, STEAM_API_KEY)
    if (!profile) {
      throw new Error('Could not load Steam profile')
    }

    status.value = 'Creating your account...'

    // Create or update user in database
    const { data: user, error: dbError } = await createOrUpdateUser(
      steamId,
      profile.personaname,
      profile.avatarfull,
    )

    if (dbError) throw dbError

    // Store user in localStorage
    localStorage.setItem('arc_user', JSON.stringify(user))

    success('Successfully logged in!')

    // Redirect to bounties
    setTimeout(() => {
      router.push('/bounties')
    }, 1000)
  } catch (error: any) {
    console.error('Steam auth error:', error)
    showError(error.message || 'Login failed')
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
