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
import PageHeader from '@/components/PageHeader.vue'
import IconInput from '@/components/IconInput.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import Card from '@/components/Card.vue'

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
  <div class="page-container">
    <LoadingState v-if="loading" message="Loading bounties..." />

    <div v-else class="content-wrapper">
      <PageHeader title="Active Bounties">
        <template v-if="currentUser && myActiveHunts > 0" #subtitle>
          <p class="hunt-status">
            You are hunting {{ myActiveHunts }}/3 targets
          </p>
        </template>
        <template #actions>
          <RouterLink to="/create-bounty" class="new-bounty-btn">
            + New Bounty
          </RouterLink>
        </template>
      </PageHeader>

      <!-- Search and Filter Controls -->
      <div class="filters-section">
        <div class="filters-grid">
          <IconInput
            v-model="searchQuery"
            :icon="Search"
            placeholder="Search by gamertag..."
          />

          <div>
            <select v-model="sortBy" class="sort-select">
              <option value="amount-high">Highest Bounty</option>
              <option value="amount-low">Lowest Bounty</option>
              <option value="newest">Newest First</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>

        <div v-if="searchQuery" class="search-results">
          Found {{ filteredBounties.length }} bounty{{
            filteredBounties.length !== 1 ? 'ies' : 'y'
          }}
        </div>
      </div>

      <!-- Most Wanted Section -->
      <div class="most-wanted-section">
        <h2 class="section-title">
          <Target class="text-arc-red" />
          Most Wanted
        </h2>
        <div class="most-wanted-grid">
          <div
            v-for="(player, index) in mostWanted"
            :key="player.target_gamertag"
            class="most-wanted-card"
          >
            <div class="most-wanted-content">
              <div class="player-rank">#{{ index + 1 }}</div>
              <div>
                <div class="player-name">{{ player.target_gamertag }}</div>
                <div class="player-stats">
                  {{ player.total_bounty }} points • {{ player.bounty_count }} bounties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Bounties -->
      <div class="bounties-list">
        <EmptyState
          v-if="filteredBounties.length === 0"
          :icon="Target"
          :message="searchQuery
              ? 'No bounties match your search'
              : 'No active bounties. Be the first to create one!'"
          actionText="Create Bounty"
          actionTo="/create-bounty"
        />

        <Card
          v-for="bounty in filteredBounties"
          :key="bounty.id"
          hover
        >
          <div class="bounty-content">
            <div class="bounty-info">
              <h3 class="bounty-target">{{ bounty.target_gamertag }}</h3>
              <div class="bounty-meta">
                <span class="expiration-info" :class="getExpirationColor(bounty.expires_at)">
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
                <span class="hunter-count">
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
                  class="extend-btn"
                  title="Extend by 7 days"
                >
                  + 7 days
                </button>
              </div>
            </div>
            <div class="bounty-actions">
              <div class="bounty-amount">{{ bounty.bounty_amount }}</div>
              <div class="bounty-points-label">points</div>

              <!-- Hunt/Claim Buttons -->
              <div class="action-buttons">
                <template v-if="currentUser">
                  <button
                    v-if="!huntingStatus[bounty.id]"
                    @click="handleJoinHunt(bounty.id)"
                    :disabled="joiningHunt === bounty.id || myActiveHunts >= 3"
                    class="join-hunt-btn"
                    :title="myActiveHunts >= 3 ? 'Maximum 3 active hunts' : 'Join hunt'"
                  >
                    <UserPlus :size="16" />
                    {{ joiningHunt === bounty.id ? 'Joining...' : 'Join Hunt' }}
                  </button>

                  <button
                    v-else
                    @click="handleLeaveHunt(bounty.id)"
                    :disabled="joiningHunt === bounty.id"
                    class="leave-hunt-btn"
                  >
                    <UserMinus :size="16" />
                    Leave Hunt
                  </button>
                </template>

                <RouterLink :to="`/claim/${bounty.id}`" class="claim-btn">
                  Claim Bounty
                </RouterLink>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-6 sm:py-8;
}

.hunt-status {
  @apply text-arc-brown mt-2 text-sm sm:text-base;
}

.new-bounty-btn {
  @apply bg-arc-red hover:bg-arc-red/80 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap text-black;
}

.filters-section {
  @apply bg-arc-card rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 border border-arc-brown/10;
}

.filters-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4;
}


.sort-select {
  @apply w-full bg-white border border-arc-brown/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-arc-brown;
}

.search-results {
  @apply mt-3 text-xs sm:text-sm text-arc-brown;
}

.most-wanted-section {
  @apply bg-arc-card rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-arc-brown/10;
}

.section-title {
  @apply text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900;
}

.most-wanted-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4;
}

.most-wanted-card {
  @apply bg-arc-beige p-3 sm:p-4 rounded-lg border border-arc-brown/20;
}

.most-wanted-content {
  @apply flex items-center gap-2 sm:gap-3;
}

.player-rank {
  @apply text-2xl sm:text-3xl font-bold text-arc-red flex-shrink-0;
}

.player-name {
  @apply font-bold text-sm sm:text-base break-words text-gray-900;
}

.player-stats {
  @apply text-xs sm:text-sm text-gray-700;
}

.bounties-list {
  @apply space-y-3 sm:space-y-4;
}


.bounty-content {
  @apply flex flex-col sm:flex-row justify-between items-start gap-4;
}

.bounty-info {
  @apply flex-1 w-full sm:w-auto;
}

.bounty-target {
  @apply text-xl sm:text-2xl font-bold mb-2 break-words text-gray-900;
}

.bounty-meta {
  @apply flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap;
}

.expiration-info {
  @apply flex items-center gap-1 text-arc-brown;
}

.hunter-count {
  @apply flex items-center gap-1 text-arc-red;
}

.extend-btn {
  @apply text-xs bg-arc-yellow hover:bg-arc-yellow/80 px-2 sm:px-3 py-1 rounded transition text-black;
}

.bounty-actions {
  @apply text-center sm:text-right w-full sm:w-auto flex-shrink-0;
}

.bounty-amount {
  @apply text-2xl sm:text-3xl font-bold text-arc-red;
}

.bounty-points-label {
  @apply text-xs sm:text-sm text-arc-brown mb-2;
}

.action-buttons {
  @apply flex flex-row sm:flex-col gap-2;
}

.join-hunt-btn {
  @apply bg-arc-red hover:bg-arc-red/80 disabled:bg-arc-brown/40 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition flex-1 sm:flex-none text-black disabled:text-gray-600;
}

.leave-hunt-btn {
  @apply bg-arc-brown hover:bg-arc-brown/80 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition flex-1 sm:flex-none text-black;
}

.claim-btn {
  @apply bg-arc-red hover:bg-arc-red/80 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-semibold text-center transition flex-1 sm:flex-none whitespace-nowrap text-black;
}
</style>
