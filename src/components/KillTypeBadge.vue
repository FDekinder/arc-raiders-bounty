<script setup lang="ts">
import { computed } from 'vue'

export type KillType =
  | 'friendly_fire'
  | 'back_stabber'
  | 'loot_ambush'
  | 'extract_camper'
  | 'spawn_killer'
  | 'bait_switch'
  | 'third_party'
  | 'other'

interface Props {
  killType: KillType
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const killTypeConfig = {
  friendly_fire: {
    emoji: '🤝',
    label: 'Friendly Fire',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
  },
  back_stabber: {
    emoji: '🔫',
    label: 'Back Stabber',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  loot_ambush: {
    emoji: '📦',
    label: 'Loot Ambush',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
  },
  extract_camper: {
    emoji: '🚪',
    label: 'Extract Camper',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
  spawn_killer: {
    emoji: '🎯',
    label: 'Spawn Killer',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-300',
  },
  bait_switch: {
    emoji: '🎣',
    label: 'Bait & Switch',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
  },
  third_party: {
    emoji: '⚡',
    label: 'Third Party',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  other: {
    emoji: '🗺️',
    label: 'Other',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
}

const config = computed(() => killTypeConfig[props.killType])

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs px-2 py-0.5 gap-1'
    case 'lg':
      return 'text-base px-4 py-2 gap-2'
    default:
      return 'text-sm px-3 py-1 gap-1.5'
  }
})
</script>

<template>
  <div
    :class="[
      'inline-flex items-center rounded-full font-medium border',
      config.color,
      config.bgColor,
      config.borderColor,
      sizeClasses,
    ]"
  >
    <span>{{ config.emoji }}</span>
    <span>{{ config.label }}</span>
  </div>
</template>
