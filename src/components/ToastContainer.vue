<!-- src/components/ToastContainer.vue -->
<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import type { Toast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function getIcon(type: Toast['type']) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'info':
      return Info
    case 'warning':
      return AlertTriangle
  }
}

function getColorClasses(type: Toast['type']) {
  switch (type) {
    case 'success':
      return 'bg-arc-green/90 border-arc-green'
    case 'error':
      return 'bg-arc-red/90 border-arc-red'
    case 'info':
      return 'bg-arc-red/90 border-arc-red'
    case 'warning':
      return 'bg-arc-yellow/90 border-arc-yellow'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm min-w-[300px] max-w-[500px]',
          getColorClasses(toast.type),
        ]"
      >
        <component :is="getIcon(toast.type)" :size="20" class="flex-shrink-0 text-arc-dark" />
        <p class="flex-1 text-arc-dark font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-arc-dark/80 hover:text-arc-dark transition"
        >
          <X :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}
</style>
