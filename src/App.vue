<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Target } from 'lucide-vue-next'
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <div>
    <!-- Toast Container -->
    <ToastContainer />

    <!-- Navigation -->
    <nav class="bg-gray-800 text-white border-b border-gray-700">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="flex items-center gap-2 font-bold text-xl">
            <Target class="text-red-500" />
            <span>Arc Bounty</span>
          </RouterLink>

          <div class="flex gap-6">
            <RouterLink to="/" class="hover:text-red-500 transition" active-class="text-red-500">
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="hover:text-red-500 transition"
              active-class="text-red-500"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="hover:text-red-500 transition"
              active-class="text-red-500"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="hover:text-red-500 transition"
              active-class="text-red-500"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="hover:text-red-500 transition"
              active-class="text-red-500"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              to="/verify"
              class="hover:text-red-500 transition"
              active-class="text-red-500"
            >
              Verify
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <RouterView />
  </div>
</template>
