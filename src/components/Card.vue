<script setup lang="ts">
interface Props {
  variant?: 'default' | 'bordered' | 'glass' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false
})
</script>

<template>
  <div
    :class="[
      'card',
      `card-${variant}`,
      `card-padding-${padding}`,
      hover && 'card-hover'
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.card {
  @apply rounded-lg transition-all duration-200;
}

/* Variants */
.card-default {
  @apply bg-arc-navy border border-arc-red/20;
}

.card-bordered {
  @apply bg-arc-navy border-2 border-arc-red;
}

.card-glass {
  @apply bg-gray-800/50 backdrop-blur-sm border border-white/10;
}

.card-flat {
  @apply bg-gray-700/50;
}

/* Padding */
.card-padding-none {
  @apply p-0;
}

.card-padding-sm {
  @apply p-4;
}

.card-padding-md {
  @apply p-6;
}

.card-padding-lg {
  @apply p-8;
}

/* Hover effect */
.card-hover {
  @apply cursor-pointer;
  @apply hover:shadow-lg hover:shadow-arc-red/10;
  @apply hover:-translate-y-1;
}
</style>
