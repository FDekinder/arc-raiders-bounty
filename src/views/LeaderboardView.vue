<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { RouterLink } from 'vue-router'
import { getTopAchievements } from '@/lib/achievements'
import { getTopKillers } from '@/lib/db'
import AchievementBadge from '@/components/AchievementBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import RankBadge from '@/components/RankBadge.vue'
import IconTrophy from '@/components/icons/IconTrophy.vue'
import IconHunter from '@/components/icons/IconHunter.vue'
import TacticalButton from '@/components/TacticalButton.vue'
import AdUnit from '@/components/AdUnit.vue'
import type { Achievement, TopKiller } from '@/lib/supabase'

const hunters = ref<any[]>([])
const killers = ref<TopKiller[]>([])
const loading = ref(true)
const killersLoading = ref(true)
const hunterAchievements = ref<Map<string, Achievement[]>>(new Map())
const selectedLeaderboard = ref<'hunters' | 'killers'>('hunters')

const isLoading = computed(() => {
  return selectedLeaderboard.value === 'hunters' ? loading.value : killersLoading.value
})

// Ad configuration
const adSlotLeaderboard = import.meta.env.VITE_AD_SLOT_LEADERBOARD || 'PLACEHOLDER_SLOT_2'

onMounted(async () => {
  // Load Top Hunters
  try {
    // Modified query to get user ID
    const { data, error } = await supabase
      .from('users')
      .select('id, username, total_points, bounties_completed, avatar_url, clan_tag, game_role')
      .order('total_points', { ascending: false })
      .limit(10)

    if (error) throw error
    hunters.value = data

    // Load top achievements for each hunter
    if (data) {
      for (const hunter of data) {
        const achievements = await getTopAchievements(hunter.id, 3)
        hunterAchievements.value.set(hunter.id, achievements)
      }
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  } finally {
    loading.value = false
  }

  // Load Top Killers
  try {
    const killersData = await getTopKillers(10) // Get top 10
    killers.value = killersData
  } catch (error) {
    console.error('Error loading top killers:', error)
  } finally {
    killersLoading.value = false
  }
})

function getDefaultAvatar(role: string | null | undefined): string {
  if (role === 'PR') return '/rat.png'
  if (role === 'BH') return '/bounty_hunter_cropped.png'
  return '/default.png'
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header with Dropdown -->
      <div class="header-with-dropdown">
        <div class="header">
          <h1 class="title">
            <IconTrophy v-if="selectedLeaderboard === 'hunters'" className="text-arc-yellow" :size="48" />
            <IconHunter v-else className="text-arc-red" :size="48" />
            {{ selectedLeaderboard === 'hunters' ? 'Top Hunters' : 'Top Killers' }}
          </h1>
          <p class="subtitle">
            {{ selectedLeaderboard === 'hunters'
              ? 'The most skilled bounty hunters in Arc Raiders'
              : 'The most dangerous Proud Rats in the wasteland'
            }}
          </p>
        </div>

        <!-- Tab Selector -->
        <div class="tabs-container">
          <TacticalButton
            :variant="selectedLeaderboard === 'hunters' ? 'primary' : 'ghost'"
            size="md"
            @click="selectedLeaderboard = 'hunters'"
          >
            <template #icon>
              <IconTrophy :size="18" />
            </template>
            Top Hunters
          </TacticalButton>
          <TacticalButton
            :variant="selectedLeaderboard === 'killers' ? 'primary' : 'ghost'"
            size="md"
            @click="selectedLeaderboard = 'killers'"
          >
            <template #icon>
              <IconHunter :size="18" />
            </template>
            Top Killers
          </TacticalButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">Loading leaderboard...</div>

      <!-- Top Hunters List -->
      <div v-else-if="selectedLeaderboard === 'hunters'" class="hunters-list">
        <div
          v-for="(hunter, index) in hunters"
          :key="hunter.id"
          class="hunter-card"
        >
          <!-- Rank -->
          <div class="rank">
            <RankBadge v-if="index < 3" :rank="(index + 1) as 1 | 2 | 3" />
            <span v-else class="rank-number">#{{ index + 1 }}</span>
          </div>

          <!-- Avatar -->
          <RouterLink :to="`/profile/${hunter.id}`" class="avatar">
            <img
              :src="hunter.avatar_url || getDefaultAvatar(hunter.game_role)"
              :alt="`${hunter.username}'s avatar`"
              class="avatar-image"
            />
          </RouterLink>

          <!-- Info -->
          <div class="hunter-info">
            <div class="hunter-name-row">
              <RouterLink
                :to="`/profile/${hunter.id}`"
                class="hunter-name"
              >
                <span v-if="hunter.clan_tag" class="clan-tag">[{{ hunter.clan_tag }}]</span>
                {{ hunter.username }}
              </RouterLink>
              <RoleBadge v-if="hunter.game_role" :role="hunter.game_role" size="sm" />
            </div>
            <div class="hunter-stats">
              <span>{{ hunter.bounties_completed }} bounties completed</span>
            </div>
            <!-- Achievement Badges -->
            <div v-if="hunterAchievements.get(hunter.id)?.length" class="achievements">
              <AchievementBadge
                v-for="achievement in hunterAchievements.get(hunter.id)"
                :key="achievement.id"
                :achievement="achievement"
                :earned="true"
                size="sm"
              />
            </div>
          </div>

          <!-- Points -->
          <div class="points-section">
            <div class="points-display">
              <Award class="text-arc-yellow" :size="24" />
              <span class="points-value">
                {{ hunter.total_points }}
              </span>
            </div>
            <div class="points-label">points</div>
          </div>
        </div>

        <div v-if="hunters.length === 0" class="empty-state">
          No hunters yet. Be the first to complete a bounty!
        </div>
      </div>

      <!-- Top Killers List -->
      <div v-else class="hunters-list">
        <div
          v-for="(killer, index) in killers"
          :key="killer.killer_id"
          class="hunter-card"
        >
          <!-- Rank -->
          <div class="rank">
            <RankBadge v-if="index < 3" :rank="(index + 1) as 1 | 2 | 3" />
            <span v-else class="rank-number">#{{ index + 1 }}</span>
          </div>

          <!-- Avatar -->
          <RouterLink :to="`/profile/${killer.killer_id}`" class="avatar">
            <img
              :src="killer.avatar_url || getDefaultAvatar(killer.game_role)"
              :alt="`${killer.username}'s avatar`"
              class="avatar-image"
            />
          </RouterLink>

          <!-- Info -->
          <div class="hunter-info">
            <div class="hunter-name-row">
              <RouterLink
                :to="`/profile/${killer.killer_id}`"
                class="hunter-name"
              >
                <span v-if="killer.clan_tag" class="clan-tag">[{{ killer.clan_tag }}]</span>
                {{ killer.username }}
              </RouterLink>
              <RoleBadge v-if="killer.game_role" :role="killer.game_role" size="sm" />
            </div>
            <div class="hunter-stats">
              <span>{{ killer.kill_count }} {{ killer.kill_count === 1 ? 'kill' : 'kills' }}</span>
            </div>
          </div>

          <!-- Kill Count -->
          <div class="points-section">
            <div class="points-display">
              <Skull class="text-arc-red" :size="24" />
              <span class="points-value">
                {{ killer.kill_count }}
              </span>
            </div>
            <div class="points-label">{{ killer.kill_count === 1 ? 'kill' : 'kills' }}</div>
          </div>
        </div>

        <div v-if="killers.length === 0" class="empty-state">
          No kills recorded yet. Be the first Proud Rat to report a kill!
        </div>
      </div>
    </div>

    <!-- Ad at bottom of leaderboard -->
    <div class="mt-12">
      <AdUnit
        :slot="adSlotLeaderboard"
        format="auto"
        :responsive="true"
      />
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

.header-with-dropdown {
  @apply flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 sm:mb-12;
}

.header {
  @apply text-center md:text-left flex-1;
}

.title {
  @apply text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center justify-center md:justify-start gap-2 sm:gap-3 text-white;
}

.subtitle {
  @apply text-arc-brown text-sm sm:text-base px-4 md:px-0;
}

/* Tabs Container */
.tabs-container {
  @apply flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto min-w-[200px];
}

.tabs-container :deep(button) {
  @apply w-full sm:w-auto;
}

.loading-state {
  @apply text-center text-lg sm:text-xl text-gray-900;
}

.hunters-list {
  @apply max-w-4xl mx-auto space-y-3 sm:space-y-4;
}

.hunter-card {
  @apply bg-arc-card rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:bg-white transition border border-arc-brown/10;
}

.rank {
  @apply text-2xl sm:text-3xl md:text-4xl font-bold w-10 sm:w-12 md:w-16 text-center flex-shrink-0 flex items-center justify-center;
}

.rank-number {
  @apply text-arc-brown;
}

.avatar {
  @apply w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-arc-beige flex items-center justify-center flex-shrink-0 overflow-hidden;
}

.avatar-image {
  @apply w-full h-full object-cover;
}

.hunter-info {
  @apply flex-1 w-full sm:w-auto min-w-0;
}

.hunter-name-row {
  @apply flex items-center gap-2 mb-1 flex-wrap;
}

.hunter-name {
  @apply text-lg sm:text-xl md:text-2xl font-bold hover:text-arc-red transition break-words text-gray-900;
}

.clan-tag {
  @apply text-arc-red;
}

.hunter-stats {
  @apply flex gap-2 sm:gap-4 text-xs sm:text-sm text-arc-brown mt-1;
}

.achievements {
  @apply flex gap-1 sm:gap-2 mt-2 flex-wrap;
}

.points-section {
  @apply text-center sm:text-right w-full sm:w-auto flex-shrink-0;
}

.points-display {
  @apply flex items-center gap-2 justify-center sm:justify-end mb-1;
}

.points-value {
  @apply text-xl sm:text-2xl md:text-3xl font-bold text-arc-yellow;
}

.points-label {
  @apply text-xs sm:text-sm text-arc-brown;
}

.empty-state {
  @apply text-center text-arc-brown py-8 sm:py-12 px-4 text-sm sm:text-base;
}
</style>
