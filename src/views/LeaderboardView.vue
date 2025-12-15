<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Trophy, Target, Award } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getTopAchievements } from '@/lib/achievements'
import AchievementBadge from '@/components/AchievementBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import type { Achievement } from '@/lib/supabase'

const hunters = ref<any[]>([])
const loading = ref(true)
const hunterAchievements = ref<Map<string, Achievement[]>>(new Map())

onMounted(async () => {
  try {
    // Modified query to get user ID
    const { data, error } = await supabase
      .from('users')
      .select('id, username, total_points, bounties_completed, avatar_url, clan_tag, role')
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
})

function getMedalColor(index: number) {
  if (index === 0) return 'text-arc-yellow'
  if (index === 1) return 'text-arc-brown'
  if (index === 2) return 'text-arc-yellow'
  return 'text-gray-600'
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header">
        <h1 class="title">
          <Trophy class="text-arc-yellow" :size="48" />
          Top Hunters
        </h1>
        <p class="subtitle">The most skilled bounty hunters in Arc Raiders</p>
      </div>

      <div v-if="loading" class="loading-state">Loading leaderboard...</div>

      <div v-else class="hunters-list">
        <div
          v-for="(hunter, index) in hunters"
          :key="hunter.id"
          class="hunter-card"
        >
          <!-- Rank -->
          <div class="rank" :class="getMedalColor(index)">
            #{{ index + 1 }}
          </div>

          <!-- Avatar placeholder -->
          <div class="avatar">
            <Target :size="32" class="text-gray-600" />
          </div>

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

.header {
  @apply text-center mb-8 sm:mb-12;
}

.title {
  @apply text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3 text-white;
}

.subtitle {
  @apply text-arc-brown text-sm sm:text-base px-4;
}

.loading-state {
  @apply text-center text-lg sm:text-xl text-white;
}

.hunters-list {
  @apply max-w-4xl mx-auto space-y-3 sm:space-y-4;
}

.hunter-card {
  @apply bg-arc-card rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:bg-white transition border border-arc-brown/10;
}

.rank {
  @apply text-3xl sm:text-4xl font-bold w-12 sm:w-16 text-center flex-shrink-0;
}

.avatar {
  @apply w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-arc-beige flex items-center justify-center flex-shrink-0;
}

.hunter-info {
  @apply flex-1 w-full sm:w-auto min-w-0;
}

.hunter-name-row {
  @apply flex items-center gap-2 mb-1 flex-wrap;
}

.hunter-name {
  @apply text-lg sm:text-xl md:text-2xl font-bold hover:text-arc-red transition break-words text-white;
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
  @apply text-2xl sm:text-3xl font-bold text-arc-yellow;
}

.points-label {
  @apply text-xs sm:text-sm text-arc-brown;
}

.empty-state {
  @apply text-center text-arc-brown py-8 sm:py-12 px-4 text-sm sm:text-base;
}
</style>
