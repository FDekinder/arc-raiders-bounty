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
      return 'text-green-500'
    case 'rejected':
      return 'text-red-500'
    case 'pending':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-500/10 border-green-500'
    case 'rejected':
      return 'bg-red-500/10 border-red-500'
    case 'pending':
      return 'bg-yellow-500/10 border-yellow-500'
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
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">My Claims</h1>
        <p class="text-gray-400">Track your bounty hunting history and earnings</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <div class="text-sm text-gray-400">Total Claims</div>
        </div>
        <div class="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-500">{{ stats.pending }}</div>
          <div class="text-sm text-gray-400">Pending</div>
        </div>
        <div class="bg-green-500/10 border border-green-500 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-500">{{ stats.approved }}</div>
          <div class="text-sm text-gray-400">Approved</div>
        </div>
        <div class="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <div class="text-2xl font-bold text-red-500">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-400">Rejected</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Award class="text-yellow-500" :size="24" />
            <div class="text-2xl font-bold text-yellow-500">{{ stats.totalEarned }}</div>
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
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          All ({{ stats.total }})
        </button>
        <button
          @click="filter = 'pending'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          Pending ({{ stats.pending }})
        </button>
        <button
          @click="filter = 'approved'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          Approved ({{ stats.approved }})
        </button>
        <button
          @click="filter = 'rejected'"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
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
          class="inline-block bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
        >
          Browse Bounties
        </RouterLink>
      </div>

      <!-- Claims List -->
      <div v-else class="space-y-4">
        <div
          v-for="claim in filteredClaims"
          :key="claim.id"
          :class="['bg-gray-800 rounded-lg p-6 border', getStatusBg(claim.verification_status)]"
        >
          <div class="grid md:grid-cols-4 gap-6">
            <!-- Screenshot Thumbnail -->
            <div>
              <a :href="claim.screenshot_url" target="_blank" class="block">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="w-full rounded-lg border border-gray-700 hover:border-red-500 transition"
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
                  <p class="text-xl font-bold text-red-500">
                    {{ claim.bounty?.bounty_amount }} pts
                  </p>
                </div>

                <div v-if="claim.verification_status === 'approved'">
                  <p class="text-sm text-gray-400">Points Earned</p>
                  <p class="text-xl font-bold text-green-500 flex items-center gap-1">
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
                class="bg-red-500/10 border border-red-500 rounded-lg p-3"
              >
                <p class="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</p>
                <p class="text-sm text-red-300">{{ claim.rejection_reason }}</p>
              </div>

              <!-- Pending Message -->
              <div
                v-if="claim.verification_status === 'pending'"
                class="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3"
              >
                <p class="text-sm text-yellow-300">⏳ Your claim is being reviewed by moderators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
