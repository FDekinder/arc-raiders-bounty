<template>
  <button
    :class="[
      'tactical-btn',
      `tactical-btn-${variant}`,
      `tactical-btn-${size}`,
      fullWidth && 'tactical-btn-full',
      disabled && 'tactical-btn-disabled'
    ]"
    :disabled="disabled"
    :type="type"
  >
    <span class="tactical-btn-inner">
      <span v-if="$slots.icon" class="tactical-btn-icon">
        <slot name="icon" />
      </span>
      <span class="tactical-btn-text">
        <slot />
      </span>
    </span>

    <!-- Corner accents -->
    <span class="tactical-btn-corner tactical-btn-corner-tl"></span>
    <span class="tactical-btn-corner tactical-btn-corner-br"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  type: 'button'
})
</script>

<style scoped>
.tactical-btn {
  @apply relative inline-flex items-center justify-center;
  @apply font-semibold transition-all duration-200;
  @apply border-2;
  position: relative;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  overflow: visible;
}

.tactical-btn-inner {
  @apply flex items-center gap-2 relative z-10;
}

.tactical-btn-icon {
  @apply flex items-center justify-center;
}

.tactical-btn-text {
  @apply whitespace-nowrap;
}

/* Sizes */
.tactical-btn-sm {
  @apply px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm;
}

.tactical-btn-md {
  @apply px-3 py-2 text-sm sm:px-4 sm:text-base;
}

.tactical-btn-lg {
  @apply px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg;
}

.tactical-btn-full {
  @apply w-full;
}

/* Variants */
.tactical-btn-primary {
  @apply bg-arc-red text-white border-white;
}

.tactical-btn-primary:hover:not(:disabled) {
  @apply bg-arc-red/90 shadow-lg;
  box-shadow: 0 4px 14px rgba(255, 0, 0, 0.4);
}

.tactical-btn-primary:active:not(:disabled) {
  @apply bg-arc-red/80;
  transform: translateY(1px);
}

.tactical-btn-secondary {
  @apply bg-arc-cyan/20 text-arc-brown border-arc-cyan;
}

.tactical-btn-secondary:hover:not(:disabled) {
  @apply bg-arc-cyan/30 shadow-lg;
  box-shadow: 0 4px 14px rgba(95, 255, 255, 0.3);
}

.tactical-btn-danger {
  @apply bg-arc-red/20 text-arc-red border-arc-red;
}

.tactical-btn-danger:hover:not(:disabled) {
  @apply bg-arc-red/30 shadow-lg;
  box-shadow: 0 4px 14px rgba(255, 0, 0, 0.3);
}

.tactical-btn-ghost {
  @apply bg-transparent text-arc-brown border-transparent;
}

.tactical-btn-ghost:hover:not(:disabled) {
  @apply bg-arc-brown/10 border-arc-brown/30;
}

.tactical-btn-outline {
  @apply bg-transparent text-arc-brown border-arc-brown;
}

.tactical-btn-outline:hover:not(:disabled) {
  @apply bg-arc-brown/10 shadow-md;
}

/* Disabled state */
.tactical-btn-disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Corner accents */
.tactical-btn-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1.5px solid currentColor;
  opacity: 0.5;
  transition: all 0.2s;
  z-index: 5;
}

@media (min-width: 640px) {
  .tactical-btn-corner {
    width: 8px;
    height: 8px;
    border-width: 2px;
  }
}

.tactical-btn-corner-tl {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

@media (min-width: 640px) {
  .tactical-btn-corner-tl {
    top: -4px;
    left: -4px;
  }
}

.tactical-btn-corner-br {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

@media (min-width: 640px) {
  .tactical-btn-corner-br {
    bottom: -4px;
    right: -4px;
  }
}

.tactical-btn:hover:not(:disabled) .tactical-btn-corner {
  opacity: 0.8;
  width: 7px;
  height: 7px;
}

@media (min-width: 640px) {
  .tactical-btn:hover:not(:disabled) .tactical-btn-corner {
    width: 10px;
    height: 10px;
  }
}

.tactical-btn-primary .tactical-btn-corner {
  border-color: rgba(255, 255, 255, 0.6);
}

.tactical-btn-secondary .tactical-btn-corner,
.tactical-btn-danger .tactical-btn-corner {
  border-color: currentColor;
}
</style>
