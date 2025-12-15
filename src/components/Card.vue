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
  @apply bg-arc-card border border-arc-brown/20;
}

.card-bordered {
  @apply bg-arc-card border-2 border-arc-brown;
}

.card-glass {
  @apply bg-white/50 backdrop-blur-sm border border-arc-brown/20;
}

.card-flat {
  @apply bg-arc-beige/50;
}

/* Padding */
.card-padding-none {
  @apply p-0;
}

.card-padding-sm {
  @apply p-3 sm:p-4;
}

.card-padding-md {
  @apply p-4 sm:p-6;
}

.card-padding-lg {
  @apply p-6 sm:p-8;
}

/* Hover effect */
.card-hover {
  @apply cursor-pointer;
  @apply hover:shadow-lg hover:shadow-arc-brown/20;
  @apply hover:-translate-y-1;
}
</style>
