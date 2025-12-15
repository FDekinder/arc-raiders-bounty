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

    // Redirect based on whether user has selected a game role
    setTimeout(() => {
      if (!userData.game_role) {
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
  <div class="page-container">
    <div class="content-wrapper">
      <div class="login-card">
        <h1 class="title">Email Login</h1>

        <form @submit.prevent="handleLogin" class="form-content">
          <!-- Email -->
          <div class="form-field">
            <label class="form-label">Email</label>
            <div class="input-wrapper">
              <Mail class="input-icon" :size="20" />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="input-field"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="form-field">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <Lock class="input-icon" :size="20" />
              <input
                v-model="password"
                type="password"
                placeholder="Your password"
                class="input-field"
                required
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- Register Link -->
          <button
            type="button"
            @click="goToRegister"
            class="link-btn"
          >
            Don't have an account? Register
          </button>

          <!-- Back to Login Options -->
          <button
            type="button"
            @click="goBack"
            class="back-btn"
          >
            Back to Login Options
          </button>
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
  @apply max-w-md w-full;
}

.login-card {
  @apply bg-arc-card rounded-lg p-8 border-2 border-arc-brown/20;
}

.title {
  @apply text-3xl font-bold mb-6 text-center text-white;
}

.form-content {
  @apply space-y-4;
}

.form-field {
  /* No additional styles */
}

.form-label {
  @apply block text-sm font-medium mb-2 text-white;
}

.input-wrapper {
  @apply relative;
}

.input-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-arc-brown;
}

.input-field {
  @apply w-full bg-white border border-arc-brown/30 rounded-lg pl-10 pr-4 py-3 focus:border-arc-brown focus:outline-none text-white;
}

.error-message {
  @apply flex items-center gap-2 text-arc-red text-sm bg-arc-red/10 p-3 rounded-lg;
}

.submit-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg transition-all disabled:bg-arc-brown/40 disabled:cursor-not-allowed;
}

.link-btn {
  @apply w-full text-arc-brown hover:text-white transition-all;
}

.back-btn {
  @apply w-full text-arc-brown hover:text-white transition-all text-sm;
}
</style>
