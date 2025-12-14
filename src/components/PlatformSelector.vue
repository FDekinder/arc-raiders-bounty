<!-- src/components/PlatformSelector.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Platform } from '@/lib/supabase'
import { Gamepad2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: Platform
}>()

const emit = defineEmits<{
  'update:modelValue': [platform: Platform]
  select: [platform: Platform]
}>()

const selectedPlatform = ref<Platform | null>(props.modelValue || null)

function selectPlatform(platform: Platform) {
  selectedPlatform.value = platform
  emit('update:modelValue', platform)
  emit('select', platform)
}

const platforms = [
  {
    id: 'steam' as Platform,
    name: 'Steam',
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
  },
  {
    id: 'xbox' as Platform,
    name: 'Xbox',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
  },
  {
    id: 'playstation' as Platform,
    name: 'PlayStation',
    color: 'from-blue-600/20 to-indigo-600/20',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-500',
  },
]
</script>

<template>
  <div class="platform-selector">
    <h3 class="text-xl font-bold mb-4 text-center">Select Your Gaming Platform</h3>
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="platform in platforms"
        :key="platform.id"
        @click="selectPlatform(platform.id)"
        :class="[
          'p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105',
          'bg-gradient-to-br',
          platform.color,
          selectedPlatform === platform.id
            ? `${platform.borderColor} ring-2 ring-offset-2 ring-offset-arc-dark scale-105`
            : 'border-gray-600 hover:border-gray-400',
        ]"
      >
        <div class="flex flex-col items-center gap-3">
          <Gamepad2 :size="48" :class="selectedPlatform === platform.id ? platform.textColor : 'text-gray-400'" />
          <span :class="['font-bold text-lg', selectedPlatform === platform.id ? platform.textColor : 'text-white']">
            {{ platform.name }}
          </span>
          <div v-if="selectedPlatform === platform.id" :class="['text-sm', platform.textColor]">
            ✓ Selected
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
