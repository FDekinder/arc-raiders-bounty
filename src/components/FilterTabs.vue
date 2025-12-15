<script setup lang="ts">
interface Tab {
  value: string
  label: string
  count?: number
  variant?: 'default' | 'yellow' | 'green' | 'red'
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const getButtonClass = (tab: Tab, isActive: boolean) => {
  if (!isActive) return 'filter-btn-inactive'

  switch (tab.variant) {
    case 'yellow':
      return 'filter-btn-active-yellow'
    case 'green':
      return 'filter-btn-active-green'
    case 'red':
      return 'filter-btn-active-red'
    default:
      return 'filter-btn-active'
  }
}

const getTabLabel = (tab: Tab) => {
  if (tab.count !== undefined) {
    return `${tab.label} (${tab.count})`
  }
  return tab.label
}
</script>

<template>
  <div class="filter-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="emit('update:modelValue', tab.value)"
      :class="['filter-btn', getButtonClass(tab, modelValue === tab.value)]"
    >
      {{ getTabLabel(tab) }}
    </button>
  </div>
</template>

<style scoped>
.filter-tabs {
  @apply flex flex-wrap gap-3 mb-6;
}

.filter-btn {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
  @apply border-2 cursor-pointer;
}

.filter-btn-active {
  @apply bg-arc-red border-arc-red text-black shadow-lg shadow-arc-red/20;
}

.filter-btn-active-yellow {
  @apply bg-yellow-600 border-yellow-600 text-black shadow-lg shadow-yellow-600/20;
}

.filter-btn-active-green {
  @apply bg-green-600 border-green-600 text-black shadow-lg shadow-green-600/20;
}

.filter-btn-active-red {
  @apply bg-red-600 border-red-600 text-black shadow-lg shadow-red-600/20;
}

.filter-btn-inactive {
  @apply bg-gray-100/50 border-gray-300 text-gray-600;
  @apply hover:bg-gray-100 hover:border-gray-300;
}
</style>
