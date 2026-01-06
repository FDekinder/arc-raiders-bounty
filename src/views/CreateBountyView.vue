<script setup lang="ts">
import { ref } from 'vue'
import { createBounty, checkExistingBounty } from '@/lib/db'
import { useRouter } from 'vue-router'
import { Target } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import LoginPromptModal from '@/components/LoginPromptModal.vue'
import type { Platform } from '@/lib/platformVerification'
import type { KillType } from '@/components/KillTypeBadge.vue'
import { useSEO, seoConfigs } from '@/composables/useSEO'

useSEO(seoConfigs.createBounty)

const router = useRouter()
const { success, error: showError } = useToast()
const { currentUser } = useAuth()

const gamertag = ref('')
const embarkId = ref('')
const loading = ref(false)
const error = ref('')
const selectedPlatform = ref<Platform>('steam')
const selectedKillType = ref<KillType | ''>('')
const otherDescription = ref('')

// Existing bounty check
const showExistingBountyModal = ref(false)
const existingBounty = ref<any>(null)

// Login prompt for guests
const showLoginPrompt = ref(false)

const platforms = [
  { value: 'steam', label: 'Steam', icon: '🎮' },
  { value: 'xbox', label: 'Xbox', icon: '🎯' },
  { value: 'playstation', label: 'PlayStation', icon: '🎮' },
]

const killTypes = [
  {
    value: 'friendly_fire' as const,
    emoji: '🤝',
    label: 'Friendly Fire Betrayal',
    description: 'Killed after saying friendly/truce',
  },
  {
    value: 'back_stabber' as const,
    emoji: '🔫',
    label: 'Back Stabber',
    description: 'Shot player in the back',
  },
  {
    value: 'loot_ambush' as const,
    emoji: '📦',
    label: 'Loot Ambush',
    description: 'Killed while looting/inventory open',
  },
  {
    value: 'extract_camper' as const,
    emoji: '🚪',
    label: 'Extract Camper',
    description: 'Waiting at extract to ambush',
  },
  {
    value: 'spawn_killer' as const,
    emoji: '🎯',
    label: 'Spawn Killer',
    description: 'Killed immediately after spawn',
  },
  {
    value: 'bait_switch' as const,
    emoji: '🎣',
    label: 'Bait & Switch',
    description: 'Pretended to help then killed',
  },
  {
    value: 'third_party' as const,
    emoji: '⚡',
    label: 'Third Party Vulture',
    description: 'Killed while fighting someone else',
  },
  {
    value: 'other' as const,
    emoji: '🗺️',
    label: 'Other',
    description: 'Other griefing behavior',
  },
]

async function handleSubmit() {
  error.value = ''

  // Check if user is logged in
  if (!currentUser.value) {
    showLoginPrompt.value = true
    return
  }

  // Validate gamertag
  if (!gamertag.value.trim()) {
    error.value = 'Please enter a username/gamertag'
    showError('Please enter a username/gamertag')
    return
  }

  // Require kill type selection
  if (!selectedKillType.value) {
    error.value = 'Please select a kill type/betrayal category'
    showError('Please select a kill type/betrayal category')
    return
  }

  loading.value = true

  try {
    const targetGamertag = gamertag.value.trim()

    // Check if bounty already exists for this target
    const existing = await checkExistingBounty(targetGamertag)

    if (existing) {
      // Bounty already exists - show modal instead of creating
      existingBounty.value = existing
      showExistingBountyModal.value = true
      loading.value = false
      return
    }

    // Create bounty with platform info and kill type
    // Bounty amount will be calculated dynamically based on hunters
    // Using 1 as placeholder since DB requires bounty_amount > 0
    await createBounty(
      targetGamertag,
      1, // Placeholder - actual amount calculated dynamically
      currentUser.value.id,
      undefined, // No player ID verification
      selectedPlatform.value,
      selectedKillType.value as KillType,
      selectedKillType.value === 'other' ? otherDescription.value : undefined,
    )

    success(`Bounty created on ${targetGamertag}! Reward will be calculated based on hunters.`)

    router.push('/bounties')
  } catch (err: any) {
    error.value = err.message || 'Failed to create bounty'
    showError(err.message || 'Failed to create bounty')
  } finally {
    loading.value = false
  }
}

function joinTheHunt() {
  showExistingBountyModal.value = false
  success(`You've joined the hunt for ${gamertag.value.trim()}!`)
  router.push('/bounties')
}

