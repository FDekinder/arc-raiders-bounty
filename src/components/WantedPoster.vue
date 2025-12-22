<template>
  <div class="wanted-poster" @click="$emit('click')">
    <!-- Rank Badge -->
    <div class="rank-badge-container">
      <RankBadge :rank="rank" />
    </div>

    <!-- Wanted Poster Content -->
    <div class="poster-content">
      <!-- WANTED Header -->
      <div class="wanted-header">
        <div class="circuit-line circuit-line-left"></div>
        <h2 class="wanted-text">WANTED</h2>
        <div class="circuit-line circuit-line-right"></div>
      </div>
      <div class="header-underline"></div>

      <!-- Stars decoration top -->
      <div class="stars-top">
        <div class="star star-tl"></div>
        <div class="star star-tr"></div>
      </div>

      <!-- Avatar Circle -->
      <div class="avatar-circle">
        <div class="circle-outer">
          <div class="circle-inner">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="`${gamertag}'s avatar`"
              class="avatar-image"
            />
            <div v-else class="avatar-fallback">
              {{ gamertag.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>
        <!-- Bullet holes -->
        <div class="bullet-hole bullet-hole-1"></div>
        <div class="bullet-hole bullet-hole-2"></div>
        <div class="bullet-hole bullet-hole-3"></div>
      </div>

      <!-- Stars decoration bottom -->
      <div class="stars-bottom">
        <div class="star star-bl"></div>
        <div class="star star-br"></div>
      </div>

      <!-- Gamertag -->
      <div class="gamertag-box">
        <div class="gamertag-text">{{ gamertag }}</div>
      </div>

      <!-- Info Boxes -->
      <div class="info-boxes">
        <div class="info-box info-box-bounty">
          <div class="info-label">BOUNTY</div>
          <div class="info-value">{{ bountyAmount }}</div>
          <div class="info-unit">POINTS</div>
        </div>
        <div class="info-box info-box-hunters">
          <div class="info-label">HUNTERS</div>
          <div class="info-value">{{ hunterCount }}</div>
          <div class="info-unit">ACTIVE</div>
        </div>
      </div>

      <!-- Share Button -->
      <button
        v-if="showShare"
        @click.stop="$emit('share', $event)"
        class="share-button"
        title="Share this bounty"
      >
        <Share2 :size="18" />
      </button>
    </div>

    <!-- Fire Effect at Bottom -->
    <div class="fire-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { Share2 } from 'lucide-vue-next'
import RankBadge from './RankBadge.vue'

interface Props {
  rank: 1 | 2 | 3
  gamertag: string
  avatarUrl?: string
  bountyAmount: number
  hunterCount: number
  showShare?: boolean
}

withDefaults(defineProps<Props>(), {
  showShare: true
})

defineEmits<{
  click: []
  share: [event: Event]
}>()
</script>

<style scoped>
.wanted-poster {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid #5fffff;
  border-radius: 12px;
  padding: 32px 24px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: visible;
  box-shadow: 0 8px 32px rgba(95, 255, 255, 0.2);
}

.wanted-poster:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(95, 255, 255, 0.3);
  border-color: #dcca04ff;
}

/* Rank Badge */
.rank-badge-container {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

/* Poster Content */
.poster-content {
  position: relative;
  z-index: 1;
}

/* WANTED Header */
.wanted-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.circuit-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #5fffff, transparent);
  position: relative;
}

.circuit-line::before,
.circuit-line::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #5fffff;
  border-radius: 50%;
}

.circuit-line-left::before {
  left: 20%;
  top: -1.5px;
}

.circuit-line-left::after {
  left: 60%;
  top: -1.5px;
}

.circuit-line-right::before {
  right: 60%;
  top: -1.5px;
}

.circuit-line-right::after {
  right: 20%;
  top: -1.5px;
}

.wanted-text {
  font-size: 32px;
  font-weight: 900;
  color: #5fffff;
  letter-spacing: 8px;
  text-shadow: 0 0 20px rgba(95, 255, 255, 0.5);
  margin: 0 16px;
  white-space: nowrap;
}

.header-underline {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #5fffff, transparent);
  margin-bottom: 24px;
}

/* Stars */
.stars-top,
.stars-bottom {
  position: absolute;
  width: 100%;
  left: 0;
}

.stars-top {
  top: 80px;
}

.stars-bottom {
  bottom: 180px;
}

.star {
  position: absolute;
  width: 24px;
  height: 24px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  background: #5fffff;
  opacity: 0.6;
}

.star-tl {
  left: 20px;
}

.star-tr {
  right: 20px;
}

.star-bl {
  left: 20px;
}

.star-br {
  right: 20px;
}

/* Avatar Circle */
.avatar-circle {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin: 0 auto 24px;
}

.circle-outer {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: linear-gradient(135deg, #5fffff 0%, #3dd9d9 100%);
  border-radius: 50%;
  padding: 4px;
}

.circle-inner {
  position: absolute;
  inset: 8px;
  background: #0a0a1a;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 80px;
  font-weight: bold;
  color: #5fffff;
}

/* Bullet Holes */
.bullet-hole {
  position: absolute;
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #0a0a1a 40%, #5fffff 41%, #5fffff 60%, transparent 61%);
  border-radius: 50%;
  opacity: 0.8;
}

.bullet-hole-1 {
  top: 15%;
  right: 10%;
}

.bullet-hole-2 {
  bottom: 20%;
  left: 12%;
}

.bullet-hole-3 {
  top: 60%;
  right: 8%;
}

/* Gamertag Box */
.gamertag-box {
  margin: 0 auto 20px;
  max-width: 90%;
  background: rgba(95, 255, 255, 0.1);
  border: 2px solid #5fffff;
  border-radius: 4px;
  padding: 12px 16px;
}

.gamertag-text {
  font-size: 20px;
  font-weight: 700;
  color: #5fffff;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  word-break: break-word;
}

/* Info Boxes */
.info-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-box {
  background: rgba(95, 255, 255, 0.05);
  border: 2px solid #5fffff;
  border-radius: 4px;
  padding: 12px 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.info-box:hover {
  background: rgba(95, 255, 255, 0.1);
  transform: translateY(-2px);
}

.info-box-bounty {
  border-color: #dcca04ff;
}

.info-label {
  font-size: 10px;
  font-weight: 600;
  color: #5fffff;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.info-box-bounty .info-label {
  color: #dcca04ff;
}

.info-value {
  font-size: 24px;
  font-weight: 900;
  color: white;
  margin-bottom: 2px;
}

.info-unit {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

/* Share Button */
.share-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: #ff0000;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
}

.share-button:hover {
  background: #cc0000;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.6);
}

/* Fire Effect */
.fire-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    to top,
    rgba(255, 69, 0, 0.6) 0%,
    rgba(255, 140, 0, 0.4) 30%,
    rgba(255, 215, 0, 0.2) 60%,
    transparent 100%
  );
  border-radius: 0 0 8px 8px;
  opacity: 0.8;
  animation: flicker 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes flicker {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .wanted-poster {
    padding: 24px 16px 20px;
  }

  .wanted-text {
    font-size: 24px;
    letter-spacing: 4px;
  }

  .star {
    width: 18px;
    height: 18px;
  }

  .avatar-fallback {
    font-size: 60px;
  }

  .gamertag-text {
    font-size: 16px;
    letter-spacing: 1px;
  }

  .info-value {
    font-size: 20px;
  }

  .info-label {
    font-size: 9px;
  }

  .info-unit {
    font-size: 8px;
  }
}
</style>
