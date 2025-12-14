<!-- src/views/EmailRegisterView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { Platform } from '@/lib/supabase'
import PlatformSelector from '@/components/PlatformSelector.vue'
import { useToast } from '@/composables/useToast'
import { Mail, Lock, User, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()

const step = ref<'credentials' | 'platform'>('credentials')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const username = ref('')
const selectedPlatform = ref<Platform | undefined>(undefined)
const loading = ref(false)
const error = ref<string | null>(null)

async function handleCredentialsSubmit() {
  error.value = null

  // Validation
  if (!email.value || !password.value || !username.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  // Move to platform selection
  step.value = 'platform'
}

function handlePlatformSelect(platform: Platform) {
  selectedPlatform.value = platform
}

async function completeRegistration() {
  if (!selectedPlatform.value) {
    error.value = 'Please select a platform'
    return
  }

  try {
    loading.value = true
    error.value = null

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('No user data returned from signup')
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.value,
        username: username.value,
        platform: selectedPlatform.value,
        total_points: 0,
        bounties_completed: 0,
        times_hunted: 0,
      })
      .select()
      .single()

    if (userError) throw userError

    // Store user in localStorage
    localStorage.setItem('arc_user', JSON.stringify(userData))

    success('Account created successfully!')

    // Redirect to role selection
    setTimeout(() => {
      router.push('/select-role')
    }, 1000)
  } catch (err: any) {
    console.error('Registration error:', err)
    const errorMessage = err.message || 'Failed to create account'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (step.value === 'platform') {
    step.value = 'credentials'
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Step 1: Credentials -->
      <div v-if="step === 'credentials'" class="bg-arc-navy rounded-lg p-8 border-2 border-arc-red/20">
        <h1 class="text-3xl font-bold mb-6 text-center">Create Account</h1>

        <form @submit.prevent="handleCredentialsSubmit" class="space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium mb-2">Username</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input
                v-model="username"
                type="text"
                placeholder="Your username"
                class="w-full bg-arc-dark border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:border-arc-red focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full bg-arc-dark border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:border-arc-red focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input
                v-model="password"
                type="password"
                placeholder="At least 6 characters"
                class="w-full bg-arc-dark border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:border-arc-red focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium mb-2">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                class="w-full bg-arc-dark border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:border-arc-red focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="flex items-center gap-2 text-arc-red text-sm bg-arc-red/10 p-3 rounded-lg">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg transition-all"
          >
            Continue
          </button>

          <!-- Back to Login -->
          <button
            type="button"
            @click="goBack"
            class="w-full text-gray-400 hover:text-white transition-all"
          >
            Back to Login
          </button>
        </form>
      </div>

      <!-- Step 2: Platform Selection -->
      <div v-else-if="step === 'platform'" class="bg-arc-navy rounded-lg p-8 border-2 border-arc-red/20">
        <h1 class="text-3xl font-bold mb-6 text-center">Almost There!</h1>

        <PlatformSelector
          v-model="selectedPlatform"
          @select="handlePlatformSelect"
        />

        <!-- Error Message -->
        <div v-if="error" class="flex items-center gap-2 text-arc-red text-sm bg-arc-red/10 p-3 rounded-lg mt-4">
          <AlertCircle :size="16" />
          <span>{{ error }}</span>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 mt-6">
          <button
            @click="goBack"
            class="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition-all"
            :disabled="loading"
          >
            Back
          </button>
          <button
            @click="completeRegistration"
            :disabled="!selectedPlatform || loading"
            class="flex-1 bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
