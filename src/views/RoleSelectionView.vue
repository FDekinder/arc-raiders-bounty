<!-- src/views/RoleSelectionView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RoleSelector from '@/components/RoleSelector.vue'
import type { UserRole } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

const router = useRouter()
const selectedRole = ref<UserRole | undefined>(undefined)
const saving = ref(false)
const error = ref<string | null>(null)

function handleRoleSelect(role: UserRole) {
  selectedRole.value = role
}

async function confirmRole() {
  if (!selectedRole.value) {
    error.value = 'Please select a role'
    return
  }

  const currentUser = getCurrentUser()
  if (!currentUser) {
    error.value = 'User not found. Please log in again.'
    return
  }

  try {
    saving.value = true
    error.value = null

    // Update user game_role in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ game_role: selectedRole.value })
      .eq('id', currentUser.id)

    if (updateError) throw updateError

    // Update localStorage
    const updatedUser = { ...currentUser, game_role: selectedRole.value }
    localStorage.setItem('arc_user', JSON.stringify(updatedUser))

    // Redirect to home
    router.push('/')
  } catch (err: any) {
    console.error('Error saving role:', err)
    error.value = err.message || 'Failed to save role. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <RoleSelector v-model="selectedRole" @select="handleRoleSelect" />

    <!-- Confirm Button -->
    <div class="confirm-bar">
      <div class="confirm-content">
        <div class="selection-info">
          <p v-if="selectedRole" class="selected-text">
            Selected:
            <span
              :class="selectedRole === 'BH' ? 'role-bh' : 'role-pr'"
            >
              {{ selectedRole === 'BH' ? 'Bounty Hunter (BH)' : 'Proud Rat (PR)' }}
            </span>
          </p>
          <p v-else class="placeholder-text">Select your role to continue</p>
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <button
          @click="confirmRole"
          :disabled="!selectedRole || saving"
          :class="[
            'confirm-btn',
            selectedRole && !saving ? 'confirm-btn-active' : 'confirm-btn-disabled'
          ]"
        >
          {{ saving ? 'Saving...' : 'Confirm Selection' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-arc-dark;
}

.confirm-bar {
  @apply fixed bottom-0 left-0 right-0 bg-arc-navy border-t-2 border-arc-red/20 p-6;
}

.confirm-content {
  @apply max-w-7xl mx-auto flex items-center justify-between;
}

.selection-info {
  @apply;
}

.selected-text {
  @apply text-white font-bold;
}

.role-bh {
  @apply text-arc-green;
}

.role-pr {
  @apply text-arc-red;
}

.placeholder-text {
  @apply text-gray-400;
}

.error-text {
  @apply text-arc-red text-sm mt-1;
}

.confirm-btn {
  @apply px-8 py-3 rounded-lg font-bold text-lg transition-all;
}

.confirm-btn-active {
  @apply bg-arc-red hover:bg-arc-red/80 text-white cursor-pointer;
}

.confirm-btn-disabled {
  @apply bg-gray-600 text-gray-400 cursor-not-allowed;
}
</style>
