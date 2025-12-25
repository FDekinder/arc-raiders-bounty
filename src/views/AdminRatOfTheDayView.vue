<!-- src/views/AdminRatOfTheDayView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Youtube, Save, Eye, Trash2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import TacticalButton from '@/components/TacticalButton.vue'
import IconInput from '@/components/IconInput.vue'
import { supabase } from '@/lib/supabase'
import type { RatOfTheDay } from '@/lib/supabase'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()

// Redirect non-admin users
if (!currentUser || currentUser.role !== 'admin') {
  showError('Access denied. Admin privileges required.')
  router.push('/')
}

const youtubeUrl = ref('')
const creatorName = ref('')
const currentRatOfTheDay = ref<RatOfTheDay | null>(null)
const loading = ref(false)
const saving = ref(false)

// Extract YouTube video ID from URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
    /youtube\.com\/v\/([^&\s]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// Get current Rat of the Day
async function fetchCurrentRatOfTheDay() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('rat_of_the_day')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    currentRatOfTheDay.value = data
  } catch (err: any) {
    console.error('Error fetching Rat of the Day:', err)
  } finally {
    loading.value = false
  }
}

// Save new Rat of the Day
async function saveRatOfTheDay() {
  if (!youtubeUrl.value.trim()) {
    showError('Please enter a YouTube URL')
    return
  }

  if (!creatorName.value.trim()) {
    showError('Please enter the creator name')
    return
  }

  const videoId = extractVideoId(youtubeUrl.value)
  if (!videoId) {
    showError('Invalid YouTube URL. Please enter a valid YouTube video link.')
    return
  }

  saving.value = true
  try {
    const { data, error } = await supabase
      .from('rat_of_the_day')
      .insert({
        youtube_url: youtubeUrl.value.trim(),
        youtube_video_id: videoId,
        creator_name: creatorName.value.trim(),
        set_by: currentUser?.id,
      })
      .select()
      .single()

    if (error) throw error

    currentRatOfTheDay.value = data
    youtubeUrl.value = ''
    creatorName.value = ''
    success('Rat of the Day updated successfully!')
  } catch (err: any) {
    console.error('Error saving Rat of the Day:', err)
    showError('Failed to save Rat of the Day')
  } finally {
    saving.value = false
  }
}

// Delete current Rat of the Day
async function deleteRatOfTheDay() {
  if (!currentRatOfTheDay.value) return

  if (!confirm('Are you sure you want to remove the current Rat of the Day?')) {
    return
  }

  saving.value = true
  try {
    const { error } = await supabase
      .from('rat_of_the_day')
      .delete()
      .eq('id', currentRatOfTheDay.value.id)

    if (error) throw error

    currentRatOfTheDay.value = null
    success('Rat of the Day removed successfully!')
  } catch (err: any) {
    console.error('Error deleting Rat of the Day:', err)
    showError('Failed to remove Rat of the Day')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCurrentRatOfTheDay()
})
</script>

<template>
  <div class="admin-rat-view">
    <PageHeader title="Rat of the Day">
      <template #subtitle>
        <p class="subtitle-text">Feature a YouTube video on the homepage</p>
      </template>
    </PageHeader>

    <!-- Current Rat of the Day -->
    <div v-if="currentRatOfTheDay" class="current-rat-section">
      <div class="section-header">
        <h2 class="section-title">
          <Eye :size="20" />
          Currently Featured
        </h2>
        <button @click="deleteRatOfTheDay" :disabled="saving" class="delete-btn">
          <Trash2 :size="16" />
          Remove
        </button>
      </div>

      <div class="current-rat-card">
        <div class="video-preview">
          <iframe
            :src="`https://www.youtube.com/embed/${currentRatOfTheDay.youtube_video_id}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="youtube-iframe"
          ></iframe>
        </div>
        <div class="video-info">
          <div class="info-row">
            <span class="info-label">Creator:</span>
            <span class="info-value">{{ currentRatOfTheDay.creator_name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Video ID:</span>
            <span class="info-value">{{ currentRatOfTheDay.youtube_video_id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Set:</span>
            <span class="info-value">{{ new Date(currentRatOfTheDay.created_at).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No current rat message -->
    <div v-else-if="!loading" class="no-rat-message">
      <Youtube :size="48" />
      <p>No Rat of the Day is currently set</p>
      <p class="sub-message">Set one below to feature it on the homepage</p>
    </div>

    <!-- Set New Rat of the Day -->
    <div class="set-rat-section">
      <h2 class="section-title">
        <Youtube :size="20" />
        {{ currentRatOfTheDay ? 'Update' : 'Set' }} Rat of the Day
      </h2>

      <div class="form-container">
        <div class="form-group">
          <label class="form-label">YouTube URL *</label>
          <IconInput
            v-model="youtubeUrl"
            :icon="Youtube"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p class="form-hint">Paste any YouTube video URL (watch, share, or embed link)</p>
        </div>

        <div class="form-group">
          <label class="form-label">Creator Name *</label>
          <input
            v-model="creatorName"
            type="text"
            placeholder="Content Creator Name"
            class="text-input"
          />
          <p class="form-hint">Credit will be shown below the video on the homepage</p>
        </div>

        <!-- Preview -->
        <div v-if="youtubeUrl && extractVideoId(youtubeUrl)" class="preview-section">
          <p class="preview-label">Preview:</p>
          <div class="preview-video">
            <iframe
              :src="`https://www.youtube.com/embed/${extractVideoId(youtubeUrl)}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="youtube-iframe"
            ></iframe>
          </div>
          <p v-if="creatorName" class="preview-credit">Video by {{ creatorName }}</p>
        </div>

        <div class="form-actions">
          <TacticalButton
            @click="saveRatOfTheDay"
            :disabled="saving || !youtubeUrl || !creatorName"
            variant="primary"
            :icon="Save"
          >
            {{ saving ? 'Saving...' : currentRatOfTheDay ? 'Update Rat of the Day' : 'Set Rat of the Day' }}
          </TacticalButton>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="instructions-section">
      <h3 class="instructions-title">How it works:</h3>
      <ul class="instructions-list">
        <li>Find a great Arc Raiders video on YouTube</li>
        <li>Copy the video URL (any YouTube URL format works)</li>
        <li>Paste it above and add the creator's name for credit</li>
        <li>Click "Set Rat of the Day" to feature it on the homepage</li>
        <li>The video will appear at the top of the homepage for all visitors</li>
        <li>You can update or remove it anytime from this page</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.admin-rat-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
}

.subtitle-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

/* Current Rat Section */
.current-rat-section {
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-rat-card {
  display: grid;
  gap: 1.5rem;
}

.video-preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: black;
}

.youtube-iframe {
  width: 100%;
  height: 100%;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  gap: 1rem;
}

.info-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  min-width: 80px;
}

.info-value {
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

/* No Rat Message */
.no-rat-message {
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.no-rat-message svg {
  margin: 0 auto 1rem;
}

.sub-message {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Set Rat Section */
.set-rat-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-container {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.text-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #dcca04ff;
  background: rgba(255, 255, 255, 0.08);
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.5rem;
}

/* Preview Section */
.preview-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.preview-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.preview-video {
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: black;
  margin: 0 auto;
}

.preview-credit {
  text-align: center;
  margin-top: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-style: italic;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
}

/* Instructions */
.instructions-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.instructions-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.instructions-list li {
  padding-left: 1.5rem;
  position: relative;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  line-height: 1.5;
}

.instructions-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #dcca04ff;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .delete-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
