<!-- src/views/ActivityFeedView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Target, Upload, CheckCircle, Clock } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'bounty_created' | 'claim_submitted' | 'claim_approved' | 'claim_rejected'
  timestamp: string
  data: any
}

const activities = ref<Activity[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadActivities()
})

async function loadActivities() {
  try {
    loading.value = true

    // Get recent bounties
    const { data: bounties } = await supabase
      .from('bounties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get recent claims
    const { data: claims } = await supabase
      .from('bounty_claims')
      .select(
        `
        *,
        bounty:bounties(target_gamertag)
      `,
      )
      .order('claimed_at', { ascending: false })
      .limit(10)

    // Combine and sort by timestamp
    const allActivities: Activity[] = []

    // Add bounties
    bounties?.forEach((bounty) => {
      allActivities.push({
        id: bounty.id,
        type: 'bounty_created',
        timestamp: bounty.created_at,
        data: bounty,
      })
    })

    // Add claims
    claims?.forEach((claim) => {
      allActivities.push({
        id: claim.id,
        type:
          claim.verification_status === 'approved'
            ? 'claim_approved'
            : claim.verification_status === 'rejected'
              ? 'claim_rejected'
              : 'claim_submitted',
        timestamp:
          claim.verification_status === 'pending'
            ? claim.claimed_at
            : claim.verified_at || claim.claimed_at,
        data: claim,
      })
    })

    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    activities.value = allActivities.slice(0, 20) // Show top 20
  } catch (error) {
    console.error('Error loading activities:', error)
  } finally {
    loading.value = false
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'bounty_created':
      return Target
    case 'claim_submitted':
      return Upload
    case 'claim_approved':
      return CheckCircle
    case 'claim_rejected':
      return CheckCircle
    default:
      return Clock
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'bounty_created':
      return 'text-arc-cyan bg-arc-cyan/10'
    case 'claim_submitted':
      return 'text-arc-cyan bg-arc-cyan/10'
    case 'claim_approved':
      return 'text-arc-green bg-arc-green/10'
    case 'claim_rejected':
      return 'text-gray-500 bg-gray-500/10'
    default:
      return 'text-gray-500 bg-gray-500/10'
  }
}

function getActivityText(activity: Activity) {
  switch (activity.type) {
    case 'bounty_created':
      return {
        title: 'New Bounty Created',
        description: `${activity.data.bounty_amount} points bounty placed on ${activity.data.target_gamertag}`,
      }
    case 'claim_submitted':
      return {
        title: 'Bounty Claimed',
        description: `Hunter submitted claim for ${activity.data.bounty?.target_gamertag}`,
      }
    case 'claim_approved':
      return {
        title: 'Claim Approved',
        description: `${activity.data.points_awarded} points awarded for eliminating ${activity.data.bounty?.target_gamertag}`,
      }
    case 'claim_rejected':
      return {
        title: 'Claim Rejected',
        description: `Claim for ${activity.data.bounty?.target_gamertag} was rejected`,
      }
    default:
      return { title: 'Activity', description: '' }
  }
}
</script>

<template>
  <div class="min-h-screen bg-arc-dark text-white">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Activity Feed</h1>
        <p class="text-gray-400">Recent bounty hunting activity from the community</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-xl">Loading activity...</div>
      </div>

      <!-- Activity Timeline -->
      <div v-else class="space-y-4">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="bg-arc-navy rounded-lg p-6 hover:bg-arc-navy/80 transition"
        >
          <div class="flex gap-4">
            <!-- Icon -->
            <div :class="['rounded-full p-3 flex-shrink-0', getActivityColor(activity.type)]">
              <component :is="getActivityIcon(activity.type)" :size="24" />
            </div>

            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-lg font-bold">
                    {{ getActivityText(activity).title }}
                  </h3>
                  <p class="text-gray-400">
                    {{ getActivityText(activity).description }}
                  </p>
                </div>

                <!-- Timestamp -->
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <Clock :size="14" />
                  {{ formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) }}
                </div>
              </div>

              <!-- Additional Info Based on Type -->
              <div v-if="activity.type === 'bounty_created'" class="mt-3">
                <RouterLink
                  :to="`/claim/${activity.data.id}`"
                  class="inline-block bg-arc-cyan hover:bg-arc-cyan/80 px-4 py-2 rounded text-sm font-semibold transition"
                >
                  View Bounty
                </RouterLink>
              </div>

              <div v-if="activity.type === 'claim_approved'" class="mt-3">
                <div
                  class="inline-flex items-center gap-2 bg-arc-green/10 border border-arc-green px-4 py-2 rounded text-sm"
                >
                  <CheckCircle :size="16" class="text-arc-green" />
                  <span class="text-arc-green font-semibold">
                    +{{ activity.data.points_awarded }} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="activities.length === 0" class="text-center py-12">
          <Clock class="mx-auto mb-4 text-gray-600" :size="48" />
          <p class="text-gray-400">No activity yet</p>
        </div>
      </div>
    </div>
  </div>
</template>
