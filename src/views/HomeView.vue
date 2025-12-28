<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  getMostWanted,
  getTopKillers,
  getHunterCount,
  getBatchBountyData,
} from '@/lib/db'
import { joinHunt, leaveHunt, getMyActiveHunts } from '@/lib/hunters'
import type { MostWanted, TopKiller, RatOfTheDay } from '@/lib/supabase'
import { getDefaultAvatar, getCurrentUser } from '@/lib/auth'
import { useToast } from '@/composables/useToast'
import { useSEO, seoConfigs } from '@/composables/useSEO'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card.vue'
import TacticalButton from '@/components/TacticalButton.vue'
import IconTarget from '@/components/icons/IconTarget.vue'
import IconHunter from '@/components/icons/IconHunter.vue'
import IconBounty from '@/components/icons/IconBounty.vue'
import IconRat from '@/components/icons/IconRat.vue'
import RolePoll from '@/components/RolePoll.vue'
import RatOfTheDayPlayer from '@/components/RatOfTheDayPlayer.vue'

// SEO
useSEO(seoConfigs.home)

const ratOfTheDay = ref<RatOfTheDay | null>(null)

const router = useRouter()
const { success, error: showError } = useToast()

const topBounties = ref<MostWanted[]>([])
const topKillers = ref<TopKiller[]>([])
const loading = ref(true)
const killersLoading = ref(true)
const hunterCounts = ref<Record<string, number>>({})
const userHuntingStatus = ref<Record<string, boolean>>({})
const bountyIds = ref<Record<string, string>>({}) // Map target_gamertag to bounty_id
const showHuntLimitModal = ref(false)
const huntLimitMessage = ref('')
const showProudRatModal = ref(false)

// Streamer bounty data
const streamerHunterCounts = ref<Record<string, number>>({})
const streamerHuntingStatus = ref<Record<string, boolean>>({})
const streamerBountyIds = ref<Record<string, string>>({})

// Streamer list - permanent bounty targets (base list)
const streamerListBase = [
  'theburntpeanut',
  'shroud',
  'summit1g',
  'recrent',
  'cohhcarnage',
  'timthetatman',
  'nickmercs',
  'ninja',
  'sxb',
  'wtcn',
  'zackrawrr',
  'LIRIK',
  'DrDisRespecT',
  'sequisha',
  'grimmmz',
  'lost',
  'sacriel',
  'anthony_kongphan',
  'thespudhunter',
  'solidfps',
  'HutchMF',
  'cloakzy',
  'Myth_',
  'RNGingy',
  'xQc',
  'Nadeshot',
  'Symfuhny',
  'Tfue',
  'Swagg',
  'Aceu',
  'iiTzTimmy',
  'FaZeJSmooth',
  'HusKerrs',
  'Klean',
  'Gigz',
  'Astatoro',
  'Phillygamer98',
  'BasicallyZen',
  'Phixate',
  'RamenStyle',
  'Bearki',
  'Jesse',
  'Qloud',
  'ON1C',
  'BoschPlays',
  'MrC0d3r',
  'Skulldar_',
  'Paitambemjoga',
  'RAIDER21',
  'RiotGamesFPS',
  'RogueNine',
]

// Computed sorted streamer list based on hunter counts
const streamerList = computed(() => {
  return [...streamerListBase].sort((a, b) => {
    const countA = streamerHunterCounts.value[a] || 0
    const countB = streamerHunterCounts.value[b] || 0
    return countB - countA // Sort descending (most hunters first)
  })
})

onMounted(async () => {
  const currentUser = getCurrentUser()

  // Load Rat of the Day
  try {
    const { data, error } = await supabase
      .from('rat_of_the_day')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      ratOfTheDay.value = data
    }
  } catch (err) {
    console.error('Error loading Rat of the Day:', err)
  }

  // Load Most Wanted
  try {
    const data = await getMostWanted()
    const top10 = data.slice(0, 10) // Get top 10

    // Apply default avatar fallback (user data already fetched in getMostWanted)
    const bountiesWithAvatars = top10.map((bounty: MostWanted) => ({
      ...bounty,
      avatar_url: bounty.avatar_url || getDefaultAvatar(bounty.game_role),
    }))

    topBounties.value = bountiesWithAvatars

    // Fetch bounty IDs, hunter counts, and hunting status in ONE batch query
    const targetGamertags = bountiesWithAvatars.map(b => b.target_gamertag)
    const batchData = await getBatchBountyData(targetGamertags, currentUser?.id)
    bountyIds.value = batchData.bountyIds
    hunterCounts.value = batchData.hunterCounts
    userHuntingStatus.value = batchData.huntingStatus
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

  // Load streamer bounty data in ONE batch query (no more N+1!)
  const batchData = await getBatchBountyData(streamerListBase, currentUser?.id)
  streamerBountyIds.value = batchData.bountyIds
  streamerHunterCounts.value = batchData.hunterCounts
  streamerHuntingStatus.value = batchData.huntingStatus
})

