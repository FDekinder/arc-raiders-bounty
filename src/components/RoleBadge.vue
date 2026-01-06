<script setup lang="ts">
import type { UserRole } from '@/lib/supabase'
import { Target, Crosshair } from 'lucide-vue-next'

const props = defineProps<{
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}>()

const sizeClasses = {
  sm: { badge: 'text-xs px-2 py-1', icon: 12 },
  md: { badge: 'text-sm px-3 py-1.5', icon: 16 },
  lg: { badge: 'text-base px-4 py-2', icon: 20 },
}

const currentSize = sizeClasses[props.size || 'md']

const roleConfig = {
  BH: {
    label: 'Bounty Hunter',
    abbr: 'BH',
    color: 'text-arc-green',
    bgColor: 'bg-arc-green/20',
    borderColor: 'border-arc-green',
    icon: Target,
  },
  PR: {
    label: 'Proud Rat',
    abbr: 'PR',
    color: 'text-arc-red',
    bgColor: 'bg-arc-red/20',
    borderColor: 'border-arc-red',
    icon: Crosshair,
  },
}

const config = roleConfig[props.role]
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full font-bold border-2',
      config.color,
      config.bgColor,
      config.borderColor,
      currentSize.badge,
    ]"
    :title="showLabel ? undefined : config.label"
  >
    <component :is="config.icon" :size="currentSize.icon" />
    <span>{{ showLabel ? config.label : config.abbr }}</span>
  </span>
</template>
