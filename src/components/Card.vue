<script setup lang="ts">
interface Props {
  variant?: 'default' | 'bordered' | 'glass' | 'flat' | 'angled' | 'red'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  corners?: boolean // Show corner brackets
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  corners: false
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
    <!-- Corner brackets -->
    <div v-if="corners" class="corner-brackets">
      <span class="corner corner-tl"></span>
      <span class="corner corner-tr"></span>
      <span class="corner corner-bl"></span>
      <span class="corner corner-br"></span>
    </div>

    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply relative transition-all duration-200;
  position: relative;
}

.card-content {
  position: relative;
  z-index: 1;
}

/* Variants */
.card-default {
  @apply bg-arc-card border border-arc-brown/20;
  clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px));
}

.card-bordered {
  @apply bg-arc-card border-2 border-arc-brown;
  clip-path: polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px));
}

.card-angled {
  @apply bg-arc-card border-2 border-arc-brown/30;
  clip-path: polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px));
  position: relative;
}

.card-angled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
  opacity: 0.3;
  z-index: 0;
}

.card-glass {
  @apply bg-white/50 backdrop-blur-sm border border-arc-brown/20;
  clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px));
}

.card-flat {
  @apply bg-arc-beige/50;
  clip-path: polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px));
}

.card-red {
  @apply bg-arc-red/20 border-2 border-arc-red;
  clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px));
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  @apply shadow-lg;
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.25);
  transform: translateY(-2px);
}

.card-hover:hover::before {
  opacity: 0.6;
}

/* Corner brackets */
.corner-brackets {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1.5px solid currentColor;
  opacity: 0.3;
}

@media (min-width: 640px) {
  .corner {
    width: 16px;
    height: 16px;
    border-width: 2px;
    opacity: 0.4;
  }
}

.corner-tl {
  top: -1.5px;
  left: -1.5px;
  border-right: none;
  border-bottom: none;
}

@media (min-width: 640px) {
  .corner-tl {
    top: -2px;
    left: -2px;
  }
}

.corner-tr {
  top: -1.5px;
  right: -1.5px;
  border-left: none;
  border-bottom: none;
}

@media (min-width: 640px) {
  .corner-tr {
    top: -2px;
    right: -2px;
  }
}

.corner-bl {
  bottom: -1.5px;
  left: -1.5px;
  border-right: none;
  border-top: none;
}

@media (min-width: 640px) {
  .corner-bl {
    bottom: -2px;
    left: -2px;
  }
}

.corner-br {
  bottom: -1.5px;
  right: -1.5px;
  border-left: none;
  border-top: none;
}

@media (min-width: 640px) {
  .corner-br {
    bottom: -2px;
    right: -2px;
  }
}
</style>
