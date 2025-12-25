<!-- src/components/AdUnit.vue -->
<template>
  <div v-if="shouldShowAd" class="ad-container">
    <div class="ad-label">Sponsored</div>

    <!-- Test mode placeholder -->
    <div v-if="isTestMode" class="ad-placeholder">
      <p>Ad Placeholder</p>
      <p class="text-sm">{{ format }} - Slot: {{ slot }}</p>
    </div>

    <!-- Real ad -->
    <ins
      v-else
      class="adsbygoogle"
      :style="adStyle"
      :data-ad-client="adClient"
      :data-ad-slot="slot"
      :data-ad-format="format"
      :data-full-width-responsive="responsive"
    ></ins>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCurrentUser } from '@/lib/auth'

interface Props {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  responsive: true,
})

const adClient = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-PLACEHOLDER'
const shouldShowAd = ref(true)

const isTestMode = computed(() => {
  return !adClient || adClient === 'ca-pub-PLACEHOLDER' || import.meta.env.DEV
})

const adStyle = computed(() => {
  if (props.format === 'horizontal') {
    return 'display:block; width:728px; height:90px;'
  } else if (props.format === 'vertical') {
    return 'display:block; width:300px; height:600px;'
  } else if (props.format === 'rectangle') {
    return 'display:block; width:336px; height:280px;'
  }
  return 'display:block;'
})

onMounted(async () => {
  // Check if user is premium
  const user = getCurrentUser()
  if (user?.subscription_tier === 'premium') {
    shouldShowAd.value = false
    return
  }

  // Check Google Funding Choices consent status
  // @ts-ignore
  if (window.__tcfapi) {
    // @ts-ignore
    window.__tcfapi('addEventListener', 2, (tcData: any, success: boolean) => {
      if (success && tcData.gdprApplies) {
        // User is in GDPR region
        if (tcData.eventStatus === 'useractioncomplete' || tcData.eventStatus === 'tcloaded') {
          // Check if user consented to ads (Purpose 1: Store/access info, Purpose 3: Create personalized ads profile)
          const hasConsent = tcData.purpose?.consents?.[1] && tcData.purpose?.consents?.[3]
          if (!hasConsent) {
            shouldShowAd.value = false
            return
          }
        }
      }
    })
  }

  // Fallback: Check legacy cookie consent
  const adsEnabled = localStorage.getItem('ads_enabled')
  if (adsEnabled === 'false') {
    shouldShowAd.value = false
    return
  }

  // Load AdSense script (only in production with real client ID)
  if (!isTestMode.value) {
    try {
      // @ts-ignore
      if (window.adsbygoogle) {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }
})
</script>

<style scoped>
.ad-container {
  margin: 32px auto;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;
  max-width: fit-content;
}

.ad-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.adsbygoogle {
  background: transparent;
}

.ad-placeholder {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  padding: 40px;
  border-radius: 4px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.ad-placeholder p {
  margin: 4px 0;
}

.text-sm {
  font-size: 12px;
  opacity: 0.7;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ad-container {
    margin: 16px auto;
    padding: 12px;
  }

  .ad-placeholder {
    padding: 20px;
  }
}
</style>
