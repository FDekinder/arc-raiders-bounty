<!-- src/components/PageHeader.vue -->
<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: Component
    iconSize?: number
    iconColor?: string
    centered?: boolean
  }>(),
  {
    iconSize: 40,
    iconColor: 'text-arc-red',
    centered: false,
  },
)
</script>

<template>
  <div :class="['page-header', { 'page-header-centered': centered }]">
    <div class="header-content">
      <h1 class="title">
        <component v-if="icon" :is="icon" :class="iconColor" :size="iconSize" />
        <span>{{ title }}</span>
      </h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  @apply mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4;
}

.page-header-centered {
  @apply flex-col items-center text-center;
}

.header-content {
  @apply flex-1 w-full sm:w-auto;
}

.page-header-centered .header-content {
  @apply flex-initial;
}

.title {
  @apply text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3 flex-wrap;
}

.page-header-centered .title {
  @apply justify-center;
}

.subtitle {
  @apply text-gray-400 text-sm sm:text-base md:text-lg;
}

.header-actions {
  @apply flex items-center gap-2 sm:gap-3 w-full sm:w-auto;
}

.page-header-centered .header-actions {
  @apply justify-center;
}
</style>
