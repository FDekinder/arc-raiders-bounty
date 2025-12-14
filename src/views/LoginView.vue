<!-- src/views/LoginView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initiateSteamLogin } from '@/lib/steamAuth'
import { Mail } from 'lucide-vue-next'

const router = useRouter()

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

function goToEmailLogin() {
  router.push('/email-login')
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-arc-dark to-arc-navy text-white flex items-center justify-center"
  >
    <div class="max-w-md w-full mx-4">
      <div class="bg-arc-navy rounded-lg p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h1
            class="text-4xl font-bold mb-2 bg-gradient-to-r from-arc-red via-arc-green via-arc-yellow to-arc-red bg-clip-text text-transparent"
          >
            ARC RAIDERS BOUNTY
          </h1>
          <p class="text-gray-400">Sign in to start hunting</p>
        </div>

        <!-- Steam Login Button -->
        <button
          @click="handleSteamLogin"
          class="w-full bg-arc-red hover:bg-arc-red-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-arc-red/30"
        >
          <svg class="w-8 h-8" viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M127.996 0C57.314 0 0 57.314 0 127.996c0 48.246 26.688 90.325 66.174 112.143l35.738-52.549c-8.25-4.096-14.336-12.134-15.36-21.606l-44.851-18.432c1.638-52.89 44.851-95.078 97.536-95.078 53.811 0 97.434 43.623 97.434 97.434s-43.623 97.434-97.434 97.434c-1.024 0-2.048 0-2.97-.102l-18.33 44.544c.614.102 1.229.102 1.843.102 70.682 0 128-57.318 128-128S198.678 0 127.996 0zm-8.704 195.277l-13.517 33.075c11.469 4.71 24.371 7.373 37.99 7.373 53.811 0 97.434-43.623 97.434-97.434 0-53.709-43.52-97.331-97.229-97.434v46.285c27.61.102 49.92 22.413 49.92 50.125 0 27.61-22.31 49.92-49.92 49.92-16.691 0-31.437-8.192-40.448-20.787l-27.61 11.878 43.38 17.05z"
            />
          </svg>
          <span>Sign in through Steam</span>
        </button>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-arc-navy text-gray-400">OR</span>
          </div>
        </div>

        <!-- Email Login Button -->
        <button
          @click="goToEmailLogin"
          class="w-full bg-arc-cyan hover:bg-arc-cyan/80 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-arc-cyan/30"
        >
          <Mail :size="32" />
          <span>Sign in with Email</span>
        </button>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-400 text-sm">
            Don't have an account?
            <button
              @click="goToRegister"
              class="text-arc-red hover:text-arc-red/80 font-bold transition-colors"
            >
              Register here
            </button>
          </p>
        </div>

        <div class="mt-6 text-center text-sm text-gray-400">
          <p>Secure authentication</p>
          <p class="mt-2">We only access your public profile information</p>
        </div>
      </div>
    </div>
  </div>
</template>
