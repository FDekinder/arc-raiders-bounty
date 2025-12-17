<!-- src/views/TopKillersView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTopKillers } from '@/lib/db'
import type { TopKiller } from '@/lib/supabase'
import { Skull, Trophy, Target } from 'lucide-vue-next'

const router = useRouter()
const topKillers = ref<TopKiller[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const killers = await getTopKillers(10) // Get top 10 for full leaderboard view
    topKillers.value = killers
  } catch (error) {
    console.error('Error loading top killers:', error)
  } finally {
    loading.value = false
  }
})

function getRankBadgeClass(index: number) {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-default'
}

function getRankIcon(index: number) {
  if (index < 3) return Trophy
  return Target
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-icon">
            <Skull :size="48" />
          </div>
          <div>
            <h1 class="page-title">Top Killers</h1>
            <p class="page-subtitle">The most dangerous Proud Rats in the wasteland</p>
          </div>
        </div>
        <button @click="router.push('/submit-kill')" class="submit-kill-btn">
          <Target :size="20" />
          <span>Report Kill</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading killers...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="topKillers.length === 0" class="empty-state">
        <Skull :size="64" class="empty-icon" />
        <h3 class="empty-title">No Killers Yet</h3>
        <p class="empty-text">
          Be the first Proud Rat to report a kill and claim your spot on the leaderboard!
        </p>
        <button @click="router.push('/submit-kill')" class="cta-btn">
          Report Your First Kill
        </button>
      </div>

      <!-- Leaderboard -->
      <div v-else class="leaderboard">
        <div
          v-for="(killer, index) in topKillers"
          :key="killer.killer_id"
          class="killer-card"
          :class="getRankBadgeClass(index)"
          @click="router.push(`/profile/${killer.killer_id}`)"
        >
          <!-- Rank Badge -->
          <div class="rank-badge">
            <component :is="getRankIcon(index)" :size="24" />
            <span class="rank-number">{{ index + 1 }}</span>
          </div>

          <!-- Killer Info -->
          <div class="killer-info">
            <div class="avatar-wrapper">
              <img
                v-if="killer.avatar_url"
                :src="killer.avatar_url"
                :alt="killer.username"
                class="avatar"
              />
              <div v-else class="avatar-placeholder">
                {{ killer.username.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="killer-details">
              <div class="name-row">
                <span v-if="killer.clan_tag" class="clan-tag">[{{ killer.clan_tag }}]</span>
                <h3 class="killer-name">{{ killer.username }}</h3>
              </div>
              <div class="role-badge">
                <Skull :size="14" />
                <span>Proud Rat</span>
              </div>
            </div>
          </div>

          <!-- Kill Count -->
          <div class="kill-count">
            <div class="count-number">{{ killer.kill_count }}</div>
            <div class="count-label">{{ killer.kill_count === 1 ? 'Kill' : 'Kills' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white p-4 md:p-8;
}

.content-wrapper {
  @apply max-w-4xl mx-auto;
}

/* Header */
.header-section {
  @apply flex items-center justify-between mb-8 flex-wrap gap-4;
}

.header-content {
  @apply flex items-center gap-4;
}

.header-icon {
  @apply bg-arc-red text-black rounded-full p-3 flex items-center justify-center;
}

.page-title {
  @apply text-4xl font-bold text-white;
}

.page-subtitle {
  @apply text-arc-brown text-sm mt-1;
}

.submit-kill-btn {
  @apply flex items-center gap-2 bg-arc-red hover:bg-arc-red/80 text-black font-bold px-6 py-3 rounded-lg transition-all;
}

/* Loading State */
.loading-state {
  @apply flex flex-col items-center justify-center py-16;
}

.spinner {
  @apply w-12 h-12 border-4 border-arc-brown/20 border-t-arc-red rounded-full animate-spin mb-4;
}

.loading-text {
  @apply text-arc-brown;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply text-arc-brown mb-4;
}

.empty-title {
  @apply text-2xl font-bold text-white mb-2;
}

.empty-text {
  @apply text-arc-brown mb-6 max-w-md;
}

.cta-btn {
  @apply bg-arc-red hover:bg-arc-red/80 text-black font-bold px-8 py-3 rounded-lg transition-all;
}

/* Leaderboard */
.leaderboard {
  @apply space-y-4;
}

.killer-card {
  @apply bg-arc-card rounded-lg p-6 border-2 flex items-center gap-6 cursor-pointer transition-all;
}

.killer-card:hover {
  @apply transform scale-105 shadow-xl;
}

.rank-gold {
  @apply border-yellow-500 hover:border-yellow-400 hover:shadow-yellow-500/30;
}

.rank-silver {
  @apply border-gray-400 hover:border-gray-300 hover:shadow-gray-400/30;
}

.rank-bronze {
  @apply border-orange-600 hover:border-orange-500 hover:shadow-orange-600/30;
}

.rank-default {
  @apply border-arc-brown/20 hover:border-arc-brown/40;
}

.rank-badge {
  @apply flex flex-col items-center justify-center min-w-[60px];
}

.rank-gold .rank-badge {
  @apply text-yellow-500;
}

.rank-silver .rank-badge {
  @apply text-gray-400;
}

.rank-bronze .rank-badge {
  @apply text-orange-600;
}

.rank-default .rank-badge {
  @apply text-arc-brown;
}

.rank-number {
  @apply text-2xl font-bold mt-1;
}

/* Killer Info */
.killer-info {
  @apply flex items-center gap-4 flex-1;
}

.avatar-wrapper {
  @apply w-16 h-16 rounded-full overflow-hidden flex-shrink-0;
}

.avatar {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-arc-brown flex items-center justify-center text-white text-2xl font-bold;
}

.killer-details {
  @apply flex flex-col gap-1;
}

.name-row {
  @apply flex items-center gap-2;
}

.clan-tag {
  @apply text-arc-yellow font-mono text-sm;
}

.killer-name {
  @apply text-xl font-bold text-arc-dark;
}

.role-badge {
  @apply flex items-center gap-1 text-arc-red text-sm;
}

/* Kill Count */
.kill-count {
  @apply flex flex-col items-center justify-center min-w-[100px];
}

.count-number {
  @apply text-4xl font-bold text-arc-red;
}

.count-label {
  @apply text-arc-brown text-sm;
}

/* Responsive */
@media (max-width: 640px) {
  .killer-card {
    @apply flex-col gap-4;
  }

  .rank-badge {
    @apply flex-row gap-2 w-full justify-center;
  }

  .killer-info {
    @apply flex-col text-center;
  }

  .name-row {
    @apply justify-center;
  }
}
</style>
