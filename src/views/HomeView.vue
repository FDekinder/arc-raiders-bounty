<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Target, Trophy, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getMostWanted, getUserByUsername } from '@/lib/db'
import type { MostWanted } from '@/lib/supabase'

const topBounties = ref<MostWanted[]>([])
const loading = ref(true)

onMounted(async () => {
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
  @apply min-h-screen bg-gradient-to-b from-arc-dark to-arc-navy text-white;
}

.hero-container {
  @apply container mx-auto px-4 py-20 text-center;
}

.hero-title {
  @apply text-6xl md:text-7xl font-bold mb-6;
}

.hero-title-gradient {
  @apply bg-gradient-to-r from-arc-red via-arc-green via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

.hero-subtitle {
  @apply text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto;
}

.hero-buttons {
  @apply flex gap-4 justify-center flex-wrap;
}

.btn-primary {
  @apply bg-arc-red hover:bg-arc-red-600 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 text-white shadow-lg shadow-arc-red/30;
}

.btn-secondary {
  @apply bg-arc-navy border-2 border-arc-red hover:bg-arc-red hover:shadow-lg hover:shadow-arc-red/30 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105;
}

/* Most Wanted Section */
.most-wanted-section {
  @apply container mx-auto px-4 py-16;
}

.section-header {
  @apply text-center mb-12;
}

.section-title {
  @apply text-4xl font-bold mb-4 flex items-center justify-center gap-3;
}

.section-title-gradient {
  @apply bg-gradient-to-r from-arc-red via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

.section-subtitle {
  @apply text-gray-400 text-lg;
}

.loading-state {
  @apply text-center py-12;
}

.bounty-grid {
  @apply grid md:grid-cols-3 gap-8 max-w-6xl mx-auto;
}

.bounty-card-wrapper {
  @apply relative;
}

/* Medal Badge */
.medal-badge {
  @apply absolute -top-4 left-1/2 transform -translate-x-1/2 z-10;
}

.medal-circle {
  @apply text-5xl w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br;
}

.medal-gold {
  @apply from-arc-yellow to-arc-yellow-600;
}

.medal-silver {
  @apply from-arc-red-300 to-arc-red-400;
}

.medal-bronze {
  @apply from-arc-red to-arc-red-600;
}

/* Bounty Card */
.bounty-card {
  @apply bg-arc-navy rounded-xl p-8 pt-16 text-center hover:bg-arc-dark transition transform hover:scale-105 border-2 border-arc-red/30 hover:border-arc-red hover:shadow-lg hover:shadow-arc-red/30;
}

.bounty-rank {
  @apply text-6xl font-bold text-arc-red/20 mb-2;
}

.bounty-avatar-container {
  @apply flex justify-center mb-4;
}

.bounty-avatar {
  @apply w-24 h-24 rounded-full border-4 border-arc-red overflow-hidden bg-arc-dark;
}

.bounty-avatar-img {
  @apply w-full h-full object-cover;
}

.bounty-avatar-fallback {
  @apply w-full h-full flex items-center justify-center text-4xl font-bold text-arc-red;
}

.bounty-gamertag {
  @apply text-2xl font-bold mb-4;
}

.bounty-stats {
  @apply space-y-3 mb-6;
}

.stat-box {
  @apply bg-arc-dark rounded-lg p-3 border border-arc-red/30;
}

.stat-value-large {
  @apply text-3xl font-bold text-arc-red;
}

.stat-value-medium {
  @apply text-xl font-bold;
}

.stat-label {
  @apply text-sm text-gray-400;
}

.bounty-btn {
  @apply block w-full bg-arc-red hover:bg-arc-red-600 text-white py-3 rounded-lg font-semibold transition shadow-md;
}

/* Empty State */
.empty-state {
  @apply text-center py-12 text-gray-400;
}

.empty-state-text {
  @apply text-xl mb-4;
}

.empty-state-btn {
  @apply inline-block bg-arc-red hover:bg-arc-red-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md shadow-arc-red/30;
}

/* Features Section */
.features-section {
  @apply container mx-auto px-4 py-16;
}

.features-grid {
  @apply grid md:grid-cols-3 gap-8;
}

.feature-card {
  @apply bg-arc-navy rounded-lg p-8 text-center hover:bg-arc-dark transition;
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
  @apply inline-block p-4 rounded-full mb-4;
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
  @apply text-2xl font-bold mb-3;
}

.feature-description {
  @apply text-gray-400;
}

/* CTA Section */
.cta-section {
  @apply container mx-auto px-4 py-20 text-center;
}

.cta-box {
  @apply bg-gradient-to-r from-arc-red/10 via-arc-green/10 via-arc-yellow/10 to-arc-red/10 border-2 border-arc-red/30 rounded-2xl p-12 shadow-lg shadow-arc-red/20;
}

.cta-title {
  @apply text-4xl font-bold mb-4;
}

.cta-subtitle {
  @apply text-xl text-gray-300 mb-8;
}

.cta-btn {
  @apply inline-block bg-arc-red hover:bg-arc-red-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-lg shadow-arc-red/40;
}
</style>
