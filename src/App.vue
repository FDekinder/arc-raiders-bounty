<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
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
    <nav
      class="bg-arc-dark text-white border-b-2 border-gradient-to-r from-arc-cyan via-arc-yellow to-arc-red"
      style="border-image: linear-gradient(to right, #00d4ff, #ffd500, #ff3355) 1"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="flex items-center gap-3 font-bold text-xl">
            <img src="/arc-logo.png" alt="Arc Raiders Logo" class="h-12 w-12" />
            <span>Arc Bounty</span>
          </RouterLink>

          <div class="flex gap-6 items-center">
            <RouterLink to="/" class="hover:text-arc-red transition" active-class="text-arc-red">
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              to="/verify"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              Verify
            </RouterLink>

            <!-- User Info -->
            <div
              v-if="currentUser"
              class="flex items-center gap-4 ml-4 pl-4 border-l border-arc-red/20"
            >
              <RouterLink :to="`/profile/${currentUser.id}`" class="hover:text-arc-red transition">
                <span v-if="currentUser.clan_tag" class="text-arc-red font-bold">[{{ currentUser.clan_tag }}]</span>
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
