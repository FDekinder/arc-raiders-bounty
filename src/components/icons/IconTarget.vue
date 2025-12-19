<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :class="['custom-icon', className]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer angled frame -->
    <path
      d="M3 4L4 3H20L21 4V20L20 21H4L3 20V4Z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
    />
    <!-- Inner crosshair -->
    <line x1="12" y1="5" x2="12" y2="9" stroke="currentColor" stroke-width="1.5" />
    <line x1="12" y1="15" x2="12" y2="19" stroke="currentColor" stroke-width="1.5" />
    <line x1="5" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" />
    <line x1="15" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.5" />
    <!-- Center circle -->
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none" />
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
