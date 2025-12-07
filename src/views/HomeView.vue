<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { Target, Trophy, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h1
          class="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
        >
          ARC RAIDERS BOUNTY SYSTEM
        </h1>
        <p class="text-xl text-gray-300 mb-8">Place bounties. Hunt targets. Claim glory.</p>
        <div class="flex gap-4 justify-center">
          <RouterLink
            to="/bounties"
            class="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition"
          >
            View Bounties
          </RouterLink>
          <RouterLink
            to="/create-bounty"
            class="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition"
          >
            Create Bounty
          </RouterLink>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 mt-16">
        <div class="bg-gray-800 p-6 rounded-lg">
          <Target class="w-12 h-12 text-red-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Place Bounties</h3>
          <p class="text-gray-400">
            Target any player and set a bounty amount. The higher the bounty, the more hunters will
            come.
          </p>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <Trophy class="w-12 h-12 text-yellow-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Earn Points</h3>
          <p class="text-gray-400">
            Complete bounties by eliminating targets and submitting proof. Climb the leaderboard!
          </p>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <Users class="w-12 h-12 text-blue-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Community Driven</h3>
          <p class="text-gray-400">
            Fair play enforced by community verification. No cheating, just skill.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
