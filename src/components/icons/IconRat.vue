<!-- src/components/icons/IconRat.vue -->
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <!-- Main body -->
    <ellipse cx="12" cy="14" rx="6" ry="4.5" fill="currentColor" opacity="0.9" />

    <!-- Head -->
    <circle cx="9" cy="9" r="4" fill="currentColor" opacity="0.95" />

    <!-- Ears -->
    <ellipse cx="7" cy="5.5" rx="1.8" ry="2.2" fill="currentColor" opacity="0.85" />
    <ellipse cx="11" cy="5.5" rx="1.8" ry="2.2" fill="currentColor" opacity="0.85" />

    <!-- Inner ears -->
    <ellipse cx="7" cy="6" rx="0.8" ry="1.2" fill="currentColor" opacity="0.4" />
    <ellipse cx="11" cy="6" rx="0.8" ry="1.2" fill="currentColor" opacity="0.4" />

    <!-- Eyes -->
    <circle cx="7.5" cy="9" r="1" fill="#000" />
    <circle cx="10.5" cy="9" r="1" fill="#000" />
    <circle cx="7.8" cy="8.7" r="0.3" fill="#fff" opacity="0.9" />
    <circle cx="10.8" cy="8.7" r="0.3" fill="#fff" opacity="0.9" />

    <!-- Nose -->
    <ellipse cx="9" cy="11" rx="0.8" ry="0.6" fill="#FF6B9D" opacity="0.9" />

    <!-- Snout -->
    <path
      d="M9 11 L9 12 M8.2 12 Q9 12.5 9.8 12"
      stroke="#000"
      stroke-width="0.4"
      fill="none"
      opacity="0.6"
    />

    <!-- Whiskers left -->
    <line x1="5" y1="9.5" x2="2" y2="9" stroke="currentColor" stroke-width="0.6" opacity="0.5" />
    <line x1="5" y1="10.5" x2="2" y2="10.5" stroke="currentColor" stroke-width="0.6" opacity="0.5" />
    <line x1="5" y1="11.5" x2="2.5" y2="12" stroke="currentColor" stroke-width="0.6" opacity="0.5" />

    <!-- Whiskers right -->
    <line x1="13" y1="9.5" x2="16" y2="9" stroke="currentColor" stroke-width="0.6" opacity="0.5" />
    <line x1="13" y1="10.5" x2="16" y2="10.5" stroke="currentColor" stroke-width="0.6" opacity="0.5" />
    <line x1="13" y1="11.5" x2="15.5" y2="12" stroke="currentColor" stroke-width="0.6" opacity="0.5" />

    <!-- Front paws -->
    <ellipse cx="9" cy="17" rx="1" ry="1.5" fill="currentColor" opacity="0.8" />
    <ellipse cx="12" cy="17" rx="1" ry="1.5" fill="currentColor" opacity="0.8" />

    <!-- Tail -->
    <path
      d="M17 15 Q19 16 20 18 Q21 20 22 22"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      fill="none"
      opacity="0.7"
    />
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
