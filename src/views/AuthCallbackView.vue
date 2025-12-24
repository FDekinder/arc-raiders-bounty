<!-- src/views/AuthCallbackView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/authHelpers'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { Loader } from 'lucide-vue-next'

const router = useRouter()
const { success, error: showError } = useToast()
const { setUser } = useAuth()
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  try {
    // Get session from URL hash/params (OAuth callback)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    if (!session?.user) {
      throw new Error('No session found. Please try signing in again.')
    }

    // Ensure user profile exists in database
    const { data: userProfile, error: profileError } = await ensureUserProfile(session.user)

    if (profileError || !userProfile) {
      throw new Error('Failed to create user profile')
    }

    // Update reactive user state (this also updates localStorage)
    setUser(userProfile)

    status.value = 'success'
    success('Successfully signed in!')

    // Redirect to bounties page after a short delay
    setTimeout(() => {
      router.push('/bounties')
    }, 1000)
  } catch (err: any) {
    console.error('Auth callback error:', err)
    status.value = 'error'
    errorMessage.value = err.message || 'Authentication failed'
    showError(errorMessage.value)

    // Redirect to login after showing error
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="status-card">
        <!-- Loading State -->
        <div v-if="status === 'loading'" class="status-content">
          <Loader class="spinner" :size="48" />
          <h2 class="status-title">Completing sign in...</h2>
          <p class="status-text">Please wait while we set up your account</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="status-content">
          <div class="success-icon">✓</div>
          <h2 class="status-title success-text">Successfully signed in!</h2>
          <p class="status-text">Redirecting you to the bounties page...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="status-content">
          <div class="error-icon">✕</div>
          <h2 class="status-title error-text">Authentication failed</h2>
          <p class="status-text">{{ errorMessage }}</p>
          <p class="status-text-small">Redirecting you back to login...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent flex items-center justify-center p-4;
}

.content-wrapper {
  @apply max-w-md w-full;
}

.status-card {
  @apply bg-arc-card rounded-lg p-8 shadow-2xl border border-arc-brown/10;
}

.status-content {
  @apply text-center;
}

.spinner {
  @apply mx-auto mb-6 text-arc-red animate-spin;
}

.success-icon {
  @apply w-16 h-16 mx-auto mb-6 rounded-full bg-arc-green/20 flex items-center justify-center text-arc-green text-4xl font-bold border-2 border-arc-green;
}

.error-icon {
  @apply w-16 h-16 mx-auto mb-6 rounded-full bg-arc-red/20 flex items-center justify-center text-arc-red text-4xl font-bold border-2 border-arc-red;
}

.status-title {
  @apply text-2xl font-bold mb-3 text-gray-900;
}

.success-text {
  @apply text-arc-green;
}

.error-text {
  @apply text-arc-red;
}

.status-text {
  @apply text-arc-brown text-base mb-2;
}

.status-text-small {
  @apply text-arc-brown text-sm mt-4;
}
</style>
