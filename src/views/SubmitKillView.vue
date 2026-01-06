<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { submitKill, uploadKillScreenshot } from '@/lib/db'
import { useToast } from '@/composables/useToast'
import type { User } from '@/lib/supabase'
import { Target, Upload, AlertCircle, CheckCircle, User as UserIcon } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = ref<User | null>(null)
const victimGamertag = ref('')
const screenshot = ref<File | null>(null)
const screenshotPreview = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const submitSuccess = ref(false)

onMounted(() => {
  // Get current user
  const userStr = localStorage.getItem('arc_user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)

    // Check if user is a Proud Rat
    if (currentUser.value?.game_role !== 'PR') {
      showError('Only Proud Rats can submit kills')
      router.push('/')
    }
  } else {
    showError('Please log in to submit kills')
    router.push('/login')
  }
})

const canSubmit = computed(() => {
  return victimGamertag.value.trim() && screenshot.value && !loading.value
})

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload an image file'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size must be less than 5MB'
    return
  }

  screenshot.value = file
  error.value = null

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    screenshotPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeScreenshot() {
  screenshot.value = null
  screenshotPreview.value = null
  const fileInput = document.getElementById('screenshot-input') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

async function handleSubmit() {
  if (!currentUser.value || !screenshot.value) return

  try {
    loading.value = true
    error.value = null

    // Validation
    if (!victimGamertag.value.trim()) {
      error.value = 'Please enter the victim gamertag'
      return
    }

    if (!screenshot.value) {
      error.value = 'Please upload a screenshot'
      return
    }

    // Upload screenshot
    const screenshotUrl = await uploadKillScreenshot(screenshot.value, currentUser.value.id)

    // Submit kill claim
    await submitKill(currentUser.value.id, victimGamertag.value.trim(), screenshotUrl)

    submitSuccess.value = true
    success('Kill submitted successfully! Awaiting verification.')

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/top-killers')
    }, 2000)

  } catch (err: any) {
    console.error('Kill submission error:', err)
    const errorMessage = err.message || 'Failed to submit kill'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Success State -->
      <div v-if="submitSuccess" class="success-card">
        <CheckCircle :size="64" class="success-icon" />
        <h1 class="title">Kill Submitted!</h1>
        <p class="success-message">
          Your kill claim is now pending verification by administrators.
        </p>
        <p class="hint-text">
          You'll earn points and increase your kill count once it's approved.
        </p>
      </div>

      <!-- Submission Form -->
      <div v-else class="form-card">
        <!-- Header -->
        <div class="header">
          <div class="header-icon">
            <Target :size="32" />
          </div>
          <div>
            <h1 class="title">Report Kill</h1>
            <p class="subtitle">Submit proof of your latest takedown</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="form-content">
          <!-- Victim Gamertag -->
          <div class="form-field">
            <label class="form-label">Victim Gamertag</label>
            <div class="input-wrapper">
              <UserIcon class="input-icon" :size="20" />
              <input
                v-model="victimGamertag"
                type="text"
                placeholder="Enter victim's gamertag"
                class="input-field"
                required
                :disabled="loading"
              />
            </div>
            <p class="field-hint">Enter the exact gamertag as shown in-game</p>
          </div>

          <!-- Screenshot Upload -->
          <div class="form-field">
            <label class="form-label">Kill Screenshot</label>

            <!-- Upload Button -->
            <div v-if="!screenshot" class="upload-area">
              <input
                id="screenshot-input"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="hidden"
              />
              <label for="screenshot-input" class="upload-label">
                <Upload :size="32" class="upload-icon" />
                <span class="upload-text">Click to upload screenshot</span>
                <span class="upload-hint">PNG, JPG up to 5MB</span>
              </label>
            </div>

            <!-- Screenshot Preview -->
            <div v-else class="preview-container">
              <img :src="screenshotPreview || undefined" alt="Kill screenshot" class="preview-image" />
              <button
                type="button"
                @click="removeScreenshot"
                class="remove-btn"
                :disabled="loading"
              >
                Remove
              </button>
            </div>

            <p class="field-hint">
              Screenshot must clearly show the kill confirmation and victim's gamertag
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Guidelines -->
          <div class="guidelines">
            <h3 class="guidelines-title">Submission Guidelines</h3>
            <ul class="guidelines-list">
              <li>Screenshot must show kill confirmation message</li>
              <li>Victim's gamertag must be clearly visible</li>
              <li>No edited or fake screenshots</li>
              <li>Each kill can only be claimed once</li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <button
              type="submit"
              :disabled="!canSubmit"
              class="submit-btn"
            >
              {{ loading ? 'Submitting...' : 'Submit Kill' }}
            </button>

            <button
              type="button"
              @click="router.push('/top-killers')"
              class="cancel-btn"
              :disabled="loading"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white flex items-center justify-center p-4;
}

