<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTrophyStats } from '@/lib/db'
import type { TrophyStats } from '@/lib/supabase'
import { getUserAchievements } from '@/lib/achievements'
import type { UserAchievement } from '@/lib/supabase'
import {
  Trophy,
  Award,
  Skull,
  Target,
  Shield,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Crown,
  ChevronLeft
} from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import TrophyCard from '@/components/TrophyCard.vue'
import NotorietyLevel from '@/components/NotorietyLevel.vue'
import AchievementBadge from '@/components/AchievementBadge.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import LoadingState from '@/components/LoadingState.vue'
import Card from '@/components/Card.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const trophyStats = ref<TrophyStats | null>(null)
const userAchievements = ref<UserAchievement[]>([])
const loading = ref(true)
const selectedRarity = ref<'all' | 'legendary' | 'epic' | 'rare' | 'common'>('all')

const userId = route.params.id as string

onMounted(async () => {
  await loadTrophyData()
})

async function loadTrophyData() {
  try {
    loading.value = true

    // Get trophy stats
    const stats = await getTrophyStats(userId)
    if (stats) {
      // Check if user is a Proud Rat (PR)
      if (stats.game_role !== 'PR') {
        // Redirect to profile if not a Proud Rat
        router.push(`/profile/${userId}`)
        return
      }
      trophyStats.value = stats
    }

    // Get user achievements
    const achievements = await getUserAchievements(userId)
    userAchievements.value = achievements

  } catch (error) {
    console.error('Error loading trophy wall:', error)
  } finally {
    loading.value = false
  }
}

const filteredAchievements = computed(() => {
  if (selectedRarity.value === 'all') {
    return userAchievements.value
  }
  return userAchievements.value.filter(
    a => a.achievement?.rarity === selectedRarity.value
  )
})

const rarityBreakdown = computed(() => ({
  legendary: userAchievements.value.filter(a => a.achievement?.rarity === 'legendary').length,
  epic: userAchievements.value.filter(a => a.achievement?.rarity === 'epic').length,
  rare: userAchievements.value.filter(a => a.achievement?.rarity === 'rare').length,
  common: userAchievements.value.filter(a => a.achievement?.rarity === 'common').length,
}))

const recentAchievements = computed(() => {
  return [...userAchievements.value]
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 5)
})

const mostWantedBadge = computed(() => {
  if (!trophyStats.value?.mostWantedRank) return null
  if (trophyStats.value.mostWantedRank === 1) return { variant: 'gold' as const, icon: 'Crown' }
  if (trophyStats.value.mostWantedRank === 2) return { variant: 'silver' as const, icon: 'Crown' }
  if (trophyStats.value.mostWantedRank === 3) return { variant: 'bronze' as const, icon: 'Crown' }
  return { variant: 'red' as const, icon: 'Target' }
})

function goBack() {
  router.push(`/profile/${userId}`)
}
</script>

