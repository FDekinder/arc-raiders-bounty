<!-- src/components/ClanTagEditor.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Edit2, Check, X, AlertCircle } from 'lucide-vue-next'
import { validateClanTag, sanitizeClanTag } from '@/lib/clanTagValidator'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

const props = defineProps<{
  user: User
  isOwnProfile: boolean
}>()

const emit = defineEmits<{
  updated: [clanTag: string | null]
}>()

const isEditing = ref(false)
const clanTagInput = ref(props.user.clan_tag || '')
const error = ref<string | null>(null)
const saving = ref(false)

const displayClanTag = computed(() => {
  return props.user.clan_tag ? `[${props.user.clan_tag}]` : ''
})

function startEditing() {
  isEditing.value = true
  clanTagInput.value = props.user.clan_tag || ''
  error.value = null
}

function cancelEditing() {
  isEditing.value = false
  clanTagInput.value = props.user.clan_tag || ''
  error.value = null
}

async function saveClanTag() {
  error.value = null

  // If empty, remove clan tag
  if (!clanTagInput.value.trim()) {
    await updateClanTag(null)
    return
  }

  // Sanitize and validate
  const sanitized = sanitizeClanTag(clanTagInput.value)
  const validation = validateClanTag(sanitized)

  if (!validation.isValid) {
    error.value = validation.error || 'Invalid clan tag'
    return
  }

  await updateClanTag(sanitized)
}

async function updateClanTag(clanTag: string | null) {
  try {
    saving.value = true

    const { error: updateError } = await supabase
      .from('users')
      .update({ clan_tag: clanTag })
      .eq('id', props.user.id)

    if (updateError) throw updateError

    // Update localStorage
    const currentUser = localStorage.getItem('arc_user')
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      userData.clan_tag = clanTag
      localStorage.setItem('arc_user', JSON.stringify(userData))
    }

    emit('updated', clanTag)
    isEditing.value = false
    error.value = null
  } catch (err) {
    console.error('Error updating clan tag:', err)
    error.value = 'Failed to update clan tag. Please try again.'
  } finally {
    saving.value = false
  }
}

async function removeClanTag() {
  await updateClanTag(null)
}
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <!-- Display Mode -->
    <div v-if="!isEditing" class="flex items-center gap-2">
      <span v-if="user.clan_tag" class="text-arc-red font-bold text-lg">
        {{ displayClanTag }}
      </span>
      <span v-else-if="isOwnProfile" class="text-gray-600 text-sm italic">
        No clan tag
      </span>

      <!-- Edit button (only for own profile) -->
      <button
        v-if="isOwnProfile"
        @click="startEditing"
        class="p-1 hover:bg-arc-red/20 rounded transition-colors"
        title="Edit clan tag"
      >
        <Edit2 :size="16" class="text-arc-brown hover:text-arc-red" />
      </button>
    </div>

    <!-- Edit Mode -->
    <div v-else class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-arc-red font-bold">
            [
          </span>
          <input
            v-model="clanTagInput"
            type="text"
            maxlength="5"
            placeholder="CLAN"
            class="bg-arc-cream border border-arc-red/30 rounded px-3 py-2 text-arc-dark focus:border-arc-red focus:outline-none w-32 text-center font-bold uppercase"
            style="padding-left: 1.5rem; padding-right: 1.5rem"
            @keyup.enter="saveClanTag"
            @keyup.escape="cancelEditing"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-arc-red font-bold">
            ]
          </span>
        </div>

        <button
          @click="saveClanTag"
          :disabled="saving"
          class="p-2 bg-arc-green hover:bg-arc-green/80 rounded transition-colors disabled:opacity-50"
          title="Save"
        >
          <Check :size="16" class="text-arc-dark" />
        </button>

        <button
          @click="cancelEditing"
          :disabled="saving"
          class="p-2 bg-gray-100 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <X :size="16" class="text-arc-dark" />
        </button>

        <button
          v-if="user.clan_tag"
          @click="removeClanTag"
          :disabled="saving"
          class="p-2 bg-arc-red hover:bg-arc-red/80 rounded transition-colors disabled:opacity-50"
          title="Remove clan tag"
        >
          <X :size="16" class="text-arc-dark" />
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="flex items-center gap-2 text-arc-red text-sm">
        <AlertCircle :size="14" />
        <span>{{ error }}</span>
      </div>

      <!-- Helper Text -->
      <div v-else class="text-xs text-gray-600">
        Max 5 characters. Letters and numbers only.
      </div>
    </div>
  </div>
</template>
