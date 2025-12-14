<!-- src/views/EmailLoginView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { Mail, Lock, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  try {
    loading.value = true
    error.value = null

    // Validation
    if (!email.value || !password.value) {
      error.value = 'Please fill in all fields'
      return
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('No user data returned from login')
    }

    // Fetch user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) throw userError

    // Store user in localStorage
    localStorage.setItem('arc_user', JSON.stringify(userData))

    success('Logged in successfully!')

    // Redirect based on whether user has selected a role
    setTimeout(() => {
      if (!userData.role) {
        router.push('/select-role')
      } else {
        router.push('/')
      }
    }, 1000)
  } catch (err: any) {
    console.error('Login error:', err)
    const errorMessage = err.message || 'Failed to log in'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}

function goBack() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="bg-arc-navy rounded-lg p-8 border-2 border-arc-red/20">
        <h1 class="text-3xl font-bold mb-6 text-center">Email Login</h1>

        <form @submit.prevent="handleLogin" class="space-y-4">
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
                placeholder="Your password"
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
            :disabled="loading"
            class="w-full bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- Register Link -->
          <button
            type="button"
            @click="goToRegister"
            class="w-full text-gray-400 hover:text-white transition-all"
          >
            Don't have an account? Register
          </button>

          <!-- Back to Login Options -->
          <button
            type="button"
            @click="goBack"
            class="w-full text-gray-400 hover:text-white transition-all text-sm"
          >
            Back to Login Options
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
