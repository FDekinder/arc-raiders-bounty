<!-- src/views/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { Mail, AlertCircle, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const emailSent = ref(false)

async function handleForgotPassword() {
  try {
    loading.value = true
    error.value = null

    // Validation
    if (!email.value) {
      error.value = 'Please enter your email address'
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      error.value = 'Please enter a valid email address'
      return
    }

    // Send password reset email using Supabase Auth
    // Make sure to use the full URL with protocol
    const redirectUrl = `${window.location.origin}/reset-password`
    console.log('Sending reset email with redirect to:', redirectUrl)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: redirectUrl,
    })

    if (resetError) throw resetError

    emailSent.value = true
    success('Password reset email sent! Check your inbox.')

  } catch (err: any) {
    console.error('Password reset error:', err)
    const errorMessage = err.message || 'Failed to send reset email'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/email-login')
}

function goBack() {
  router.push('/login')
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="reset-card">
        <!-- Success State -->
        <div v-if="emailSent" class="success-state">
          <CheckCircle :size="64" class="success-icon" />
          <h1 class="title">Check Your Email</h1>
          <p class="success-message">
            We've sent a password reset link to <strong>{{ email }}</strong>
          </p>
          <p class="hint-text">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>

          <div class="button-group">
            <button
              type="button"
              @click="goToLogin"
              class="submit-btn"
            >
              Back to Login
            </button>

            <button
              type="button"
              @click="emailSent = false"
              class="link-btn"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        </div>

        <!-- Request Form -->
        <div v-else>
          <h1 class="title">Forgot Password?</h1>
          <p class="subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form @submit.prevent="handleForgotPassword" class="form-content">
            <!-- Email -->
            <div class="form-field">
              <label class="form-label">Email Address</label>
              <div class="input-wrapper">
                <Mail class="input-icon" :size="20" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="your@email.com"
                  class="input-field"
                  required
                  :disabled="loading"
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
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
            </button>

            <!-- Back to Login -->
            <button
              type="button"
              @click="goToLogin"
              class="link-btn"
            >
              Remember your password? Login
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
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white flex items-center justify-center p-4;
}

.content-wrapper {
  @apply max-w-md w-full;
}

.reset-card {
  @apply bg-arc-card rounded-lg p-8 border-2 border-arc-brown/20;
}

.title {
  @apply text-3xl font-bold mb-4 text-center text-white;
}

.subtitle {
  @apply text-arc-brown text-center mb-6;
}

.success-state {
  @apply flex flex-col items-center text-center space-y-4;
}

.success-icon {
  @apply text-arc-green mb-2;
}

.success-message {
  @apply text-arc-dark text-lg;
}

.success-message strong {
  @apply text-arc-red font-bold;
}

.hint-text {
  @apply text-arc-brown text-sm;
}

.button-group {
  @apply w-full space-y-3 mt-6;
}

.form-content {
  @apply space-y-4;
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

.error-message {
  @apply flex items-center gap-2 text-arc-red text-sm bg-arc-red/10 p-3 rounded-lg;
}

.submit-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 text-black font-bold py-3 rounded-lg transition-all disabled:bg-arc-brown/40 disabled:cursor-not-allowed disabled:text-gray-600;
}

.link-btn {
  @apply w-full text-arc-brown hover:text-white transition-all;
}

.back-btn {
  @apply w-full text-arc-brown hover:text-white transition-all text-sm;
}
</style>
