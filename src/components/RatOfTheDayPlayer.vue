<script setup lang="ts">
import { Youtube } from 'lucide-vue-next'
import type { RatOfTheDay } from '@/lib/supabase'

interface Props {
  ratOfTheDay: RatOfTheDay
}

const props = defineProps<Props>()
</script>

<template>
  <div class="rat-of-the-day-player">
    <div class="player-header">
      <div class="header-left">
        <Youtube :size="24" class="youtube-icon" />
        <h2 class="player-title">RAT Moment of the Day</h2>
      </div>
    </div>

    <div class="video-container">
      <iframe
        :src="`https://www.youtube.com/embed/${ratOfTheDay.youtube_video_id}`"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="video-iframe"
        :title="`RAT Moment of the Day by ${ratOfTheDay.creator_name}`"
      ></iframe>
    </div>

    <div class="video-credit">
      <span class="credit-text">Video by</span>
      <span class="creator-name">{{ ratOfTheDay.creator_name }}</span>
    </div>
  </div>
</template>

<style scoped>
.rat-of-the-day-player {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  overflow: hidden;
  transition: all 0.3s;
}

.rat-of-the-day-player:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 202, 4, 0.3);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.youtube-icon {
  color: #ff0000;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.player-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #dcca04ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: black;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  position: relative;
}

.video-container::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, rgba(220, 202, 4, 0.2), rgba(255, 0, 0, 0.2)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.video-iframe {
  width: 100%;
  height: 100%;
  display: block;
}

.video-credit {
  margin-top: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(220, 202, 4, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(220, 202, 4, 0.1);
}

.credit-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.creator-name {
  font-size: 1rem;
  font-weight: 600;
  color: #dcca04ff;
  text-shadow: 0 0 10px rgba(220, 202, 4, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .rat-of-the-day-player {
    padding: 1rem;
  }

  .player-title {
    font-size: 1.25rem;
  }

  .video-credit {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .player-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .player-title {
    font-size: 1.1rem;
  }
}
</style>
