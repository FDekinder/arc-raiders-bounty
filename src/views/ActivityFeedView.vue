<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Target, Upload, CheckCircle, Clock } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import { useSEO, seoConfigs } from '@/composables/useSEO'

useSEO(seoConfigs.activity)

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

function getActivityColorClass(type: string) {
  switch (type) {
    case 'bounty_created':
      return 'icon-bounty-created'
    case 'claim_submitted':
      return 'icon-claim-submitted'
    case 'claim_approved':
      return 'icon-claim-approved'
    case 'claim_rejected':
      return 'icon-claim-rejected'
    default:
      return 'icon-default'
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
  <div class="activity-page">
    <div class="activity-container">
      <!-- Header -->
      <div class="header">
        <h1 class="title">Activity Feed</h1>
        <p class="subtitle">Recent bounty hunting activity from the community</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="text-xl">Loading activity...</div>
      </div>

      <!-- Activity Timeline -->
      <div v-else class="activity-timeline">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
        >
          <div class="activity-content">
            <!-- Icon -->
            <div :class="['activity-icon', getActivityColorClass(activity.type)]">
              <component :is="getActivityIcon(activity.type)" :size="24" />
            </div>

            <!-- Content -->
            <div class="activity-details">
              <div class="activity-header">
                <div>
                  <h3 class="activity-title">
                    {{ getActivityText(activity).title }}
                  </h3>
                  <p class="activity-description">
                    {{ getActivityText(activity).description }}
                  </p>
                </div>

                <!-- Timestamp -->
                <div class="activity-timestamp">
                  <Clock :size="14" />
                  {{ formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) }}
                </div>
              </div>

              <!-- Additional Info Based on Type -->
              <div v-if="activity.type === 'bounty_created'" class="activity-action">
                <RouterLink
                  :to="`/claim/${activity.data.id}`"
                  class="btn-view-bounty"
                >
                  View Bounty
                </RouterLink>
              </div>

              <div v-if="activity.type === 'claim_approved'" class="activity-action">
                <div class="points-badge">
                  <CheckCircle :size="16" class="text-arc-green" />
                  <span class="points-text">
                    +{{ activity.data.points_awarded }} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="activities.length === 0" class="empty-state">
          <Clock class="empty-icon" :size="48" />
          <p class="empty-text">No activity yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-page {
  @apply min-h-screen bg-transparent text-white;
}

.activity-container {
  @apply container mx-auto px-4 py-8 max-w-4xl;
}

.header {
  @apply mb-8;
}

.title {
  @apply text-4xl font-bold mb-2 text-white;
}

.subtitle {
  @apply text-arc-brown;
}

.loading-state {
  @apply text-center py-12;
}

.activity-timeline {
  @apply space-y-4;
}

.activity-card {
  @apply bg-arc-card rounded-lg p-6 hover:bg-arc-card/80 transition;
}

.activity-content {
  @apply flex gap-4;
}

.activity-icon {
  @apply rounded-full p-3 flex-shrink-0;
}

.icon-bounty-created {
  @apply text-arc-red bg-arc-red/10;
}

.icon-claim-submitted {
  @apply text-arc-red bg-arc-red/10;
}

.icon-claim-approved {
  @apply text-arc-green bg-arc-green/10;
}

.icon-claim-rejected {
  @apply text-gray-600 bg-gray-100/10;
}

.icon-default {
  @apply text-gray-600 bg-gray-100/10;
}

.activity-details {
  @apply flex-1;
}

.activity-header {
  @apply flex items-start justify-between mb-2;
}

.activity-title {
  @apply text-lg font-bold text-gray-900;
}

.activity-description {
  @apply text-arc-brown;
}

.activity-timestamp {
  @apply text-sm text-gray-600 flex items-center gap-1;
}

.activity-action {
  @apply mt-3;
}

.btn-view-bounty {
  @apply inline-block bg-arc-red hover:bg-arc-red/80 px-4 py-2 rounded text-sm font-semibold transition text-black;
}

.points-badge {
  @apply inline-flex items-center gap-2 bg-arc-green/10 border border-arc-green px-4 py-2 rounded text-sm;
}

.points-text {
  @apply text-arc-green font-semibold;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply mx-auto mb-4 text-gray-600;
}

.empty-text {
  @apply text-arc-brown;
}
</style>
