<!-- src/views/ClaimBountyView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { uploadScreenshot, submitClaim } from '@/lib/db'
import type { Bounty } from '@/lib/supabase'
import { Upload, AlertCircle } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

import { getCurrentUser } from '@/lib/auth'

const route = useRoute()
const router = useRouter()
const { success: showSuccess, error: showError } = useToast()

const bounty = ref<Bounty | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const success = ref(false)

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

onMounted(async () => {
  try {
    const bountyId = route.params.id as string
    const { data, error: fetchError } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', bountyId)
      .single()

    if (fetchError) throw fetchError
    bounty.value = data
  } catch (err: any) {
    error.value = 'Failed to load bounty'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size must be less than 5MB'
    return
  }

  selectedFile.value = file
  error.value = ''

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  if (!selectedFile.value) {
    error.value = 'Please select a screenshot'
    showError('Please select a screenshot')
    return
  }

  if (!bounty.value) return

  submitting.value = true
  error.value = ''

  try {
    const screenshotUrl = await uploadScreenshot(selectedFile.value, userId)
    await submitClaim(bounty.value.id, userId, screenshotUrl)

    success.value = true
    showSuccess('Claim submitted successfully! Awaiting verification.') // Changed to showSuccess

    setTimeout(() => {
      router.push('/bounties')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to submit claim'
    showError(err.message || 'Failed to submit claim')
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-text">Loading bounty...</div>
    </div>

    <div v-else-if="!bounty" class="error-container">
      <div class="error-content">
        <AlertCircle class="error-icon" :size="48" />
        <h2 class="error-title">Bounty Not Found</h2>
        <p class="error-message">This bounty doesn't exist or has been completed.</p>
        <button @click="router.push('/bounties')" class="back-btn">
          Back to Bounties
        </button>
      </div>
    </div>

    <div v-else class="content-wrapper">
      <!-- Success Message -->
      <div v-if="success" class="success-message">
        <h2 class="success-title">Claim Submitted!</h2>
        <p class="success-text">Your claim is pending verification. Redirecting...</p>
      </div>

      <!-- Claim Form -->
      <div v-else class="claim-form">
        <h1 class="form-title">Claim Bounty</h1>
        <p class="form-subtitle">
          Submit proof that you eliminated
          <span class="target-name">{{ bounty.target_gamertag }}</span>
        </p>

        <!-- Bounty Info -->
        <div class="bounty-info-card">
          <div class="bounty-info-content">
            <div>
              <div class="info-label">Target</div>
              <div class="info-target">{{ bounty.target_gamertag }}</div>
            </div>
            <div class="info-reward">
              <div class="reward-label">Reward</div>
              <div class="reward-amount">{{ bounty.bounty_amount }}</div>
              <div class="reward-points">points</div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-alert">
          {{ error }}
        </div>

        <!-- Upload Section -->
        <div class="upload-section">
          <label class="upload-label">Screenshot Proof</label>

          <!-- File Input -->
          <div class="upload-dropzone">
            <input
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
              id="screenshot-upload"
            />
            <label for="screenshot-upload" class="upload-dropzone-label">
              <Upload class="upload-icon" :size="48" />
              <p class="upload-text-primary">Click to upload or drag and drop</p>
              <p class="upload-text-secondary">PNG, JPG or WEBP (max 5MB)</p>
            </label>
          </div>

          <!-- Preview -->
          <div v-if="previewUrl" class="preview-section">
            <p class="preview-label">Preview:</p>
            <img
              :src="previewUrl"
              alt="Screenshot preview"
              class="preview-image"
            />
            <p class="preview-filename">
              {{ selectedFile?.name }}
            </p>
          </div>
        </div>

        <!-- Requirements -->
        <div class="requirements-card">
          <h3 class="requirements-title">Screenshot Requirements:</h3>
          <ul class="requirements-list">
            <li>Must show the kill feed with target's gamertag</li>
            <li>Must be from Arc Raiders game</li>
            <li>Must be clearly visible and unedited</li>
            <li>Recent screenshot (within bounty period)</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="action-buttons">
          <button
            @click="handleSubmit"
            :disabled="!selectedFile || submitting"
            class="submit-btn"
          >
            {{ submitting ? 'Submitting...' : 'Submit Claim' }}
          </button>
          <button
            @click="router.push('/bounties')"
            :disabled="submitting"
            class="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-arc-dark text-white;
}

.loading-container {
  @apply flex items-center justify-center min-h-screen;
}

.loading-text {
  @apply text-xl;
}

.error-container {
  @apply flex items-center justify-center min-h-screen;
}

.error-content {
  @apply text-center;
}

.error-icon {
  @apply mx-auto mb-4 text-arc-red;
}

.error-title {
  @apply text-2xl font-bold mb-2;
}

.error-message {
  @apply text-gray-400 mb-4;
}

.back-btn {
  @apply bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8 max-w-3xl;
}

.success-message {
  @apply bg-arc-green/10 border border-arc-green text-arc-green p-6 rounded-lg text-center mb-8;
}

.success-title {
  @apply text-2xl font-bold mb-2;
}

.success-text {
  @apply;
}

.claim-form {
  @apply bg-arc-navy rounded-lg p-8;
}

.form-title {
  @apply text-3xl font-bold mb-2;
}

.form-subtitle {
  @apply text-gray-400 mb-8;
}

.target-name {
  @apply text-arc-red font-bold;
}

.bounty-info-card {
  @apply bg-gray-700 rounded-lg p-6 mb-8 border border-arc-red/20;
}

.bounty-info-content {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-sm text-gray-400;
}

.info-target {
  @apply text-2xl font-bold;
}

.info-reward {
  @apply text-right;
}

.reward-label {
  @apply text-sm text-gray-400;
}

.reward-amount {
  @apply text-3xl font-bold text-arc-red;
}

.reward-points {
  @apply text-sm text-gray-400;
}

.error-alert {
  @apply bg-arc-red/10 border border-arc-red text-arc-red p-4 rounded-lg mb-6;
}

.upload-section {
  @apply mb-6;
}

.upload-label {
  @apply block text-sm font-medium mb-2;
}

.upload-dropzone {
  @apply border-2 border-dashed border-arc-red/30 rounded-lg p-8 text-center hover:border-arc-red transition cursor-pointer;
}

.file-input {
  @apply hidden;
}

.upload-dropzone-label {
  @apply cursor-pointer;
}

.upload-icon {
  @apply mx-auto mb-4 text-gray-400;
}

.upload-text-primary {
  @apply text-gray-300 mb-2;
}

.upload-text-secondary {
  @apply text-sm text-gray-500;
}

.preview-section {
  @apply mt-4;
}

.preview-label {
  @apply text-sm text-gray-400 mb-2;
}

.preview-image {
  @apply rounded-lg max-h-96 mx-auto border border-arc-red/20;
}

.preview-filename {
  @apply text-sm text-gray-400 mt-2 text-center;
}

.requirements-card {
  @apply bg-gray-700 p-4 rounded-lg mb-6 border border-arc-red/20;
}

.requirements-title {
  @apply font-semibold mb-2;
}

.requirements-list {
  @apply text-sm text-gray-300 space-y-1 list-disc list-inside;
}

.action-buttons {
  @apply flex gap-4;
}

.submit-btn {
  @apply flex-1 bg-arc-red hover:bg-arc-red/80 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition;
}

.cancel-btn {
  @apply px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 transition;
}
</style>