// Scroll to streamers section
function scrollToStreamers() {
  const element = document.getElementById('streamer-bounties')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Handle kill report button click
function handleKillReportClick() {
  const currentUser = getCurrentUser()

  // Check if user is logged in
  if (!currentUser) {
    router.push('/login')
    return
  }

  // Check if user is a Proud Rat
  if (currentUser.game_role !== 'PR') {
    showProudRatModal.value = true
    return
  }

  // If Proud Rat, navigate to submit kill page
  router.push('/submit-kill')
}

// Function to handle joining/leaving the hunt for streamers
async function handleStreamerToggleHunt(streamerGamertag: string) {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    router.push('/login')
    return
  }

  const bountyId = streamerBountyIds.value[streamerGamertag]
  if (!bountyId) {
    showError('Bounty not found for this streamer')
    return
  }

  const isHunting = streamerHuntingStatus.value[streamerGamertag]

  if (isHunting) {
    // Leave the hunt
    const result = await leaveHunt(bountyId, currentUser.id)
    if (result.success) {
      success(`You've left the hunt for ${streamerGamertag}`)
      streamerHuntingStatus.value[streamerGamertag] = false

      // Refresh hunter count
      const count = await getHunterCount(streamerGamertag)
      streamerHunterCounts.value[streamerGamertag] = count
    } else {
      showError(result.error || 'Failed to leave hunt')
    }
  } else {
    // Join the hunt
    const result = await joinHunt(bountyId, currentUser.id)
    if (result.success) {
      success(`You've joined the hunt for ${streamerGamertag}!`)
      streamerHuntingStatus.value[streamerGamertag] = true

      // Refresh hunter count
      const count = await getHunterCount(streamerGamertag)
      streamerHunterCounts.value[streamerGamertag] = count
    } else {
      // Show error modal if hunt limit reached
      if (result.error?.includes('3 targets')) {
        huntLimitMessage.value = result.error
        showHuntLimitModal.value = true
      } else {
        showError(result.error || 'Failed to join hunt')
      }
    }
  }
}

// Function to handle joining/leaving the hunt
async function handleToggleHunt(targetGamertag: string) {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    router.push('/login')
    return
  }

  const bountyId = bountyIds.value[targetGamertag]
  if (!bountyId) {
    showError('Bounty not found')
    return
  }

  const isHunting = userHuntingStatus.value[targetGamertag]

  if (isHunting) {
    // Leave the hunt
    const result = await leaveHunt(bountyId, currentUser.id)
    if (result.success) {
      success(`You've left the hunt for ${targetGamertag}`)
      userHuntingStatus.value[targetGamertag] = false

      // Refresh hunter count
      const count = await getHunterCount(targetGamertag)
      hunterCounts.value[targetGamertag] = count

      // Refresh bounty values
      await refreshBountyValues()
    } else {
      showError(result.error || 'Failed to leave hunt')
    }
  } else {
    // Join the hunt
    const result = await joinHunt(bountyId, currentUser.id)
    if (result.success) {
      success(`You've joined the hunt for ${targetGamertag}!`)
      userHuntingStatus.value[targetGamertag] = true

      // Refresh hunter count
      const count = await getHunterCount(targetGamertag)
      hunterCounts.value[targetGamertag] = count

      // Refresh bounty values
      await refreshBountyValues()
    } else {
      // Show error modal if hunt limit reached
      if (result.error?.includes('3 targets')) {
        huntLimitMessage.value = result.error
        showHuntLimitModal.value = true
      } else {
        showError(result.error || 'Failed to join hunt')
      }
    }
  }
}

