<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  type?: string
  icon?: Component
  iconSize?: number
  iconPosition?: 'left' | 'right'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  type: 'text',
  iconSize: 20,
  iconPosition: 'left',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="input-container">
    <component
      v-if="icon && iconPosition === 'left'"
      :is="icon"
      class="input-icon-left"
      :size="iconSize"
    />
    <input
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'input-field',
        icon && iconPosition === 'left' && 'input-with-icon-left',
        icon && iconPosition === 'right' && 'input-with-icon-right'
      ]"
    />
    <component
      v-if="icon && iconPosition === 'right'"
      :is="icon"
      class="input-icon-right"
      :size="iconSize"
    />
  </div>
</template>

<style scoped>
.input-container {
  @apply relative w-full;
}

.input-field {
  @apply w-full bg-gray-100 border border-arc-red/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3;
  @apply text-arc-dark placeholder-gray-600 text-sm sm:text-base;
  @apply focus:outline-none focus:ring-2 focus:ring-arc-red/50 focus:border-arc-red;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.input-with-icon-left {
  @apply pl-10 sm:pl-12;
}

.input-with-icon-right {
  @apply pr-10 sm:pr-12;
}

.input-icon-left {
  @apply absolute left-3 sm:left-4 top-1/2 -translate-y-1/2;
  @apply text-arc-brown pointer-events-none;
}

.input-icon-right {
  @apply absolute right-3 sm:right-4 top-1/2 -translate-y-1/2;
  @apply text-arc-brown pointer-events-none;
}
</style>
