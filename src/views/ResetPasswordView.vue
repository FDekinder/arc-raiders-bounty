<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const resetSuccess = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const validSession = ref(false)
const checkingSession = ref(true)

onMounted(async () => {
  // Check if user has a valid session from the reset link
  try {
    // First, check if there's a hash in the URL with access_token
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    // Check for error in hash (like expired token)
    const errorCode = hashParams.get('error_code')
    const errorDescription = hashParams.get('error_description')

    if (errorCode) {
      if (errorCode === 'otp_expired') {
        error.value = 'This reset link has expired. Please request a new password reset.'
      } else {
        error.value = errorDescription || 'Invalid reset link. Please request a new password reset.'
      }
      checkingSession.value = false
      return
    }

    // If we have an access token and type is recovery, session is valid
    if (accessToken && type === 'recovery') {
      validSession.value = true
      checkingSession.value = false
      return
    }

    // Otherwise check for existing session
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      validSession.value = true
    } else {
      error.value = 'Invalid or expired reset link. Please request a new password reset.'
    }
  } catch (err) {
    console.error('Session check error:', err)
    error.value = 'Could not verify reset link. Please try again.'
  } finally {
    checkingSession.value = false
  }
})

async function handleResetPassword() {
  try {
    loading.value = true
    error.value = null

    // Validation
    if (!password.value || !confirmPassword.value) {
      error.value = 'Please fill in all fields'
      return
    }

    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters long'
      return
    }

    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (updateError) throw updateError

    resetSuccess.value = true
    success('Password updated successfully!')

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/email-login')
    }, 2000)

  } catch (err: any) {
    console.error('Password reset error:', err)
    const errorMessage = err.message || 'Failed to reset password'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/email-login')
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="reset-card">
        <!-- Checking Session -->
        <div v-if="checkingSession" class="checking-state">
          <div class="spinner"></div>
          <p class="checking-text">Verifying reset link...</p>
        </div>

        <!-- Invalid Session -->
        <div v-else-if="!validSession" class="error-state">
          <AlertCircle :size="64" class="error-icon" />
          <h1 class="title">Invalid Reset Link</h1>
          <p class="error-description">
            {{ error }}
          </p>
          <button
            type="button"
            @click="router.push('/forgot-password')"
            class="submit-btn"
          >
            Request New Reset Link
          </button>
        </div>

        <!-- Success State -->
        <div v-else-if="resetSuccess" class="success-state">
          <CheckCircle :size="64" class="success-icon" />
          <h1 class="title">Password Reset Complete!</h1>
          <p class="success-message">
            Your password has been successfully updated.
          </p>
          <p class="hint-text">
            Redirecting you to login...
          </p>
        </div>

        <!-- Reset Form -->
        <div v-else>
          <h1 class="title">Reset Your Password</h1>
          <p class="subtitle">
            Enter your new password below.
          </p>

          <form @submit.prevent="handleResetPassword" class="form-content">
            <!-- New Password -->
            <div class="form-field">
              <label class="form-label">New Password</label>
              <div class="input-wrapper">
                <Lock class="input-icon" :size="20" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter new password"
                  class="input-field pr-12"
                  required
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="toggle-password"
                  tabindex="-1"
                >
                  <Eye v-if="!showPassword" :size="20" />
                  <EyeOff v-else :size="20" />
                </button>
              </div>
              <p class="hint-text-small">Minimum 6 characters</p>
            </div>

            <!-- Confirm Password -->
            <div class="form-field">
              <label class="form-label">Confirm Password</label>
              <div class="input-wrapper">
                <Lock class="input-icon" :size="20" />
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm new password"
                  class="input-field pr-12"
                  required
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="toggle-password"
                  tabindex="-1"
                >
                  <Eye v-if="!showConfirmPassword" :size="20" />
                  <EyeOff v-else :size="20" />
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error && validSession" class="error-message">
              <AlertCircle :size="16" />
              <span>{{ error }}</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="submit-btn"
            >
              {{ loading ? 'Resetting Password...' : 'Reset Password' }}
            </button>

            <!-- Back to Login -->
            <button
              type="button"
              @click="goToLogin"
              class="link-btn"
            >
              Back to Login
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

.checking-state {
  @apply flex flex-col items-center text-center space-y-4 py-8;
}

.spinner {
  @apply w-12 h-12 border-4 border-arc-brown/20 border-t-arc-red rounded-full animate-spin;
}

.checking-text {
  @apply text-arc-brown;
}

.error-state {
  @apply flex flex-col items-center text-center space-y-4;
}

.error-icon {
  @apply text-arc-red mb-2;
}

.error-description {
  @apply text-arc-brown;
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

.hint-text {
  @apply text-arc-brown text-sm;
}

.hint-text-small {
  @apply text-arc-brown text-xs mt-1;
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

.toggle-password {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-arc-brown hover:text-arc-dark transition-colors;
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
</style>
