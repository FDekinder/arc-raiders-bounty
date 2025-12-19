<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :class="['custom-icon', className]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Trophy with angled base -->
    <path
      d="M8 4L16 4L18 6V10C18 13 15 15 12 15C9 15 6 13 6 10V6L8 4Z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
    />
    <!-- Handles -->
    <path d="M6 6H4V9H6" stroke="currentColor" stroke-width="1.5" fill="none" />
    <path d="M18 6H20V9H18" stroke="currentColor" stroke-width="1.5" fill="none" />
    <!-- Base -->
    <path d="M10 15V17H14V15" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 17L9 20H15L16 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter" />
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
