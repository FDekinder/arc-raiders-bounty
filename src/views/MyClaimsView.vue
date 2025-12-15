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
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <h1 class="title">My Claims</h1>
        <p class="subtitle">Track your bounty hunting history and earnings</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Claims</div>
        </div>
        <div class="stat-card-pending">
          <div class="stat-value-pending">{{ stats.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card-approved">
          <div class="stat-value-approved">{{ stats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card-rejected">
          <div class="stat-value-rejected">{{ stats.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
        <div class="stat-card">
          <div class="stat-earned-wrapper">
            <Award class="stat-icon" :size="24" />
            <div class="stat-earned-value">{{ stats.totalEarned }}</div>
          </div>
          <div class="stat-label">Points Earned</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          @click="filter = 'all'"
          :class="['filter-btn', filter === 'all' ? 'filter-btn-active' : 'filter-btn-inactive']"
        >
          All ({{ stats.total }})
        </button>
        <button
          @click="filter = 'pending'"
          :class="['filter-btn', filter === 'pending' ? 'filter-btn-active-yellow' : 'filter-btn-inactive']"
        >
          Pending ({{ stats.pending }})
        </button>
        <button
          @click="filter = 'approved'"
          :class="['filter-btn', filter === 'approved' ? 'filter-btn-active-green' : 'filter-btn-inactive']"
        >
          Approved ({{ stats.approved }})
        </button>
        <button
          @click="filter = 'rejected'"
          :class="['filter-btn', filter === 'rejected' ? 'filter-btn-active-red' : 'filter-btn-inactive']"
        >
          Rejected ({{ stats.rejected }})
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-text">Loading claims...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredClaims.length === 0" class="empty-state">
        <Clock class="empty-icon" :size="48" />
        <p class="empty-text">
          {{ filter === 'all' ? 'No claims yet' : `No ${filter} claims` }}
        </p>
        <RouterLink to="/bounties" class="empty-action">
          Browse Bounties
        </RouterLink>
      </div>

      <!-- Claims List -->
      <div v-else class="claims-list">
        <div
          v-for="claim in filteredClaims"
          :key="claim.id"
          :class="['claim-card', getStatusBg(claim.verification_status)]"
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

                <div class="status-badge">
                  <component
                    :is="getStatusIcon(claim.verification_status)"
                    :class="getStatusColor(claim.verification_status)"
                    :size="24"
                  />
                  <span
                    :class="[
                      'status-text',
                      getStatusColor(claim.verification_status),
                    ]"
                  >
                    {{ claim.verification_status }}
                  </span>
                </div>
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
  @apply mb-8;
}

.title {
  @apply text-4xl font-bold mb-2;
}

.subtitle {
  @apply text-gray-400;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-5 gap-4 mb-8;
}

.stat-card {
  @apply bg-arc-navy rounded-lg p-4;
}

.stat-card-pending {
  @apply bg-arc-yellow/10 border border-arc-yellow rounded-lg p-4;
}

.stat-card-approved {
  @apply bg-arc-green/10 border border-arc-green rounded-lg p-4;
}

.stat-card-rejected {
  @apply bg-arc-red/10 border border-arc-red rounded-lg p-4;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-value-pending {
  @apply text-2xl font-bold text-arc-yellow;
}

.stat-value-approved {
  @apply text-2xl font-bold text-arc-green;
}

.stat-value-rejected {
  @apply text-2xl font-bold text-arc-red;
}

.stat-label {
  @apply text-sm text-gray-400;
}

.stat-earned-wrapper {
  @apply flex items-center gap-2;
}

.stat-icon {
  @apply text-arc-yellow;
}

.stat-earned-value {
  @apply text-2xl font-bold text-arc-yellow;
}

.filter-tabs {
  @apply flex gap-4 mb-8;
}

.filter-btn {
  @apply px-6 py-2 rounded-lg font-semibold transition;
}

.filter-btn-active {
  @apply bg-arc-red text-white;
}

.filter-btn-active-yellow {
  @apply bg-arc-yellow text-white;
}

.filter-btn-active-green {
  @apply bg-arc-green text-white;
}

.filter-btn-active-red {
  @apply bg-arc-red text-white;
}

.filter-btn-inactive {
  @apply bg-arc-navy hover:bg-arc-navy/80;
}

.loading-state {
  @apply text-center py-12;
}

.loading-text {
  @apply text-xl;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply mx-auto mb-4 text-gray-600;
}

.empty-text {
  @apply text-gray-400 mb-4;
}

.empty-action {
  @apply inline-block bg-arc-red hover:bg-arc-red/80 px-6 py-2 rounded-lg font-semibold;
}

.claims-list {
  @apply space-y-4;
}

.claim-card {
  @apply bg-arc-navy rounded-lg p-6 border;
}

.claim-grid {
  @apply grid md:grid-cols-4 gap-6;
}

.screenshot-section {
  /* No additional styles */
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
  @apply text-sm text-gray-400;
}

.status-badge {
  @apply flex items-center gap-2;
}

.status-text {
  @apply text-lg font-semibold uppercase;
}

.claim-stats {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4 mb-4;
}

.stat-label-small {
  @apply text-sm text-gray-400;
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
