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

      <!-- Top Achievements Section -->
      <div v-if="topAchievements.length > 0" class="achievements-section">
        <div class="achievements-header">
          <h3 class="achievements-title">
            <Award class="title-icon" />
            Achievements
          </h3>
          <button
            @click="showAllAchievements = !showAllAchievements"
            class="view-all-btn"
          >
            {{ showAllAchievements ? 'Show Less' : 'View All' }}
          </button>
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
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy class="text-arc-green" />
            Hunter Stats
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-brown">Claims Approved</span>
              <span class="font-bold text-arc-green">{{ stats?.approvedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-brown">Claims Pending</span>
              <span class="font-bold text-arc-yellow">{{ stats?.pendingClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-brown">Claims Rejected</span>
              <span class="font-bold text-arc-red">{{ stats?.rejectedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between border-t border-arc-red/20 pt-3">
              <span class="text-arc-brown">Success Rate</span>
              <span class="font-bold">{{ stats?.successRate || 0 }}%</span>
            </div>
          </div>
        </Card>

        <!-- Bounty Creator Stats -->
        <Card>
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Target class="text-arc-red" />
            Bounty Creator
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-brown">Total Bounties</span>
              <span class="font-bold">{{ stats?.bountiesCreatedTotal || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-brown">Active</span>
              <span class="font-bold text-arc-yellow">{{ stats?.activeBounties || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-brown">Completed</span>
              <span class="font-bold text-arc-green">{{ stats?.completedBounties || 0 }}</span>
            </div>
          </div>
        </Card>

        <!-- Other Stats -->
        <Card>
          <h3 class="text-xl font-bold mb-4">Other Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-arc-brown">Times Hunted</span>
              <span class="font-bold">{{ stats?.timesHunted || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-arc-brown">Total Points</span>
              <span class="font-bold text-arc-yellow">{{ stats?.totalPoints || 0 }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Activity Tabs -->
      <Card>
        <h3 class="text-2xl font-bold mb-6">Recent Activity</h3>

        <!-- Recent Claims -->
        <div class="mb-8">
          <h4 class="text-lg font-bold mb-4 text-gray-600">Recent Claims</h4>
          <EmptyState
            v-if="claimsSubmitted.length === 0"
            :icon="Clock"
            message="No claims submitted yet"
          />
          <div v-else class="space-y-3">
            <div
              v-for="claim in claimsSubmitted.slice(0, 5)"
              :key="claim.id"
              class="bg-gray-100 rounded-lg p-4 flex justify-between items-center border border-arc-red/20"
            >
              <div>
                <div class="font-bold">{{ claim.bounty?.target_gamertag }}</div>
                <div class="text-sm text-arc-brown">
                  {{ formatDistanceToNow(new Date(claim.claimed_at), { addSuffix: true }) }}
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-bold">{{ claim.bounty?.bounty_amount }} pts</div>
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
          <h4 class="text-lg font-bold mb-4 text-gray-600">Bounties Created</h4>
          <EmptyState
            v-if="bountiesCreated.length === 0"
            :icon="Target"
            message="No bounties created yet"
          />
          <div v-else class="space-y-3">
            <div
              v-for="bounty in bountiesCreated.slice(0, 5)"
              :key="bounty.id"
              class="bg-gray-100 rounded-lg p-4 flex justify-between items-center border border-arc-red/20"
            >
              <div>
                <div class="font-bold">{{ bounty.target_gamertag }}</div>
                <div class="text-sm text-arc-brown">
                  {{ formatDistanceToNow(new Date(bounty.created_at), { addSuffix: true }) }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-arc-red">{{ bounty.bounty_amount }} pts</div>
                <div
                  class="text-sm"
                  :class="bounty.status === 'active' ? 'text-arc-yellow' : 'text-arc-green'"
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
