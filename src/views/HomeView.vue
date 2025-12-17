<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Target, Trophy, Users, Skull } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getMostWanted, getUserByUsername, getTopKillers } from '@/lib/db'
import type { MostWanted, TopKiller } from '@/lib/supabase'

const topBounties = ref<MostWanted[]>([])
const topKillers = ref<TopKiller[]>([])
const loading = ref(true)
const killersLoading = ref(true)

onMounted(async () => {
  // Load Most Wanted
  try {
    const data = await getMostWanted()
    const top3 = data.slice(0, 3) // Get top 3

    // Fetch user profiles to get avatar URLs
    const bountiesWithAvatars = await Promise.all(
      top3.map(async (bounty: MostWanted) => {
        const user = await getUserByUsername(bounty.target_gamertag)
        return {
          ...bounty,
          avatar_url: user?.avatar_url
        }
      })
    )

    topBounties.value = bountiesWithAvatars
  } catch (error) {
    console.error('Error loading top bounties:', error)
  } finally {
    loading.value = false
  }

  // Load Top Killers
  try {
    const killers = await getTopKillers(3) // Get top 3
    topKillers.value = killers
  } catch (error) {
    console.error('Error loading top killers:', error)
  } finally {
    killersLoading.value = false
  }
})

function getMedalClass(index: number) {
  if (index === 0) return 'medal-gold'
  if (index === 1) return 'medal-silver'
  if (index === 2) return 'medal-bronze'
  return ''
}

function getMedalEmoji(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return ''
}
</script>

