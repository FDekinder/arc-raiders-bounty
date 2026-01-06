<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bug, Send, AlertCircle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import PageHeader from '@/components/PageHeader.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const { success, error: showError } = useToast()
const { currentUser } = useAuth()

const bugType = ref<'bug' | 'feature' | 'improvement' | 'other'>('bug')
const title = ref('')
const description = ref('')
const stepsToReproduce = ref('')
const expectedBehavior = ref('')
const actualBehavior = ref('')
const browserInfo = ref('')
const loading = ref(false)
const error = ref('')

// Auto-fill browser info
browserInfo.value = `${navigator.userAgent}`

const bugTypes = [
  { value: 'bug' as const, label: 'Bug Report', emoji: '🐛', description: 'Something is broken or not working' },
  { value: 'feature' as const, label: 'Feature Request', emoji: '💡', description: 'Suggest a new feature' },
  { value: 'improvement' as const, label: 'Improvement', emoji: '⚡', description: 'Suggest an enhancement' },
  { value: 'other' as const, label: 'Other', emoji: '📝', description: 'General feedback or question' },
]

async function handleSubmit() {
  error.value = ''

  // Validation
  if (!title.value.trim()) {
    error.value = 'Please enter a title'
    showError('Please enter a title')
    return
  }

  if (!description.value.trim()) {
    error.value = 'Please enter a description'
    showError('Please enter a description')
    return
  }

  if (description.value.length < 20) {
    error.value = 'Description must be at least 20 characters'
    showError('Description must be at least 20 characters')
    return
  }

  loading.value = true

  try {
    // Create bug report in database
    const { error: dbError } = await supabase.from('bug_reports').insert({
      user_id: currentUser.value?.id || null,
      username: currentUser.value?.username || 'Anonymous',
      bug_type: bugType.value,
      title: title.value.trim(),
      description: description.value.trim(),
      steps_to_reproduce: stepsToReproduce.value.trim() || null,
      expected_behavior: expectedBehavior.value.trim() || null,
      actual_behavior: actualBehavior.value.trim() || null,
      browser_info: browserInfo.value,
      status: 'open',
    })

    if (dbError) throw dbError

    success('Report submitted successfully! Thank you for your feedback.')

    // Reset form
    title.value = ''
    description.value = ''
    stepsToReproduce.value = ''
    expectedBehavior.value = ''
    actualBehavior.value = ''

    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to submit report'
    showError(err.message || 'Failed to submit report')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent py-8">
    <div class="container mx-auto px-4 max-w-3xl">
      <PageHeader
        title="Report a Problem"
        subtitle="Help us improve the Arc Raiders Bounty System by reporting bugs or suggesting improvements"
      />

      <!-- Info Alert -->
      <div class="info-alert mb-8">
        <Info class="text-blue-600" :size="24" />
        <div>
          <h3 class="font-semibold text-gray-900">Your feedback matters!</h3>
          <p class="text-sm text-gray-700">
            All reports are reviewed by our team. For urgent issues, please also join our Discord community.
          </p>
        </div>
      </div>

      <!-- Report Form -->
      <div class="bg-arc-card border-2 border-arc-brown/20 rounded-xl p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Report Type -->
          <div class="form-section">
            <label class="form-label">Report Type</label>
            <div class="report-type-grid">
              <button
                v-for="type in bugTypes"
                :key="type.value"
                type="button"
                @click="bugType = type.value"
                :class="[
                  'report-type-btn',
                  bugType === type.value ? 'report-type-active' : 'report-type-inactive'
                ]"
              >
                <span class="text-2xl">{{ type.emoji }}</span>
                <div class="text-left">
                  <div class="font-semibold text-sm">{{ type.label }}</div>
                  <div class="text-xs opacity-75">{{ type.description }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="form-section">
            <label class="form-label">Title <span class="text-arc-red">*</span></label>
            <input
              v-model="title"
              type="text"
              placeholder="Brief summary of the issue..."
              maxlength="200"
              class="input-field"
              required
            />
            <p class="help-text">{{ title.length }}/200 characters</p>
          </div>

          <!-- Description -->
          <div class="form-section">
            <label class="form-label">Description <span class="text-arc-red">*</span></label>
            <textarea
              v-model="description"
              placeholder="Provide detailed information about the issue or suggestion..."
              rows="5"
              maxlength="2000"
              class="input-field"
              required
            ></textarea>
            <p class="help-text">{{ description.length }}/2000 characters (minimum 20)</p>
          </div>

          <!-- Steps to Reproduce (for bugs) -->
          <div v-if="bugType === 'bug'" class="form-section">
            <label class="form-label">Steps to Reproduce (Optional)</label>
            <textarea
              v-model="stepsToReproduce"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows="4"
              maxlength="1000"
              class="input-field"
            ></textarea>
            <p class="help-text">Help us understand how to reproduce the issue</p>
          </div>

          <!-- Expected vs Actual Behavior (for bugs) -->
          <div v-if="bugType === 'bug'" class="form-section">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Expected Behavior (Optional)</label>
                <textarea
                  v-model="expectedBehavior"
                  placeholder="What should happen..."
                  rows="3"
                  maxlength="500"
                  class="input-field"
                ></textarea>
              </div>
              <div>
                <label class="form-label">Actual Behavior (Optional)</label>
                <textarea
                  v-model="actualBehavior"
                  placeholder="What actually happens..."
                  rows="3"
                  maxlength="500"
                  class="input-field"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Browser Info (read-only) -->
          <div class="form-section">
            <label class="form-label">Browser Information</label>
            <input
              v-model="browserInfo"
              type="text"
              class="input-field bg-gray-100"
              readonly
            />
            <p class="help-text">This helps us debug issues specific to your browser</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-alert">
            <AlertCircle :size="20" />
            {{ error }}
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="submit-btn flex-1"
            >
              <Send :size="20" />
              {{ loading ? 'Submitting...' : 'Submit Report' }}
            </button>
            <button
              type="button"
              @click="router.push('/')"
              class="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 text-center text-gray-600">
        <p class="text-sm">
          You can also report issues on our
          <a href="https://github.com/yourusername/arc-raiders-bounty/issues" target="_blank" class="text-arc-red hover:underline">
            GitHub repository
          </a>
          or join our Discord community for immediate help.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-semibold text-gray-900;
}

.input-field {
  @apply w-full px-4 py-3 bg-white border-2 border-arc-brown/20 rounded-lg focus:outline-none focus:border-arc-red transition text-gray-900 placeholder-gray-500;
}

.help-text {
  @apply text-xs text-gray-600;
}

.report-type-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.report-type-btn {
  @apply flex items-center gap-3 p-4 rounded-lg border-2 transition cursor-pointer text-gray-900;
}

.report-type-active {
  @apply bg-arc-red/10 border-arc-red text-gray-900;
}

.report-type-inactive {
  @apply bg-white border-arc-brown/20 hover:border-arc-red/50 text-gray-900;
}

.info-alert {
  @apply flex items-start gap-3 bg-blue-50 border-2 border-blue-200 rounded-lg p-4;
}

.error-alert {
  @apply flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-800 rounded-lg p-4 text-sm;
}

.submit-btn {
  @apply flex items-center justify-center gap-2 bg-arc-red hover:bg-arc-red/80 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed;
}

.cancel-btn {
  @apply px-6 py-3 bg-arc-red hover:bg-arc-red/80 text-white rounded-lg font-semibold transition;
}
</style>
