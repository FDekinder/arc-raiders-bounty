<!-- src/views/FAQView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import {
  HelpCircle,
  Target,
  Trophy,
  Shield,
  Settings,
  User,
  Search,
  MessageCircle,
} from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  icon: any
  questions: FAQItem[]
}

const searchQuery = ref('')
const expandedSections = ref<Set<number>>(new Set())
const expandedQuestions = ref<Set<string>>(new Set())

const faqSections: FAQSection[] = [
  {
    title: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        question: 'What is Arc Raiders Bounty System?',
        answer:
          'Arc Raiders Bounty System is a community-driven platform where players can place bounties on other players, hunt targets, and compete for glory. Track your kills, earn achievements, and climb the leaderboards in this competitive bounty hunting experience.',
      },
      {
        question: 'How do I create an account?',
        answer:
          'You can create an account using Steam, Xbox, or PlayStation authentication, or register with email. Click "Login" in the navigation, then choose your preferred method. For platform authentication, you\'ll be redirected to authorize the connection. For email registration, you\'ll need to verify your email address.',
      },
      {
        question: 'How does Steam/Xbox/PlayStation authentication work?',
        answer:
          'Platform authentication allows you to log in using your gaming platform credentials. When you select a platform, you\'ll be redirected to that platform\'s login page. After authorizing the connection, you\'ll be redirected back to the bounty system with your account linked. This is the recommended method for quick setup.',
      },
      {
        question: 'Is this official Arc Raiders content?',
        answer:
          'No, this is a community-created bounty system for Arc Raiders players. It is not officially affiliated with or endorsed by the Arc Raiders development team. This platform is built by fans, for fans.',
      },
    ],
  },
  {
    title: 'Creating Bounties',
    icon: Target,
    questions: [
      {
        question: 'How do I create a bounty on another player?',
        answer:
          'Navigate to "Create Bounty" in the menu. Enter the target player\'s gamertag, select their platform (Steam, Xbox, or PlayStation), and set your bounty amount. You can optionally add platform player IDs for verification. Click "Create Bounty" to publish it.',
      },
      {
        question: 'What is the minimum bounty amount?',
        answer:
          'The minimum bounty amount is typically 100 points. Bounty amounts are in platform points and determine how attractive your bounty is to hunters. Higher bounties attract more attention and competition.',
      },
      {
        question: 'How do I verify a player exists?',
        answer:
          'The system will attempt to verify the player exists based on the gamertag and platform you provide. If you have their platform player ID (Steam ID, Xbox Live ID, or PSN ID), including it will help with verification. Make sure to spell the gamertag correctly.',
      },
      {
        question: 'What platforms are supported?',
        answer:
          'The bounty system supports Steam, Xbox (Xbox Live), and PlayStation (PSN) platforms. You can create bounties on players from any of these platforms and specify which platform they play on.',
      },
      {
        question: 'How long do bounties last?',
        answer:
          'Bounties remain active until they are successfully claimed and verified, or until you cancel them. Active bounties are displayed in the bounties list and contribute to the "Most Wanted" rankings.',
      },
      {
        question: 'Can I extend my bounty duration?',
        answer:
          'Currently, bounties do not have a set expiration time. They remain active indefinitely until claimed. You can cancel your own bounties at any time from the bounty details page.',
      },
    ],
  },
  {
    title: 'Hunting Bounties',
    icon: Trophy,
    questions: [
      {
        question: 'How do I claim/hunt a bounty?',
        answer:
          'Browse the "Bounties" page to find active bounties. Click on a bounty to view details, then click "Hunt This Target" to join the hunt. Once you\'ve eliminated the target in-game, take a screenshot showing the kill and submit it as proof via the "Submit Claim" button.',
      },
      {
        question: 'What is the 3-hunt limit?',
        answer:
          'Each bounty has a maximum of 3 active hunters at a time. This ensures fair competition and prevents bounties from being overwhelmed. If a bounty already has 3 hunters, you\'ll need to wait until a slot opens up.',
      },
      {
        question: 'How do I join/leave a hunt?',
        answer:
          'To join a hunt, click "Join Hunt" on the bounty details page (if slots are available). To leave a hunt, go to "My Claims" and click "Leave Hunt" on the active hunt you want to abandon. Leaving a hunt opens up a slot for other players.',
      },
      {
        question: 'How do I submit proof of elimination?',
        answer:
          'After eliminating your target, take a clear screenshot showing the kill feed with the victim\'s gamertag. Go to "My Claims", find the bounty, and click "Submit Proof". Upload your screenshot and submit it for verification by admins.',
      },
      {
        question: 'What kind of proof is accepted?',
        answer:
          'Valid proof includes clear screenshots showing the kill feed with the target\'s gamertag visible, the elimination message, or your kill confirmation. The screenshot must be unedited and clearly show you eliminated the correct target. Fake or doctored screenshots will result in claim rejection and potential account penalties.',
      },
    ],
  },
  {
    title: 'Points & Rewards',
    icon: Trophy,
    questions: [
      {
        question: 'How do points work?',
        answer:
          'Points are the currency of the bounty system. You earn points by successfully completing bounties and eliminating targets. Points are awarded based on the bounty amount. Your total points determine your rank on the leaderboard.',
      },
      {
        question: 'How do I earn points?',
        answer:
          'Earn points by: 1) Successfully claiming bounties and having your proof verified, 2) Recording kills in the kill tracker system, 3) Unlocking achievements. The primary way to earn points is by hunting and eliminating bounty targets.',
      },
      {
        question: 'Can I buy points?',
        answer:
          'Currently, points cannot be purchased. All points must be earned through gameplay. This ensures fair competition and rewards skilled hunters. Future updates may introduce additional ways to earn points.',
      },
      {
        question: 'What happens to points when a bounty is completed?',
        answer:
          'When a bounty claim is verified, the bounty amount is awarded to the successful hunter as points. The bounty is then marked as completed and removed from the active bounties list. The bounty creator\'s points are not affected.',
      },
    ],
  },
  {
    title: 'Achievements & Badges',
    icon: Trophy,
    questions: [
      {
        question: 'What are achievements?',
        answer:
          'Achievements are special milestones and accomplishments you can unlock by performing specific actions in the bounty system. They come in different rarity levels (Common, Rare, Epic, Legendary) and are displayed on your profile.',
      },
      {
        question: 'How do I unlock badges?',
        answer:
          'Badges (achievements) are unlocked automatically when you meet their requirements. Examples include: First Blood (first kill), Bounty Hunter (complete 5 bounties), Wanted (have 10 active bounties on you), and many more. Check the achievements page to see all available badges.',
      },
      {
        question: 'What are the different rarity levels?',
        answer:
          'Achievements come in four rarity levels: Common (easiest to unlock), Rare (moderate difficulty), Epic (challenging), and Legendary (extremely difficult). Legendary achievements are prestigious accomplishments that showcase your dedication and skill.',
      },
      {
        question: 'Can I see my achievement progress?',
        answer:
          'Yes! Visit your profile page and click on the "Trophy Wall" to view all your unlocked achievements. You can see which achievements you\'ve earned, their rarity, and when you unlocked them. Your achievement count also contributes to your Notoriety Level.',
      },
    ],
  },
  {
    title: 'Profile & Leaderboard',
    icon: User,
    questions: [
      {
        question: 'How does the leaderboard work?',
        answer:
          'The leaderboard ranks players based on their total points earned from bounty completions and kills. Higher points mean higher rank. The leaderboard updates in real-time as players complete bounties and earn points. Separate leaderboards exist for top hunters and top killers.',
      },
      {
        question: 'How do I improve my rank?',
        answer:
          'Improve your rank by: 1) Completing more bounties successfully, 2) Recording kills in the kill tracker, 3) Going for high-value bounties, 4) Unlocking achievements that award points. Consistency and skill are key to climbing the leaderboard.',
      },
      {
        question: 'Can I customize my profile?',
        answer:
          'Yes! You can customize your profile by: 1) Adding a clan tag (displayed next to your username), 2) Uploading a custom avatar, 3) Selecting your game role (Raider or Proud Rat). Your achievements, stats, and activity are automatically tracked and displayed.',
      },
      {
        question: 'What stats are tracked?',
        answer:
          'Your profile tracks: Total points, bounties completed, bounties created, kill count, death count, total achievements, notoriety level, Most Wanted rank, bounties survived, highest bounty amount, active bounty streak, and more. All stats are visible on your profile page.',
      },
    ],
  },
  {
    title: 'Safety & Rules',
    icon: Shield,
    questions: [
      {
        question: 'What happens if someone submits fake proof?',
        answer:
          'Submitting fake proof is a serious violation. All claims are reviewed by admins before approval. If fake or doctored screenshots are detected, the claim will be rejected. Repeated violations may result in account suspension or ban. We take integrity seriously.',
      },
      {
        question: 'Can I report abuse?',
        answer:
          'Yes! If you encounter abuse, harassment, fake claims, or rule violations, please contact the admin team. You can report issues through the support channels or by messaging an admin directly. Include evidence when possible.',
      },
      {
        question: 'What are the platform rules?',
        answer:
          'Key rules: 1) No fake screenshots or proof, 2) No harassment or toxic behavior, 3) No exploiting bugs or glitches, 4) No creating duplicate accounts, 5) No boosting or collusion with other players, 6) Respect all players and admins. Breaking these rules may result in warnings, suspensions, or permanent bans.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'To delete your account, please contact an admin through the support channels. Account deletion is permanent and cannot be undone. All your data, including points, achievements, and bounties, will be removed.',
      },
    ],
  },
  {
    title: 'Technical',
    icon: Settings,
    questions: [
      {
        question: "Why isn't my player verification working?",
        answer:
          'Player verification issues can occur if: 1) The gamertag is spelled incorrectly, 2) The platform is wrong, 3) The player doesn\'t exist on that platform, 4) API services are temporarily down. Double-check the spelling and platform. If issues persist, try again later or contact support.',
      },
      {
        question: 'What browsers are supported?',
        answer:
          'The bounty system works best on modern browsers including: Chrome, Firefox, Edge, Safari, and Brave. Make sure your browser is up to date for the best experience. Mobile browsers are also supported.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'Currently, there is no dedicated mobile app. However, the website is fully responsive and works great on mobile browsers. You can add it to your home screen for a near-app experience. A mobile app may be developed in the future based on community demand.',
      },
      {
        question: 'How do I contact support?',
        answer:
          'For support, you can: 1) Join the Discord community (link below), 2) Message the admin team directly, 3) Create an issue on the GitHub repository if it\'s a technical bug. We aim to respond to all support requests within 24-48 hours.',
      },
    ],
  },
]