function closeModal() {
  showExistingBountyModal.value = false
  existingBounty.value = null
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
                  @click="selectedPlatform = platform.value as Platform"
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

            <!-- Kill Type / Betrayal Category -->
            <div class="form-section">
              <label class="form-label">Kill Type / Betrayal Category</label>
              <p class="help-text mb-3">Select why this bounty is being placed</p>
              <div class="kill-type-grid">
                <button
                  v-for="killType in killTypes"
                  :key="killType.value"
                  type="button"
                  @click="selectedKillType = killType.value"
                  :class="[
                    'kill-type-card',
                    selectedKillType === killType.value ? 'kill-type-card-active' : 'kill-type-card-inactive'
                  ]"
                >
                  <div class="kill-type-icon">{{ killType.emoji }}</div>
                  <div class="kill-type-content">
                    <div class="kill-type-label">{{ killType.label }}</div>
                    <div class="kill-type-description">{{ killType.description }}</div>
                  </div>
                </button>
              </div>

              <!-- Other Description (shown when "Other" is selected) -->
              <div v-if="selectedKillType === 'other'" class="mt-3">
                <label class="form-label text-sm">Describe the griefing behavior (optional)</label>
                <textarea
                  v-model="otherDescription"
                  placeholder="Briefly describe what happened..."
                  class="input-field"
                  rows="3"
                  maxlength="200"
                ></textarea>
                <p class="help-text mt-1">{{ otherDescription.length }}/200 characters</p>
              </div>
            </div>

            <!-- Target Player -->
            <div class="form-section">
              <label class="form-label">
                Target Player
                <span class="platform-hint">
                  ({{ platforms.find((p) => p.value === selectedPlatform)?.label }} username/ID)
                </span>
              </label>
              <input
                v-model="gamertag"
                type="text"
                placeholder="Enter username or gamertag..."
                class="input-field"
                required
              />
              <p class="help-text">
                Enter the player's {{ platforms.find((p) => p.value === selectedPlatform)?.label }} username or gamertag
              </p>
            </div>

            <!-- Embark ID -->
            <div class="form-section">
              <label class="form-label">
                Embark ID
                <span class="text-arc-brown text-xs ml-2">(Optional)</span>
              </label>
              <input
                v-model="embarkId"
                type="text"
                placeholder="Paste Embark ID here..."
                class="input-field font-mono"
                maxlength="100"
              />
              <p class="help-text">
                Copy and paste the player's Embark ID if you have it. This helps with accurate player identification.
              </p>
            </div>

            <!-- Dynamic Bounty Explanation -->
            <div class="form-section">
              <div class="info-box">
                <h3 class="info-title">🎯 Dynamic Bounty System</h3>
                <p class="info-text">
                  The bounty reward is calculated automatically based on who is hunting this target:
                </p>
                <ul class="info-list">
                  <li><strong>Top 1-3 Killers:</strong> +1000 points each</li>
                  <li><strong>Top 4-10 Killers:</strong> +500 points each</li>
                  <li><strong>Regular Hunters:</strong> +150 points each</li>
                </ul>
                <p class="info-text-small">
                  The more hunters, the higher the reward! Rankings update in real-time.
                </p>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-alert">
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
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

  <!-- Existing Bounty Modal -->
  <div v-if="showExistingBountyModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">🎯 Bounty Already Exists</h2>
      </div>

      <div class="modal-body">
        <p class="modal-message">
          A bounty already exists for <strong>{{ gamertag }}</strong>.
        </p>

        <p class="modal-submessage">
          Would you like to join the hunt instead?
        </p>

        <div class="bounty-info-box">
          <div class="info-row">
            <span class="info-label">Target:</span>
            <span class="info-value">{{ existingBounty?.target_gamertag }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Created by:</span>
            <span class="info-value">{{ existingBounty?.created_by_user?.username || 'Unknown' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value status-active">Active</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="joinTheHunt" class="btn-join">
          Join the Hunt
        </button>
        <button @click="closeModal" class="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- Login Prompt Modal -->
  <LoginPromptModal :show="showLoginPrompt" @close="showLoginPrompt = false" />
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-6 sm:py-8;
}

.content-inner {
  @apply max-w-2xl mx-auto;
}

.header {
  @apply mb-6 sm:mb-8;
}

.title {
  @apply text-3xl sm:text-4xl font-bold mb-2 text-white;
}

.subtitle {
  @apply text-arc-brown text-sm sm:text-base;
}

.form-card {
  @apply bg-arc-card rounded-lg p-4 sm:p-6 md:p-8 border border-arc-brown/10;
}

.form-content {
  @apply space-y-5 sm:space-y-6;
}

.form-section {
  /* No additional styles */
}

.form-label {
  @apply block text-sm font-medium mb-2 text-gray-900;
}

.platform-grid {
  @apply grid grid-cols-3 gap-2 sm:gap-3;
}

.platform-btn {
  @apply p-3 sm:p-4 rounded-lg border-2 transition font-semibold flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base;
}

.platform-btn-active {
  @apply border-arc-red bg-arc-red/10 text-gray-900;
}

.platform-btn-inactive {
  @apply border-arc-brown/30 hover:border-arc-brown/50 text-arc-brown;
}

.platform-icon {
  @apply text-xl sm:text-2xl;
}

.platform-hint {
  @apply text-arc-brown text-xs ml-2 block sm:inline;
}

.input-group {
  @apply flex flex-col sm:flex-row gap-2;
}

.input-wrapper {
  @apply flex-1 relative;
}

.input-field {
  @apply w-full bg-white border border-arc-brown/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-arc-brown text-gray-900;
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
  @apply bg-arc-red hover:bg-arc-red/80 disabled:bg-arc-brown/40 disabled:cursor-not-allowed px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base w-full sm:w-auto text-black disabled:text-gray-600;
}

.spinner {
  @apply animate-spin;
}

.player-card {
  @apply mt-4 bg-arc-beige rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border border-arc-brown/20;
}

.player-avatar {
  @apply w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0;
}

.player-avatar-placeholder {
  @apply w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-arc-card flex items-center justify-center text-xl sm:text-2xl flex-shrink-0;
}

.player-info {
  @apply flex-1 min-w-0;
}

.player-name {
  @apply font-bold text-base sm:text-lg break-words text-gray-900;
}

.player-platform {
  @apply text-xs sm:text-sm text-arc-brown;
}

.player-link {
  @apply text-xs sm:text-sm text-arc-red hover:text-arc-red/80 break-all;
}

.verified-icon {
  @apply text-arc-green flex-shrink-0;
}

.help-text {
  @apply text-xs sm:text-sm text-arc-brown mt-2;
}

.error-alert {
  @apply bg-arc-red/10 border border-arc-red rounded-lg p-3 sm:p-4 text-arc-red text-sm sm:text-base;
}

.submit-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 disabled:bg-arc-brown/40 disabled:cursor-not-allowed px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base text-black disabled:text-gray-600;
}

.kill-type-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.kill-type-card {
  @apply p-3 sm:p-4 rounded-lg border-2 transition flex items-start gap-3 text-left;
}

.kill-type-card-active {
  @apply border-arc-red bg-arc-red/10;
}

.kill-type-card-inactive {
  @apply border-arc-brown/30 hover:border-arc-brown/50 hover:bg-arc-beige;
}

.kill-type-icon {
  @apply text-2xl sm:text-3xl flex-shrink-0;
}

.kill-type-content {
  @apply flex-1 min-w-0;
}

.kill-type-label {
  @apply font-semibold text-gray-900 text-sm sm:text-base mb-1;
}

.kill-type-description {
  @apply text-xs sm:text-sm text-arc-brown;
}

.info-box {
  @apply bg-arc-beige rounded-lg p-4 sm:p-5 border border-arc-brown/20;
}

.info-title {
  @apply text-lg font-bold text-gray-900 mb-3;
}

.info-text {
  @apply text-sm sm:text-base text-gray-900 mb-3;
}

.info-list {
  @apply list-disc list-inside space-y-2 mb-3 text-sm sm:text-base text-gray-900;
}

.info-list li {
  @apply ml-2;
}

.info-text-small {
  @apply text-xs sm:text-sm text-arc-brown italic;
}

/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-arc-card rounded-xl shadow-2xl max-w-lg w-full border-2 border-arc-brown/30;
  clip-path: polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px));
}

.modal-header {
  @apply p-6 pb-4 border-b border-arc-brown/20;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900;
}

.modal-body {
  @apply p-6;
}

.modal-message {
  @apply text-base text-gray-900 mb-2;
}

.modal-submessage {
  @apply text-sm text-arc-brown mb-4;
}

.bounty-info-box {
  @apply bg-arc-beige rounded-lg p-4 space-y-2 border border-arc-brown/20;
}

.info-row {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-sm font-semibold text-arc-brown;
}

.info-value {
  @apply text-sm text-gray-900;
}

.status-active {
  @apply text-green-600 font-bold;
}

.modal-actions {
  @apply p-6 pt-4 flex gap-3;
}

.btn-join {
  @apply flex-1 bg-arc-red hover:bg-arc-red/80 text-white font-semibold py-3 rounded-lg transition;
}

.btn-cancel {
  @apply flex-1 bg-arc-brown/20 hover:bg-arc-brown/30 text-gray-900 font-semibold py-3 rounded-lg transition;
}
</style>
