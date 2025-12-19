<template>
  <div :class="['rank-badge', `rank-badge-${rank}`]">
    <div class="rank-badge-inner">
      <div class="rank-number">{{ rank }}</div>
      <div class="rank-chevrons">
        <div v-for="i in rank" :key="i" class="chevron"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rank: 1 | 2 | 3
}

defineProps<Props>()
</script>

<style scoped>
.rank-badge {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

@media (min-width: 640px) {
  .rank-badge {
    width: 60px;
    height: 60px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.rank-badge:hover {
  transform: scale(1.05);
}

@media (min-width: 640px) {
  .rank-badge:hover {
    transform: scale(1.1);
  }
}

.rank-badge-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rank-number {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

@media (min-width: 640px) {
  .rank-number {
    font-size: 20px;
  }
}

.rank-chevrons {
  display: flex;
  gap: 1.5px;
  height: 6px;
}

@media (min-width: 640px) {
  .rank-chevrons {
    gap: 2px;
    height: 8px;
  }
}

.chevron {
  width: 6px;
  height: 6px;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

@media (min-width: 640px) {
  .chevron {
    width: 8px;
    height: 8px;
  }
}

/* Rank 1 - Gold/Yellow */
.rank-badge-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  border: 2px solid #ffed4e;
  color: #8b4513;
}

.rank-badge-1 .chevron {
  background: #8b4513;
}

.rank-badge-1::before {
  content: '';
  position: absolute;
  inset: 4px;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  pointer-events: none;
}

/* Rank 2 - Silver/Gray */
.rank-badge-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%);
  border: 2px solid #e8e8e8;
  color: #4a4a4a;
}

.rank-badge-2 .chevron {
  background: #4a4a4a;
}

.rank-badge-2::before {
  content: '';
  position: absolute;
  inset: 4px;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent);
  pointer-events: none;
}

/* Rank 3 - Bronze/Copper */
.rank-badge-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e39b58 50%, #cd7f32 100%);
  border: 2px solid #e39b58;
  color: #4a2b1a;
}

.rank-badge-3 .chevron {
  background: #4a2b1a;
}

.rank-badge-3::before {
  content: '';
  position: absolute;
  inset: 4px;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}
</style>
