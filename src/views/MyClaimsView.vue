<!-- src/views/MyClaimsView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BountyClaim, Bounty } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, Award, AlertCircle } from 'lucide-vue-next'
import { getCurrentUser } from '@/lib/auth'

interface ClaimWithBounty extends BountyClaim {
  bounty?: Bounty
}

const claims = ref<ClaimWithBounty[]>([])
const loading = ref(true)
const filter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

const filteredClaims = computed(() => {
  if (filter.value === 'all') return claims.value
  return claims.value.filter((claim) => claim.verification_status === filter.value)
})

const stats = computed(() => {
  return {
    total: claims.value.length,
    pending: claims.value.filter((c) => c.verification_status === 'pending').length,
    approved: claims.value.filter((c) => c.verification_status === 'approved').length,
    rejected: claims.value.filter((c) => c.verification_status === 'rejected').length,
    totalEarned: claims.value
      .filter((c) => c.verification_status === 'approved')
      .reduce((sum, c) => sum + c.points_awarded, 0),
  }
})

onMounted(async () => {
  await loadClaims()
})

async function loadClaims() {
  try {
    loading.value = true

    const { data, error } = await supabase
      .from('bounty_claims')
      .select(
        `
        *,
        bounty:bounties(*)
      `,
      )
      .eq('hunter_id', userId)
      .order('claimed_at', { ascending: false })

    if (error) throw error
    claims.value = data as ClaimWithBounty[]
  } catch (error) {
    console.error('Error loading claims:', error)
  } finally {
    loading.value = false
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

function getStatusBg(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-arc-green/10 border-arc-green'
    case 'rejected':
      return 'bg-arc-red/10 border-arc-red'
    case 'pending':
      return 'bg-arc-yellow/10 border-arc-yellow'
    default:
      return 'bg-gray-500/10 border-gray-500'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return CheckCircle
    case 'rejected':
      return XCircle
    case 'pending':
      return Clock
    default:
      return AlertCircle
  }
}
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">My Claims</h1>
        <p class="text-gray-400">Track your bounty hunting history and earnings</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-arc-navy rounded-lg p-4">
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <div class="text-sm text-gray-400">Total Claims</div>
        </div>
        <div class="bg-arc-yellow/10 border border-arc-yellow rounded-lg p-4">
          <div class="text-2xl font-bold text-arc-yellow">{{ stats.pending }}</div>
          <div class="text-sm text-gray-400">Pending</div>
        </div>
        <div class="bg-arc-green/10 border border-arc-green rounded-lg p-4">
          <div class="text-2xl font-bold text-arc-green">{{ stats.approved }}</div>
          <div class="text-sm text-gray-400">Approved</div>
        </div>
        <div class="bg-arc-red/10 border border-arc-red rounded-lg p-4">
          <div class="text-2xl font-bold text-arc-red">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-400">Rejected</div>
        </div>
        <div class="bg-arc-navy rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Award class="text-arc-yellow" :size="24" />
            <div class="text-2xl font-bold text-arc-yellow">{{ stats.totalEarned }}</div>
          </div>
          <div class="text-sm text-gray-400">Points Earned</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-4 mb-8">
        <button
          @click="filter = 'all'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'all' ? 'bg-arc-cyan text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          All ({{ stats.total }})
        </button>
        <button
          @click="filter = 'pending'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'pending' ? 'bg-arc-yellow text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Pending ({{ stats.pending }})
        </button>
        <button
          @click="filter = 'approved'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'approved' ? 'bg-arc-green text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Approved ({{ stats.approved }})
        </button>
        <button
          @click="filter = 'rejected'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'rejected' ? 'bg-arc-red text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Rejected ({{ stats.rejected }})
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-xl">Loading claims...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredClaims.length === 0" class="text-center py-12">
        <Clock class="mx-auto mb-4 text-gray-600" :size="48" />
        <p class="text-gray-400 mb-4">
          {{ filter === 'all' ? 'No claims yet' : `No ${filter} claims` }}
        </p>
        <RouterLink
          to="/bounties"
          class="inline-block bg-arc-cyan hover:bg-arc-cyan/80 px-6 py-2 rounded-lg font-semibold"
        >
          Browse Bounties
        </RouterLink>
      </div>

      <!-- Claims List -->
      <div v-else class="space-y-4">
        <div
          v-for="claim in filteredClaims"
          :key="claim.id"
          :class="['bg-arc-navy rounded-lg p-6 border', getStatusBg(claim.verification_status)]"
        >
          <div class="grid md:grid-cols-4 gap-6">
            <!-- Screenshot Thumbnail -->
            <div>
              <a :href="claim.screenshot_url" target="_blank" class="block">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="w-full rounded-lg border border-arc-cyan/20 hover:border-arc-cyan transition"
                />
              </a>
            </div>

            <!-- Claim Details -->
            <div class="md:col-span-3">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-2xl font-bold mb-1">
                    {{ claim.bounty?.target_gamertag }}
                  </h3>
                  <p class="text-sm text-gray-400">
                    Submitted {{ new Date(claim.claimed_at).toLocaleDateString() }} at
                    {{ new Date(claim.claimed_at).toLocaleTimeString() }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <component
                    :is="getStatusIcon(claim.verification_status)"
                    :class="getStatusColor(claim.verification_status)"
                    :size="24"
                  />
                  <span
                    :class="[
                      'text-lg font-semibold uppercase',
                      getStatusColor(claim.verification_status),
                    ]"
                  >
                    {{ claim.verification_status }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-400">Bounty Amount</p>
                  <p class="text-xl font-bold text-arc-cyan">
                    {{ claim.bounty?.bounty_amount }} pts
                  </p>
                </div>

                <div v-if="claim.verification_status === 'approved'">
                  <p class="text-sm text-gray-400">Points Earned</p>
                  <p class="text-xl font-bold text-arc-green flex items-center gap-1">
                    <Award :size="20" />
                    {{ claim.points_awarded }}
                  </p>
                </div>

                <div v-if="claim.verified_at">
                  <p class="text-sm text-gray-400">Verified</p>
                  <p class="text-sm">
                    {{ new Date(claim.verified_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <!-- Rejection Reason -->
              <div
                v-if="claim.rejection_reason"
                class="bg-arc-red/10 border border-arc-red rounded-lg p-3"
              >
                <p class="text-sm font-semibold text-arc-red mb-1">Rejection Reason:</p>
                <p class="text-sm text-arc-red">{{ claim.rejection_reason }}</p>
              </div>

              <!-- Pending Message -->
              <div
                v-if="claim.verification_status === 'pending'"
                class="bg-arc-yellow/10 border border-arc-yellow rounded-lg p-3"
              >
                <p class="text-sm text-arc-yellow">⏳ Your claim is being reviewed by moderators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