// Function to refresh bounty values after joining/leaving
async function refreshBountyValues() {
  try {
    const data = await getMostWanted()
    const top10 = data.slice(0, 10)

    // Update only the total_bounty values for existing bounties
    topBounties.value = topBounties.value.map((existing) => {
      const updated = top10.find((b) => b.target_gamertag === existing.target_gamertag)
      return updated ? { ...existing, total_bounty: updated.total_bounty } : existing
    })
  } catch (error) {
    console.error('Error refreshing bounty values:', error)
  }
}
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

      <!-- SEO Content -->
      <div class="hero-description">
        <p>
          Don't Shoot is the premier bounty tracking system for Arc Raiders players. Whether you're
          a seasoned bounty hunter or just starting out, our platform makes it easy to track the
          most wanted players, claim bounties, and earn rewards. Join thousands of players in the
          ultimate bounty hunting experience.
        </p>
      </div>

      <div class="hero-buttons">
        <RouterLink to="/create-bounty">
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconBounty :size="20" />
            </template>
            Create Bounty
          </TacticalButton>
        </RouterLink>
        <button @click="handleKillReportClick">
          <TacticalButton variant="primary" size="lg">
            Brag About Your Kills
            <span class="button-subtitle">(Proud Rat Only)</span>
          </TacticalButton>
        </button>
        <button @click="scrollToStreamers" class="pulse-button">
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconTarget :size="20" />
            </template>
            Streamer Bounty
          </TacticalButton>
        </button>
      </div>
    </div>

    <!-- Rat of the Day Section -->
    <div v-if="ratOfTheDay" class="rat-of-the-day-section">
      <div class="container mx-auto px-4">
        <RatOfTheDayPlayer :rat-of-the-day="ratOfTheDay" />
      </div>
    </div>

    <!-- Role Poll Section -->
    <div class="container mx-auto px-4 py-8">
      <RolePoll />
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

                  <!-- Spacer to push content to bottom -->
                  <div class="bounty-spacer"></div>

                  <!-- Bottom section with stats and button -->
                  <div class="bounty-bottom">
                    <div class="bounty-stats-horizontal">
                      <div class="stat-box-compact">
                        <div class="stat-value-large">{{ bounty.total_bounty }}</div>
                        <div class="stat-label">Total Bounty</div>
                      </div>
                      <div class="stat-box-compact">
                        <div class="stat-value-medium">
                          {{ hunterCounts[bounty.target_gamertag] || 0 }}
                        </div>
                        <div class="stat-label">Hunters</div>
                      </div>
                    </div>
                    <button
                      @click.prevent="handleToggleHunt(bounty.target_gamertag)"
                      :class="
                        userHuntingStatus[bounty.target_gamertag]
                          ? 'leave-hunt-btn'
                          : 'join-hunt-btn'
                      "
                    >
                      {{
                        userHuntingStatus[bounty.target_gamertag] ? 'Leave Hunt' : 'Join the Hunt'
                      }}
                    </button>
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
              <div class="leaderboard-subtext">
                {{ hunterCounts[bounty.target_gamertag] || 0 }} hunters
              </div>
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

    <!-- Streamer Bounty List Section -->
    <div id="streamer-bounties" class="streamer-bounty-section">
      <div class="section-header">
        <h2 class="section-title">
          <IconTarget :size="40" className="text-arc-red" />
          <span class="section-title-gradient streamer-gradient">Streamer Bounties</span>
        </h2>
        <p class="section-subtitle">Popular streamers with active bounties</p>
      </div>

      <!-- Streamer List -->
      <!-- Top 5 Streamers (Full Width) -->
      <div class="streamer-list-top5">
        <div
          v-for="(streamer, index) in streamerList.slice(0, 5)"
          :key="streamer"
          class="streamer-item streamer-item-large"
        >
          <div class="streamer-rank">{{ index + 1 }}</div>
          <div class="streamer-icon">🎮</div>
          <div class="streamer-info">
            <div class="streamer-name">{{ streamer }}</div>
            <div class="streamer-subtext">
              {{ streamerHunterCounts[streamer] || 0 }} hunter{{
                streamerHunterCounts[streamer] === 1 ? '' : 's'
              }}
            </div>
          </div>
          <button
            @click="handleStreamerToggleHunt(streamer)"
            :class="streamerHuntingStatus[streamer] ? 'streamer-leave-btn' : 'streamer-join-btn'"
          >
            {{ streamerHuntingStatus[streamer] ? 'Leave Hunt' : 'Join the Hunt' }}
          </button>
        </div>
      </div>

      <!-- Remaining Streamers (2 Columns) -->
      <div class="streamer-list-rest">
        <div
          v-for="(streamer, index) in streamerList.slice(5)"
          :key="streamer"
          class="streamer-item"
        >
          <div class="streamer-rank">{{ index + 6 }}</div>
          <div class="streamer-icon">🎮</div>
          <div class="streamer-info">
            <div class="streamer-name">{{ streamer }}</div>
            <div class="streamer-subtext">
              {{ streamerHunterCounts[streamer] || 0 }} hunter{{
                streamerHunterCounts[streamer] === 1 ? '' : 's'
              }}
            </div>
          </div>
          <button
            @click="handleStreamerToggleHunt(streamer)"
            :class="streamerHuntingStatus[streamer] ? 'streamer-leave-btn' : 'streamer-join-btn'"
          >
            {{ streamerHuntingStatus[streamer] ? 'Leave Hunt' : 'Join the Hunt' }}
          </button>
        </div>
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

                  <!-- Spacer to push content to bottom -->
                  <div class="bounty-spacer"></div>

                  <!-- Bottom section with stats -->
                  <div class="bounty-bottom">
                    <div class="stat-box-compact killer-stat-centered">
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

    <!-- Hunt Limit Modal -->
    <div v-if="showHuntLimitModal" class="modal-overlay" @click="showHuntLimitModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">🎯 Hunt Limit Reached</h2>
        </div>

        <div class="modal-body">
          <p class="modal-message">
            {{ huntLimitMessage }}
          </p>

          <p class="modal-submessage">
            You can only hunt 3 targets at a time. Leave one of your current hunts to join a new
            one.
          </p>
        </div>

        <div class="modal-actions">
          <button @click="showHuntLimitModal = false" class="btn-ok">Got it</button>
          <RouterLink to="/bounties" class="btn-view-hunts"> View My Hunts </RouterLink>
        </div>
      </div>
    </div>

    <!-- Proud Rat Modal -->
    <div v-if="showProudRatModal" class="modal-overlay" @click="showProudRatModal = false">
      <div class="modal-content proud-rat-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <IconRat :size="48" class="text-arc-yellow" />
          </div>
          <h2 class="modal-title">🏆 Proud Rat Kills Contest</h2>
        </div>

        <div class="modal-body">
          <p class="modal-message">
            This feature is exclusively for <strong class="text-arc-yellow">Proud Rats</strong>!
          </p>

          <div class="modal-info-box">
            <h3 class="info-title">What is the Kills Contest?</h3>
            <p class="info-text">
              Proud Rats compete to see who can eliminate the most players in a <strong>single run</strong>.
              Each kill is verified with a screenshot and added to your personal leaderboard.
            </p>
          </div>

          <div class="modal-info-box">
            <h3 class="info-title">How it works:</h3>
            <ul class="info-list">
              <li>Only Proud Rats can submit kills</li>
              <li>Upload a screenshot of each kill</li>
              <li>All kills from one run count together</li>
              <li>The player with the most kills in a single run tops the leaderboard</li>
              <li>Brag about your dominance and claim glory!</li>
            </ul>
          </div>

          <p class="modal-submessage">
            Want to participate? Join the <strong class="text-arc-red">Proud Rats</strong> faction and start hunting!
          </p>
        </div>

        <div class="modal-actions">
          <button @click="showProudRatModal = false" class="btn-ok">Got it</button>
          <RouterLink to="/profile" class="btn-view-hunts" @click="showProudRatModal = false">
            View Profile
          </RouterLink>
        </div>
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
  @apply text-lg sm:text-xl md:text-2xl text-arc-brown mb-4 sm:mb-6 max-w-3xl mx-auto px-4;
}

