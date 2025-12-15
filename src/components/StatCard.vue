<!-- src/components/StatCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string | number
    label: string
    icon?: Component
    iconSize?: number
    variant?: 'default' | 'pending' | 'approved' | 'rejected' | 'yellow' | 'green' | 'red'
    bordered?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    iconSize: 24,
    variant: 'default',
    bordered: false,
    size: 'md',
  },
)

const cardClass = computed(() => {
  const classes = ['stat-card']

  if (props.bordered) {
    switch (props.variant) {
      case 'pending':
      case 'yellow':
        classes.push('stat-card-yellow')
        break
      case 'approved':
      case 'green':
        classes.push('stat-card-green')
        break
      case 'rejected':
      case 'red':
        classes.push('stat-card-red')
        break
      default:
        classes.push('stat-card-default')
    }
  } else {
    classes.push('stat-card-default')
  }

  return classes.join(' ')
})

const valueClass = computed(() => {
  switch (props.variant) {
    case 'pending':
    case 'yellow':
      return 'stat-value-yellow'
    case 'approved':
    case 'green':
      return 'stat-value-green'
    case 'rejected':
    case 'red':
      return 'stat-value-red'
    default:
      return 'stat-value'
  }
})

const iconClass = computed(() => {
  switch (props.variant) {
    case 'pending':
    case 'yellow':
      return 'text-arc-yellow'
    case 'approved':
    case 'green':
      return 'text-arc-green'
    case 'rejected':
    case 'red':
      return 'text-arc-red'
    default:
      return 'text-gray-400'
  }
})

const sizeClass = computed(() => `stat-card-${props.size}`)
</script>

<template>
  <div :class="[cardClass, sizeClass]">
    <div v-if="icon" class="stat-value-row">
      <component :is="icon" :class="iconClass" :size="iconSize" />
      <span :class="valueClass">{{ value }}</span>
    </div>
    <div v-else :class="valueClass">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply rounded-lg p-3 sm:p-4 transition hover:bg-opacity-80;
}

.stat-card-sm {
  @apply p-2 sm:p-3;
}

.stat-card-lg {
  @apply p-4 sm:p-6;
}

.stat-card-default {
  @apply bg-arc-navy;
}

.stat-card-yellow {
  @apply bg-arc-yellow/10 border border-arc-yellow;
}

.stat-card-green {
  @apply bg-arc-green/10 border border-arc-green;
}

.stat-card-red {
  @apply bg-arc-red/10 border border-arc-red;
}

.stat-value-row {
  @apply flex items-center gap-1 sm:gap-2 mb-1;
}

.stat-value {
  @apply text-xl sm:text-2xl font-bold text-white;
}

.stat-card-sm .stat-value {
  @apply text-lg sm:text-xl;
}

.stat-card-lg .stat-value {
  @apply text-2xl sm:text-3xl;
}

.stat-value-yellow {
  @apply text-xl sm:text-2xl font-bold text-arc-yellow;
}

.stat-value-green {
  @apply text-xl sm:text-2xl font-bold text-arc-green;
}

.stat-value-red {
  @apply text-xl sm:text-2xl font-bold text-arc-red;
}

.stat-label {
  @apply text-xs sm:text-sm text-gray-400 mt-1;
}

.stat-card-sm .stat-label {
  @apply text-xs;
}
</style>
