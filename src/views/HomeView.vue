<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Target, Trophy, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getMostWanted, getUserByUsername } from '@/lib/db'
import type { MostWanted } from '@/lib/supabase'

const topBounties = ref<MostWanted[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await getMostWanted()
    const top3 = data.slice(0, 3) // Get top 3

    // Fetch user profiles to get avatar URLs
    const bountiesWithAvatars = await Promise.all(
      top3.map(async (bounty: MostWanted) => {
        const user = await getUserByUsername(bounty.target_gamertag)
        return {
          ...bounty,
          avatar_url: user?.avatar_url
        }
      })
    )

    topBounties.value = bountiesWithAvatars
  } catch (error) {
    console.error('Error loading top bounties:', error)
  } finally {
    loading.value = false
  }
})

function getMedalColor(index: number) {
  if (index === 0) return 'from-yellow-500 to-yellow-600'
  if (index === 1) return 'from-gray-400 to-gray-500'
  if (index === 2) return 'from-orange-600 to-orange-700'
  return 'from-gray-600 to-gray-700'
}

function getMedalEmoji(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-6xl md:text-7xl font-bold mb-6">
        <span class="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          ARC RAIDERS
        </span>
        <br />
        BOUNTY SYSTEM
      </h1>
      <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
        Place bounties. Hunt targets. Claim glory.
      </p>

      <div class="flex gap-4 justify-center flex-wrap">
        <RouterLink
          to="/bounties"
          class="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
        >
          View Bounties
        </RouterLink>
        <RouterLink
          to="/create-bounty"
          class="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
        >
          Create Bounty
        </RouterLink>
      </div>
    </div>

    <!-- Top 3 Most Wanted -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Target class="text-red-500" :size="40" />
          Most Wanted
        </h2>
        <p class="text-gray-400 text-lg">The highest-value targets in Arc Raiders</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-xl">Loading top bounties...</div>
      </div>

      <!-- Top 3 Cards -->
      <div v-else-if="topBounties.length > 0" class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div v-for="(bounty, index) in topBounties" :key="bounty.target_gamertag" class="relative">
          <!-- Medal Badge -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div
              :class="[
                'text-5xl w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br',
                getMedalColor(index),
              ]"
            >
              {{ getMedalEmoji(index) }}
            </div>
          </div>

          <!-- Card -->
          <div
            class="bg-gray-800 rounded-xl p-8 pt-16 text-center hover:bg-gray-750 transition transform hover:scale-105 border-2 border-gray-700 hover:border-red-500"
          >
            <!-- Rank -->
            <div class="text-6xl font-bold text-gray-700 mb-2">#{{ index + 1 }}</div>

            <!-- Profile Picture -->
            <div class="flex justify-center mb-4">
              <div
                class="w-24 h-24 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-700"
              >
                <img
                  v-if="bounty.avatar_url"
                  :src="bounty.avatar_url"
                  :alt="`${bounty.target_gamertag}'s avatar`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500"
                >
                  {{ bounty.target_gamertag.charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Gamertag -->
            <h3 class="text-2xl font-bold mb-4">{{ bounty.target_gamertag }}</h3>

            <!-- Stats -->
            <div class="space-y-3 mb-6">
              <div class="bg-gray-700 rounded-lg p-3">
                <div class="text-3xl font-bold text-red-500">{{ bounty.total_bounty }}</div>
                <div class="text-sm text-gray-400">Total Bounty</div>
              </div>

              <div class="bg-gray-700 rounded-lg p-3">
                <div class="text-xl font-bold">{{ bounty.bounty_count }}</div>
                <div class="text-sm text-gray-400">Active Bounties</div>
              </div>
            </div>

            <!-- View Bounties Button -->
            <RouterLink
              to="/bounties"
              class="block w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition"
            >
              Hunt This Target
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 text-gray-400">
        <p class="text-xl mb-4">No bounties yet!</p>
        <RouterLink
          to="/create-bounty"
          class="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Be the First to Create One
        </RouterLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Place Bounties -->
        <div class="bg-gray-800 rounded-lg p-8 text-center hover:bg-gray-750 transition">
          <div class="inline-block bg-red-500/10 p-4 rounded-full mb-4">
            <Target class="text-red-500" :size="48" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Place Bounties</h3>
          <p class="text-gray-400">
            Target any player and set a bounty amount. The higher the bounty, the more hunters will
            come.
          </p>
        </div>

        <!-- Earn Points -->
        <div class="bg-gray-800 rounded-lg p-8 text-center hover:bg-gray-750 transition">
          <div class="inline-block bg-yellow-500/10 p-4 rounded-full mb-4">
            <Trophy class="text-yellow-500" :size="48" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Earn Points</h3>
          <p class="text-gray-400">
            Complete bounties by eliminating targets and submitting proof. Climb the leaderboard!
          </p>
        </div>

        <!-- Community Driven -->
        <div class="bg-gray-800 rounded-lg p-8 text-center hover:bg-gray-750 transition">
          <div class="inline-block bg-blue-500/10 p-4 rounded-full mb-4">
            <Users class="text-blue-500" :size="48" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Community Driven</h3>
          <p class="text-gray-400">
            Fair play enforced by community verification. No cheating, just skill.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="container mx-auto px-4 py-20 text-center">
      <div
        class="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-12"
      >
        <h2 class="text-4xl font-bold mb-4">Ready to Start Hunting?</h2>
        <p class="text-xl text-gray-300 mb-8">
          Join the Arc Raiders bounty hunting community today
        </p>
        <RouterLink
          to="/bounties"
          class="inline-block bg-red-600 hover:bg-red-700 px-10 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
        >
          View All Bounties
        </RouterLink>
      </div>
    </div>
  </div>
</template>
