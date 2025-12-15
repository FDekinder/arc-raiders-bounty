<!-- src/views/MyClaimsView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BountyClaim, Bounty } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, Award, AlertCircle } from 'lucide-vue-next'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import FilterTabs from '@/components/FilterTabs.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Card from '@/components/Card.vue'

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

const filterTabs = computed(() => [
  { value: 'all', label: 'All', count: stats.value.total, variant: 'default' as const },
  { value: 'pending', label: 'Pending', count: stats.value.pending, variant: 'yellow' as const },
  { value: 'approved', label: 'Approved', count: stats.value.approved, variant: 'green' as const },
  { value: 'rejected', label: 'Rejected', count: stats.value.rejected, variant: 'red' as const }
])

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
      return 'text-gray-600'
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
      return 'bg-gray-100/10 border-gray-300'
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
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <PageHeader
        title="My Claims"
        subtitle="Track your bounty hunting history and earnings"
      />

      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatCard
          :value="stats.total"
          label="Total Claims"
        />
        <StatCard
          :value="stats.pending"
          label="Pending"
          variant="yellow"
        />
        <StatCard
          :value="stats.approved"
          label="Approved"
          variant="green"
        />
        <StatCard
          :value="stats.rejected"
          label="Rejected"
          variant="red"
        />
        <StatCard
          :value="stats.totalEarned"
          label="Points Earned"
          :icon="Award"
        />
      </div>

      <!-- Filter Tabs -->
      <FilterTabs
        v-model="filter"
        :tabs="filterTabs"
      />

      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading claims..." />

      <!-- Empty State -->
      <EmptyState
        v-else-if="filteredClaims.length === 0"
        :icon="Clock"
        :message="filter === 'all' ? 'No claims yet' : `No ${filter} claims`"
        actionText="Browse Bounties"
        actionTo="/bounties"
      />

      <!-- Claims List -->
      <div v-else class="claims-list">
        <Card
          v-for="claim in filteredClaims"
          :key="claim.id"
          :variant="claim.verification_status === 'approved' ? 'bordered' : 'default'"
        >
          <div class="claim-grid">
            <!-- Screenshot Thumbnail -->
            <div class="screenshot-section">
              <a :href="claim.screenshot_url" target="_blank" class="screenshot-link">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="screenshot-img"
                />
              </a>
            </div>

            <!-- Claim Details -->
            <div class="claim-details">
              <div class="claim-header">
                <div>
                  <h3 class="claim-target">
                    {{ claim.bounty?.target_gamertag }}
                  </h3>
                  <p class="claim-timestamp">
                    Submitted {{ new Date(claim.claimed_at).toLocaleDateString() }} at
                    {{ new Date(claim.claimed_at).toLocaleTimeString() }}
                  </p>
                </div>

                <StatusBadge :status="claim.verification_status" />
              </div>

              <div class="claim-stats">
                <div>
                  <p class="stat-label-small">Bounty Amount</p>
                  <p class="stat-bounty-amount">
                    {{ claim.bounty?.bounty_amount }} pts
                  </p>
                </div>

                <div v-if="claim.verification_status === 'approved'">
                  <p class="stat-label-small">Points Earned</p>
                  <p class="stat-points-earned">
                    <Award :size="20" />
                    {{ claim.points_awarded }}
                  </p>
                </div>

                <div v-if="claim.verified_at">
                  <p class="stat-label-small">Verified</p>
                  <p class="stat-verified-date">
                    {{ new Date(claim.verified_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <!-- Rejection Reason -->
              <div v-if="claim.rejection_reason" class="rejection-box">
                <p class="rejection-label">Rejection Reason:</p>
                <p class="rejection-text">{{ claim.rejection_reason }}</p>
              </div>

              <!-- Pending Message -->
              <div v-if="claim.verification_status === 'pending'" class="pending-box">
                <p class="pending-text">⏳ Your claim is being reviewed by moderators</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-arc-cream text-arc-dark;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-5 gap-4 mb-8;
}

.claims-list {
  @apply space-y-4;
}

.claim-grid {
  @apply grid md:grid-cols-4 gap-6;
}

.screenshot-link {
  @apply block;
}

.screenshot-img {
  @apply w-full rounded-lg border border-arc-red/20 hover:border-arc-red transition;
}

.claim-details {
  @apply md:col-span-3;
}

.claim-header {
  @apply flex items-start justify-between mb-4;
}

.claim-target {
  @apply text-2xl font-bold mb-1;
}

.claim-timestamp {
  @apply text-sm text-arc-brown;
}

.claim-stats {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4 mb-4;
}

.stat-label-small {
  @apply text-sm text-arc-brown;
}

.stat-bounty-amount {
  @apply text-xl font-bold text-arc-red;
}

.stat-points-earned {
  @apply text-xl font-bold text-arc-green flex items-center gap-1;
}

.stat-verified-date {
  @apply text-sm;
}

.rejection-box {
  @apply bg-arc-red/10 border border-arc-red rounded-lg p-3;
}

.rejection-label {
  @apply text-sm font-semibold text-arc-red mb-1;
}

.rejection-text {
  @apply text-sm text-arc-red;
}

.pending-box {
  @apply bg-arc-yellow/10 border border-arc-yellow rounded-lg p-3;
}

.pending-text {
  @apply text-sm text-arc-yellow;
}
</style>
