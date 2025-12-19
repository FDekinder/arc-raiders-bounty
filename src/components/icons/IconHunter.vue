<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :class="['custom-icon', className]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Tactical helmet/visor shape -->
    <path
      d="M5 8L7 5H17L19 8V16L17 19H7L5 16V8Z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
    />
    <!-- Visor line -->
    <path
      d="M7 11H17"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
    />
    <!-- Eyes/sensors -->
    <circle cx="9" cy="14" r="1.5" fill="currentColor" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  className: '',
})
</script>

<style scoped>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
