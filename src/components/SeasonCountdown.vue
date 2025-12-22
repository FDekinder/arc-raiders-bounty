<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Season 1 dates
const SEASON_START = new Date('2025-12-24T00:00:00') // Dec 24, 2025
const SEASON_END = new Date('2026-02-13T23:59:59') // Feb 13, 2026

const now = ref(new Date())
let interval: number | undefined

const seasonStatus = computed(() => {
  if (now.value < SEASON_START) {
    return 'pre-season'
  } else if (now.value >= SEASON_START && now.value <= SEASON_END) {
    return 'active'
  } else {
    return 'ended'
  }
})

const targetDate = computed(() => {
  return seasonStatus.value === 'pre-season' ? SEASON_START : SEASON_END
})

const timeRemaining = computed(() => {
  const diff = targetDate.value.getTime() - now.value.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
})

onMounted(() => {
  interval = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<template>
  <div class="season-countdown">
    <!-- Pre-Season Countdown -->
    <div v-if="seasonStatus === 'pre-season'" class="countdown-container christmas-theme">
      <div class="countdown-header">
        <span class="snowflake">❄️</span>
        <span class="title">🎄 Season 1 Starts In 🎄</span>
        <span class="snowflake">❄️</span>
      </div>
      <div class="countdown-timer">
        <div class="time-unit">
          <span class="time-value">{{ timeRemaining.days }}</span>
          <span class="time-label">Days</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.hours).padStart(2, '0') }}</span>
          <span class="time-label">Hours</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.minutes).padStart(2, '0') }}</span>
          <span class="time-label">Mins</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.seconds).padStart(2, '0') }}</span>
          <span class="time-label">Secs</span>
        </div>
      </div>
      <div class="christmas-decorations">
        <span class="decoration">🎅</span>
        <span class="decoration">🎁</span>
        <span class="decoration">⭐</span>
        <span class="decoration">🔔</span>
        <span class="decoration">🎄</span>
      </div>
    </div>

    <!-- Active Season Countdown -->
    <div v-else-if="seasonStatus === 'active'" class="countdown-container active-season">
      <div class="countdown-header">
        <span class="icon">🏆</span>
        <span class="title">Season 1 Active - Ends In</span>
        <span class="icon">🏆</span>
      </div>
      <div class="countdown-timer">
        <div class="time-unit">
          <span class="time-value">{{ timeRemaining.days }}</span>
          <span class="time-label">Days</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.hours).padStart(2, '0') }}</span>
          <span class="time-label">Hours</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.minutes).padStart(2, '0') }}</span>
          <span class="time-label">Mins</span>
        </div>
        <span class="time-separator">:</span>
        <div class="time-unit">
          <span class="time-value">{{ String(timeRemaining.seconds).padStart(2, '0') }}</span>
          <span class="time-label">Secs</span>
        </div>
      </div>
    </div>

    <!-- Season Ended -->
    <div v-else class="countdown-container season-ended">
      <div class="countdown-header">
        <span class="title">Season 1 Has Ended</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.season-countdown {
  width: 100%;
}

.countdown-container {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.christmas-theme {
  background: linear-gradient(135deg, #c41e3a 0%, #165b33 50%, #c41e3a 100%);
  background-size: 200% 200%;
  animation: christmasGradient 3s ease infinite;
  border: 2px solid #ffd700;
  box-shadow: 0 4px 15px rgba(196, 30, 58, 0.4), 0 0 20px rgba(255, 215, 0, 0.3);
}

@keyframes christmasGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.active-season {
  background: linear-gradient(135deg, #ff3355 0%, #8b0000 100%);
  border: 2px solid #ffd700;
  box-shadow: 0 4px 15px rgba(255, 51, 85, 0.4);
}

.season-ended {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  border: 2px solid #718096;
}

.countdown-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.title {
  font-weight: bold;
  font-size: 0.875rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

@media (min-width: 640px) {
  .title {
    font-size: 1rem;
  }
}

.snowflake {
  font-size: 1.25rem;
  animation: snowfall 2s ease-in-out infinite;
}

.snowflake:first-child {
  animation-delay: 0s;
}

.snowflake:last-child {
  animation-delay: 1s;
}

@keyframes snowfall {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.icon {
  font-size: 1.25rem;
}

.countdown-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

@media (min-width: 640px) {
  .countdown-timer {
    gap: 0.5rem;
  }
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  min-width: 3rem;
  backdrop-filter: blur(5px);
}

@media (min-width: 640px) {
  .time-unit {
    padding: 0.5rem 0.75rem;
    min-width: 4rem;
  }
}

.time-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

@media (min-width: 640px) {
  .time-value {
    font-size: 1.5rem;
  }
}

.time-label {
  font-size: 0.625rem;
  color: #e2e8f0;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

@media (min-width: 640px) {
  .time-label {
    font-size: 0.75rem;
  }
}

.time-separator {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

@media (min-width: 640px) {
  .time-separator {
    font-size: 1.5rem;
  }
}

.christmas-decorations {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.decoration {
  font-size: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@media (min-width: 640px) {
  .decoration {
    font-size: 1.25rem;
  }
}

.decoration:nth-child(1) { animation-delay: 0s; }
.decoration:nth-child(2) { animation-delay: 0.2s; }
.decoration:nth-child(3) { animation-delay: 0.4s; }
.decoration:nth-child(4) { animation-delay: 0.6s; }
.decoration:nth-child(5) { animation-delay: 0.8s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
