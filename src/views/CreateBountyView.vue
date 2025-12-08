<!-- src/views/CreateBountyView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { createBounty } from '@/lib/db'
import { useRouter } from 'vue-router'
import { Target } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'

const router = useRouter()
const { success, error: showError } = useToast()
const gamertag = ref('')
const amount = ref('')
const loading = ref(false)
const error = ref('')

// For POC, we'll use a hardcoded user ID

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    if (!gamertag.value.trim()) {
      throw new Error('Please enter a gamertag')
    }

    const bountyAmount = parseInt(amount.value)
    if (isNaN(bountyAmount) || bountyAmount < 10) {
      throw new Error('Bounty amount must be at least 10 points')
    }

    await createBounty(gamertag.value.trim(), bountyAmount, userId)

    // Show success toast
    success(`Bounty created on ${gamertag.value.trim()} for ${bountyAmount} points!`)

    router.push('/bounties')
  } catch (err: any) {
    error.value = err.message || 'Failed to create bounty'
    showError(err.message || 'Failed to create bounty') // Add this line
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="bg-gray-800 rounded-lg p-8">
        <div class="flex items-center gap-3 mb-6">
          <Target class="text-red-500" :size="32" />
          <h1 class="text-3xl font-bold">Create New Bounty</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium mb-2"> Target Gamertag </label>
            <input
              v-model="gamertag"
              type="text"
              placeholder="Enter player gamertag"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-white"
              required
            />
            <p class="text-sm text-gray-400 mt-1">
              The Arc Raiders player you want to place a bounty on
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2"> Bounty Amount (Points) </label>
            <input
              v-model="amount"
              type="number"
              placeholder="100"
              min="10"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-white"
              required
            />
            <p class="text-sm text-gray-400 mt-1">
              Minimum 10 points. Higher bounties attract more hunters!
            </p>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">How it works:</h3>
            <ul class="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Your bounty will be active for 7 days</li>
              <li>Hunters submit screenshot proof of elimination</li>
              <li>Community verifies the claim</li>
              <li>First verified hunter earns the points</li>
            </ul>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              {{ loading ? 'Creating...' : 'Create Bounty' }}
            </button>
            <button
              type="button"
              @click="router.push('/bounties')"
              class="px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
