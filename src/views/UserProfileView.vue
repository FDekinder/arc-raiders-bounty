<!-- src/views/UserProfileView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User, Bounty, BountyClaim } from '@/lib/supabase'
import { Target, Trophy, Award, TrendingUp, Clock } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import AchievementGrid from '@/components/AchievementGrid.vue'
import { getTopAchievements } from '@/lib/achievements'
import AchievementBadge from '@/components/AchievementBadge.vue'
import ClanTagEditor from '@/components/ClanTagEditor.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import type { Achievement } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import LoadingState from '@/components/LoadingState.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import StatCard from '@/components/StatCard.vue'
import Card from '@/components/Card.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const user = ref<User | null>(null)
const bountiesCreated = ref<Bounty[]>([])
const claimsSubmitted = ref<any[]>([])
const loading = ref(true)
const topAchievements = ref<Achievement[]>([])
const showAllAchievements = ref(false)

const userId = route.params.id as string
const currentUser = getCurrentUser()
const isOwnProfile = computed(() => currentUser?.id === userId)

onMounted(async () => {
  await loadUserProfile()
})

async function loadUserProfile() {
  try {
    loading.value = true

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError
    user.value = userData

    // Get bounties created by this user
    const { data: bountiesData } = await supabase
      .from('bounties')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    bountiesCreated.value = bountiesData || []

    // Get claims submitted by this user
    const { data: claimsData } = await supabase
      .from('bounty_claims')
      .select(
        `
        *,
        bounty:bounties(target_gamertag, bounty_amount)
      `,
      )
      .eq('hunter_id', userId)
      .order('claimed_at', { ascending: false })
      .limit(10)

    claimsSubmitted.value = claimsData || []

    // Get top achievements for this user
    const achievements = await getTopAchievements(userId, 5)
    topAchievements.value = achievements
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

const stats = computed(() => {
  if (!user.value) return null

  const approvedClaims = claimsSubmitted.value.filter((c) => c.verification_status === 'approved')
  const pendingClaims = claimsSubmitted.value.filter((c) => c.verification_status === 'pending')
  const rejectedClaims = claimsSubmitted.value.filter((c) => c.verification_status === 'rejected')

  const successRate =
    claimsSubmitted.value.length > 0
      ? Math.round((approvedClaims.length / claimsSubmitted.value.length) * 100)
      : 0

  const activeBounties = bountiesCreated.value.filter((b) => b.status === 'active').length
  const completedBounties = bountiesCreated.value.filter((b) => b.status === 'completed').length

  return {
    totalPoints: user.value.total_points,
    bountiesCompleted: user.value.bounties_completed,
    timesHunted: user.value.times_hunted,
    successRate,
    approvedClaims: approvedClaims.length,
    pendingClaims: pendingClaims.length,
    rejectedClaims: rejectedClaims.length,
    bountiesCreatedTotal: bountiesCreated.value.length,
    activeBounties,
    completedBounties,
  }
})

function handleClanTagUpdate(clanTag: string | null) {
  if (user.value) {
    user.value.clan_tag = clanTag ?? undefined
  }
}
</script>

<template>
  <div class="page-container">
    <LoadingState v-if="loading" message="Loading profile..." />

    <div v-else-if="!user" class="error-container">
      <AlertMessage variant="error" message="User Not Found" />
    </div>

    <div v-else class="content-wrapper">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-content">
          <!-- Avatar -->
          <div class="profile-avatar">
            <Target :size="48" class="avatar-icon" />
          </div>

          <!-- Info -->
          <div class="profile-info">
            <div class="profile-title-row">
              <h1 class="profile-username">{{ user.username }}</h1>
              <ClanTagEditor
                :user="user"
                :is-own-profile="isOwnProfile"
                @updated="handleClanTagUpdate"
              />
              <RoleBadge v-if="user.game_role" :role="user.game_role" size="lg" :show-label="true" />
            </div>
            <p class="profile-member-since">
              Member since {{ new Date(user.created_at).toLocaleDateString() }}
            </p>

            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="quick-stat">
                <div class="stat-value-row">
                  <Award class="stat-icon-yellow" :size="24" />
                  <span class="stat-value-yellow">{{
                    stats?.totalPoints || 0
                  }}</span>
                </div>
                <div class="stat-label">Total Points</div>
              </div>
              <div class="quick-stat">
                <div class="stat-value-row">
                  <Trophy class="stat-icon-green" :size="24" />
                  <span class="stat-value-green">{{
                    stats?.bountiesCompleted || 0
                  }}</span>
                </div>
                <div class="stat-label">Bounties Completed</div>
              </div>
              <div class="quick-stat">
                <div class="stat-value-row">
                  <TrendingUp class="stat-icon-red" :size="24" />
                  <span class="stat-value-red"
                    >{{ stats?.successRate || 0 }}%</span
                  >
                </div>
                <div class="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trophy Wall Section (Proud Rats Only) -->
      <div v-if="user.game_role === 'PR'" class="achievements-section">
        <router-link
          :to="`/profile/${userId}/trophies`"
          class="trophy-wall-banner"
        >
          <div class="flex items-center gap-4">
            <div class="trophy-icon-wrapper">
              <Trophy :size="32" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-arc-dark">Hall of Infamy</h3>
              <p class="text-arc-brown text-sm">View your complete trophy collection and notoriety level</p>
            </div>
            <div class="text-arc-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Top Achievements Section -->
      <div v-if="topAchievements.length > 0" class="achievements-section">
        <div class="achievements-header">
          <h3 class="achievements-title">
            <Award class="title-icon" />
            Achievements
          </h3>
          <div class="flex gap-2">
            <button
              @click="showAllAchievements = !showAllAchievements"
              class="view-all-btn"
            >
              {{ showAllAchievements ? 'Show Less' : 'View All' }}
            </button>
          </div>
        </div>

        <!-- Top Achievements Preview -->
        <div v-if="!showAllAchievements" class="achievements-preview">
          <AchievementBadge
            v-for="achievement in topAchievements"
            :key="achievement.id"
            :achievement="achievement"
            :earned="true"
            size="lg"
            :show-name="true"
          />
        </div>

        <!-- All Achievements Grid -->
        <div v-else>
          <AchievementGrid :user-id="userId" />
        </div>
      </div>

      <!-- Detailed Stats Grid -->
      <div class="stats-grid">
        <!-- Hunter Stats -->
        <Card>
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-arc-dark">
            <Trophy class="text-arc-green" />
            Hunter Stats
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Claims Approved</span>
              <span class="font-bold text-arc-green">{{ stats?.approvedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Claims Pending</span>
              <span class="font-bold text-arc-yellow-dark">{{ stats?.pendingClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Claims Rejected</span>
              <span class="font-bold text-arc-red">{{ stats?.rejectedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between border-t border-arc-brown/20 pt-3">
              <span class="text-arc-dark/80">Success Rate</span>
              <span class="font-bold text-arc-dark">{{ stats?.successRate || 0 }}%</span>
            </div>
          </div>
        </Card>

        <!-- Bounty Creator Stats -->
        <Card>
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-arc-dark">
            <Target class="text-arc-red" />
            Bounty Creator
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Total Bounties</span>
              <span class="font-bold text-arc-dark">{{ stats?.bountiesCreatedTotal || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Active</span>
              <span class="font-bold text-arc-yellow-dark">{{ stats?.activeBounties || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Completed</span>
              <span class="font-bold text-arc-green">{{ stats?.completedBounties || 0 }}</span>
            </div>
          </div>
        </Card>

        <!-- Other Stats -->
        <Card>
          <h3 class="text-xl font-bold mb-4 text-arc-dark">Other Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Times Hunted</span>
              <span class="font-bold text-arc-dark">{{ stats?.timesHunted || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-dark/80">Total Points</span>
              <span class="font-bold text-arc-yellow-dark">{{ stats?.totalPoints || 0 }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Activity Tabs -->
      <Card>
        <h3 class="text-2xl font-bold mb-6 text-arc-dark">Recent Activity</h3>

        <!-- Recent Claims -->
        <div class="mb-8">
          <h4 class="text-lg font-bold mb-4 text-arc-dark/90">Recent Claims</h4>
          <EmptyState
            v-if="claimsSubmitted.length === 0"
            :icon="Clock"
            message="No claims submitted yet"
          />
          <div v-else class="space-y-3">
            <div
              v-for="claim in claimsSubmitted.slice(0, 5)"
              :key="claim.id"
              class="bg-arc-beige/50 rounded-lg p-4 flex justify-between items-center border border-arc-brown/30"
            >
              <div>
                <div class="font-bold text-arc-dark">{{ claim.bounty?.target_gamertag }}</div>
                <div class="text-sm text-arc-dark/70">
                  {{ formatDistanceToNow(new Date(claim.claimed_at), { addSuffix: true }) }}
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-bold text-arc-dark">{{ claim.bounty?.bounty_amount }} pts</div>
                  <div
                    v-if="claim.verification_status === 'approved'"
                    class="text-sm text-arc-green"
                  >
                    +{{ claim.points_awarded }} earned
                  </div>
                </div>
                <StatusBadge :status="claim.verification_status" size="sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Bounties Created -->
        <div>
          <h4 class="text-lg font-bold mb-4 text-arc-dark/90">Bounties Created</h4>
          <EmptyState
            v-if="bountiesCreated.length === 0"
            :icon="Target"
            message="No bounties created yet"
          />
          <div v-else class="space-y-3">
            <div
              v-for="bounty in bountiesCreated.slice(0, 5)"
              :key="bounty.id"
              class="bg-arc-beige/50 rounded-lg p-4 flex justify-between items-center border border-arc-brown/30"
            >
              <div>
                <div class="font-bold text-arc-dark">{{ bounty.target_gamertag }}</div>
                <div class="text-sm text-arc-dark/70">
                  {{ formatDistanceToNow(new Date(bounty.created_at), { addSuffix: true }) }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-arc-red">{{ bounty.bounty_amount }} pts</div>
                <div
                  class="text-sm font-semibold"
                  :class="bounty.status === 'active' ? 'text-arc-yellow-dark' : 'text-arc-green'"
                >
                  {{ bounty.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8 space-y-8;
}

/* Profile Header */
.profile-header {
  @apply bg-arc-card rounded-xl p-6 md:p-8 border-2 border-arc-brown/20 shadow-lg;
}

.profile-content {
  @apply flex flex-col md:flex-row gap-6 items-start;
}

.profile-avatar {
  @apply w-20 h-20 md:w-24 md:h-24 rounded-full bg-arc-beige border-4 border-arc-red flex items-center justify-center flex-shrink-0;
}

.avatar-icon {
  @apply text-arc-red;
}

.profile-info {
  @apply flex-1 w-full;
}

.profile-title-row {
  @apply flex flex-wrap items-center gap-3 mb-2;
}

.profile-username {
  @apply text-3xl md:text-4xl font-bold text-arc-dark;
}

.profile-member-since {
  @apply text-arc-dark/70 mb-4;
}

/* Quick Stats */
.quick-stats {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6;
}

.quick-stat {
  @apply bg-arc-beige/50 rounded-lg p-4 border border-arc-brown/30;
}

.stat-value-row {
  @apply flex items-center gap-2 mb-1;
}

.stat-icon-yellow {
  @apply text-arc-yellow-dark;
}

.stat-icon-green {
  @apply text-arc-green;
}

.stat-icon-red {
  @apply text-arc-red;
}

.stat-value-yellow {
  @apply text-2xl font-bold text-arc-yellow-dark;
}

.stat-value-green {
  @apply text-2xl font-bold text-arc-green;
}

.stat-value-red {
  @apply text-2xl font-bold text-arc-red;
}

.stat-label {
  @apply text-sm text-arc-dark/70;
}

/* Achievements Section */
.achievements-section {
  @apply bg-arc-card rounded-xl p-6 md:p-8 border-2 border-arc-brown/20 shadow-lg;
}

.achievements-header {
  @apply flex justify-between items-center mb-6;
}

.achievements-title {
  @apply text-2xl font-bold flex items-center gap-2 text-arc-dark;
}

.title-icon {
  @apply text-arc-yellow-dark;
}

.view-all-btn {
  @apply px-4 py-2 bg-arc-red text-white font-semibold rounded-lg hover:bg-arc-red/80 transition;
}

.achievements-preview {
  @apply flex flex-wrap gap-4 justify-center md:justify-start;
}

/* Trophy Wall Banner */
.trophy-wall-banner {
  @apply block w-full bg-gradient-to-r from-arc-yellow/20 to-arc-red/20 rounded-lg p-6 border-2 border-arc-yellow hover:border-arc-red transition-all duration-300 hover:shadow-lg hover:shadow-arc-yellow/30 cursor-pointer;
}

.trophy-icon-wrapper {
  @apply bg-arc-yellow text-arc-dark rounded-full p-3 flex items-center justify-center;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}
</style>
