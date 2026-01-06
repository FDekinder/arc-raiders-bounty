<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">Login Required</h3>
      <p class="modal-message">
        Please log in to perform this action.
      </p>

      <div class="modal-buttons">
        <button @click="emit('close')" class="modal-btn-cancel">
          Cancel
        </button>
        <button @click="goToLogin" class="modal-btn-login">
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-arc-red;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900 mb-4 text-center;
}

.modal-message {
  @apply text-gray-700 text-center mb-6 text-lg;
}

.modal-buttons {
  @apply flex gap-4;
}

.modal-btn-cancel {
  @apply flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition-all;
}

.modal-btn-login {
  @apply flex-1 bg-arc-red hover:bg-arc-red/80 text-white font-bold py-3 rounded-lg transition-all;
}
</style>
