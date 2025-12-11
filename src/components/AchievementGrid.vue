<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAchievementProgress } from '@/lib/achievements'
import AchievementBadge from './AchievementBadge.vue'
import type { Achievement, UserAchievement } from '@/lib/supabase'

const props = defineProps<{
  userId: string
}>()

const loading = ref(true)
const earned = ref<UserAchievement[]>([])
const available = ref<Achievement[]>([])
const stats = ref({
  earnedCount: 0,
  totalCount: 0,
  byRarity: { common: 0, rare: 0, epic: 0, legendary: 0 }
})

const selectedFilter = ref<'all' | 'earned' | 'locked'>('all')
const selectedRarity = ref<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

onMounted(async () => {
  await loadAchievements()
})

async function loadAchievements() {
  loading.value = true
  try {
    const progress = await getAchievementProgress(props.userId)
    earned.value = progress.earned
    available.value = progress.available
    stats.value = {
      earnedCount: progress.earnedCount,
      totalCount: progress.totalCount,
      byRarity: progress.byRarity
    }
  } catch (error) {
    console.error('Failed to load achievements:', error)
  } finally {
    loading.value = false
  }
}

const filteredAchievements = computed(() => {
  let achievements: { achievement: Achievement; earned: boolean; earnedAt?: string }[] = []

  if (selectedFilter.value === 'all' || selectedFilter.value === 'earned') {
    const earnedAchievements = earned.value
      .filter(ua => ua.achievement)
      .map(ua => ({
        achievement: ua.achievement!,
        earned: true,
        earnedAt: ua.earned_at
      }))
    achievements = [...achievements, ...earnedAchievements]
  }

  if (selectedFilter.value === 'all' || selectedFilter.value === 'locked') {
    const lockedAchievements = available.value.map(a => ({
      achievement: a,
      earned: false
    }))
    achievements = [...achievements, ...lockedAchievements]
  }

  if (selectedRarity.value !== 'all') {
    achievements = achievements.filter(a => a.achievement.rarity === selectedRarity.value)
  }

  return achievements
})

const completionPercentage = computed(() => {
  if (stats.value.totalCount === 0) return 0
  return Math.round((stats.value.earnedCount / stats.value.totalCount) * 100)
})
</script>

<template>
  <div class="achievement-grid">
    <!-- Stats Header -->
    <div class="bg-arc-navy rounded-lg p-6 mb-6 border border-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-white">Achievements</h3>
        <div class="text-right">
          <p class="text-2xl font-bold text-arc-cyan">{{ stats.earnedCount }}/{{ stats.totalCount }}</p>
          <p class="text-sm text-gray-400">{{ completionPercentage }}% Complete</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-arc-cyan to-arc-green transition-all duration-500"
          :style="{ width: `${completionPercentage}%` }"
        ></div>
      </div>

      <!-- Rarity Breakdown -->
      <div class="grid grid-cols-4 gap-4 mt-4">
        <div class="text-center">
          <p class="text-lg font-bold text-gray-300">{{ stats.byRarity.common }}</p>
          <p class="text-xs text-gray-500">Common</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-blue-400">{{ stats.byRarity.rare }}</p>
          <p class="text-xs text-gray-500">Rare</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-purple-400">{{ stats.byRarity.epic }}</p>
          <p class="text-xs text-gray-500">Epic</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-arc-yellow">{{ stats.byRarity.legendary }}</p>
          <p class="text-xs text-gray-500">Legendary</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6 flex-wrap">
      <div class="flex gap-2">
        <button
          @click="selectedFilter = 'all'"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            selectedFilter === 'all'
              ? 'bg-arc-red text-white'
              : 'bg-arc-navy text-gray-400 hover:text-white'
          ]"
        >
          All
        </button>
        <button
          @click="selectedFilter = 'earned'"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            selectedFilter === 'earned'
              ? 'bg-arc-red text-white'
              : 'bg-arc-navy text-gray-400 hover:text-white'
          ]"
        >
          Earned
        </button>
        <button
          @click="selectedFilter = 'locked'"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            selectedFilter === 'locked'
              ? 'bg-arc-red text-white'
              : 'bg-arc-navy text-gray-400 hover:text-white'
          ]"
        >
          Locked
        </button>
      </div>

      <div class="flex gap-2">
        <button
          @click="selectedRarity = 'all'"
          :class="[
            'px-3 py-2 rounded-lg text-sm transition-all',
            selectedRarity === 'all'
              ? 'bg-gray-700 text-white'
              : 'bg-arc-navy text-gray-500 hover:text-white'
          ]"
        >
          All Rarities
        </button>
        <button
          @click="selectedRarity = 'legendary'"
          :class="[
            'px-3 py-2 rounded-lg text-sm transition-all',
            selectedRarity === 'legendary'
              ? 'bg-yellow-900 text-arc-yellow border border-arc-yellow'
              : 'bg-arc-navy text-gray-500 hover:text-arc-yellow'
          ]"
        >
          Legendary
        </button>
        <button
          @click="selectedRarity = 'epic'"
          :class="[
            'px-3 py-2 rounded-lg text-sm transition-all',
            selectedRarity === 'epic'
              ? 'bg-purple-900 text-purple-400 border border-purple-400'
              : 'bg-arc-navy text-gray-500 hover:text-purple-400'
          ]"
        >
          Epic
        </button>
        <button
          @click="selectedRarity = 'rare'"
          :class="[
            'px-3 py-2 rounded-lg text-sm transition-all',
            selectedRarity === 'rare'
              ? 'bg-blue-900 text-blue-400 border border-blue-400'
              : 'bg-arc-navy text-gray-500 hover:text-blue-400'
          ]"
        >
          Rare
        </button>
      </div>
    </div>

    <!-- Achievement Grid -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400">Loading achievements...</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <AchievementBadge
        v-for="item in filteredAchievements"
        :key="item.achievement.id"
        :achievement="item.achievement"
        :earned="item.earned"
        :earned-at="item.earnedAt"
        size="md"
        :show-name="true"
      />
    </div>

    <div v-if="filteredAchievements.length === 0" class="text-center py-12">
      <p class="text-gray-400">No achievements found with current filters.</p>
    </div>
  </div>
</template>
