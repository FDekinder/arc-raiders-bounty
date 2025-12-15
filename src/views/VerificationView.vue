<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BountyClaim, Bounty } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import { isUserAdmin, approveBountyClaim, rejectBountyClaim } from '@/lib/adminUtils'

interface ClaimWithBounty extends BountyClaim {
  bounty?: Bounty
}

const claims = ref<ClaimWithBounty[]>([])
const loading = ref(true)
const filter = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const processingId = ref<string | null>(null)
const isAdmin = ref(false)
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

onMounted(async () => {
  // Check if user is admin
  if (userId) {
    isAdmin.value = await isUserAdmin(userId)
  }
  await loadClaims()
})

async function loadClaims() {
  try {
    console.log('Loading claims with filter:', filter.value)
    loading.value = true

    let query = supabase
      .from('bounty_claims')
      .select(
        `
        *,
        bounty:bounties(*)
      `,
      )
      .order('claimed_at', { ascending: false })

    if (filter.value !== 'all') {
      console.log('Filtering by status:', filter.value)
      query = query.eq('verification_status', filter.value)
    }

    const { data, error } = await query

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    console.log('Loaded claims:', data?.length, data)
    claims.value = data as ClaimWithBounty[]
  } catch (error) {
    console.error('Error loading claims:', error)
  } finally {
    loading.value = false
  }
}

// Filter helper methods
function setFilterPending() {
  filter.value = 'pending'
  loadClaims()
}

function setFilterApproved() {
  filter.value = 'approved'
  loadClaims()
}

function setFilterRejected() {
  filter.value = 'rejected'
  loadClaims()
}

function setFilterAll() {
  filter.value = 'all'
  loadClaims()
}

async function approveClaim(claim: ClaimWithBounty) {
  console.log('Starting approval for claim:', claim.id)

  if (!claim.bounty) {
    console.log('No bounty found!')
    return
  }

  processingId.value = claim.id

  try {
    const result = await approveBountyClaim(claim.id, userId, claim.bounty.bounty_amount)

    if (!result.success) {
      throw new Error('Failed to approve claim')
    }

    console.log('Approval successful, reloading claims...')
    await loadClaims()

    // Show success toast with points
    success(`Claim approved! ${claim.bounty.bounty_amount} points awarded.`)

    // Show achievement notifications if any were earned
    if (result.achievements && result.achievements.length > 0) {
      for (const achievementName of result.achievements) {
        setTimeout(() => {
          success(`🏆 Achievement Unlocked: ${achievementName}!`)
        }, 500)
      }
    }
  } catch (error: unknown) {
    console.error('Error approving claim:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve claim'
    showError(errorMessage)
  } finally {
    processingId.value = null
  }
}

async function rejectClaim(claim: ClaimWithBounty) {
  const reason = prompt('Rejection reason (optional):')

  if (reason === null) return

  processingId.value = claim.id

  try {
    console.log('Rejecting claim:', claim.id)

    const success_ = await rejectBountyClaim(
      claim.id,
      userId,
      reason || 'Claim rejected by moderator',
    )

    if (!success_) {
      throw new Error('Failed to reject claim')
    }

    console.log('Rejection successful, reloading claims...')
    await loadClaims()
    showError('Claim rejected')
  } catch (error: unknown) {
    console.error('Error rejecting claim:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to reject claim'
    showError(errorMessage)
  } finally {
    processingId.value = null
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
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header">
        <div class="header-title-row">
          <h1 class="title">Claim Verification</h1>
          <div v-if="isAdmin" class="admin-badge">
            Admin
          </div>
        </div>
        <p class="subtitle">Review and verify bounty claims from hunters</p>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          @click="setFilterPending()"
          :class="[
            'filter-btn',
            filter === 'pending' ? 'filter-btn-pending' : 'filter-btn-inactive'
          ]"
        >
          Pending
        </button>
        <button
          @click="setFilterApproved()"
          :class="[
            'filter-btn',
            filter === 'approved' ? 'filter-btn-approved' : 'filter-btn-inactive'
          ]"
        >
          Approved
        </button>
        <button
          @click="setFilterRejected()"
          :class="[
            'filter-btn',
            filter === 'rejected' ? 'filter-btn-rejected' : 'filter-btn-inactive'
          ]"
        >
          Rejected
        </button>
        <button
          @click="setFilterAll()"
          :class="[
            'filter-btn',
            filter === 'all' ? 'filter-btn-all' : 'filter-btn-inactive'
          ]"
        >
          All
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-text">Loading claims...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="claims.length === 0" class="empty-state">
        <Clock class="empty-icon" :size="48" />
        <p class="empty-text">No {{ filter !== 'all' ? filter : '' }} claims found</p>
      </div>

      <!-- Claims List -->
      <div v-else class="claims-list">
        <div v-for="claim in claims" :key="claim.id" class="claim-card">
          <div class="claim-grid">
            <!-- Left: Screenshot -->
            <div class="screenshot-section">
              <p class="screenshot-label">Screenshot Evidence</p>
              <a :href="claim.screenshot_url" target="_blank" class="screenshot-link">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="screenshot-img"
                />
                <div class="screenshot-overlay">
                  <ExternalLink class="overlay-icon" :size="32" />
                </div>
              </a>
            </div>

            <!-- Right: Claim Details -->
            <div class="details-section">
              <div class="status-header">
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

              <div class="details-list">
                <div class="detail-item">
                  <p class="detail-label">Target</p>
                  <p class="detail-target">{{ claim.bounty?.target_gamertag }}</p>
                </div>

                <div class="detail-item">
                  <p class="detail-label">Bounty Amount</p>
                  <p class="detail-amount">
                    {{ claim.bounty?.bounty_amount }} points
                  </p>
                </div>

                <div class="detail-item">
                  <p class="detail-label">Submitted</p>
                  <p class="detail-value">{{ new Date(claim.claimed_at).toLocaleString() }}</p>
                </div>

                <div v-if="claim.verified_at" class="detail-item">
                  <p class="detail-label">Verified</p>
                  <p class="detail-value">{{ new Date(claim.verified_at).toLocaleString() }}</p>
                </div>

                <div v-if="claim.rejection_reason" class="detail-item">
                  <p class="detail-label">Rejection Reason</p>
                  <p class="detail-rejection">{{ claim.rejection_reason }}</p>
                </div>
              </div>

              <!-- Action Buttons (only for pending claims) -->
              <div v-if="claim.verification_status === 'pending'" class="action-buttons">
                <button
                  @click="approveClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="approve-btn"
                >
                  <CheckCircle :size="20" />
                  {{ processingId === claim.id ? 'Processing...' : 'Approve' }}
                </button>
                <button
                  @click="rejectClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="reject-btn"
                >
                  <XCircle :size="20" />
                  Reject
                </button>
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

