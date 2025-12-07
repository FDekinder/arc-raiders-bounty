<!-- src/views/ClaimBountyView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { uploadScreenshot, submitClaim } from '@/lib/db'
import type { Bounty } from '@/lib/supabase'
import { Upload, AlertCircle } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast' // Add this line

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

// For POC - hardcoded user ID
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

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
    const screenshotUrl = await uploadScreenshot(selectedFile.value, TEMP_USER_ID)
    await submitClaim(bounty.value.id, TEMP_USER_ID, screenshotUrl)

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
  <div class="min-h-screen bg-gray-900 text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-xl">Loading bounty...</div>
    </div>

    <div v-else-if="!bounty" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <AlertCircle class="mx-auto mb-4 text-red-500" :size="48" />
        <h2 class="text-2xl font-bold mb-2">Bounty Not Found</h2>
        <p class="text-gray-400 mb-4">This bounty doesn't exist or has been completed.</p>
        <button
          @click="router.push('/bounties')"
          class="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
        >
          Back to Bounties
        </button>
      </div>
    </div>

    <div v-else class="container mx-auto px-4 py-8 max-w-3xl">
      <!-- Success Message -->
      <div
        v-if="success"
        class="bg-green-500/10 border border-green-500 text-green-500 p-6 rounded-lg text-center mb-8"
      >
        <h2 class="text-2xl font-bold mb-2">Claim Submitted!</h2>
        <p>Your claim is pending verification. Redirecting...</p>
      </div>

      <!-- Claim Form -->
      <div v-else class="bg-gray-800 rounded-lg p-8">
        <h1 class="text-3xl font-bold mb-2">Claim Bounty</h1>
        <p class="text-gray-400 mb-8">
          Submit proof that you eliminated
          <span class="text-red-500 font-bold">{{ bounty.target_gamertag }}</span>
        </p>

        <!-- Bounty Info -->
        <div class="bg-gray-700 rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm text-gray-400">Target</div>
              <div class="text-2xl font-bold">{{ bounty.target_gamertag }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">Reward</div>
              <div class="text-3xl font-bold text-red-500">{{ bounty.bounty_amount }}</div>
              <div class="text-sm text-gray-400">points</div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6"
        >
          {{ error }}
        </div>

        <!-- Upload Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2"> Screenshot Proof </label>

          <!-- File Input -->
          <div
            class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-red-500 transition cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
              id="screenshot-upload"
            />
            <label for="screenshot-upload" class="cursor-pointer">
              <Upload class="mx-auto mb-4 text-gray-400" :size="48" />
              <p class="text-gray-300 mb-2">Click to upload or drag and drop</p>
              <p class="text-sm text-gray-500">PNG, JPG or WEBP (max 5MB)</p>
            </label>
          </div>

          <!-- Preview -->
          <div v-if="previewUrl" class="mt-4">
            <p class="text-sm text-gray-400 mb-2">Preview:</p>
            <img
              :src="previewUrl"
              alt="Screenshot preview"
              class="rounded-lg max-h-96 mx-auto border border-gray-700"
            />
            <p class="text-sm text-gray-400 mt-2 text-center">
              {{ selectedFile?.name }}
            </p>
          </div>
        </div>

        <!-- Requirements -->
        <div class="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-2">Screenshot Requirements:</h3>
          <ul class="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Must show the kill feed with target's gamertag</li>
            <li>Must be from Arc Raiders game</li>
            <li>Must be clearly visible and unedited</li>
            <li>Recent screenshot (within bounty period)</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            @click="handleSubmit"
            :disabled="!selectedFile || submitting"
            class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition"
          >
            {{ submitting ? 'Submitting...' : 'Submit Claim' }}
          </button>
          <button
            @click="router.push('/bounties')"
            :disabled="submitting"
            class="px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
