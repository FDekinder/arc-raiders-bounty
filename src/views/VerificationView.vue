<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BountyClaim, Bounty } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'

interface ClaimWithBounty extends BountyClaim {
  bounty?: Bounty
}

const claims = ref<ClaimWithBounty[]>([])
const loading = ref(true)
const filter = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const processingId = ref<string | null>(null)
const { success, error: showError } = useToast() // Add this line after the other refs

const currentUser = getCurrentUser()
const userId = currentUser?.id || ''

onMounted(async () => {
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
    console.log('Step 1: Updating claim status...')
    const { error: claimError } = await supabase
      .from('bounty_claims')
      .update({
        verification_status: 'approved',
        verified_by: userId,
        verified_at: new Date().toISOString(),
        points_awarded: claim.bounty.bounty_amount,
      })
      .eq('id', claim.id)

    if (claimError) {
      console.error('Claim update error:', claimError)
      throw claimError
    }
    console.log('Step 1: Success!')

    console.log('Step 2: Updating hunter points...')
    const { error: hunterError } = await supabase.rpc('increment_hunter_points', {
      hunter_id: claim.hunter_id,
      points: claim.bounty.bounty_amount,
    })

    if (hunterError) {
      console.error('Hunter points error:', hunterError)
    }
    console.log('Step 2: Done!')

    console.log('Step 3: Updating bounty status...')
    const { error: bountyError } = await supabase
      .from('bounties')
      .update({ status: 'completed' })
      .eq('id', claim.bounty_id)

    if (bountyError) {
      console.error('Bounty update error:', bountyError)
      throw bountyError
    }
    console.log('Step 3: Success!')

    console.log('Reloading claims...')
    await loadClaims()
    success(`Claim approved! ${claim.bounty.bounty_amount} points awarded.`) // Add this line
  } catch (error: any) {
    console.error('Error approving claim:', error)
    showError('Failed to approve claim: ' + error.message) // Update this line
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

    const { error } = await supabase
      .from('bounty_claims')
      .update({
        verification_status: 'rejected',
        verified_by: userId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason || 'Claim rejected by moderator',
      })
      .eq('id', claim.id)

    if (error) {
      console.error('Reject error:', error)
      throw error
    }

    console.log('Rejection successful, reloading claims...')
    await loadClaims()
    showError('Claim rejected') // Add this line (using error toast for red color)
  } catch (error: any) {
    console.error('Error rejecting claim:', error)
    showError('Failed to reject claim: ' + error.message) // Update this line
  } finally {
    processingId.value = null
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
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-4">Claim Verification</h1>
        <p class="text-gray-400">Review and verify bounty claims from hunters</p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-4 mb-8">
        <button
          @click="setFilterPending()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          Pending
        </button>
        <button
          @click="setFilterApproved()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          Approved
        </button>
        <button
          @click="setFilterRejected()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
          ]"
        >
          Rejected
        </button>
        <button
          @click="setFilterAll()"
          :class="[
            'px-6 py-2 rounded-lg font-semibold transition',
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700',
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
        <div v-for="claim in claims" :key="claim.id" class="bg-gray-800 rounded-lg p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Left: Screenshot -->
            <div>
              <p class="text-sm text-gray-400 mb-2">Screenshot Evidence</p>
              <a :href="claim.screenshot_url" target="_blank" class="block relative group">
                <img
                  :src="claim.screenshot_url"
                  alt="Claim screenshot"
                  class="w-full rounded-lg border border-gray-700 hover:border-red-500 transition"
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
                  <p class="text-2xl font-bold text-red-500">
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
                  <p class="text-red-400">{{ claim.rejection_reason }}</p>
                </div>
              </div>

              <!-- Action Buttons (only for pending claims) -->
              <div v-if="claim.verification_status === 'pending'" class="flex gap-3">
                <button
                  @click="approveClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle :size="20" />
                  {{ processingId === claim.id ? 'Processing...' : 'Approve' }}
                </button>
                <button
                  @click="rejectClaim(claim)"
                  :disabled="processingId === claim.id"
                  class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
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
