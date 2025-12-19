<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="icon-container">
              <Heart class="heart-icon" :size="48" />
            </div>
            <h2 class="modal-title">Welcome to Don't Shoot! 🎯</h2>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <div class="welcome-message">
              <p class="lead-text">
                This is a <strong>fun, community-driven platform</strong> for Arc Raiders players
                to engage in friendly competition through bounties and challenges.
              </p>

              <div class="guidelines-section">
                <h3>Our Community Values</h3>
                <div class="guideline-item">
                  <CheckCircle class="check-icon" :size="20" />
                  <div>
                    <strong>It's All in Good Fun</strong>
                    <p>Bounties are meant to create exciting gameplay moments, not cause stress or negativity.</p>
                  </div>
                </div>

                <div class="guideline-item">
                  <CheckCircle class="check-icon" :size="20" />
                  <div>
                    <strong>Respect Everyone</strong>
                    <p>Treat all players with kindness. No bullying, harassment, or toxic behavior will be tolerated.</p>
                  </div>
                </div>

                <div class="guideline-item">
                  <CheckCircle class="check-icon" :size="20" />
                  <div>
                    <strong>Good Sportsmanship</strong>
                    <p>Win with grace, lose with dignity. Celebrate achievements without putting others down.</p>
                  </div>
                </div>

                <div class="guideline-item">
                  <CheckCircle class="check-icon" :size="20" />
                  <div>
                    <strong>Keep It Positive</strong>
                    <p>Use bounties to challenge friends and rivals in a friendly way, not to target or harass anyone.</p>
                  </div>
                </div>
              </div>

              <div class="important-note">
                <AlertCircle class="alert-icon" :size="24" />
                <div>
                  <strong>Remember:</strong>
                  <p>
                    This platform is for entertainment only. Any behavior that crosses the line
                    into bullying, harassment, or toxicity will result in account suspension.
                    Let's build a positive gaming community together! 💪
                  </p>
                </div>
              </div>
            </div>

            <!-- Agreement Checkbox -->
            <div class="agreement-section">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="agreedToGuidelines"
                  class="checkbox-input"
                />
                <span>
                  I understand this is for fun and agree to treat all players with respect and kindness
                </span>
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button
              @click="handleAgree"
              :disabled="!agreedToGuidelines"
              class="agree-button"
            >
              <Heart :size="18" />
              I Agree - Let's Have Fun!
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Heart, CheckCircle, AlertCircle } from 'lucide-vue-next'

const GUIDELINES_VERSION = '1.0' // Update this when guidelines change

const showModal = ref(false)
const agreedToGuidelines = ref(false)

onMounted(() => {
  checkAndShowModal()
})

function checkAndShowModal() {
  const lastVersion = localStorage.getItem('welcome_modal_version')
  const lastShown = localStorage.getItem('welcome_modal_last_shown')
  const today = new Date().toDateString()

  // Show if version changed OR if not shown today
  if (lastVersion !== GUIDELINES_VERSION || lastShown !== today) {
    showModal.value = true
  }
}

function handleAgree() {
  if (!agreedToGuidelines.value) return

  // Save today's date and version
  const today = new Date().toDateString()
  localStorage.setItem('welcome_modal_last_shown', today)
  localStorage.setItem('welcome_modal_version', GUIDELINES_VERSION)

  // Close modal
  showModal.value = false
}

function handleOverlayClick() {
  // Prevent closing by clicking overlay - user must agree
  return
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  padding: 32px 32px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-container {
  margin-bottom: 16px;
}

.heart-icon {
  color: #ef4444;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.modal-content {
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.welcome-message {
  color: rgba(255, 255, 255, 0.9);
}

.lead-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.85);
}

.lead-text strong {
  color: #ef4444;
}

.guidelines-section {
  margin: 24px 0;
}

.guidelines-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.guideline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

.check-icon {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

.guideline-item strong {
  display: block;
  color: white;
  margin-bottom: 4px;
  font-size: 15px;
}

.guideline-item p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
}

.important-note {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
}

.important-note strong {
  display: block;
  color: #ef4444;
  margin-bottom: 4px;
  font-size: 15px;
}

.important-note p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
}

.agreement-section {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  user-select: none;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #ef4444;
  flex-shrink: 0;
}

.modal-footer {
  padding: 24px 32px 32px;
  text-align: center;
}

.agree-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.agree-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.agree-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 20px;
  }

  .modal-header {
    padding: 24px 20px 20px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-content {
    padding: 24px 20px;
    max-height: 70vh;
  }

  .modal-footer {
    padding: 20px;
  }

  .guideline-item {
    padding: 12px;
  }

  .agree-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
