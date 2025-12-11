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
  <div class="min-h-screen bg-arc-dark text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center gap-3">
          <h1 class="text-4xl font-bold">Claim Verification</h1>
          <div
            v-if="isAdmin"
            class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
          >
            Admin
          </div>
        </div>
        <p class="text-gray-400 mt-2">Review and verify bounty claims from hunters</p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-4 mb-8">
        <button
          @click="setFilterPending()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'pending' ? 'bg-arc-yellow text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Pending
        </button>
        <button
          @click="setFilterApproved()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'approved' ? 'bg-arc-green text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Approved
        </button>
        <button
          @click="setFilterRejected()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'rejected' ? 'bg-arc-red text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          Rejected
        </button>
        <button
          @click="setFilterAll()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'all' ? 'bg-arc-cyan text-white' : 'bg-arc-navy hover:bg-arc-navy/80',
          ]"
        >
          All
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-xl">Loading claims...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="claims.length === 0" class="text-center py-12">
        <Clock class="mx-auto mb-4 text-gray-600" :size="48" />
        <p class="text-gray-400">No {{ filter !== 'all' ? filter : '' }} claims found</p>
      </div>

      <!-- Claims List -->
      <div v-else class="space-y-6">
        <div v-for="claim in claims" :key="claim.id" class="bg-arc-navy rounded-lg p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Left: Screenshot -->
            <div>
              <p class="text-sm text-gray-400 mb-2">Screenshot Evidence</p>
              <a :href="claim.screenshot_url" target="_blank" class="block relative group">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="w-full rounded-lg border border-arc-cyan/20 hover:border-arc-cyan transition"
                />
                <div
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg"
                >
                  <ExternalLink class="text-white" :size="32" />
                </div>
              </a>
            </div>

            <!-- Right: Claim Details -->
            <div>
              <div class="flex items-center gap-2 mb-4">
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

              <div class="space-y-3 mb-6">
                <div>
                  <p class="text-sm text-gray-400">Target</p>
                  <p class="text-xl font-bold">{{ claim.bounty?.target_gamertag }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-400">Bounty Amount</p>
                  <p class="text-2xl font-bold text-arc-cyan">
                    {{ claim.bounty?.bounty_amount }} points
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-400">Submitted</p>
                  <p>{{ new Date(claim.claimed_at).toLocaleString() }}</p>
                </div>

                <div v-if="claim.verified_at">
                  <p class="text-sm text-gray-400">Verified</p>
                  <p>{{ new Date(claim.verified_at).toLocaleString() }}</p>
                </div>

                <div v-if="claim.rejection_reason">
                  <p class="text-sm text-gray-400">Rejection Reason</p>
                  <p class="text-arc-red">{{ claim.rejection_reason }}</p>
                </div>
              </div>

              <!-- Action Buttons (only for pending claims) -->
              <div v-if="claim.verification_status === 'pending'" class="flex gap-3">
                <button
                  @click="approveClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="flex-1 bg-arc-green hover:bg-arc-green/80 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle :size="20" />
                  {{ processingId === claim.id ? 'Processing...' : 'Approve' }}
                </button>
                <button
                  @click="rejectClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="flex-1 bg-arc-red hover:bg-arc-red/80 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
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