.header-title-row {
  @apply flex items-center gap-3;
}

.title {
  @apply text-4xl font-bold;
}

.admin-badge {
  @apply bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold;
}

.subtitle {
  @apply text-gray-400 mt-2;
}

.filter-tabs {
  @apply flex gap-4 mb-8;
}

.filter-btn {
  @apply px-6 py-2 rounded-lg font-semibold transition;
}

.filter-btn-pending {
  @apply bg-arc-yellow text-white;
}

.filter-btn-approved {
  @apply bg-arc-green text-white;
}

.filter-btn-rejected {
  @apply bg-arc-red text-white;
}

.filter-btn-all {
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
  @apply text-gray-400;
}

.claims-list {
  @apply space-y-6;
}

.claim-card {
  @apply bg-arc-navy rounded-lg p-6;
}

.claim-grid {
  @apply grid md:grid-cols-2 gap-6;
}

.screenshot-section {
  @apply;
}

.screenshot-label {
  @apply text-sm text-gray-400 mb-2;
}

.screenshot-link {
  @apply block relative group;
}

.screenshot-img {
  @apply w-full rounded-lg border border-arc-red/20 hover:border-arc-red transition;
}

.screenshot-overlay {
  @apply absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg;
}

.overlay-icon {
  @apply text-white;
}

.details-section {
  @apply;
}

.status-header {
  @apply flex items-center gap-2 mb-4;
}

.status-text {
  @apply text-lg font-semibold uppercase;
}

.details-list {
  @apply space-y-3 mb-6;
}

.detail-item {
  @apply;
}

.detail-label {
  @apply text-sm text-gray-400;
}

.detail-target {
  @apply text-xl font-bold;
}

.detail-amount {
  @apply text-2xl font-bold text-arc-red;
}

.detail-value {
  @apply;
}

.detail-rejection {
  @apply text-arc-red;
}

.action-buttons {
  @apply flex gap-3;
}

.approve-btn {
  @apply flex-1 bg-arc-green hover:bg-arc-green/80 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2;
}

.reject-btn {
  @apply flex-1 bg-arc-red hover:bg-arc-red/80 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2;
}
</style>
