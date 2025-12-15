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
  if (index === 1) return 'text-gray-400'
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
            <Target :size="32" class="text-gray-500" />
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
  @apply min-h-screen bg-arc-dark text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8;
}

.header {
  @apply text-center mb-12;
}

.title {
  @apply text-5xl font-bold mb-4 flex items-center justify-center gap-3;
}

.subtitle {
  @apply text-gray-400;
}

.loading-state {
  @apply text-center text-xl;
}

.hunters-list {
  @apply max-w-4xl mx-auto space-y-4;
}

.hunter-card {
  @apply bg-arc-navy rounded-lg p-6 flex items-center gap-6 hover:bg-arc-navy/80 transition;
}

.rank {
  @apply text-4xl font-bold w-16 text-center;
}

.avatar {
  @apply w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center;
}

.hunter-info {
  @apply flex-1;
}

.hunter-name-row {
  @apply flex items-center gap-2 mb-1;
}

.hunter-name {
  @apply text-2xl font-bold hover:text-arc-red transition;
}

.clan-tag {
  @apply text-arc-red;
}

.hunter-stats {
  @apply flex gap-4 text-sm text-gray-400 mt-1;
}

.achievements {
  @apply flex gap-2 mt-2;
}

.points-section {
  @apply text-right;
}

.points-display {
  @apply flex items-center gap-2 justify-end mb-1;
}

.points-value {
  @apply text-3xl font-bold text-arc-yellow;
}

.points-label {
  @apply text-sm text-gray-400;
}

.empty-state {
  @apply text-center text-gray-400 py-12;
}
</style>
