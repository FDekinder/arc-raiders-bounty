<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    icon: Component
    iconSize?: number
    message: string
    actionLabel?: string
    actionTo?: string
  }>(),
  {
    iconSize: 48,
  },
)

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <component :is="icon" class="empty-icon" :size="iconSize" />
    <p class="empty-text">{{ message }}</p>
    <slot name="action">
      <RouterLink v-if="actionTo && actionLabel" :to="actionTo" class="empty-action">
        {{ actionLabel }}
      </RouterLink>
      <button v-else-if="actionLabel" @click="$emit('action')" class="empty-action">
        {{ actionLabel }}
      </button>
    </slot>
  </div>
</template>

<style scoped>
.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply mx-auto mb-4 text-gray-600;
}

.empty-text {
  @apply text-arc-brown mb-4 text-lg;
}

.empty-action {
  @apply inline-block bg-arc-red hover:bg-arc-red/80 px-6 py-2 rounded-lg font-semibold transition;
}
</style>
