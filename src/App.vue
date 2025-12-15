<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { LogOut, Menu, X } from 'lucide-vue-next'
import ToastContainer from './components/ToastContainer.vue'
import ExpirationChecker from './components/ExpirationChecker.vue'
import RoleBadge from './components/RoleBadge.vue'
import { getCurrentUser, logout } from './lib/auth'
import { computed, ref } from 'vue'

const currentUser = computed(() => getCurrentUser())
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div>
    <!-- Toast Container -->
    <ToastContainer />

    <!-- Expiration Checker -->
    <ExpirationChecker />

    <!-- Navigation -->
    <nav
      class="bg-arc-dark/95 backdrop-blur-sm text-white border-b-2 border-gradient-to-r from-arc-cyan via-arc-yellow to-arc-red sticky top-0 z-50 shadow-lg"
      style="border-image: linear-gradient(to right, #00d4ff, #ffd500, #ff3355) 1"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl" @click="closeMobileMenu">
            <img src="/arc-logo.png" alt="Arc Raiders Logo" class="h-10 w-10 sm:h-12 sm:w-12" />
            <span class="hidden xs:inline">Arc Bounty</span>
          </RouterLink>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex gap-6 items-center">
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
              v-if="currentUser?.role === 'admin'"
              to="/verify"
              class="hover:text-arc-red transition"
              active-class="text-arc-red"
            >
              Verify
            </RouterLink>

            <!-- User Info Desktop -->
            <div
              v-if="currentUser"
              class="flex items-center gap-3 ml-4 pl-4 border-l border-arc-red/20"
            >
              <RouterLink :to="`/profile/${currentUser.id}`" class="flex items-center gap-2 hover:text-arc-red transition">
                <RoleBadge v-if="currentUser.game_role" :role="currentUser.game_role" size="sm" />
                <span v-if="currentUser.clan_tag" class="text-arc-red font-bold">[{{ currentUser.clan_tag }}]</span>
                <span class="hidden xl:inline">{{ currentUser.username }}</span>
              </RouterLink>
              <button
                @click="logout"
                class="flex items-center gap-1 text-gray-300 hover:text-arc-red transition"
                title="Logout"
              >
                <LogOut :size="18" />
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="lg:hidden p-2 hover:bg-white/10 rounded transition"
            aria-label="Toggle menu"
          >
            <Menu v-if="!mobileMenuOpen" :size="24" />
            <X v-else :size="24" />
          </button>
        </div>

        <!-- Mobile Navigation Menu -->
        <div
          v-if="mobileMenuOpen"
          class="lg:hidden pb-4 border-t border-arc-red/20 mt-2"
        >
          <div class="flex flex-col space-y-2 pt-4">
            <RouterLink
              to="/"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              v-if="currentUser?.role === 'admin'"
              to="/verify"
              class="px-4 py-3 hover:bg-white/10 rounded transition"
              active-class="bg-arc-red text-black"
              @click="closeMobileMenu"
            >
              Verify
            </RouterLink>

            <!-- User Info Mobile -->
            <div v-if="currentUser" class="border-t border-arc-red/20 pt-4 mt-4">
              <RouterLink
                :to="`/profile/${currentUser.id}`"
                class="px-4 py-3 hover:bg-white/10 rounded transition flex items-center gap-2"
                @click="closeMobileMenu"
              >
                <RoleBadge v-if="currentUser.game_role" :role="currentUser.game_role" size="sm" />
                <span v-if="currentUser.clan_tag" class="text-arc-red font-bold">[{{ currentUser.clan_tag }}]</span>
                <span>{{ currentUser.username }}</span>
              </RouterLink>
              <button
                @click="logout(); closeMobileMenu()"
                class="w-full px-4 py-3 hover:bg-white/10 rounded transition flex items-center gap-2 text-gray-300"
              >
                <LogOut :size="18" />
                <span>Logout</span>
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
