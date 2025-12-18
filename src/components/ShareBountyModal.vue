<!-- src/components/ShareBountyModal.vue -->
<script setup lang="ts">
import { X, Share2, Copy, Check } from 'lucide-vue-next'
import { ref } from 'vue'
import { shareBounty, copyToClipboard, generateShareText, getShareUrl, type BountyShareData } from '@/lib/shareUtils'
import { useToast } from '@/composables/useToast'

interface Props {
  bounty: BountyShareData
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const copied = ref(false)
const { success, error: showError } = useToast()

async function handleShare(platform: 'twitter' | 'facebook') {
  // For Facebook, copy text to clipboard first since FB doesn't allow pre-filled text
  if (platform === 'facebook') {
    const text = generateShareText(props.bounty, 'facebook')
    const copySuccess = await copyToClipboard(text)

    if (copySuccess) {
      success('Caption copied! Paste it in the Facebook post.')
      // Wait a bit before opening Facebook share dialog
      setTimeout(() => {
        shareBounty(props.bounty, platform)
      }, 500)
    } else {
      // Still open Facebook even if copy failed
      shareBounty(props.bounty, platform)
    }
  } else {
    // Twitter supports pre-filled text
    shareBounty(props.bounty, platform)
  }

  emit('close')
}

async function handleCopyDiscord() {
  const text = generateShareText(props.bounty, 'discord')
  const url = getShareUrl(props.bounty, 'discord')
  const fullText = `${text}\n\n${url}`
  const copySuccess = await copyToClipboard(fullText)

  if (copySuccess) {
    copied.value = true
    success('Discord message copied to clipboard!')
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } else {
    showError('Failed to copy message')
  }
}

async function handleCopyLink() {
  const url = getShareUrl(props.bounty, 'clipboard')
  const copySuccess = await copyToClipboard(url)

  if (copySuccess) {
    copied.value = true
    success('Link copied to clipboard!')
    setTimeout(() => {
      copied.value = false
      emit('close')
    }, 1500)
  } else {
    showError('Failed to copy link')
  }
}

async function handleCopyInstagram() {
  const text = generateShareText(props.bounty, 'instagram')
  const copySuccess = await copyToClipboard(text)

  if (copySuccess) {
    copied.value = true
    success('Instagram caption copied to clipboard!')
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } else {
    showError('Failed to copy caption')
  }
}

function closeModal() {
  emit('close')
}

// Close on escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Add/remove event listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="bg-arc-card border-2 border-arc-red/30 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-600 hover:text-arc-red transition"
          aria-label="Close"
        >
          <X :size="24" />
        </button>

        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <Share2 class="text-arc-red" :size="28" />
            <h2 class="text-2xl font-bold text-gray-900">Share Bounty</h2>
          </div>
          <p class="text-gray-600 text-sm">
            Share this {{ bounty.bounty_amount.toLocaleString() }} point bounty on {{ bounty.target_gamertag }}
          </p>
        </div>

        <!-- Share Options -->
        <div class="space-y-3">
          <!-- Twitter/X -->
          <button
            @click="handleShare('twitter')"
            class="w-full flex items-center gap-4 px-4 py-3 bg-arc-beige hover:bg-arc-brown/20 border-2 border-arc-brown/20 hover:border-arc-red rounded-lg transition group"
          >
            <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900">Share on X (Twitter)</div>
              <div class="text-xs text-gray-600">Post to your timeline</div>
            </div>
            <Share2 class="text-gray-400 group-hover:text-arc-red transition" :size="20" />
          </button>

          <!-- Facebook -->
          <button
            @click="handleShare('facebook')"
            class="w-full flex items-center gap-4 px-4 py-3 bg-arc-beige hover:bg-arc-brown/20 border-2 border-arc-brown/20 hover:border-arc-red rounded-lg transition group"
          >
            <div class="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900">Share on Facebook</div>
              <div class="text-xs text-gray-600">Caption auto-copied - just paste!</div>
            </div>
            <Share2 class="text-gray-400 group-hover:text-arc-red transition" :size="20" />
          </button>

          <!-- Discord -->
          <button
            @click="handleCopyDiscord"
            class="w-full flex items-center gap-4 px-4 py-3 bg-arc-beige hover:bg-arc-brown/20 border-2 border-arc-brown/20 hover:border-arc-red rounded-lg transition group"
          >
            <div class="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900">Share on Discord</div>
              <div class="text-xs text-gray-600">Copy message and link</div>
            </div>
            <Share2 class="text-gray-400 group-hover:text-arc-red transition" :size="20" />
          </button>

          <!-- Copy Link -->
          <button
            @click="handleCopyLink"
            class="w-full flex items-center gap-4 px-4 py-3 bg-arc-beige hover:bg-arc-brown/20 border-2 border-arc-brown/20 hover:border-arc-red rounded-lg transition group"
            :class="{ 'bg-arc-green/20 border-arc-green': copied }"
          >
            <div class="w-10 h-10 bg-arc-red rounded-lg flex items-center justify-center">
              <Check v-if="copied" class="text-white" :size="20" />
              <Copy v-else class="text-white" :size="20" />
            </div>
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900">
                {{ copied ? 'Copied!' : 'Copy Link' }}
              </div>
              <div class="text-xs text-gray-600">
                {{ copied ? 'Link copied to clipboard' : 'Copy bounty URL' }}
              </div>
            </div>
            <Share2 v-if="!copied" class="text-gray-400 group-hover:text-arc-red transition" :size="20" />
          </button>
        </div>

        <!-- Cancel Button -->
        <button
          @click="closeModal"
          class="w-full mt-4 px-4 py-3 bg-arc-brown/10 hover:bg-arc-brown/20 text-gray-700 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
