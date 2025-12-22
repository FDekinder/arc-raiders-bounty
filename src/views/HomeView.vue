<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getMostWanted, getUserByUsername, getTopKillers } from '@/lib/db'
import type { MostWanted, TopKiller } from '@/lib/supabase'
import { getDefaultAvatar } from '@/lib/auth'
import Card from '@/components/Card.vue'
import TacticalButton from '@/components/TacticalButton.vue'
import IconTarget from '@/components/icons/IconTarget.vue'
import IconHunter from '@/components/icons/IconHunter.vue'
import IconBounty from '@/components/icons/IconBounty.vue'

const topBounties = ref<MostWanted[]>([])
const topKillers = ref<TopKiller[]>([])
const loading = ref(true)
const killersLoading = ref(true)

onMounted(async () => {
  // Load Most Wanted
  try {
    const data = await getMostWanted()
    const top10 = data.slice(0, 10) // Get top 10

    // Fetch user profiles to get avatar URLs with fallback to default
    const bountiesWithAvatars = await Promise.all(
      top10.map(async (bounty: MostWanted) => {
        const user = await getUserByUsername(bounty.target_gamertag)
        const avatarUrl = user?.avatar_url || getDefaultAvatar(user?.game_role)
        return {
          ...bounty,
          avatar_url: avatarUrl,
        }
      }),
    )

    topBounties.value = bountiesWithAvatars
  } catch (error) {
    console.error('Error loading top bounties:', error)
  } finally {
    loading.value = false
  }

  // Load Top Killers
  try {
    const killers = await getTopKillers(10) // Get top 10

    // Add avatar URLs with fallback to default
    const killersWithAvatars = killers.map((killer) => ({
      ...killer,
      avatar_url: killer.avatar_url || getDefaultAvatar(killer.game_role),
    }))

    topKillers.value = killersWithAvatars
  } catch (error) {
    console.error('Error loading top killers:', error)
  } finally {
    killersLoading.value = false
  }
})
</script>