function toggleSection(index: number) {
  if (expandedSections.value.has(index)) {
    expandedSections.value.delete(index)
  } else {
    expandedSections.value.add(index)
  }
}

function toggleQuestion(sectionIndex: number, questionIndex: number) {
  const key = `${sectionIndex}-${questionIndex}`
  if (expandedQuestions.value.has(key)) {
    expandedQuestions.value.delete(key)
  } else {
    expandedQuestions.value.add(key)
  }
}

function isQuestionExpanded(sectionIndex: number, questionIndex: number): boolean {
  return expandedQuestions.value.has(`${sectionIndex}-${questionIndex}`)
}

function isSectionExpanded(index: number): boolean {
  return expandedSections.value.has(index)
}

// Filter FAQ sections based on search query
const filteredSections = ref(faqSections)

function filterFAQs() {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    filteredSections.value = faqSections
    return
  }

  filteredSections.value = faqSections
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(query) || q.answer.toLowerCase().includes(query),
      ),
    }))
    .filter((section) => section.questions.length > 0)
}
</script>

<template>
  <div class="min-h-screen bg-transparent py-8">
    <div class="container mx-auto px-4">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about the Arc Raiders Bounty System"
      />

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
          <input
            v-model="searchQuery"
            @input="filterFAQs"
            type="text"
            placeholder="Search FAQs..."
            class="w-full pl-12 pr-4 py-3 bg-arc-card border-2 border-arc-brown/20 rounded-lg focus:outline-none focus:border-arc-red transition text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      <!-- FAQ Sections -->
      <div class="max-w-4xl mx-auto space-y-6">
        <div
          v-for="(section, sectionIndex) in filteredSections"
          :key="sectionIndex"
          class="bg-arc-card border-2 border-arc-brown/20 rounded-xl overflow-hidden"
        >
          <!-- Section Header -->
          <button
            @click="toggleSection(sectionIndex)"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-arc-beige transition"
          >
            <div class="flex items-center gap-3">
              <component :is="section.icon" class="text-arc-red" :size="24" />
              <h2 class="text-xl font-bold text-gray-900">{{ section.title }}</h2>
            </div>
            <div
              class="transform transition-transform"
              :class="{ 'rotate-180': isSectionExpanded(sectionIndex) }"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          <!-- Section Questions -->
          <div
            v-if="isSectionExpanded(sectionIndex)"
            class="border-t-2 border-arc-brown/20"
          >
            <div
              v-for="(faq, questionIndex) in section.questions"
              :key="questionIndex"
              class="border-b border-arc-brown/10 last:border-b-0"
            >
              <!-- Question -->
              <button
                @click="toggleQuestion(sectionIndex, questionIndex)"
                class="w-full px-6 py-4 text-left hover:bg-arc-beige/50 transition flex items-start justify-between gap-4"
              >
                <span class="font-semibold text-gray-900 flex-1">{{ faq.question }}</span>
                <div
                  class="transform transition-transform flex-shrink-0 mt-1"
                  :class="{ 'rotate-180': isQuestionExpanded(sectionIndex, questionIndex) }"
                >
                  <svg
                    class="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <!-- Answer -->
              <div
                v-if="isQuestionExpanded(sectionIndex, questionIndex)"
                class="px-6 pb-4 text-gray-700 bg-arc-beige/30"
              >
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div
        v-if="filteredSections.length === 0"
        class="text-center py-12 text-gray-600"
      >
        <HelpCircle class="mx-auto mb-4 text-gray-400" :size="48" />
        <p class="text-xl mb-2">No results found</p>
        <p class="text-gray-500">Try a different search term</p>
      </div>

      <!-- Still Have Questions Section -->
      <div
        class="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-arc-red/10 via-arc-yellow/10 to-arc-green/10 border-2 border-arc-red/30 rounded-xl p-8 text-center"
      >
        <MessageCircle class="mx-auto mb-4 text-arc-red" :size="48" />
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Still have questions?</h2>
        <p class="text-gray-700 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Join our Discord community or contact our support
          team for assistance.
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <a
            href="#"
            class="inline-flex items-center gap-2 bg-arc-red hover:bg-arc-red/80 text-black px-6 py-3 rounded-lg font-semibold transition shadow-md"
          >
            <MessageCircle :size="20" />
            Join Discord
          </a>
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 bg-arc-card hover:bg-arc-beige border-2 border-arc-red text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Home
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #8b7355;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6e5943;
}
</style>
