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
      return 'bg-green-500/90 border-green-400'
    case 'error':
      return 'bg-red-500/90 border-red-400'
    case 'info':
      return 'bg-blue-500/90 border-blue-400'
    case 'warning':
      return 'bg-yellow-500/90 border-yellow-400'
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
        <component :is="getIcon(toast.type)" :size="20" class="flex-shrink-0 text-white" />
        <p class="flex-1 text-white font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-white/80 hover:text-white transition"
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
