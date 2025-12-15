<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BountyClaim, Bounty } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import { isUserAdmin, approveBountyClaim, rejectBountyClaim } from '@/lib/adminUtils'
import PageHeader from '@/components/PageHeader.vue'
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

const filterTabs = [
  { value: 'pending', label: 'Pending', variant: 'yellow' as const },
  { value: 'approved', label: 'Approved', variant: 'green' as const },
  { value: 'rejected', label: 'Rejected', variant: 'red' as const },
  { value: 'all', label: 'All', variant: 'default' as const }
]

// Watch filter changes
function handleFilterChange(newFilter: string) {
  filter.value = newFilter as 'all' | 'pending' | 'approved' | 'rejected'
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
      return 'text-gray-600'
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
      <PageHeader title="Claim Verification" subtitle="Review and verify bounty claims from hunters">
        <template #actions>
          <div v-if="isAdmin" class="admin-badge">
            Admin
          </div>
        </template>
      </PageHeader>

      <!-- Filter Tabs -->
      <FilterTabs
        :modelValue="filter"
        @update:modelValue="handleFilterChange"
        :tabs="filterTabs"
      />

      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading claims..." />

      <!-- Empty State -->
      <EmptyState
        v-else-if="claims.length === 0"
        :icon="Clock"
        :message="`No ${filter !== 'all' ? filter : ''} claims found`"
      />

      <!-- Claims List -->
      <div v-else class="claims-list">
        <Card v-for="claim in claims" :key="claim.id">
          <div class="claim-grid">
            <!-- Left: Screenshot -->
            <div class="screenshot-section">
              <p class="screenshot-label">Screenshot Evidence</p>
              <a :href="claim.screenshot_url" target="_blank" class="screenshot-link group">
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
              <StatusBadge :status="claim.verification_status" />

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
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8;
}

.admin-badge {
  @apply bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold;
}

.claims-list {
  @apply space-y-6;
}

.claim-grid {
  @apply grid md:grid-cols-2 gap-6;
}

.screenshot-label {
  @apply text-sm text-arc-brown mb-2;
}

.screenshot-link {
  @apply block relative;
}

.screenshot-img {
  @apply w-full rounded-lg border border-arc-red/20 hover:border-arc-red transition;
}

.screenshot-overlay {
  @apply absolute inset-0 bg-black/50 opacity-0 transition flex items-center justify-center rounded-lg;
}

.screenshot-link:hover .screenshot-overlay {
  @apply opacity-100;
}

.overlay-icon {
  @apply text-white;
}

.details-list {
  @apply space-y-3 mb-6 mt-4;
}

.detail-label {
  @apply text-sm text-arc-brown;
}

.detail-target {
  @apply text-xl font-bold;
}

.detail-amount {
  @apply text-2xl font-bold text-arc-red;
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
