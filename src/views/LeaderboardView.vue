<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Trophy, Target, Award } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getTopAchievements } from '@/lib/achievements'
import AchievementBadge from '@/components/AchievementBadge.vue'
import type { Achievement } from '@/lib/supabase'

const hunters = ref<any[]>([])
const loading = ref(true)
const hunterAchievements = ref<Map<string, Achievement[]>>(new Map())

onMounted(async () => {
  try {
    // Modified query to get user ID
    const { data, error } = await supabase
      .from('users')
      .select('id, username, total_points, bounties_completed, avatar_url')
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
  <div class="min-h-screen bg-arc-dark text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy class="text-arc-yellow" :size="48" />
          Top Hunters
        </h1>
        <p class="text-gray-400">The most skilled bounty hunters in Arc Raiders</p>
      </div>

      <div v-if="loading" class="text-center text-xl">Loading leaderboard...</div>

      <div v-else class="max-w-4xl mx-auto space-y-4">
        <div
          v-for="(hunter, index) in hunters"
          :key="hunter.id"
          class="bg-arc-navy rounded-lg p-6 flex items-center gap-6 hover:bg-arc-navy/80 transition"
        >
          <!-- Rank -->
          <div class="text-4xl font-bold w-16 text-center" :class="getMedalColor(index)">
            #{{ index + 1 }}
          </div>

          <!-- Avatar placeholder -->
          <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <Target :size="32" class="text-gray-500" />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <RouterLink
              :to="`/profile/${hunter.id}`"
              class="text-2xl font-bold hover:text-arc-red transition"
            >
              {{ hunter.username }}
            </RouterLink>
            <div class="flex gap-4 text-sm text-gray-400 mt-1">
              <span>{{ hunter.bounties_completed }} bounties completed</span>
            </div>
            <!-- Achievement Badges -->
            <div v-if="hunterAchievements.get(hunter.id)?.length" class="flex gap-2 mt-2">
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
          <div class="text-right">
            <div class="flex items-center gap-2 justify-end mb-1">
              <Award class="text-arc-yellow" :size="24" />
              <span class="text-3xl font-bold text-arc-yellow">
                {{ hunter.total_points }}
              </span>
            </div>
            <div class="text-sm text-gray-400">points</div>
          </div>
        </div>

        <div v-if="hunters.length === 0" class="text-center text-gray-400 py-12">
          No hunters yet. Be the first to complete a bounty!
        </div>
      </div>
    </div>
  </div>
</template>
