<!-- src/views/BountiesView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getActiveBounties, getMostWanted } from '@/lib/db'
import type { Bounty, MostWanted } from '@/lib/supabase'
import { Target, Clock, Search, Users, UserPlus, UserMinus } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getTimeRemaining, getExpirationColor, extendBounty } from '@/lib/bountyExpiration'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/composables/useToast'
import { joinHunt, leaveHunt, getHunterCount, isHunting, getMyActiveHunts } from '@/lib/hunters'

const bounties = ref<Bounty[]>([])
const mostWanted = ref<MostWanted[]>([])
const loading = ref(true)

// Search and filter state
const searchQuery = ref('')
const sortBy = ref<'amount-high' | 'amount-low' | 'newest' | 'expiring'>('amount-high')

// Hunter tracking
const hunterCounts = ref<Record<string, number>>({})
const huntingStatus = ref<Record<string, boolean>>({})
const myActiveHunts = ref(0)
const joiningHunt = ref<string | null>(null)

const { success, error: showError } = useToast()
const currentUser = getCurrentUser()

onMounted(async () => {
  try {
    const [bountiesData, mostWantedData] = await Promise.all([getActiveBounties(), getMostWanted()])
    bounties.value = bountiesData
    mostWanted.value = mostWantedData

    await loadHunterData()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})

async function loadHunterData() {
  if (!currentUser) return

  // Get my active hunt count
  myActiveHunts.value = await getMyActiveHunts(currentUser.id)

  // Load hunter counts and status for each bounty
  for (const bounty of bounties.value) {
    hunterCounts.value[bounty.id] = await getHunterCount(bounty.id)
    huntingStatus.value[bounty.id] = await isHunting(bounty.id, currentUser.id)
  }
}

async function handleJoinHunt(bountyId: string) {
  if (!currentUser) {
    showError('Please login to join a hunt')
    return
  }

  joiningHunt.value = bountyId

  const result = await joinHunt(bountyId, currentUser.id)

  if (result.success) {
    success('You are now hunting this target!')
    huntingStatus.value[bountyId] = true
    hunterCounts.value[bountyId] = (hunterCounts.value[bountyId] || 0) + 1
    myActiveHunts.value++
  } else {
    showError(result.error || 'Failed to join hunt')
  }

  joiningHunt.value = null
}

async function handleLeaveHunt(bountyId: string) {
  if (!currentUser) return

  joiningHunt.value = bountyId

  const result = await leaveHunt(bountyId, currentUser.id)

  if (result.success) {
    success('You have stopped hunting this target')
    huntingStatus.value[bountyId] = false
    hunterCounts.value[bountyId] = Math.max(0, (hunterCounts.value[bountyId] || 0) - 1)
    myActiveHunts.value = Math.max(0, myActiveHunts.value - 1)
  } else {
    showError(result.error || 'Failed to leave hunt')
  }

  joiningHunt.value = null
}

async function handleExtendBounty(bountyId: string) {
  if (!currentUser) return

  try {
    const { error } = await extendBounty(bountyId, 7)

    if (error) throw error

    success('Bounty extended by 7 days!')

    const bountiesData = await getActiveBounties()
    bounties.value = bountiesData
  } catch (err: any) {
    showError(err.message || 'Failed to extend bounty')
  }
}

const filteredBounties = computed(() => {
  let filtered = bounties.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((b) => b.target_gamertag.toLowerCase().includes(query))
  }

  const sorted = [...filtered]
  switch (sortBy.value) {
    case 'amount-high':
      sorted.sort((a, b) => b.bounty_amount - a.bounty_amount)
      break
    case 'amount-low':
      sorted.sort((a, b) => a.bounty_amount - b.bounty_amount)
      break
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'expiring':
      sorted.sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
      break
  }

  return sorted
})
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-white text-xl">Loading bounties...</div>
    </div>

    <div v-else class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold">Active Bounties</h1>
          <p v-if="currentUser && myActiveHunts > 0" class="text-gray-400 mt-2">
            You are hunting {{ myActiveHunts }}/3 targets
          </p>
        </div>
        <RouterLink
          to="/create-bounty"
          class="bg-arc-cyan hover:bg-arc-cyan/80 px-6 py-2 rounded-lg font-semibold"
        >
          + New Bounty
        </RouterLink>
      </div>

      <!-- Search and Filter Controls -->
      <div class="bg-arc-navy rounded-lg p-4 mb-8">
        <div class="grid md:grid-cols-2 gap-4">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              :size="20"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by gamertag..."
              class="w-full bg-gray-700 border border-arc-cyan/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-arc-cyan"
            />
          </div>

          <div>
            <select
              v-model="sortBy"
              class="w-full bg-gray-700 border border-arc-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-arc-cyan"
            >
              <option value="amount-high">Highest Bounty</option>
              <option value="amount-low">Lowest Bounty</option>
              <option value="newest">Newest First</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>

        <div v-if="searchQuery" class="mt-3 text-sm text-gray-400">
          Found {{ filteredBounties.length }} bounty{{
            filteredBounties.length !== 1 ? 'ies' : 'y'
          }}
        </div>
      </div>

      <!-- Most Wanted Section -->
      <div class="bg-arc-navy rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target class="text-arc-cyan" />
          Most Wanted
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(player, index) in mostWanted"
            :key="player.target_gamertag"
            class="bg-gray-700 p-4 rounded-lg border border-arc-cyan/20"
          >
            <div class="flex items-center gap-3">
              <div class="text-3xl font-bold text-arc-cyan">#{{ index + 1 }}</div>
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
          v-if="filteredBounties.length === 0"
          class="bg-arc-navy rounded-lg p-8 text-center text-gray-400"
        >
          {{
            searchQuery
              ? 'No bounties match your search'
              : 'No active bounties. Be the first to create one!'
          }}
        </div>

        <div
          v-for="bounty in filteredBounties"
          :key="bounty.id"
          class="bg-arc-navy rounded-lg p-6 hover:bg-arc-navy/80 transition"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-2xl font-bold mb-2">{{ bounty.target_gamertag }}</h3>
              <div class="flex items-center gap-4 text-sm flex-wrap">
                <span
                  class="flex items-center gap-1"
                  :class="getExpirationColor(bounty.expires_at)"
                >
                  <Clock :size="16" />
                  <template v-if="getTimeRemaining(bounty.expires_at).isExpired">
                    Expired
                  </template>
                  <template v-else-if="getTimeRemaining(bounty.expires_at).days > 0">
                    {{ getTimeRemaining(bounty.expires_at).days }}d
                    {{ getTimeRemaining(bounty.expires_at).hours }}h remaining
                  </template>
                  <template v-else-if="getTimeRemaining(bounty.expires_at).hours > 0">
                    {{ getTimeRemaining(bounty.expires_at).hours }}h
                    {{ getTimeRemaining(bounty.expires_at).minutes }}m remaining
                  </template>
                  <template v-else>
                    {{ getTimeRemaining(bounty.expires_at).minutes }}m remaining
                  </template>
                </span>

                <!-- Hunter Count -->
                <span class="flex items-center gap-1 text-arc-cyan">
                  <Users :size="16" />
                  {{ hunterCounts[bounty.id] || 0 }} hunter{{
                    (hunterCounts[bounty.id] || 0) !== 1 ? 's' : ''
                  }}
                </span>

                <!-- Extend button -->
                <button
                  v-if="
                    currentUser &&
                    bounty.created_by === currentUser.id &&
                    getTimeRemaining(bounty.expires_at).totalHours < 48
                  "
                  @click="handleExtendBounty(bounty.id)"
                  class="text-xs bg-arc-yellow hover:bg-arc-yellow/80 px-3 py-1 rounded transition"
                  title="Extend by 7 days"
                >
                  + 7 days
                </button>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-arc-cyan">{{ bounty.bounty_amount }}</div>
              <div class="text-sm text-gray-400 mb-2">points</div>

              <!-- Hunt/Claim Buttons -->
              <div class="flex flex-col gap-2">
                <template v-if="currentUser">
                  <button
                    v-if="!huntingStatus[bounty.id]"
                    @click="handleJoinHunt(bounty.id)"
                    :disabled="joiningHunt === bounty.id || myActiveHunts >= 3"
                    class="bg-arc-cyan hover:bg-arc-cyan/80 disabled:bg-gray-600 px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition"
                    :title="myActiveHunts >= 3 ? 'Maximum 3 active hunts' : 'Join hunt'"
                  >
                    <UserPlus :size="16" />
                    {{ joiningHunt === bounty.id ? 'Joining...' : 'Join Hunt' }}
                  </button>

                  <button
                    v-else
                    @click="handleLeaveHunt(bounty.id)"
                    :disabled="joiningHunt === bounty.id"
                    class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <UserMinus :size="16" />
                    Leave Hunt
                  </button>
                </template>

                <RouterLink
                  :to="`/claim/${bounty.id}`"
                  class="bg-arc-cyan hover:bg-arc-cyan/80 px-4 py-2 rounded text-sm font-semibold text-center transition"
                >
                  Claim Bounty
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