.content-wrapper {
  @apply max-w-2xl w-full;
}

.form-card,
.success-card {
  @apply bg-arc-card rounded-lg p-8 border-2 border-arc-brown/20;
}

/* Success State */
.success-card {
  @apply flex flex-col items-center text-center space-y-4;
}

.success-icon {
  @apply text-arc-green mb-2;
}

.success-message {
  @apply text-arc-dark text-lg;
}

.hint-text {
  @apply text-arc-brown text-sm;
}

/* Header */
.header {
  @apply flex items-center gap-4 mb-6;
}

.header-icon {
  @apply bg-arc-red text-black rounded-full p-3 flex items-center justify-center;
}

.title {
  @apply text-3xl font-bold text-white;
}

.subtitle {
  @apply text-arc-brown text-sm mt-1;
}

/* Form */
.form-content {
  @apply space-y-6;
}

.form-field {
  /* No additional styles */
}

.form-label {
  @apply block text-sm font-medium mb-2 text-gray-900;
}

.input-wrapper {
  @apply relative;
}

.input-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-arc-brown;
}

.input-field {
  @apply w-full bg-white border border-arc-brown/30 rounded-lg pl-10 pr-4 py-3 focus:border-arc-brown focus:outline-none text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed;
}

.field-hint {
  @apply text-arc-brown text-xs mt-1;
}

/* Upload Area */
.upload-area {
  @apply border-2 border-dashed border-arc-brown/30 rounded-lg p-8 hover:border-arc-brown transition-colors;
}

.upload-label {
  @apply flex flex-col items-center justify-center cursor-pointer;
}

.upload-icon {
  @apply text-arc-brown mb-2;
}

.upload-text {
  @apply text-arc-dark font-medium mb-1;
}

.upload-hint {
  @apply text-arc-brown text-sm;
}

.hidden {
  @apply sr-only;
}

/* Preview */
.preview-container {
  @apply space-y-3;
}

.preview-image {
  @apply w-full rounded-lg border-2 border-arc-brown/20;
}

.remove-btn {
  @apply w-full bg-arc-brown/20 hover:bg-arc-brown/30 text-arc-dark font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Error Message */
.error-message {
  @apply flex items-center gap-2 text-arc-red text-sm bg-arc-red/10 p-3 rounded-lg;
}

/* Guidelines */
.guidelines {
  @apply bg-arc-brown/10 rounded-lg p-4;
}

.guidelines-title {
  @apply text-arc-dark font-bold mb-2;
}

.guidelines-list {
  @apply list-disc list-inside space-y-1 text-arc-brown text-sm;
}

/* Buttons */
.button-group {
  @apply space-y-3;
}

.submit-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 text-black font-bold py-3 rounded-lg transition-all disabled:bg-arc-brown/40 disabled:cursor-not-allowed disabled:text-gray-600;
}

.cancel-btn {
  @apply w-full text-arc-brown hover:text-arc-dark transition-all disabled:opacity-50;
}
</style>
