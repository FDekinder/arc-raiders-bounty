<!-- src/components/LoadingState.vue -->
<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    message?: string
    showSpinner?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    message: 'Loading...',
    showSpinner: true,
    size: 'md',
  },
)
</script>

<template>
  <div :class="['loading-state', `loading-state-${size}`]">
    <Loader v-if="showSpinner" class="loading-spinner" :size="size === 'lg' ? 32 : size === 'sm' ? 16 : 24" />
    <div class="loading-text">{{ message }}</div>
  </div>
</template>

<style scoped>
.loading-state {
  @apply text-center py-12;
}

.loading-state-sm {
  @apply py-6;
}

.loading-state-lg {
  @apply py-16;
}

.loading-spinner {
  @apply mx-auto mb-4 text-arc-red animate-spin;
}

.loading-text {
  @apply text-xl text-gray-600;
}

.loading-state-sm .loading-text {
  @apply text-base;
}

.loading-state-lg .loading-text {
  @apply text-2xl;
}
</style>
