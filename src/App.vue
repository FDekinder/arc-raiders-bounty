<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Target, LogOut } from 'lucide-vue-next'
import ToastContainer from './components/ToastContainer.vue'
import ExpirationChecker from './components/ExpirationChecker.vue'
import { getCurrentUser, logout } from './lib/auth'
import { computed } from 'vue'

const currentUser = computed(() => getCurrentUser())
</script>

<template>
  <div>
    <!-- Toast Container -->
    <ToastContainer />

    <!-- Expiration Checker -->
    <ExpirationChecker />

    <!-- Navigation -->
    <nav class="bg-arc-dark text-white border-b border-arc-cyan/20">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="flex items-center gap-2 font-bold text-xl">
            <Target class="text-arc-cyan" />
            <span>Arc Bounty</span>
          </RouterLink>

          <div class="flex gap-6 items-center">
            <RouterLink to="/" class="hover:text-arc-cyan transition" active-class="text-arc-cyan">
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="hover:text-arc-cyan transition"
              active-class="text-arc-cyan"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="hover:text-arc-cyan transition"
              active-class="text-arc-cyan"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="hover:text-arc-cyan transition"
              active-class="text-arc-cyan"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="hover:text-arc-cyan transition"
              active-class="text-arc-cyan"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              to="/verify"
              class="hover:text-arc-cyan transition"
              active-class="text-arc-cyan"
            >
              Verify
            </RouterLink>

            <!-- User Info -->
            <div
              v-if="currentUser"
              class="flex items-center gap-4 ml-4 pl-4 border-l border-arc-cyan/20"
            >
              <RouterLink :to="`/profile/${currentUser.id}`" class="hover:text-arc-cyan transition">
                {{ currentUser.username }}
              </RouterLink>
              <button
                @click="logout"
                class="flex items-center gap-1 text-gray-400 hover:text-arc-red transition"
                title="Logout"
              >
                <LogOut :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <RouterView />
  </div>
</template>
