<!-- src/components/StatusBadge.vue -->
<script setup lang="ts">
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'approved' | 'rejected' | 'pending' | 'active' | 'completed' | string
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    uppercase?: boolean
  }>(),
  {
    showLabel: true,
    size: 'md',
    uppercase: false,
  },
)

const statusIcon = computed(() => {
  const normalized = props.status.toLowerCase()
  switch (normalized) {
    case 'approved':
    case 'completed':
      return CheckCircle
    case 'rejected':
      return XCircle
    case 'pending':
    case 'active':
      return Clock
    default:
      return AlertCircle
  }
})

const statusColor = computed(() => {
  const normalized = props.status.toLowerCase()
  switch (normalized) {
    case 'approved':
    case 'completed':
      return 'text-arc-green'
    case 'rejected':
      return 'text-arc-red'
    case 'pending':
    case 'active':
      return 'text-arc-yellow'
    default:
      return 'text-gray-500'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 16
    case 'lg':
      return 28
    default:
      return 20
  }
})

const sizeClass = computed(() => `status-badge-${props.size}`)
</script>

<template>
  <div :class="['status-badge', sizeClass]">
    <component :is="statusIcon" :class="statusColor" :size="iconSize" />
    <span v-if="showLabel" :class="['status-label', statusColor, { 'status-uppercase': uppercase }]">
      {{ status }}
    </span>
  </div>
</template>

<style scoped>
.status-badge {
  @apply flex items-center gap-2;
}

.status-badge-sm {
  @apply gap-1;
}

.status-badge-lg {
  @apply gap-3;
}

.status-label {
  @apply font-semibold;
}

.status-badge-sm .status-label {
  @apply text-sm;
}

.status-badge-md .status-label {
  @apply text-base;
}

.status-badge-lg .status-label {
  @apply text-lg;
}

.status-uppercase {
  @apply uppercase;
}
</style>