<template>
  <div class="hero-section">
    <!-- Hero Section -->
    <div class="hero-container">
      <h1 class="hero-title">
        <span class="hero-title-gradient">
          ARC RAIDERS
        </span>
        <br />
        BOUNTY SYSTEM
      </h1>
      <p class="hero-subtitle">
        Place bounties. Hunt targets. Claim glory.
      </p>

      <div class="hero-buttons">
        <RouterLink to="/bounties" class="btn-primary">
          View Bounties
        </RouterLink>
        <RouterLink to="/create-bounty" class="btn-secondary">
          Create Bounty
        </RouterLink>
      </div>
    </div>

    <!-- Top 3 Most Wanted -->
    <div class="most-wanted-section">
      <div class="section-header">
        <h2 class="section-title">
          <Target class="text-arc-red" :size="40" />
          <span class="section-title-gradient">Most Wanted</span>
        </h2>
        <p class="section-subtitle">The highest-value targets in Arc Raiders</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="text-xl">Loading top bounties...</div>
      </div>

      <!-- Top 3 Cards -->
      <div v-else-if="topBounties.length > 0" class="bounty-grid">
        <div v-for="(bounty, index) in topBounties" :key="bounty.target_gamertag" class="bounty-card-wrapper">
          <!-- Medal Badge -->
          <div class="medal-badge">
            <div :class="['medal-circle', getMedalClass(index)]">
              {{ getMedalEmoji(index) }}
            </div>
          </div>

          <!-- Card -->
          <div class="bounty-card">
            <!-- Rank -->
            <div class="bounty-rank">#{{ index + 1 }}</div>

            <!-- Profile Picture -->
            <div class="bounty-avatar-container">
              <div class="bounty-avatar">
                <img
                  v-if="bounty.avatar_url"
                  :src="bounty.avatar_url"
                  :alt="`${bounty.target_gamertag}'s avatar`"
                  class="bounty-avatar-img"
                />
                <div v-else class="bounty-avatar-fallback">
                  {{ bounty.target_gamertag.charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Gamertag -->
            <h3 class="bounty-gamertag">{{ bounty.target_gamertag }}</h3>

            <!-- Stats -->
            <div class="bounty-stats">
              <div class="stat-box">
                <div class="stat-value-large">{{ bounty.total_bounty }}</div>
                <div class="stat-label">Total Bounty</div>
              </div>

              <div class="stat-box">
                <div class="stat-value-medium">{{ bounty.bounty_count }}</div>
                <div class="stat-label">Active Bounties</div>
              </div>
            </div>

            <!-- View Bounties Button -->
            <RouterLink to="/bounties" class="bounty-btn">
              Hunt This Target
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="empty-state-text">No bounties yet!</p>
        <RouterLink to="/create-bounty" class="empty-state-btn">
          Be the First to Create One
        </RouterLink>
      </div>
    </div>

    <!-- Top 3 Killers -->
    <div class="top-killers-section">
      <div class="section-header">
        <h2 class="section-title">
          <Skull class="text-arc-red" :size="40" />
          <span class="section-title-gradient">Top Killers</span>
        </h2>
        <p class="section-subtitle">The most dangerous Proud Rats in the wasteland</p>
      </div>

      <!-- Loading State -->
      <div v-if="killersLoading" class="loading-state">
        <div class="text-xl">Loading top killers...</div>
      </div>

      <!-- Top 3 Cards -->
      <div v-else-if="topKillers.length > 0" class="bounty-grid">
        <div v-for="(killer, index) in topKillers" :key="killer.killer_id" class="bounty-card-wrapper">
          <!-- Medal Badge -->
          <div class="medal-badge">
            <div :class="['medal-circle', getMedalClass(index)]">
              {{ getMedalEmoji(index) }}
            </div>
          </div>

          <!-- Card -->
          <RouterLink :to="`/profile/${killer.killer_id}`" class="bounty-card killer-card">
            <!-- Rank -->
            <div class="bounty-rank">#{{ index + 1 }}</div>

            <!-- Profile Picture -->
            <div class="bounty-avatar-container">
              <div class="bounty-avatar">
                <img
                  v-if="killer.avatar_url"
                  :src="killer.avatar_url"
                  :alt="`${killer.username}'s avatar`"
                  class="bounty-avatar-img"
                />
                <div v-else class="bounty-avatar-fallback">
                  {{ killer.username.charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <span v-if="killer.clan_tag" class="clan-tag">[{{ killer.clan_tag }}]</span>
              <h3 class="bounty-gamertag">{{ killer.username }}</h3>
            </div>

            <!-- Stats -->
            <div class="bounty-stats">
              <div class="stat-box">
                <div class="stat-value-large">{{ killer.kill_count }}</div>
                <div class="stat-label">{{ killer.kill_count === 1 ? 'Kill' : 'Kills' }}</div>
              </div>
            </div>

            <!-- View Profile Button -->
            <div class="bounty-btn killer-btn">
              View Profile
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="empty-state-text">No kills recorded yet!</p>
        <RouterLink to="/submit-kill" class="empty-state-btn">
          Be the First Killer
        </RouterLink>
      </div>

      <!-- View All Link -->
      <div v-if="topKillers.length > 0" class="view-all-link">
        <RouterLink to="/top-killers" class="view-all-btn">
          View Full Leaderboard
        </RouterLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-grid">
        <!-- Place Bounties -->
        <div class="feature-card feature-card-red">
          <div class="feature-icon feature-icon-red">
            <Target class="text-arc-red" :size="48" />
          </div>
          <h3 class="feature-title">Place Bounties</h3>
          <p class="feature-description">
            Target any player and set a bounty amount. The higher the bounty, the more hunters will
            come.
          </p>
        </div>

        <!-- Earn Points -->
        <div class="feature-card feature-card-yellow">
          <div class="feature-icon feature-icon-yellow">
            <Trophy class="text-arc-yellow" :size="48" />
          </div>
          <h3 class="feature-title">Earn Points</h3>
          <p class="feature-description">
            Complete bounties by eliminating targets and submitting proof. Climb the leaderboard!
          </p>
        </div>

        <!-- Community Driven -->
        <div class="feature-card feature-card-green">
          <div class="feature-icon feature-icon-green">
            <Users class="text-arc-green" :size="48" />
          </div>
          <h3 class="feature-title">Community Driven</h3>
          <p class="feature-description">
            Fair play enforced by community verification. No cheating, just skill.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-box">
        <h2 class="cta-title">Ready to Start Hunting?</h2>
        <p class="cta-subtitle">
          Join the Arc Raiders bounty hunting community today
        </p>
        <RouterLink to="/bounties" class="cta-btn">
          View All Bounties
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  @apply min-h-screen bg-transparent text-white;
}

.hero-container {
  @apply container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center;
}

.hero-title {
  @apply text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight;
}

.hero-title-gradient {
  @apply bg-gradient-to-r from-arc-red via-arc-green via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

.hero-subtitle {
  @apply text-lg sm:text-xl md:text-2xl text-arc-brown mb-8 sm:mb-12 max-w-3xl mx-auto px-4;
}

.hero-buttons {
  @apply flex gap-3 sm:gap-4 justify-center flex-wrap px-4;
}

.btn-primary {
  @apply bg-arc-red hover:bg-arc-red/80 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition transform hover:scale-105 text-black shadow-lg shadow-arc-red/30 min-w-[140px] sm:min-w-0;
}

.btn-secondary {
  @apply bg-arc-card border-2 border-arc-red hover:bg-arc-red hover:text-black hover:shadow-lg hover:shadow-arc-red/30 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition transform hover:scale-105 min-w-[140px] sm:min-w-0 text-gray-900;
}

/* Most Wanted Section */
.most-wanted-section {
  @apply container mx-auto px-4 py-8 sm:py-12 md:py-16;
}

.section-header {
  @apply text-center mb-8 sm:mb-12;
}

.section-title {
  @apply text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3;
}

.section-title-gradient {
  @apply bg-gradient-to-r from-arc-red via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

.section-subtitle {
  @apply text-arc-brown text-base sm:text-lg px-4;
}

.loading-state {
  @apply text-center py-8 sm:py-12 text-white;
}

.bounty-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto;
}

.bounty-card-wrapper {
  @apply relative;
}

/* Medal Badge */
.medal-badge {
  @apply absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10;
}

.medal-circle {
  @apply text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br;
}

.medal-gold {
  @apply from-arc-yellow to-arc-yellow;
}

.medal-silver {
  @apply from-arc-red to-arc-red;
}

.medal-bronze {
  @apply from-arc-red to-arc-red;
}

/* Bounty Card */
.bounty-card {
  @apply bg-arc-card rounded-xl p-6 sm:p-8 pt-14 sm:pt-16 text-center hover:bg-white transition transform hover:scale-105 border-2 border-arc-brown/20 hover:border-arc-red hover:shadow-lg hover:shadow-arc-brown/30;
}

.bounty-rank {
  @apply text-4xl sm:text-6xl font-bold text-arc-red/20 mb-2;
}

.bounty-avatar-container {
  @apply flex justify-center mb-3 sm:mb-4;
}

.bounty-avatar {
  @apply w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-arc-red overflow-hidden bg-arc-beige;
}

.bounty-avatar-img {
  @apply w-full h-full object-cover;
}

.bounty-avatar-fallback {
  @apply w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-arc-red;
}

.bounty-gamertag {
  @apply text-xl sm:text-2xl font-bold mb-3 sm:mb-4 break-words text-gray-900;
}

.bounty-stats {
  @apply space-y-2 sm:space-y-3 mb-4 sm:mb-6;
}

.stat-box {
  @apply bg-arc-beige rounded-lg p-2 sm:p-3 border border-arc-brown/30;
}

.stat-value-large {
  @apply text-2xl sm:text-3xl font-bold text-arc-red;
}

.stat-value-medium {
  @apply text-lg sm:text-xl font-bold text-gray-900;
}

.stat-label {
  @apply text-xs sm:text-sm text-gray-700;
}

.bounty-btn {
  @apply block w-full bg-arc-red hover:bg-arc-red/80 text-black py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition shadow-md;
}

/* Empty State */
.empty-state {
  @apply text-center py-8 sm:py-12 text-arc-brown px-4;
}

.empty-state-text {
  @apply text-lg sm:text-xl mb-4 text-gray-900;
}

.empty-state-btn {
  @apply inline-block bg-arc-red hover:bg-arc-red/80 text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition shadow-md shadow-arc-red/30;
}

/* Features Section */
.features-section {
  @apply container mx-auto px-4 py-8 sm:py-12 md:py-16;
}

.features-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8;
}

.feature-card {
  @apply bg-arc-card rounded-lg p-6 sm:p-8 text-center hover:bg-white transition;
}

.feature-card-red {
  @apply border border-arc-red/30 hover:border-arc-red hover:shadow-lg hover:shadow-arc-red/20;
}

.feature-card-yellow {
  @apply border border-arc-yellow/30 hover:border-arc-yellow hover:shadow-lg hover:shadow-arc-yellow/20;
}

.feature-card-green {
  @apply border border-arc-green/30 hover:border-arc-green hover:shadow-lg hover:shadow-arc-green/20;
}

.feature-icon {
  @apply inline-block p-3 sm:p-4 rounded-full mb-3 sm:mb-4;
}

.feature-icon-red {
  @apply bg-arc-red/10;
}

.feature-icon-yellow {
  @apply bg-arc-yellow/10;
}

.feature-icon-green {
  @apply bg-arc-green/10;
}

.feature-title {
  @apply text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900;
}

.feature-description {
  @apply text-arc-brown text-sm sm:text-base;
}

/* CTA Section */
.cta-section {
  @apply container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center;
}

.cta-box {
  @apply bg-gradient-to-r from-arc-red/10 via-arc-green/10 via-arc-yellow/10 to-arc-red/10 border-2 border-arc-red/30 rounded-2xl p-8 sm:p-12 shadow-lg shadow-arc-brown/20;
}

.cta-title {
  @apply text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white;
}

.cta-subtitle {
  @apply text-base sm:text-lg md:text-xl text-arc-brown mb-6 sm:mb-8 px-4;
}

.cta-btn {
  @apply inline-block bg-arc-red hover:bg-arc-red/80 text-black px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition transform hover:scale-105 shadow-lg shadow-arc-red/40;
}

/* Top Killers Section */
.top-killers-section {
  @apply container mx-auto px-4 py-8 sm:py-12 md:py-16;
}

.killer-card {
  @apply block no-underline;
}

.killer-btn {
  @apply bg-arc-red hover:bg-arc-red/80;
}

.clan-tag {
  @apply text-arc-yellow font-mono text-sm;
}

.view-all-link {
  @apply text-center mt-8;
}

.view-all-btn {
  @apply inline-block bg-arc-brown/20 hover:bg-arc-brown/30 text-gray-900 px-6 py-3 rounded-lg font-semibold transition;
}
</style>
