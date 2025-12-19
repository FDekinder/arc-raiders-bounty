<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :class="['custom-icon', className]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Angled hexagon shape -->
    <path
      d="M7 3L17 3L21 7V17L17 21H7L3 17V7L7 3Z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
    />
    <!-- Dollar/coins symbol -->
    <path
      d="M12 6V8M12 16V18M9 9L15 15M15 9L9 15"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
    />
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none" />
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
