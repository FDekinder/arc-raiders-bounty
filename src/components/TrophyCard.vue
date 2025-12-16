<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

interface TrophyCardProps {
  title: string
  value: string | number
  icon?: string
  variant?: 'gold' | 'silver' | 'bronze' | 'red' | 'green' | 'yellow' | 'cyan' | 'default'
  description?: string
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

const props = withDefaults(defineProps<TrophyCardProps>(), {
  variant: 'default',
  size: 'md',
  glow: false
})

const IconComponent = computed(() => {
  if (!props.icon) return null
  return (LucideIcons as any)[props.icon] || null
})

const variantClasses = computed(() => {
  const base = 'transition-all duration-300 hover:scale-105'

  switch (props.variant) {
    case 'gold':
      return `${base} bg-gradient-to-br from-arc-yellow/20 to-arc-yellow/10 border-2 border-arc-yellow ${props.glow ? 'shadow-lg shadow-arc-yellow/50' : ''}`
    case 'silver':
      return `${base} bg-gradient-to-br from-gray-300/20 to-gray-300/10 border-2 border-gray-300 ${props.glow ? 'shadow-lg shadow-gray-300/50' : ''}`
    case 'bronze':
      return `${base} bg-gradient-to-br from-orange-600/20 to-orange-600/10 border-2 border-orange-600 ${props.glow ? 'shadow-lg shadow-orange-600/50' : ''}`
    case 'red':
      return `${base} bg-gradient-to-br from-arc-red/20 to-arc-red/10 border-2 border-arc-red ${props.glow ? 'shadow-lg shadow-arc-red/50' : ''}`
    case 'green':
      return `${base} bg-gradient-to-br from-arc-green/20 to-arc-green/10 border-2 border-arc-green ${props.glow ? 'shadow-lg shadow-arc-green/50' : ''}`
    case 'yellow':
      return `${base} bg-gradient-to-br from-arc-yellow/20 to-arc-yellow/10 border-2 border-arc-yellow ${props.glow ? 'shadow-lg shadow-arc-yellow/50' : ''}`
    case 'cyan':
      return `${base} bg-gradient-to-br from-arc-cyan/20 to-arc-cyan/10 border-2 border-arc-cyan ${props.glow ? 'shadow-lg shadow-arc-cyan/50' : ''}`
    default:
      return `${base} bg-arc-card border border-arc-brown/20 hover:border-arc-brown/40`
  }
})

const iconColorClasses = computed(() => {
  switch (props.variant) {
    case 'gold':
      return 'text-arc-yellow'
    case 'silver':
      return 'text-gray-400'
    case 'bronze':
      return 'text-orange-600'
    case 'red':
      return 'text-arc-red'
    case 'green':
      return 'text-arc-green'
    case 'yellow':
      return 'text-arc-yellow'
    case 'cyan':
      return 'text-arc-cyan'
    default:
      return 'text-arc-brown'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        container: 'p-3',
        icon: 'w-8 h-8',
        title: 'text-xs',
        value: 'text-lg',
        description: 'text-xs'
      }
    case 'lg':
      return {
        container: 'p-6',
        icon: 'w-16 h-16',
        title: 'text-base',
        value: 'text-4xl',
        description: 'text-base'
      }
    default:
      return {
        container: 'p-4',
        icon: 'w-12 h-12',
        title: 'text-sm',
        value: 'text-2xl sm:text-3xl',
        description: 'text-sm'
      }
  }
})
</script>

<template>
  <div
    :class="[
      'rounded-lg',
      variantClasses,
      sizeClasses.container
    ]"
  >
    <div class="flex flex-col items-center text-center space-y-2">
      <!-- Icon -->
      <component
        v-if="IconComponent"
        :is="IconComponent"
        :class="[sizeClasses.icon, iconColorClasses]"
      />

      <!-- Title -->
      <p :class="['font-medium text-arc-brown uppercase tracking-wider', sizeClasses.title]">
        {{ title }}
      </p>

      <!-- Value -->
      <p :class="['font-bold text-arc-dark', sizeClasses.value]">
        {{ value }}
      </p>

      <!-- Description -->
      <p
        v-if="description"
        :class="['text-arc-brown/80', sizeClasses.description]"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
