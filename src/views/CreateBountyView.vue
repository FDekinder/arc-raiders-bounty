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
  <div class="page-container">
    <div class="content-wrapper">
      <div class="content-inner">
        <div class="header">
          <h1 class="title">Create Bounty</h1>
          <p class="subtitle">Place a bounty on another player</p>
        </div>

        <div class="form-card">
          <form @submit.prevent="handleSubmit" class="form-content">
            <!-- Platform Selection -->
            <div class="form-section">
              <label class="form-label">Platform</label>
              <div class="platform-grid">
                <button
                  v-for="platform in platforms"
                  :key="platform.value"
                  type="button"
                  @click="
                    selectedPlatform = platform.value as Platform;
                    handlePlatformChange()
                  "
                  :class="[
                    'platform-btn',
                    selectedPlatform === platform.value ? 'platform-btn-active' : 'platform-btn-inactive'
                  ]"
                >
                  <span class="platform-icon">{{ platform.icon }}</span>
                  <span>{{ platform.label }}</span>
                </button>
              </div>
            </div>

            <!-- Target Player with Verification -->
            <div class="form-section">
              <label class="form-label">
                Target Player
                <span class="platform-hint">
                  ({{ platforms.find((p) => p.value === selectedPlatform)?.label }} username/ID)
                </span>
              </label>
              <div class="input-group">
                <div class="input-wrapper">
                  <input
                    v-model="gamertag"
                    type="text"
                    placeholder="Enter username or ID..."
                    class="input-field"
                    required
                    @input="verificationStatus = 'idle'"
                  />
                  <div v-if="verificationStatus === 'success'" class="input-icon">
                    <CheckCircle class="icon-success" :size="20" />
                  </div>
                  <div v-if="verificationStatus === 'error'" class="input-icon">
                    <XCircle class="icon-error" :size="20" />
                  </div>
                </div>
                <button
                  type="button"
                  @click="verifyGamertag"
                  :disabled="verifying || !gamertag.trim()"
                  class="verify-btn"
                >
                  <Loader v-if="verifying" class="spinner" :size="18" />
                  <Search v-else :size="18" />
                  Verify
                </button>
              </div>

              <!-- Verified Player Card -->
              <div v-if="verifiedPlayer" class="player-card">
                <img
                  v-if="verifiedPlayer.avatarUrl"
                  :src="verifiedPlayer.avatarUrl"
                  :alt="verifiedPlayer.displayName"
                  class="player-avatar"
                />
                <div v-else class="player-avatar-placeholder">
                  {{ platforms.find((p) => p.value === selectedPlatform)?.icon }}
                </div>
                <div class="player-info">
                  <div class="player-name">{{ verifiedPlayer.displayName }}</div>
                  <div class="player-platform">
                    {{ platforms.find((p) => p.value === selectedPlatform)?.label }}
                  </div>
                  <a
                    v-if="verifiedPlayer.profileUrl && selectedPlatform !== 'xbox'"
                    :href="verifiedPlayer.profileUrl"
                    target="_blank"
                    class="player-link"
                  >
                    View Profile →
                  </a>
                </div>
                <CheckCircle class="verified-icon" :size="32" />
              </div>

              <p class="help-text">
                We'll verify this player exists on
                {{ platforms.find((p) => p.value === selectedPlatform)?.label }}
              </p>
            </div>

            <!-- Bounty Amount -->
            <div class="form-section">
              <label class="form-label">Bounty Amount (Points)</label>
              <input
                v-model="amount"
                type="number"
                min="10"
                placeholder="Minimum 10 points"
                class="input-field"
                required
              />
              <p class="help-text">Higher bounties attract more hunters!</p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-alert">
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || verificationStatus !== 'success'"
              class="submit-btn"
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

<style scoped>
.page-container {
  @apply min-h-screen bg-arc-dark text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8;
}

.content-inner {
  @apply max-w-2xl mx-auto;
}

.header {
  @apply mb-8;
}

.title {
  @apply text-4xl font-bold mb-2;
}

.subtitle {
  @apply text-gray-400;
}

.form-card {
  @apply bg-arc-navy rounded-lg p-8;
}

.form-content {
  @apply space-y-6;
}

.form-section {
  @apply;
}

.form-label {
  @apply block text-sm font-medium mb-2;
}

.platform-grid {
  @apply grid grid-cols-3 gap-3;
}

.platform-btn {
  @apply p-4 rounded-lg border-2 transition font-semibold flex flex-col items-center gap-2;
}

.platform-btn-active {
  @apply border-arc-red bg-arc-red/10;
}

.platform-btn-inactive {
  @apply border-gray-600 hover:border-gray-500;
}

.platform-icon {
  @apply text-2xl;
}

.platform-hint {
  @apply text-gray-400 text-xs ml-2;
}

.input-group {
  @apply flex gap-2;
}

.input-wrapper {
  @apply flex-1 relative;
}

.input-field {
  @apply w-full bg-gray-700 border border-arc-red/30 rounded-lg px-4 py-3 focus:outline-none focus:border-arc-red;
}

.input-icon {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2;
}

.icon-success {
  @apply text-arc-green;
}

.icon-error {
  @apply text-arc-red;
}

.verify-btn {
  @apply bg-arc-red hover:bg-arc-red/80 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition;
}

.spinner {
  @apply animate-spin;
}

.player-card {
  @apply mt-4 bg-gray-700 rounded-lg p-4 flex items-center gap-4;
}

.player-avatar {
  @apply w-16 h-16 rounded-full;
}

.player-avatar-placeholder {
  @apply w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl;
}

.player-info {
  @apply flex-1;
}

.player-name {
  @apply font-bold text-lg;
}

.player-platform {
  @apply text-sm text-gray-400;
}

.player-link {
  @apply text-sm text-arc-red hover:text-arc-red/80;
}

.verified-icon {
  @apply text-arc-green;
}

.help-text {
  @apply text-sm text-gray-400 mt-2;
}

.error-alert {
  @apply bg-arc-red/10 border border-arc-red rounded-lg p-4 text-arc-red;
}

.submit-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition;
}
</style>