<template>
  <div class="min-h-screen">
    <LoadingState v-if="loading" message="Loading trophy wall..." />

    <div v-else-if="!trophyStats" class="container mx-auto px-4 py-8">
      <EmptyState
        title="Trophy Wall Not Found"
        message="Could not load trophy data for this player."
        :icon="Trophy"
      />
    </div>

    <div v-else class="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft class="w-5 h-5" />
          <span>Back to Profile</span>
        </button>
      </div>

      <div class="space-y-2">
        <PageHeader
          title="Hall of Infamy"
          subtitle="Proud Rat Trophy Showcase"
          :icon="Trophy"
        />
        <div class="flex items-center justify-center sm:justify-start">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-arc-red/20 border-2 border-arc-red rounded-lg">
            <Skull class="w-5 h-5 text-arc-red" />
            <span class="text-arc-red font-bold uppercase tracking-wider text-sm">Proud Rat Exclusive</span>
          </div>
        </div>
      </div>

      <!-- Player Identity Card -->
      <Card variant="bordered">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-arc-yellow shadow-lg">
              <img
                v-if="trophyStats.avatar_url"
                :src="trophyStats.avatar_url"
                :alt="trophyStats.username"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-arc-yellow to-arc-red flex items-center justify-center"
              >
                <Skull class="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </div>
          </div>

          <!-- Player Info -->
          <div class="flex-1 text-center sm:text-left space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h2 class="text-2xl sm:text-3xl font-bold text-arc-dark">
                  {{ trophyStats.username }}
                </h2>
                <RoleBadge v-if="trophyStats.game_role" :role="trophyStats.game_role" />
              </div>
              <p v-if="trophyStats.clan_tag" class="text-arc-brown text-sm">
                Clan: [{{ trophyStats.clan_tag }}]
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-arc-brown">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                <span>Member since {{ formatDistanceToNow(new Date(trophyStats.memberSince), { addSuffix: true }) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                <span>Last seen {{ formatDistanceToNow(new Date(trophyStats.lastActivity), { addSuffix: true }) }}</span>
              </div>
            </div>

            <!-- Most Wanted Badge -->
            <div v-if="mostWantedBadge" class="inline-block">
              <div
                :class="[
                  'px-4 py-2 rounded-lg border-2 flex items-center gap-2 font-bold text-sm',
                  mostWantedBadge.variant === 'gold' ? 'bg-arc-yellow/20 border-arc-yellow text-arc-yellow' :
                  mostWantedBadge.variant === 'silver' ? 'bg-gray-300/20 border-gray-300 text-gray-600' :
                  mostWantedBadge.variant === 'bronze' ? 'bg-orange-600/20 border-orange-600 text-orange-600' :
                  'bg-arc-red/20 border-arc-red text-arc-red'
                ]"
              >
                <Crown class="w-5 h-5" />
                <span>Most Wanted #{{ trophyStats.mostWantedRank }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Notoriety Level -->
      <NotorietyLevel
        :level="trophyStats.notorietyLevel"
        :tier="trophyStats.notorietyTier"
        size="lg"
      />

      <!-- Trophy Stats Grid -->
      <div>
        <h3 class="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy class="w-6 h-6" />
          Trophy Collection
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <!-- Total Points -->
          <TrophyCard
            title="Total Points"
            :value="trophyStats.totalPoints"
            icon="Award"
            variant="yellow"
            :glow="true"
          />

          <!-- Bounties Survived -->
          <TrophyCard
            title="Bounties Survived"
            :value="trophyStats.bountiesSurvived"
            icon="Shield"
            variant="green"
            :glow="trophyStats.bountiesSurvived > 5"
          />

          <!-- Highest Bounty -->
          <TrophyCard
            title="Highest Bounty"
            :value="`$${trophyStats.highestBountyAmount.toLocaleString()}`"
            icon="Target"
            variant="red"
            :glow="trophyStats.highestBountyAmount > 10000"
          />

          <!-- Hunters Defeated -->
          <TrophyCard
            title="Hunters Defeated"
            :value="trophyStats.bountyHuntersDefeated"
            icon="Skull"
            variant="cyan"
            :glow="trophyStats.bountyHuntersDefeated > 10"
          />

          <!-- Active Streak -->
          <TrophyCard
            title="Active Streak"
            :value="trophyStats.activeBountyStreak"
            icon="Flame"
            variant="gold"
            :glow="trophyStats.activeBountyStreak > 3"
          />

          <!-- Bounties Placed -->
          <TrophyCard
            title="Bounties Placed"
            :value="trophyStats.totalBountiesPlaced"
            icon="Target"
            variant="default"
          />

          <!-- Legendary Achievements -->
          <TrophyCard
            title="Legendary"
            :value="trophyStats.legendaryAchievements"
            icon="Star"
            variant="gold"
            :glow="trophyStats.legendaryAchievements > 0"
            description="achievements"
          />

          <!-- Total Achievements -->
          <TrophyCard
            title="Total Achievements"
            :value="trophyStats.totalAchievements"
            icon="Trophy"
            variant="default"
          />
        </div>
      </div>

      <!-- Achievement Rarity Breakdown -->
      <Card variant="bordered">
        <h3 class="text-lg sm:text-xl font-bold text-arc-dark mb-4">Achievement Collection</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center space-y-2">
            <div class="text-3xl font-bold text-arc-yellow">{{ rarityBreakdown.legendary }}</div>
            <div class="text-sm text-arc-brown uppercase tracking-wide">Legendary</div>
          </div>
          <div class="text-center space-y-2">
            <div class="text-3xl font-bold text-purple-600">{{ rarityBreakdown.epic }}</div>
            <div class="text-sm text-arc-brown uppercase tracking-wide">Epic</div>
          </div>
          <div class="text-center space-y-2">
            <div class="text-3xl font-bold text-blue-600">{{ rarityBreakdown.rare }}</div>
            <div class="text-sm text-arc-brown uppercase tracking-wide">Rare</div>
          </div>
          <div class="text-center space-y-2">
            <div class="text-3xl font-bold text-gray-600">{{ rarityBreakdown.common }}</div>
            <div class="text-sm text-arc-brown uppercase tracking-wide">Common</div>
          </div>
        </div>
      </Card>

      <!-- Recent Achievements Timeline -->
      <div v-if="recentAchievements.length > 0">
        <h3 class="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock class="w-6 h-6" />
          Recent Achievements
        </h3>

        <div class="space-y-3">
          <Card
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            variant="bordered"
          >
            <div class="flex items-center gap-4">
              <AchievementBadge
                :achievement="achievement.achievement!"
                :earned="true"
                :earned-at="achievement.earned_at"
                size="md"
                :show-name="false"
              />
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-arc-dark">{{ achievement.achievement?.name }}</h4>
                <p class="text-sm text-arc-brown">{{ achievement.achievement?.description }}</p>
              </div>
              <div class="text-right text-sm text-arc-brown flex-shrink-0">
                {{ formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true }) }}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- All Achievements -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Star class="w-6 h-6" />
            All Achievements
          </h3>

          <!-- Rarity Filter -->
          <div class="flex gap-2">
            <button
              v-for="rarity in ['all', 'legendary', 'epic', 'rare', 'common']"
              :key="rarity"
              @click="selectedRarity = rarity as any"
              :class="[
                'px-3 py-1 rounded-lg text-sm font-medium transition-all',
                selectedRarity === rarity
                  ? 'bg-arc-yellow text-arc-dark shadow-lg'
                  : 'bg-arc-card text-arc-brown hover:bg-arc-beige'
              ]"
            >
              {{ rarity.charAt(0).toUpperCase() + rarity.slice(1) }}
            </button>
          </div>
        </div>

        <div v-if="filteredAchievements.length === 0">
          <EmptyState
            :title="`No ${selectedRarity === 'all' ? '' : selectedRarity} achievements yet`"
            message="Keep playing to unlock more achievements!"
            :icon="Trophy"
          />
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AchievementBadge
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            :achievement="achievement.achievement!"
            :earned="true"
            :earned-at="achievement.earned_at"
            size="lg"
            :show-name="true"
            :show-description="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
