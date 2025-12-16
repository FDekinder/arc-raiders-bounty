<script setup lang="ts">
import { computed } from 'vue'
import { Skull, Flame, AlertTriangle, Eye, Star } from 'lucide-vue-next'

interface NotorietyLevelProps {
  level: number // 0-100
  tier: 'Rookie' | 'Known' | 'Notorious' | 'Infamous' | 'Legendary'
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<NotorietyLevelProps>(), {
  showProgress: true,
  size: 'md'
})

const tierConfig = computed(() => {
  switch (props.tier) {
    case 'Legendary':
      return {
        icon: Skull,
        color: 'arc-yellow',
        bgGradient: 'from-arc-yellow/30 to-arc-red/20',
        borderColor: 'border-arc-yellow',
        textColor: 'text-arc-yellow',
        glow: 'shadow-arc-yellow/50',
        description: 'The most feared in the wasteland'
      }
    case 'Infamous':
      return {
        icon: Flame,
        color: 'arc-red',
        bgGradient: 'from-arc-red/30 to-orange-600/20',
        borderColor: 'border-arc-red',
        textColor: 'text-arc-red',
        glow: 'shadow-arc-red/50',
        description: 'Known across all sectors'
      }
    case 'Notorious':
      return {
        icon: AlertTriangle,
        color: 'orange-500',
        bgGradient: 'from-orange-500/30 to-yellow-600/20',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-500',
        glow: 'shadow-orange-500/50',
        description: 'Making a name for yourself'
      }
    case 'Known':
      return {
        icon: Eye,
        color: 'arc-cyan',
        bgGradient: 'from-arc-cyan/30 to-blue-500/20',
        borderColor: 'border-arc-cyan',
        textColor: 'text-arc-cyan',
        glow: 'shadow-arc-cyan/50',
        description: 'On the radar'
      }
    default: // Rookie
      return {
        icon: Star,
        color: 'arc-brown',
        bgGradient: 'from-arc-brown/20 to-gray-400/10',
        borderColor: 'border-arc-brown',
        textColor: 'text-arc-brown',
        glow: 'shadow-arc-brown/30',
        description: 'Just getting started'
      }
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        container: 'p-3',
        icon: 'w-8 h-8',
        title: 'text-lg',
        subtitle: 'text-xs',
        level: 'text-2xl',
        progress: 'h-2'
      }
    case 'lg':
      return {
        container: 'p-8',
        icon: 'w-20 h-20',
        title: 'text-4xl',
        subtitle: 'text-base',
        level: 'text-6xl',
        progress: 'h-4'
      }
    default:
      return {
        container: 'p-6',
        icon: 'w-16 h-16',
        title: 'text-3xl',
        subtitle: 'text-sm',
        level: 'text-5xl',
        progress: 'h-3'
      }
  }
})

const nextTierThreshold = computed(() => {
  if (props.tier === 'Legendary') return 100
  if (props.tier === 'Infamous') return 80
  if (props.tier === 'Notorious') return 60
  if (props.tier === 'Known') return 40
  return 20
})

const progressToNextTier = computed(() => {
  if (props.tier === 'Legendary') return 100

  const currentThreshold = nextTierThreshold.value - 20
  const progress = ((props.level - currentThreshold) / 20) * 100
  return Math.max(0, Math.min(100, progress))
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border-2 bg-gradient-to-br',
      tierConfig.bgGradient,
      tierConfig.borderColor,
      'shadow-xl',
      tierConfig.glow,
      sizeClasses.container
    ]"
  >
    <div class="flex flex-col items-center text-center space-y-4">
      <!-- Icon with glow effect -->
      <div class="relative">
        <div
          :class="[
            'absolute inset-0 blur-xl opacity-50',
            `bg-${tierConfig.color}`
          ]"
        ></div>
        <component
          :is="tierConfig.icon"
          :class="[
            sizeClasses.icon,
            tierConfig.textColor,
            'relative z-10',
            'drop-shadow-lg'
          ]"
        />
      </div>

      <!-- Tier Name -->
      <div class="space-y-1">
        <h3
          :class="[
            'font-bold uppercase tracking-wider',
            tierConfig.textColor,
            sizeClasses.title
          ]"
        >
          {{ tier }}
        </h3>
        <p
          :class="[
            'text-arc-dark/80 italic',
            sizeClasses.subtitle
          ]"
        >
          {{ tierConfig.description }}
        </p>
      </div>

      <!-- Notoriety Level -->
      <div class="flex items-baseline space-x-2">
        <span
          :class="[
            'font-bold text-arc-dark',
            sizeClasses.level
          ]"
        >
          {{ level }}
        </span>
        <span class="text-arc-brown/60 text-base font-medium">/100</span>
      </div>

      <!-- Progress bar to next tier -->
      <div
        v-if="showProgress && tier !== 'Legendary'"
        class="w-full space-y-2"
      >
        <div class="flex justify-between text-xs text-arc-brown/80">
          <span>{{ tier }}</span>
          <span>Next: {{ nextTierThreshold }}</span>
        </div>
        <div
          :class="[
            'w-full bg-arc-brown/20 rounded-full overflow-hidden',
            sizeClasses.progress
          ]"
        >
          <div
            :class="[
              'h-full transition-all duration-500 ease-out',
              `bg-${tierConfig.color}`,
              'shadow-lg'
            ]"
            :style="{ width: `${progressToNextTier}%` }"
          ></div>
        </div>
      </div>

      <!-- Max level indicator -->
      <div
        v-if="tier === 'Legendary'"
        class="text-arc-yellow font-semibold text-sm uppercase tracking-wider"
      >
        Maximum Notoriety Reached
      </div>
    </div>
  </div>
</template>
