<!-- src/views/CreateBountyView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { createBounty } from '@/lib/db'
import { useRouter } from 'vue-router'
import { Target, Search, CheckCircle, XCircle, Loader } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import { verifyPlayer, type Platform, type PlayerVerification } from '@/lib/platformVerification'

const router = useRouter()
const { success, error: showError } = useToast()

const gamertag = ref('')
const amount = ref('')
const loading = ref(false)
const error = ref('')
const selectedPlatform = ref<Platform>('steam')

// Verification
const verifying = ref(false)
const verificationStatus = ref<'idle' | 'success' | 'error'>('idle')
const verifiedPlayer = ref<PlayerVerification | null>(null)

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

const platforms = [
  { value: 'steam', label: 'Steam', icon: '🎮' },
  { value: 'xbox', label: 'Xbox', icon: '🎯' },
  { value: 'playstation', label: 'PlayStation', icon: '🎮' },
]

async function verifyGamertag() {
  if (!gamertag.value.trim()) {
    showError('Please enter a username/gamertag')
    return
  }

  verifying.value = true
  verificationStatus.value = 'idle'
  verifiedPlayer.value = null

  try {
    const result = await verifyPlayer(gamertag.value.trim(), selectedPlatform.value)

    if (result.error || !result.playerId) {
      verificationStatus.value = 'error'
      error.value = result.error || 'Player not found'
      showError(result.error || 'Player not found')
    } else {
      verificationStatus.value = 'success'
      verifiedPlayer.value = result
      // Update the gamertag field with the verified name
      gamertag.value = result.displayName
      success(
        `${platforms.find((p) => p.value === selectedPlatform.value)?.label} player verified!`,
      )
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
    error.value = 'Please verify the player first'
    showError('Please verify the player first')
    return
  }

  loading.value = true

  try {
    const bountyAmount = parseInt(amount.value)
    if (isNaN(bountyAmount) || bountyAmount < 10) {
      throw new Error('Bounty amount must be at least 10 points')
    }

    // Create bounty with platform info
    await createBounty(
      verifiedPlayer.value!.displayName,
      bountyAmount,
      userId,
      verifiedPlayer.value!.playerId,
      verifiedPlayer.value!.platform,
    )

    success(`Bounty created on ${verifiedPlayer.value!.displayName} for ${bountyAmount} points!`)

    router.push('/bounties')
  } catch (err: any) {
    error.value = err.message || 'Failed to create bounty'
    showError(err.message || 'Failed to create bounty')
  } finally {
    loading.value = false
  }
}

function handlePlatformChange() {
  // Reset verification when platform changes
  verificationStatus.value = 'idle'
  verifiedPlayer.value = null
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
            <!-- Platform Selection -->
            <div>
              <label class="block text-sm font-medium mb-2">Platform</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="platform in platforms"
                  :key="platform.value"
                  type="button"
                  @click="
                    selectedPlatform = platform.value as Platform
                    handlePlatformChange()
                  "
                  :class="[
                    'p-4 rounded-lg border-2 transition font-semibold flex flex-col items-center gap-2',
                    selectedPlatform === platform.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 hover:border-gray-500',
                  ]"
                >
                  <span class="text-2xl">{{ platform.icon }}</span>
                  <span>{{ platform.label }}</span>
                </button>
              </div>
            </div>

            <!-- Target Player with Verification -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Target Player
                <span class="text-gray-400 text-xs ml-2">
                  ({{ platforms.find((p) => p.value === selectedPlatform)?.label }} username/ID)
                </span>
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="gamertag"
                    type="text"
                    placeholder="Enter username or ID..."
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
                  v-if="verifiedPlayer.avatarUrl"
                  :src="verifiedPlayer.avatarUrl"
                  :alt="verifiedPlayer.displayName"
                  class="w-16 h-16 rounded-full"
                />
                <div
                  class="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl"
                  v-else
                >
                  {{ platforms.find((p) => p.value === selectedPlatform)?.icon }}
                </div>
                <div class="flex-1">
                  <div class="font-bold text-lg">{{ verifiedPlayer.displayName }}</div>
                  <div class="text-sm text-gray-400">
                    {{ platforms.find((p) => p.value === selectedPlatform)?.label }}
                  </div>
                  <a
                    v-if="verifiedPlayer.profileUrl"
                    :href="verifiedPlayer.profileUrl"
                    target="_blank"
                    class="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Profile →
                  </a>
                </div>
                <CheckCircle class="text-green-500" :size="32" />
              </div>

              <p class="text-sm text-gray-400 mt-2">
                We'll verify this player exists on
                {{ platforms.find((p) => p.value === selectedPlatform)?.label }}
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
