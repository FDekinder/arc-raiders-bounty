<!-- src/views/CreateBountyView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { createBounty } from '@/lib/db'
import { useRouter } from 'vue-router'
import { Target, Search, CheckCircle, XCircle, Loader } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import { searchSteamPlayer } from '@/lib/steamAuth'

const router = useRouter()
const { success, error: showError } = useToast()

const gamertag = ref('')
const amount = ref('')
const loading = ref(false)
const error = ref('')

// Steam verification
const verifying = ref(false)
const verificationStatus = ref<'idle' | 'success' | 'error'>('idle')
const verifiedPlayer = ref<{
  steamId: string
  personaName: string
  avatarUrl: string
  profileUrl: string
} | null>(null)

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

const STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY || ''

async function verifyGamertag() {
  if (!gamertag.value.trim()) {
    showError('Please enter a gamertag')
    return
  }

  verifying.value = true
  verificationStatus.value = 'idle'
  verifiedPlayer.value = null

  try {
    const result = await searchSteamPlayer(gamertag.value.trim(), STEAM_API_KEY)

    if (result.error || !result.steamId) {
      verificationStatus.value = 'error'
      error.value = result.error || 'Player not found'
      showError(result.error || 'Player not found on Steam')
    } else {
      verificationStatus.value = 'success'
      verifiedPlayer.value = {
        steamId: result.steamId,
        personaName: result.personaName!,
        avatarUrl: result.avatarUrl!,
        profileUrl: result.profileUrl!,
      }
      // Update the gamertag field with the verified name
      gamertag.value = result.personaName!
      success('Steam player verified!')
    }
  } catch (err: any) {
    verificationStatus.value = 'error'
    error.value = err.message || 'Failed to verify player'
    showError('Failed to verify player')
  } finally {
    verifying.value = false
  }
}

async function handleSubmit() {
  error.value = ''

  // Require verification
  if (verificationStatus.value !== 'success') {
    error.value = 'Please verify the Steam player first'
    showError('Please verify the Steam player first')
    return
  }

  loading.value = true

  try {
    const bountyAmount = parseInt(amount.value)
    if (isNaN(bountyAmount) || bountyAmount < 10) {
      throw new Error('Bounty amount must be at least 10 points')
    }

    await createBounty(
      verifiedPlayer.value!.personaName,
      bountyAmount,
      userId,
      verifiedPlayer.value!.steamId,
    )

    success(`Bounty created on ${verifiedPlayer.value!.personaName} for ${bountyAmount} points!`)

    router.push('/bounties')
  } catch (err: any) {
    error.value = err.message || 'Failed to create bounty'
    showError(err.message || 'Failed to create bounty')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-2">Create Bounty</h1>
          <p class="text-gray-400">Place a bounty on another player</p>
        </div>

        <div class="bg-gray-800 rounded-lg p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Target Gamertag with Verification -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Target Player (Steam Username or ID)
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="gamertag"
                    type="text"
                    placeholder="Enter Steam username or ID..."
                    class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    required
                    @input="verificationStatus = 'idle'"
                  />
                  <div
                    v-if="verificationStatus === 'success'"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <CheckCircle class="text-green-500" :size="20" />
                  </div>
                  <div
                    v-if="verificationStatus === 'error'"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <XCircle class="text-red-500" :size="20" />
                  </div>
                </div>
                <button
                  type="button"
                  @click="verifyGamertag"
                  :disabled="verifying || !gamertag.trim()"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <Loader v-if="verifying" class="animate-spin" :size="18" />
                  <Search v-else :size="18" />
                  Verify
                </button>
              </div>

              <!-- Verified Player Card -->
              <div
                v-if="verifiedPlayer"
                class="mt-4 bg-gray-700 rounded-lg p-4 flex items-center gap-4"
              >
                <img
                  :src="verifiedPlayer.avatarUrl"
                  :alt="verifiedPlayer.personaName"
                  class="w-16 h-16 rounded-full"
                />
                <div class="flex-1">
                  <div class="font-bold text-lg">{{ verifiedPlayer.personaName }}</div>
                  <a
                    :href="verifiedPlayer.profileUrl"
                    target="_blank"
                    class="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Steam Profile →
                  </a>
                </div>
                <CheckCircle class="text-green-500" :size="32" />
              </div>

              <p class="text-sm text-gray-400 mt-2">
                We'll verify this player exists on Steam before creating the bounty
              </p>
            </div>

            <!-- Bounty Amount -->
            <div>
              <label class="block text-sm font-medium mb-2">Bounty Amount (Points)</label>
              <input
                v-model="amount"
                type="number"
                min="10"
                placeholder="Minimum 10 points"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                required
              />
              <p class="text-sm text-gray-400 mt-2">Higher bounties attract more hunters!</p>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400"
            >
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || verificationStatus !== 'success'"
              class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Target :size="20" />
              {{ loading ? 'Creating Bounty...' : 'Create Bounty' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
