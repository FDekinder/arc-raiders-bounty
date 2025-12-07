<!-- src/views/BountiesView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getActiveBounties, getMostWanted } from '@/lib/db'
import type { Bounty, MostWanted } from '@/lib/supabase'
import { Target, Clock } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import { RouterLink } from 'vue-router'

const bounties = ref<Bounty[]>([])
const mostWanted = ref<MostWanted[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [bountiesData, mostWantedData] = await Promise.all([getActiveBounties(), getMostWanted()])
    bounties.value = bountiesData
    mostWanted.value = mostWantedData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-xl">Loading bounties...</div>
    </div>

    <div v-else class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Active Bounties</h1>
        <RouterLink
          to="/create-bounty"
          class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
        >
          + New Bounty
        </RouterLink>
      </div>

      <!-- Most Wanted Section -->
      <div class="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target class="text-red-500" />
          Most Wanted
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(player, index) in mostWanted"
            :key="player.target_gamertag"
            class="bg-gray-700 p-4 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="text-3xl font-bold text-red-500">#{{ index + 1 }}</div>
              <div>
                <div class="font-bold">{{ player.target_gamertag }}</div>
                <div class="text-sm text-gray-400">
                  {{ player.total_bounty }} points • {{ player.bounty_count }} bounties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Bounties -->
      <div class="space-y-4">
        <div
          v-if="bounties.length === 0"
          class="bg-gray-800 rounded-lg p-8 text-center text-gray-400"
        >
          No active bounties. Be the first to create one!
        </div>

        <div
          v-for="bounty in bounties"
          :key="bounty.id"
          class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-2xl font-bold mb-2">{{ bounty.target_gamertag }}</h3>
              <div class="flex items-center gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <Clock :size="16" />
                  Expires
                  {{ formatDistanceToNow(new Date(bounty.expires_at), { addSuffix: true }) }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-red-500">{{ bounty.bounty_amount }}</div>
              <div class="text-sm text-gray-400">points</div>
              <RouterLink
                :to="`/claim/${bounty.id}`"
                class="mt-2 inline-block bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
              >
                Claim Bounty
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