.hero-description {
  @apply text-sm sm:text-base text-arc-brown/80 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 leading-relaxed;
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

/* Rat of the Day Section */
.rat-of-the-day-section {
  @apply container mx-auto px-4 py-12 md:py-16;
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
  top: 0;
  left: 0;
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
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
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

.bounty-spacer {
  flex: 1;
}

.bounty-bottom {
  @apply space-y-3;
}

.bounty-stats-horizontal {
  @apply grid grid-cols-2 gap-2;
}

.bounty-stats {
  @apply space-y-2 sm:space-y-3 mb-4 sm:mb-6;
}

.stat-box {
  @apply bg-arc-beige rounded-lg p-2 sm:p-3 border border-arc-brown/30;
}

.stat-box-compact {
  @apply bg-arc-beige rounded-lg p-2 sm:p-3 border border-arc-brown/30;
}

.killer-stat-centered {
  @apply w-full;
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

/* Join the Hunt Button */
.join-hunt-btn {
  @apply w-full bg-arc-red hover:bg-arc-red/80 text-black py-3 rounded-lg font-semibold text-base transition transform hover:scale-105 shadow-md shadow-arc-red/30;
  margin-top: auto;
}

/* Leave Hunt Button */
.leave-hunt-btn {
  @apply w-full bg-arc-brown/30 hover:bg-arc-brown/50 text-gray-900 border border-arc-brown py-3 rounded-lg font-semibold text-base transition;
  margin-top: auto;
}

/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-arc-card rounded-xl shadow-2xl max-w-lg w-full border-2 border-arc-brown/30;
  clip-path: polygon(
    0 12px,
    12px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
}

.modal-header {
  @apply p-6 pb-4 border-b border-arc-brown/20;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900;
}

.modal-body {
  @apply p-6;
}

.modal-message {
  @apply text-base text-gray-900 mb-3 font-semibold;
}

.modal-submessage {
  @apply text-sm text-arc-brown;
}

.modal-actions {
  @apply p-6 pt-4 flex gap-3;
}

.btn-ok {
  @apply flex-1 bg-arc-red hover:bg-arc-red/80 text-white font-semibold py-3 rounded-lg transition;
}

.btn-view-hunts {
  @apply flex-1 bg-arc-brown/20 hover:bg-arc-brown/30 text-gray-900 font-semibold py-3 rounded-lg transition text-center;
}

/* Proud Rat Modal Styles */
.proud-rat-modal {
  @apply max-w-2xl;
}

.modal-icon {
  @apply flex justify-center mb-3;
}

.text-arc-yellow {
  color: #dcca04ff;
}

.modal-info-box {
  @apply bg-arc-brown/10 border border-arc-brown/20 rounded-lg p-4 mb-4;
}

.info-title {
  @apply text-lg font-bold text-gray-900 mb-2;
}

.info-text {
  @apply text-sm text-arc-brown leading-relaxed;
}

.info-list {
  @apply list-none pl-0 space-y-2;
}

.info-list li {
  @apply text-sm text-arc-brown flex items-start gap-2;
}

.info-list li::before {
  content: '🎯';
  @apply flex-shrink-0;
}

/* Button subtitle */
.button-subtitle {
  @apply block text-xs opacity-70 mt-0.5;
}

/* Streamer Bounty Section */
.streamer-bounty-section {
  @apply container mx-auto px-4 py-8 sm:py-12 md:py-16;
}

.streamer-gradient {
  @apply bg-gradient-to-r from-arc-red via-arc-yellow to-arc-red bg-clip-text text-transparent;
}

/* Top 5 Streamers - Full Width */
.streamer-list-top5 {
  @apply max-w-5xl mx-auto flex flex-col gap-3 mb-3;
}

/* Remaining Streamers - 2 Column Grid */
.streamer-list-rest {
  @apply max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3;
}

.streamer-item {
  @apply flex items-center gap-3 bg-arc-card rounded-lg p-3 border border-arc-red/20 hover:border-arc-red hover:bg-white transition;
}

.streamer-item-large {
  @apply p-4 border-2 border-arc-red;
  animation: glow-red 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

@keyframes glow-red {
  0%,
  100% {
    box-shadow:
      0 0 10px rgba(239, 68, 68, 0.3),
      0 0 20px rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
  }
  50% {
    box-shadow:
      0 0 20px rgba(239, 68, 68, 0.5),
      0 0 30px rgba(239, 68, 68, 0.3),
      0 0 40px rgba(239, 68, 68, 0.2);
    border-color: #f87171;
  }
}

.streamer-rank {
  @apply w-8 h-8 flex items-center justify-center rounded-full bg-arc-red/20 font-bold text-sm text-gray-900;
  min-width: 2rem;
}

.streamer-icon {
  @apply text-2xl;
}

.streamer-info {
  @apply flex-1 min-w-0;
}

.streamer-name {
  @apply font-bold text-gray-900 truncate text-sm;
}

.streamer-subtext {
  @apply text-xs text-gray-600;
}

.streamer-join-btn {
  @apply bg-arc-red hover:bg-arc-red/80 text-black px-3 py-1.5 rounded-md font-semibold text-xs transition shadow-sm;
}

.streamer-leave-btn {
  @apply bg-arc-brown/30 hover:bg-arc-brown/50 text-gray-900 border border-arc-brown px-3 py-1.5 rounded-md font-semibold text-xs transition;
}

/* Futuristic Streamer Bounty button */
.pulse-button {
  position: relative;
  animation: floatPulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(220, 202, 4, 0.4));
}

.pulse-button::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(45deg, #00d4ff, #dcca04ff, #ff3355, #00d4ff);
  background-size: 300% 300%;
  border-radius: 12px;
  z-index: -1;
  opacity: 0.6;
  animation:
    gradientShift 3s ease infinite,
    holographicGlow 2s ease-in-out infinite;
  filter: blur(8px);
}

.pulse-button::after {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(220, 202, 4, 0.3) 25%,
    rgba(0, 212, 255, 0.3) 50%,
    rgba(255, 51, 85, 0.3) 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  border-radius: 12px;
  z-index: -1;
  animation: scanLine 2s linear infinite;
  opacity: 0.8;
}

@keyframes floatPulse {
  0%,
  100% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 0 20px rgba(220, 202, 4, 0.4));
  }
  25% {
    transform: translateY(-3px) scale(1.03);
    filter: drop-shadow(0 5px 25px rgba(0, 212, 255, 0.5));
  }
  50% {
    transform: translateY(0) scale(1.05);
    filter: drop-shadow(0 0 30px rgba(255, 51, 85, 0.5));
  }
  75% {
    transform: translateY(-3px) scale(1.03);
    filter: drop-shadow(0 5px 25px rgba(220, 202, 4, 0.5));
  }
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes holographicGlow {
  0%,
  100% {
    opacity: 0.6;
    filter: blur(8px) brightness(1);
  }
  50% {
    opacity: 0.9;
    filter: blur(12px) brightness(1.3);
  }
}

@keyframes scanLine {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.pulse-button:hover {
  animation: hoverFloat 0.6s ease-in-out infinite;
  filter: drop-shadow(0 0 35px rgba(220, 202, 4, 0.8));
}

.pulse-button:hover::before {
  opacity: 1;
  filter: blur(15px);
  animation:
    gradientShift 1.5s ease infinite,
    holographicGlow 1s ease-in-out infinite;
}

.pulse-button:hover::after {
  animation: scanLine 1s linear infinite;
}

@keyframes hoverFloat {
  0%,
  100% {
    transform: translateY(-2px) scale(1.05);
  }
  50% {
    transform: translateY(-5px) scale(1.08);
  }
}

.pulse-button:active {
  transform: scale(0.98);
  filter: drop-shadow(0 0 40px rgba(0, 212, 255, 1));
}

/* Mobile optimizations for pulse-button */
@media (max-width: 768px) {
  .pulse-button {
    animation: floatPulseMobile 3s ease-in-out infinite;
    filter: drop-shadow(0 0 12px rgba(220, 202, 4, 0.5));
  }

  .pulse-button::before {
    inset: -2px;
    filter: blur(5px);
    opacity: 0.5;
  }

  .pulse-button::after {
    opacity: 0.6;
  }

  @keyframes floatPulseMobile {
    0%, 100% {
      transform: translateY(0) scale(1);
      filter: drop-shadow(0 0 12px rgba(220, 202, 4, 0.5));
    }
    50% {
      transform: translateY(0) scale(1.02);
      filter: drop-shadow(0 0 15px rgba(220, 202, 4, 0.6));
    }
  }

  .pulse-button:hover {
    animation: floatPulseMobile 2s ease-in-out infinite;
    filter: drop-shadow(0 0 18px rgba(220, 202, 4, 0.7));
  }

  .pulse-button:hover::before {
    opacity: 0.7;
    filter: blur(8px);
  }

  .pulse-button:hover::after {
    opacity: 0.8;
  }

  .pulse-button:active {
    transform: scale(0.98);
    filter: drop-shadow(0 0 20px rgba(220, 202, 4, 0.9));
  }
}

@media (max-width: 480px) {
  .pulse-button {
    filter: drop-shadow(0 0 8px rgba(220, 202, 4, 0.4));
  }

  .pulse-button::before {
    inset: -1px;
    filter: blur(4px);
    opacity: 0.4;
  }

  .pulse-button::after {
    opacity: 0.5;
  }

  @keyframes floatPulseMobile {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 8px rgba(220, 202, 4, 0.4));
    }
    50% {
      transform: scale(1.01);
      filter: drop-shadow(0 0 12px rgba(220, 202, 4, 0.5));
    }
  }

  .pulse-button:hover {
    filter: drop-shadow(0 0 15px rgba(220, 202, 4, 0.6));
  }

  .pulse-button:active {
    filter: drop-shadow(0 0 18px rgba(220, 202, 4, 0.8));
  }
}
</style>
