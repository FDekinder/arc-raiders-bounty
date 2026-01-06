<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { initiateSteamLogin } from '@/lib/steamAuth'
import { signInWithGoogle } from '@/lib/auth'
import { Mail } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { error: showError } = useToast()
const loading = ref(false)

onMounted(() => {
  // Check if user is already logged in
  const currentUser = localStorage.getItem('arc_user')
  if (currentUser) {
    router.push('/bounties')
  }
})

function handleSteamLogin() {
  initiateSteamLogin()
}

async function handleGoogleLogin() {
  if (loading.value) return

  loading.value = true
  try {
    await signInWithGoogle()
    // Redirect happens automatically via OAuth flow
  } catch (err: any) {
    console.error('Google sign-in error:', err)
    showError('Failed to sign in with Google. Please try again.')
    loading.value = false
  }
}

function goToEmailLogin() {
  router.push('/email-login')
}

function goToRegister() {
  router.push('/register')
}

function continueAsGuest() {
  router.push('/')
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="login-card">
        <div class="header">
          <h1 class="title">
            ARC RAIDERS BOUNTY
          </h1>
          <p class="subtitle">Sign in to start hunting</p>
        </div>

        <!-- Steam Login Button -->
        <button @click="handleSteamLogin" class="steam-btn">
          <svg class="steam-icon" viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M127.996 0C57.314 0 0 57.314 0 127.996c0 48.246 26.688 90.325 66.174 112.143l35.738-52.549c-8.25-4.096-14.336-12.134-15.36-21.606l-44.851-18.432c1.638-52.89 44.851-95.078 97.536-95.078 53.811 0 97.434 43.623 97.434 97.434s-43.623 97.434-97.434 97.434c-1.024 0-2.048 0-2.97-.102l-18.33 44.544c.614.102 1.229.102 1.843.102 70.682 0 128-57.318 128-128S198.678 0 127.996 0zm-8.704 195.277l-13.517 33.075c11.469 4.71 24.371 7.373 37.99 7.373 53.811 0 97.434-43.623 97.434-97.434 0-53.709-43.52-97.331-97.229-97.434v46.285c27.61.102 49.92 22.413 49.92 50.125 0 27.61-22.31 49.92-49.92 49.92-16.691 0-31.437-8.192-40.448-20.787l-27.61 11.878 43.38 17.05z"
            />
          </svg>
          <span>Sign in through Steam</span>
        </button>

        <!-- Google Login Button -->
        <button @click="handleGoogleLogin" :disabled="loading" class="google-btn">
          <svg class="google-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{{ loading ? 'Signing in...' : 'Continue with Google' }}</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line">
            <div class="divider-border"></div>
          </div>
          <div class="divider-text-wrapper">
            <span class="divider-text">OR</span>
          </div>
        </div>

        <!-- Email Login Button -->
        <button @click="goToEmailLogin" class="email-btn">
          <Mail :size="32" />
          <span>Sign in with Email</span>
        </button>

        <!-- Continue as Guest Button -->
        <button @click="continueAsGuest" class="guest-btn">
          Continue as Guest
        </button>

        <!-- Register Link -->
        <div class="register-section">
          <p class="register-text">
            Don't have an account?
            <button @click="goToRegister" class="register-link">
              Register here
            </button>
          </p>
          <p class="register-text">
            Forgot your password?
            <button @click="router.push('/forgot-password')" class="forgot-link">
              Reset it here
            </button>
          </p>
        </div>

        <div class="footer-text">
          <p>Secure authentication</p>
          <p class="footer-subtext">We only access your public profile information</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white flex items-center justify-center;
}

.content-wrapper {
  @apply max-w-md w-full mx-4;
}

.login-card {
  @apply bg-arc-card rounded-lg p-8 shadow-2xl border border-arc-brown/10;
}

.header {
  @apply text-center mb-8;
}

.title {
  @apply text-4xl font-bold mb-2 bg-gradient-to-r from-arc-red via-arc-green via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

.subtitle {
  @apply text-arc-brown;
}

.steam-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 text-black font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-arc-red/30 mb-3;
}

.steam-icon {
  @apply w-8 h-8;
}

.google-btn {
  @apply w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg border border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed;
}

.google-icon {
  @apply w-6 h-6;
}

.divider {
  @apply relative my-6;
}

.divider-line {
  @apply absolute inset-0 flex items-center;
}

.divider-border {
  @apply w-full border-t border-arc-brown/30;
}

.divider-text-wrapper {
  @apply relative flex justify-center text-sm;
}

.divider-text {
  @apply px-2 bg-arc-card text-arc-brown;
}

.email-btn {
  @apply w-full bg-arc-cyan hover:bg-arc-cyan/80 text-black font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-arc-cyan/30;
}

.guest-btn {
  @apply w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 mt-4;
}

.register-section {
  @apply mt-6 text-center;
}

.register-text {
  @apply text-arc-brown text-sm;
}

.register-link {
  @apply text-arc-red hover:bg-arc-red/80 font-bold transition-colors;
}

.forgot-link {
  @apply text-arc-red hover:bg-arc-red/80 font-bold transition-colors;
}

.footer-text {
  @apply mt-6 text-center text-sm text-arc-brown;
}

.footer-subtext {
  @apply mt-2;
}
</style>
