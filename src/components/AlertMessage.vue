<!-- src/components/AlertMessage.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    message?: string
    variant?: 'error' | 'success' | 'warning' | 'info'
    icon?: Component | boolean
    dismissible?: boolean
  }>(),
  {
    variant: 'info',
    icon: true,
    dismissible: false,
  },
)

const emit = defineEmits<{
  dismiss: []
}>()

const variantClass = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'alert-error'
    case 'success':
      return 'alert-success'
    case 'warning':
      return 'alert-warning'
    default:
      return 'alert-info'
  }
})

const defaultIcon = computed(() => {
  if (typeof props.icon !== 'boolean') return props.icon

  switch (props.variant) {
    case 'error':
      return AlertCircle
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
})
</script>

<template>
  <div v-if="message" :class="['alert', variantClass]">
    <component v-if="icon" :is="defaultIcon" :size="16" class="alert-icon" />
    <span class="alert-message">{{ message }}</span>
    <button v-if="dismissible" @click="emit('dismiss')" class="alert-dismiss">×</button>
  </div>
</template>

<style scoped>
.alert {
  @apply flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base;
}

.alert-icon {
  @apply flex-shrink-0;
}

.alert-message {
  @apply flex-1 leading-snug break-words;
}

.alert-dismiss {
  @apply flex-shrink-0 text-xl sm:text-2xl hover:opacity-70 transition w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer;
}

.alert-error {
  @apply bg-arc-red/10 border border-arc-red text-arc-red;
}

.alert-success {
  @apply bg-arc-green/10 border border-arc-green text-arc-green;
}

.alert-warning {
  @apply bg-arc-yellow/10 border border-arc-yellow text-arc-yellow;
}

.alert-info {
  @apply bg-blue-600/10 border border-blue-600 text-blue-600;
}
</style>
