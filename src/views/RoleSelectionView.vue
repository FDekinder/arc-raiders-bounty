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

    // Update user role in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: selectedRole.value })
      .eq('id', currentUser.id)

    if (updateError) throw updateError

    // Update localStorage
    const updatedUser = { ...currentUser, role: selectedRole.value }
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
  <div class="min-h-screen bg-arc-dark">
    <RoleSelector v-model="selectedRole" @select="handleRoleSelect" />

    <!-- Confirm Button -->
    <div class="fixed bottom-0 left-0 right-0 bg-arc-navy border-t-2 border-arc-red/20 p-6">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p v-if="selectedRole" class="text-white font-bold">
            Selected:
            <span
              :class="selectedRole === 'BH' ? 'text-arc-green' : 'text-arc-red'"
            >
              {{ selectedRole === 'BH' ? 'Bounty Hunter (BH)' : 'Proud Rat (PR)' }}
            </span>
          </p>
          <p v-else class="text-gray-400">Select your role to continue</p>
          <p v-if="error" class="text-arc-red text-sm mt-1">{{ error }}</p>
        </div>

        <button
          @click="confirmRole"
          :disabled="!selectedRole || saving"
          :class="[
            'px-8 py-3 rounded-lg font-bold text-lg transition-all',
            selectedRole && !saving
              ? 'bg-arc-red hover:bg-arc-red/80 text-white cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed',
          ]"
        >
          {{ saving ? 'Saving...' : 'Confirm Selection' }}
        </button>
      </div>
    </div>
  </div>
</template>