<template>
  <div class="hero-section">
    <!-- Hero Section -->
    <div class="hero-container">
      <h1 class="hero-title">
        <span class="hero-title-gradient"> ARC RAIDERS </span>
        <br />
        BOUNTY SYSTEM
      </h1>
      <p class="hero-subtitle">Place bounties. Hunt targets. Claim glory.</p>

      <div class="hero-buttons">
        <RouterLink to="/create-bounty">
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconBounty :size="20" />
            </template>
            Create Bounty
          </TacticalButton>
        </RouterLink>
        <RouterLink to="/submit-kill">
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconHunter :size="20" />
            </template>
            Report Kill
          </TacticalButton>
        </RouterLink>
      </div>
    </div>

    <!-- Most Wanted Section -->
    <div class="most-wanted-section">
      <div class="section-header">
        <h2 class="section-title">
          <IconTarget :size="40" className="text-arc-red" />
          <span class="section-title-gradient">Most Wanted</span>
        </h2>
        <p class="section-subtitle">The highest-value targets in Arc Raiders</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="text-xl">Loading top bounties...</div>
      </div>

      <!-- Top 3 Bounties Cards -->
      <div v-else-if="topBounties.length > 0">
        <div class="bounties-grid">
          <RouterLink
            v-for="(bounty, index) in topBounties.slice(0, 3)"
            :key="bounty.target_gamertag"
            to="/bounties"
            class="bounty-link"
          >
            <div class="card-with-medal">
              <div
                class="futuristic-medal"
                :class="
                  index === 0 ? 'medal-rank-1' : index === 1 ? 'medal-rank-2' : 'medal-rank-3'
                "
              >
                <div class="medal-inner">
                  <div class="medal-rank">{{ index + 1 }}</div>
                </div>
                <div class="medal-glow"></div>
              </div>
              <Card variant="red">
                <div
                  class="bounty-card"
                  :style="
                    bounty.avatar_url
                      ? {
                          backgroundImage: `linear-gradient(rgba(236, 226, 208, 0.25), rgba(236, 226, 208, 0.20)), url(${bounty.avatar_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  "
                >
                  <h3 class="bounty-gamertag">{{ bounty.target_gamertag }}</h3>
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
                </div>
              </Card>
            </div>
          </RouterLink>
        </div>

        <!-- Positions 4-10 List -->
        <div v-if="topBounties.length > 3" class="leaderboard-list">
          <RouterLink
            v-for="(bounty, index) in topBounties.slice(3, 10)"
            :key="bounty.target_gamertag"
            to="/bounties"
            class="leaderboard-item"
          >
            <div class="leaderboard-rank">{{ index + 4 }}</div>
            <div class="leaderboard-avatar">
              <img
                v-if="bounty.avatar_url"
                :src="bounty.avatar_url"
                :alt="bounty.target_gamertag"
              />
              <div v-else class="leaderboard-avatar-fallback">
                {{ bounty.target_gamertag.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">{{ bounty.target_gamertag }}</div>
              <div class="leaderboard-subtext">{{ bounty.bounty_count }} active bounties</div>
            </div>
            <div class="leaderboard-value">{{ bounty.total_bounty }}</div>
          </RouterLink>
        </div>

        <!-- View Full Leaderboard Button -->
        <div class="view-all-link">
          <RouterLink to="/leaderboard" class="view-all-btn"> View Full Leaderboard </RouterLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="empty-state-text">No bounties yet!</p>
        <RouterLink to="/create-bounty">
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconBounty :size="20" />
            </template>
            Be the First to Create One
          </TacticalButton>
        </RouterLink>
      </div>
    </div>

    <!-- Top Killers Section -->
    <div class="top-killers-section">
      <div class="section-header">
        <h2 class="section-title">
          <IconHunter :size="40" className="text-arc-red" />
          <span class="section-title-gradient">Top Killers</span>
        </h2>
        <p class="section-subtitle">The most dangerous Proud Rats in the wasteland</p>
      </div>

      <!-- Loading State -->
      <div v-if="killersLoading" class="loading-state">
        <div class="text-xl">Loading top killers...</div>
      </div>

      <!-- Top 3 Killers Cards -->
      <div v-else-if="topKillers.length > 0">
        <div class="killers-grid">
          <RouterLink
            v-for="(killer, index) in topKillers.slice(0, 3)"
            :key="killer.killer_id"
            :to="`/profile/${killer.killer_id}`"
            class="killer-link"
          >
            <div class="card-with-medal">
              <div
                class="futuristic-medal"
                :class="
                  index === 0 ? 'medal-rank-1' : index === 1 ? 'medal-rank-2' : 'medal-rank-3'
                "
              >
                <div class="medal-inner">
                  <div class="medal-rank">{{ index + 1 }}</div>
                </div>
                <div class="medal-glow"></div>
              </div>
              <Card variant="red">
                <div
                  class="bounty-card"
                  :style="
                    killer.avatar_url
                      ? {
                          backgroundImage: `linear-gradient(rgba(236, 226, 208, 0.25), rgba(236, 226, 208, 0.20)), url(${killer.avatar_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  "
                >
                  <h3 class="bounty-gamertag">
                    <span v-if="killer.clan_tag" class="clan-tag">[{{ killer.clan_tag }}]</span>
                    {{ killer.username }}
                  </h3>
                  <div class="bounty-stats">
                    <div class="stat-box">
                      <div class="stat-value-large">{{ killer.kill_count }}</div>
                      <div class="stat-label">Total Kills</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </RouterLink>
        </div>

        <!-- Positions 4-10 List -->
        <div v-if="topKillers.length > 3" class="leaderboard-list">
          <RouterLink
            v-for="(killer, index) in topKillers.slice(3, 10)"
            :key="killer.killer_id"
            :to="`/profile/${killer.killer_id}`"
            class="leaderboard-item"
          >
            <div class="leaderboard-rank">{{ index + 4 }}</div>
            <div class="leaderboard-avatar">
              <img v-if="killer.avatar_url" :src="killer.avatar_url" :alt="killer.username" />
              <div v-else class="leaderboard-avatar-fallback">
                {{ killer.username.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">
                <span v-if="killer.clan_tag" class="clan-tag">[{{ killer.clan_tag }}]</span>
                {{ killer.username }}
              </div>
              <div class="leaderboard-subtext">{{ killer.kill_count }} total kills</div>
            </div>
            <div class="leaderboard-value">{{ killer.kill_count }}</div>
          </RouterLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="empty-state-text">No kills recorded yet!</p>
        <RouterLink to="/submit-kill" class="empty-state-btn"> Be the First Killer </RouterLink>
      </div>

      <!-- View All Link -->
      <div v-if="topKillers.length > 0" class="view-all-link">
        <RouterLink to="/top-killers" class="view-all-btn"> View Full Leaderboard </RouterLink>
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
        <p class="cta-subtitle">Join the Arc Raiders bounty hunting community today</p>
        <RouterLink to="/bounties" class="cta-btn"> View All Bounties </RouterLink>
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
  @apply flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 max-w-md mx-auto sm:max-w-none;
}

.hero-buttons a {
  @apply w-full sm:w-auto;
}

.hero-buttons a :deep(button) {
  @apply w-full;
}

.btn-primary {
  @apply bg-arc-red hover:bg-arc-red/80 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition transform hover:scale-105 text-black shadow-lg shadow-arc-red/30 min-w-[140px] sm:min-w-0;
}

.btn-secondary {
  @apply bg-arc-card border-2 border-arc-red hover:bg-arc-red hover:text-black hover:shadow-lg hover:shadow-arc-red/30 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition transform hover:scale-105 min-w-[140px] sm:min-w-0 text-gray-900;
}

/* Most Wanted & Top Killers Sections */
.most-wanted-section,
.top-killers-section {
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

.bounties-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto;
}

.bounty-link {
  @apply block no-underline;
}

.killers-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto;
}

.killer-link {
  @apply block no-underline;
}

/* Card with Medal Container */
.card-with-medal {
  position: relative;
  padding-top: 50px;
}

/* Futuristic Medal System */
.futuristic-medal {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  z-index: 10;
}

.medal-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 3px solid;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 2;
}

.medal-rank {
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 10px currentColor;
}

.medal-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(15px);
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.medal-rank-1 .medal-inner {
  border-color: #ffd700;
  color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.medal-rank-1 .medal-glow {
  background: #ffd700;
}

.medal-rank-2 .medal-inner {
  border-color: #c0c0c0;
  color: #c0c0c0;
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.5);
}

.medal-rank-2 .medal-glow {
  background: #c0c0c0;
}

.medal-rank-3 .medal-inner {
  border-color: #cd7f32;
  color: #cd7f32;
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.5);
}

.medal-rank-3 .medal-glow {
  background: #cd7f32;
}

/* Bounty Card */
.bounty-card {
  @apply bg-arc-card rounded-xl p-4 sm:p-6 md:p-8 text-center hover:bg-white transition transform hover:scale-105 border-2 border-arc-red hover:shadow-lg hover:shadow-arc-brown/30;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bounty-gamertag {
  @apply text-xl sm:text-2xl font-bold mb-3 sm:mb-4 break-words;
  background: rgba(236, 226, 208, 0.95);
  color: #1a1a1a;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

/* Killer Card Styles */
.clan-tag {
  @apply text-arc-yellow font-mono text-sm;
}

/* Leaderboard List (Positions 4-10) */
.leaderboard-list {
  @apply max-w-4xl mx-auto mt-8 space-y-2;
}

.leaderboard-item {
  @apply flex items-center gap-4 bg-arc-card rounded-lg p-4 border border-arc-brown/20 hover:border-arc-red hover:bg-white transition no-underline;
}

.leaderboard-rank {
  @apply w-10 h-10 flex items-center justify-center rounded-full bg-arc-brown/20 font-bold text-lg text-gray-900;
  min-width: 2.5rem;
}

.leaderboard-avatar {
  @apply w-12 h-12 rounded-full overflow-hidden border-2 border-arc-brown/30 bg-arc-beige flex-shrink-0;
}

.leaderboard-avatar img {
  @apply w-full h-full object-cover;
}

.leaderboard-avatar-fallback {
  @apply w-full h-full flex items-center justify-center text-xl font-bold text-arc-red;
}

.leaderboard-info {
  @apply flex-1 min-w-0;
}

.leaderboard-name {
  @apply font-bold text-gray-900 truncate text-base;
}

.leaderboard-subtext {
  @apply text-sm text-gray-600;
}

.leaderboard-value {
  @apply font-bold text-xl text-arc-red;
}

.view-all-link {
  @apply text-center mt-8;
}

.view-all-btn {
  @apply inline-block bg-arc-red/50 hover:bg-arc-red/80 text-gray-900 px-6 py-3 rounded-lg font-semibold transition;
}
</style>
