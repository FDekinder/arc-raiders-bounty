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
  if (index === 0) return 'from-arc-yellow to-arc-yellow-600'
  if (index === 1) return 'from-arc-red-300 to-arc-red-400'
  if (index === 2) return 'from-arc-red to-arc-red-600'
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
  <div class="min-h-screen bg-gradient-to-b from-arc-dark to-arc-navy text-white">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-6xl md:text-7xl font-bold mb-6">
        <span class="bg-gradient-to-r from-arc-red via-arc-green via-arc-yellow to-arc-red bg-clip-text text-transparent">
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
          class="bg-arc-red hover:bg-arc-red-600 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 text-white shadow-lg shadow-arc-red/30"
        >
          View Bounties
        </RouterLink>
        <RouterLink
          to="/create-bounty"
          class="bg-arc-navy border-2 border-arc-red hover:bg-arc-red hover:shadow-lg hover:shadow-arc-red/30 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
        >
          Create Bounty
        </RouterLink>
      </div>
    </div>

    <!-- Top 3 Most Wanted -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Target class="text-arc-red" :size="40" />
          <span class="bg-gradient-to-r from-arc-red via-arc-yellow to-arc-red bg-clip-text text-transparent">Most Wanted</span>
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
            class="bg-arc-navy rounded-xl p-8 pt-16 text-center hover:bg-arc-dark transition transform hover:scale-105 border-2 border-arc-red/30 hover:border-arc-red hover:shadow-lg hover:shadow-arc-red/30"
          >
            <!-- Rank -->
            <div class="text-6xl font-bold text-arc-red/20 mb-2">#{{ index + 1 }}</div>

            <!-- Profile Picture -->
            <div class="flex justify-center mb-4">
              <div
                class="w-24 h-24 rounded-full border-4 border-arc-red overflow-hidden bg-arc-dark"
              >
                <img
                  v-if="bounty.avatar_url"
                  :src="bounty.avatar_url"
                  :alt="`${bounty.target_gamertag}'s avatar`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-4xl font-bold text-arc-red"
                >
                  {{ bounty.target_gamertag.charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Gamertag -->
            <h3 class="text-2xl font-bold mb-4">{{ bounty.target_gamertag }}</h3>

            <!-- Stats -->
            <div class="space-y-3 mb-6">
              <div class="bg-arc-dark rounded-lg p-3 border border-arc-red/30">
                <div class="text-3xl font-bold text-arc-red">{{ bounty.total_bounty }}</div>
                <div class="text-sm text-gray-400">Total Bounty</div>
              </div>

              <div class="bg-arc-dark rounded-lg p-3 border border-arc-red/30">
                <div class="text-xl font-bold">{{ bounty.bounty_count }}</div>
                <div class="text-sm text-gray-400">Active Bounties</div>
              </div>
            </div>

            <!-- View Bounties Button -->
            <RouterLink
              to="/bounties"
              class="block w-full bg-arc-red hover:bg-arc-red-600 text-white py-3 rounded-lg font-semibold transition shadow-md"
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
          class="inline-block bg-arc-red hover:bg-arc-red-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md shadow-arc-red/30"
        >
          Be the First to Create One
        </RouterLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Place Bounties -->
        <div class="bg-arc-navy rounded-lg p-8 text-center hover:bg-arc-dark transition border border-arc-red/30 hover:border-arc-red hover:shadow-lg hover:shadow-arc-red/20">
          <div class="inline-block bg-arc-red/10 p-4 rounded-full mb-4">
            <Target class="text-arc-red" :size="48" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Place Bounties</h3>
          <p class="text-gray-400">
            Target any player and set a bounty amount. The higher the bounty, the more hunters will
            come.
          </p>
        </div>

        <!-- Earn Points -->
        <div class="bg-arc-navy rounded-lg p-8 text-center hover:bg-arc-dark transition border border-arc-yellow/30 hover:border-arc-yellow hover:shadow-lg hover:shadow-arc-yellow/20">
          <div class="inline-block bg-arc-yellow/10 p-4 rounded-full mb-4">
            <Trophy class="text-arc-yellow" :size="48" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Earn Points</h3>
          <p class="text-gray-400">
            Complete bounties by eliminating targets and submitting proof. Climb the leaderboard!
          </p>
        </div>

        <!-- Community Driven -->
        <div class="bg-arc-navy rounded-lg p-8 text-center hover:bg-arc-dark transition border border-arc-green/30 hover:border-arc-green hover:shadow-lg hover:shadow-arc-green/20">
          <div class="inline-block bg-arc-green/10 p-4 rounded-full mb-4">
            <Users class="text-arc-green" :size="48" />
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
        class="bg-gradient-to-r from-arc-red/10 via-arc-green/10 via-arc-yellow/10 to-arc-red/10 border-2 border-arc-red/30 rounded-2xl p-12 shadow-lg shadow-arc-red/20"
      >
        <h2 class="text-4xl font-bold mb-4">Ready to Start Hunting?</h2>
        <p class="text-xl text-gray-300 mb-8">
          Join the Arc Raiders bounty hunting community today
        </p>
        <RouterLink
          to="/bounties"
          class="inline-block bg-arc-red hover:bg-arc-red-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-lg shadow-arc-red/40"
        >
          View All Bounties
        </RouterLink>
      </div>
    </div>
  </div>
</template>
