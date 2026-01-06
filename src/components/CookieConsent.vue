<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="cookie-banner">
      <div class="cookie-content">
        <div class="cookie-text">
          <p>
            We use cookies to improve your experience and show relevant ads.
            <RouterLink to="/privacy" class="cookie-link">Learn more</RouterLink>
          </p>
        </div>
        <div class="cookie-actions">
          <button @click="acceptCookies" class="cookie-btn accept">Accept All</button>
          <button @click="rejectCookies" class="cookie-btn reject">Reject</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const showBanner = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookie_consent')
  if (!consent) {
    // Show banner after a short delay for better UX
    setTimeout(() => {
      showBanner.value = true
    }, 1000)
  }
})

function acceptCookies() {
  localStorage.setItem('cookie_consent', 'accepted')
  localStorage.setItem('ads_enabled', 'true')
  showBanner.value = false

  // Reload to enable ads
  window.location.reload()
}

function rejectCookies() {
  localStorage.setItem('cookie_consent', 'rejected')
  localStorage.setItem('ads_enabled', 'false')
  showBanner.value = false
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  z-index: 9999;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cookie-text p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.cookie-link {
  color: #ef4444;
  text-decoration: underline;
  margin-left: 4px;
  transition: color 0.2s;
}

.cookie-link:hover {
  color: #dc2626;
}

.cookie-actions {
  display: flex;
  gap: 12px;
}

.cookie-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cookie-btn.accept {
  background: #ef4444;
  color: white;
}

.cookie-btn.accept:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.cookie-btn.reject {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.cookie-btn.reject:hover {
  background: rgba(255, 255, 255, 0.15);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    text-align: center;
  }

  .cookie-actions {
    width: 100%;
    flex-direction: column;
  }

  .cookie-btn {
    width: 100%;
  }
}
</style>
