<!-- src/views/UserProfileView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User, Bounty, BountyClaim } from '@/lib/supabase'
import { Target, Trophy, Award, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'

const route = useRoute()
const user = ref<User | null>(null)
const bountiesCreated = ref<Bounty[]>([])
const claimsSubmitted = ref<any[]>([])
const loading = ref(true)

const userId = route.params.id as string

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

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return CheckCircle
    case 'rejected':
      return XCircle
    case 'pending':
      return Clock
    default:
      return Clock
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'text-arc-green'
    case 'rejected':
      return 'text-arc-red'
    case 'pending':
      return 'text-arc-yellow'
    default:
      return 'text-gray-500'
  }
}
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-xl">Loading profile...</div>
    </div>

    <div v-else-if="!user" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">User Not Found</h2>
        <p class="text-gray-400">This user doesn't exist</p>
      </div>
    </div>

    <div v-else class="container mx-auto px-4 py-8">
      <!-- Profile Header -->
      <div class="bg-arc-navy rounded-lg p-8 mb-8">
        <div class="flex items-start gap-6">
          <!-- Avatar -->
          <div
            class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"
          >
            <Target :size="48" class="text-gray-500" />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-4xl font-bold mb-2">{{ user.username }}</h1>
            <p class="text-gray-400 mb-4">
              Member since {{ new Date(user.created_at).toLocaleDateString() }}
            </p>

            <!-- Quick Stats -->
            <div class="flex gap-6">
              <div>
                <div class="flex items-center gap-2">
                  <Award class="text-arc-yellow" :size="24" />
                  <span class="text-2xl font-bold text-arc-yellow">{{
                    stats?.totalPoints || 0
                  }}</span>
                </div>
                <div class="text-sm text-gray-400">Total Points</div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <Trophy class="text-arc-green" :size="24" />
                  <span class="text-2xl font-bold text-arc-green">{{
                    stats?.bountiesCompleted || 0
                  }}</span>
                </div>
                <div class="text-sm text-gray-400">Bounties Completed</div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <TrendingUp class="text-arc-red" :size="24" />
                  <span class="text-2xl font-bold text-arc-red"
                    >{{ stats?.successRate || 0 }}%</span
                  >
                </div>
                <div class="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats Grid -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <!-- Hunter Stats -->
        <div class="bg-arc-navy rounded-lg p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy class="text-arc-green" />
            Hunter Stats
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Claims Approved</span>
              <span class="font-bold text-arc-green">{{ stats?.approvedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Claims Pending</span>
              <span class="font-bold text-arc-yellow">{{ stats?.pendingClaims || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Claims Rejected</span>
              <span class="font-bold text-arc-red">{{ stats?.rejectedClaims || 0 }}</span>
            </div>
            <div class="flex justify-between border-t border-arc-red/20 pt-3">
              <span class="text-gray-400">Success Rate</span>
              <span class="font-bold">{{ stats?.successRate || 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Bounty Creator Stats -->
        <div class="bg-arc-navy rounded-lg p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Target class="text-arc-red" />
            Bounty Creator
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Total Bounties</span>
              <span class="font-bold">{{ stats?.bountiesCreatedTotal || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Active</span>
              <span class="font-bold text-arc-yellow">{{ stats?.activeBounties || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Completed</span>
              <span class="font-bold text-arc-green">{{ stats?.completedBounties || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Other Stats -->
        <div class="bg-arc-navy rounded-lg p-6">
          <h3 class="text-xl font-bold mb-4">Other Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Times Hunted</span>
              <span class="font-bold">{{ stats?.timesHunted || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Total Points</span>
              <span class="font-bold text-arc-yellow">{{ stats?.totalPoints || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Tabs -->
      <div class="bg-arc-navy rounded-lg p-6">
        <h3 class="text-2xl font-bold mb-6">Recent Activity</h3>

        <!-- Recent Claims -->
        <div class="mb-8">
          <h4 class="text-lg font-bold mb-4 text-gray-300">Recent Claims</h4>
          <div v-if="claimsSubmitted.length === 0" class="text-gray-400 text-center py-8">
            No claims submitted yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="claim in claimsSubmitted.slice(0, 5)"
              :key="claim.id"
              class="bg-gray-700 rounded-lg p-4 flex justify-between items-center border border-arc-red/20"
            >
              <div>
                <div class="font-bold">{{ claim.bounty?.target_gamertag }}</div>
                <div class="text-sm text-gray-400">
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
                <div
                  :class="['flex items-center gap-1', getStatusColor(claim.verification_status)]"
                >
                  <component :is="getStatusIcon(claim.verification_status)" :size="20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Bounties Created -->
        <div>
          <h4 class="text-lg font-bold mb-4 text-gray-300">Bounties Created</h4>
          <div v-if="bountiesCreated.length === 0" class="text-gray-400 text-center py-8">
            No bounties created yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="bounty in bountiesCreated.slice(0, 5)"
              :key="bounty.id"
              class="bg-gray-700 rounded-lg p-4 flex justify-between items-center border border-arc-red/20"
            >
              <div>
                <div class="font-bold">{{ bounty.target_gamertag }}</div>
                <div class="text-sm text-gray-400">
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
      </div>
    </div>
  </div>
</template>
