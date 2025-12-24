<!-- src/components/RolePoll.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const currentUser = getCurrentUser()

const loading = ref(true)
const voting = ref(false)
const userVote = ref<'good_guy' | 'proud_rat' | null>(null)
const goodGuyVotes = ref(0)
const proudRatVotes = ref(0)

const totalVotes = computed(() => goodGuyVotes.value + proudRatVotes.value)
const goodGuyPercentage = computed(() =>
  totalVotes.value > 0 ? Math.round((goodGuyVotes.value / totalVotes.value) * 100) : 50
)
const proudRatPercentage = computed(() =>
  totalVotes.value > 0 ? Math.round((proudRatVotes.value / totalVotes.value) * 100) : 50
)

async function fetchPollData() {
  loading.value = true
  try {
    // Get vote counts
    const { data: votes, error: votesError } = await supabase
      .from('role_poll_votes')
      .select('vote')

    if (votesError) throw votesError

    goodGuyVotes.value = votes?.filter(v => v.vote === 'good_guy').length || 0
    proudRatVotes.value = votes?.filter(v => v.vote === 'proud_rat').length || 0

    // Get user's vote if logged in
    if (currentUser) {
      const { data: userVoteData, error: userVoteError } = await supabase
        .from('role_poll_votes')
        .select('vote')
        .eq('user_id', currentUser.id)
        .single()

      if (!userVoteError && userVoteData) {
        userVote.value = userVoteData.vote as 'good_guy' | 'proud_rat'
      }
    }
  } catch (err) {
    console.error('Error fetching poll data:', err)
  } finally {
    loading.value = false
  }
}

async function vote(choice: 'good_guy' | 'proud_rat') {
  if (!currentUser) {
    showError('Please log in to vote')
    return
  }

  if (voting.value) return

  voting.value = true
  try {
    const { error: voteError } = await supabase
      .from('role_poll_votes')
      .upsert({
        user_id: currentUser.id,
        vote: choice,
        updated_at: new Date().toISOString()
      })

    if (voteError) throw voteError

    userVote.value = choice
    success('Vote recorded!')
    await fetchPollData()
  } catch (err: any) {
    showError('Failed to record vote')
    console.error(err)
  } finally {
    voting.value = false
  }
}

onMounted(() => {
  fetchPollData()
})
</script>

<template>
  <div class="poll-container">
    <h2 class="poll-title">Which one are you?</h2>
    <p class="poll-subtitle">Choose your side in the Arc Raiders universe</p>

    <div class="poll-grid">
      <!-- Good Guy Option -->
      <button
        @click="vote('good_guy')"
        :disabled="voting || !currentUser"
        :class="[
          'poll-option',
          userVote === 'good_guy' ? 'poll-option-selected' : '',
          !currentUser ? 'poll-option-disabled' : ''
        ]"
      >
        <div class="image-container">
          <img src="/Good.png" alt="Good Guy" class="poll-image" />
          <div v-if="userVote === 'good_guy'" class="selected-badge">✓ Your Vote</div>
        </div>
        <div class="poll-info">
          <h3 class="option-title">The Good Guy</h3>
          <div class="vote-bar-container">
            <div class="vote-bar" :style="{ width: `${goodGuyPercentage}%` }"></div>
          </div>
          <div class="vote-stats">
            <span class="vote-percentage">{{ goodGuyPercentage }}%</span>
            <span class="vote-count">{{ goodGuyVotes }} votes</span>
          </div>
        </div>
      </button>

      <!-- Proud Rat Option -->
      <button
        @click="vote('proud_rat')"
        :disabled="voting || !currentUser"
        :class="[
          'poll-option',
          userVote === 'proud_rat' ? 'poll-option-selected' : '',
          !currentUser ? 'poll-option-disabled' : ''
        ]"
      >
        <div class="image-container">
          <img src="/BAD.png" alt="Proud Rat" class="poll-image" />
          <div v-if="userVote === 'proud_rat'" class="selected-badge">✓ Your Vote</div>
        </div>
        <div class="poll-info">
          <h3 class="option-title">The Proud Rat</h3>
          <div class="vote-bar-container">
            <div class="vote-bar vote-bar-rat" :style="{ width: `${proudRatPercentage}%` }"></div>
          </div>
          <div class="vote-stats">
            <span class="vote-percentage">{{ proudRatPercentage }}%</span>
            <span class="vote-count">{{ proudRatVotes }} votes</span>
          </div>
        </div>
      </button>
    </div>

    <div v-if="!currentUser" class="login-notice">
      <p>Log in to vote and see the results!</p>
    </div>

    <div class="total-votes">
      Total Votes: {{ totalVotes.toLocaleString() }}
    </div>
  </div>
</template>

<style scoped>
.poll-container {
  @apply bg-arc-card border-2 border-arc-brown/20 rounded-xl p-6 md:p-8 mb-8;
}

.poll-title {
  @apply text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900;
}

.poll-subtitle {
  @apply text-center text-gray-600 mb-6;
}

.poll-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 mb-6;
}

.poll-option {
  @apply relative bg-arc-beige border-2 border-arc-brown/30 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer;
  @apply hover:border-arc-red hover:shadow-xl hover:scale-105;
}

.poll-option-selected {
  @apply border-arc-red border-4 shadow-2xl;
}

.poll-option-disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:border-arc-brown/30 hover:shadow-none hover:scale-100;
}

.image-container {
  @apply relative aspect-[16/10] overflow-hidden;
}

.poll-image {
  @apply w-full h-full object-cover;
}

.selected-badge {
  @apply absolute top-4 right-4 bg-arc-red text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg;
}

.poll-info {
  @apply p-4 bg-white;
}

.option-title {
  @apply text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center;
}

.vote-bar-container {
  @apply w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-2;
}

.vote-bar {
  @apply h-full bg-blue-600 transition-all duration-500 rounded-full;
}

.vote-bar-rat {
  @apply bg-arc-red;
}

.vote-stats {
  @apply flex justify-between items-center text-sm;
}

.vote-percentage {
  @apply font-bold text-gray-900 text-lg;
}

.vote-count {
  @apply text-gray-600;
}

.login-notice {
  @apply text-center bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4;
}

.login-notice p {
  @apply text-yellow-800 font-semibold;
}

.total-votes {
  @apply text-center text-gray-600 font-semibold;
}
</style>
