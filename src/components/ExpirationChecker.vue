<!-- src/components/ExpirationChecker.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { checkAndExpireBounties } from '@/lib/bountyExpiration'

let intervalId: number | null = null

onMounted(() => {
  // Check immediately on mount
  checkExpiredBounties()

  // Check every 5 minutes
  intervalId = window.setInterval(
    () => {
      checkExpiredBounties()
    },
    5 * 60 * 1000,
  ) // 5 minutes
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

async function checkExpiredBounties() {
  const result = await checkAndExpireBounties()
  if (result.expired > 0) {
    console.log(`Auto-expired ${result.expired} bounties`)
  }
}
</script>

<template>
  <!-- This component has no visual output -->
  <div style="display: none"></div>
</template>
