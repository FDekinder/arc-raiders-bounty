<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { LogOut, Menu, X } from 'lucide-vue-next'
import ToastContainer from './components/ToastContainer.vue'
import ExpirationChecker from './components/ExpirationChecker.vue'
import CookieConsent from './components/CookieConsent.vue'
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

    <!-- Cookie Consent Banner -->
    <CookieConsent />

    <!-- Navigation -->
    <nav
      class="backdrop-blur-sm border-b-2 border-gradient-to-r from-arc-cyan via-arc-yellow to-arc-red sticky top-0 z-50 shadow-lg"
      style="background-color: #ece2d0; border-image: linear-gradient(to right, #00d4ff, #ffd500, #ff3355) 1"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl text-arc-brown hover:text-arc-red transition" @click="closeMobileMenu">
            <img src="/arc-logo.png" alt="Arc Raiders Logo" class="h-10 w-10 sm:h-12 sm:w-12" />
            <span class="hidden xs:inline">Arc Bounty</span>
          </RouterLink>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex gap-6 items-center">
            <RouterLink to="/" class="text-arc-red hover:text-arc-red/80 transition font-semibold" active-class="!text-[#000080]">
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              to="/faq"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              FAQ
            </RouterLink>
            <RouterLink
              v-if="currentUser?.role === 'admin'"
              to="/verify"
              class="text-arc-red hover:text-arc-red/80 transition font-semibold"
              active-class="!text-[#000080]"
            >
              Verify
            </RouterLink>

            <!-- User Info Desktop -->
            <div
              v-if="currentUser"
              class="flex items-center gap-3 ml-4 pl-4 border-l border-arc-red/20"
            >
              <RouterLink :to="`/profile/${currentUser.id}`" class="flex items-center gap-2 text-arc-brown hover:text-arc-red transition">
                <RoleBadge v-if="currentUser.game_role" :role="currentUser.game_role" size="sm" />
                <span v-if="currentUser.clan_tag" class="text-arc-red font-bold">[{{ currentUser.clan_tag }}]</span>
                <span class="hidden xl:inline">{{ currentUser.username }}</span>
              </RouterLink>
              <button
                @click="logout"
                class="flex items-center gap-1 text-arc-brown hover:text-arc-red transition"
                title="Logout"
              >
                <LogOut :size="18" />
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="lg:hidden p-2 hover:bg-arc-brown/10 rounded transition text-arc-brown"
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
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/bounties"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              Bounties
            </RouterLink>
            <RouterLink
              to="/activity"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              Activity
            </RouterLink>
            <RouterLink
              to="/my-claims"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              My Claims
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              Leaderboard
            </RouterLink>
            <RouterLink
              to="/faq"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              FAQ
            </RouterLink>
            <RouterLink
              v-if="currentUser?.role === 'admin'"
              to="/verify"
              class="px-4 py-3 text-arc-red hover:bg-arc-brown/10 rounded transition font-semibold"
              active-class="!bg-[#000080] !text-white"
              @click="closeMobileMenu"
            >
              Verify
            </RouterLink>

            <!-- User Info Mobile -->
            <div v-if="currentUser" class="border-t border-arc-red/20 pt-4 mt-4">
              <RouterLink
                :to="`/profile/${currentUser.id}`"
                class="px-4 py-3 hover:bg-arc-brown/10 rounded transition flex items-center gap-2 text-arc-brown"
                @click="closeMobileMenu"
              >
                <RoleBadge v-if="currentUser.game_role" :role="currentUser.game_role" size="sm" />
                <span v-if="currentUser.clan_tag" class="text-arc-red font-bold">[{{ currentUser.clan_tag }}]</span>
                <span>{{ currentUser.username }}</span>
              </RouterLink>
              <button
                @click="logout(); closeMobileMenu()"
                class="w-full px-4 py-3 hover:bg-arc-brown/10 rounded transition flex items-center gap-2 text-arc-brown"
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
