<script setup lang="ts">
import { computed } from 'vue'
import type { Achievement } from '@/lib/supabase'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps<{
  achievement: Achievement
  earned?: boolean
  earnedAt?: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showDescription?: boolean
}>()

const rarityColors = {
  common: {
    bg: 'bg-gray-700/50',
    border: 'border-gray-500',
    text: 'text-gray-300',
    glow: 'shadow-gray-500/20'
  },
  rare: {
    bg: 'bg-blue-900/50',
    border: 'border-blue-400',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30'
  },
  epic: {
    bg: 'bg-purple-900/50',
    border: 'border-purple-400',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/40'
  },
  legendary: {
    bg: 'bg-yellow-900/50',
    border: 'border-arc-yellow',
    text: 'text-arc-yellow',
    glow: 'shadow-arc-yellow/50'
  }
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-base',
  lg: 'w-24 h-24 text-2xl'
}

const colors = computed(() => rarityColors[props.achievement.rarity])
const sizeClass = computed(() => sizeClasses[props.size || 'md'])

// Dynamically get the icon component
const IconComponent = computed(() => {
  const iconName = props.achievement.icon
  return (LucideIcons as any)[iconName] || LucideIcons.Award
})

const formattedDate = computed(() => {
  if (!props.earnedAt) return ''
  return new Date(props.earnedAt).toLocaleDateString()
})
</script>

<template>
  <div class="achievement-badge group relative">
    <!-- Badge Icon -->
    <div
      :class="[
        'rounded-lg border-2 flex items-center justify-center transition-all',
        sizeClass,
        earned ? colors.bg : 'bg-arc-navy/30',
        earned ? colors.border : 'border-gray-700',
        earned ? colors.glow : '',
        earned ? 'shadow-lg' : 'opacity-40 grayscale'
      ]"
    >
      <component
        :is="IconComponent"
        :class="[
          earned ? colors.text : 'text-gray-600',
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
        ]"
      />
    </div>

    <!-- Badge Name (optional) -->
    <div v-if="showName" class="mt-2 text-center">
      <p :class="['font-medium text-sm', earned ? colors.text : 'text-gray-500']">
        {{ achievement.name }}
      </p>
      <p v-if="earnedAt" class="text-xs text-gray-500 mt-1">
        {{ formattedDate }}
      </p>
    </div>

    <!-- Tooltip on Hover -->
    <div
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
    >
      <div :class="['px-3 py-2 rounded-lg border whitespace-nowrap', colors.bg, colors.border]">
        <p :class="['font-semibold text-sm', colors.text]">{{ achievement.name }}</p>
        <p v-if="showDescription || !showName" class="text-xs text-gray-300 mt-1 max-w-xs whitespace-normal">
          {{ achievement.description }}
        </p>
        <p class="text-xs mt-1 text-gray-400">
          <span :class="['font-medium', colors.text]">{{ achievement.rarity.toUpperCase() }}</span>
          • +{{ achievement.points_reward }} pts
        </p>
        <p v-if="earnedAt" class="text-xs text-arc-green mt-1">
          ✓ Earned {{ formattedDate }}
        </p>
        <p v-else class="text-xs text-gray-500 mt-1">
          🔒 Not earned yet
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievement-badge {
  cursor: pointer;
}
</style>
