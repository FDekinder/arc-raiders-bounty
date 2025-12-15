<!-- src/components/RoleSelector.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { UserRole } from '@/lib/supabase'
import { Target, Crosshair } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: UserRole
}>()

const emit = defineEmits<{
  'update:modelValue': [role: UserRole]
  select: [role: UserRole]
}>()

const selectedRole = ref<UserRole | null>(props.modelValue || null)
const hoveredRole = ref<UserRole | null>(null)

function selectRole(role: UserRole) {
  selectedRole.value = role
  emit('update:modelValue', role)
  emit('select', role)
}

function getRoleInfo(role: UserRole) {
  if (role === 'BH') {
    return {
      title: 'Bounty Hunter',
      subtitle: 'Hunt down the rats',
      description:
        'You are the law. Track down and eliminate players with bounties on their heads. Earn rewards for every successful hunt.',
      color: 'arc-green',
      bgGradient: 'from-arc-green/20 to-arc-cyan/20',
      borderColor: 'border-arc-green',
      image: '/bounty_hunter_cropped.png',
      icon: Target,
    }
  } else {
    return {
      title: 'Proud Rat',
      subtitle: 'Player Killer',
      description:
        'Chaos is your playground. Hunt other players, create havoc, and wear your bounties with pride. The more wanted you are, the better.',
      color: 'arc-red',
      bgGradient: 'from-arc-red/20 to-arc-yellow/20',
      borderColor: 'border-arc-red',
      image: '/rat_player_killer_cropped.png',
      icon: Crosshair,
    }
  }
}
</script>

<template>
  <div class="role-selector min-h-screen bg-arc-cream text-arc-dark p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4">Choose Your Path</h1>
        <p class="text-xl text-arc-brown">
          This choice defines your journey in Arc Raiders. Choose wisely.
        </p>
      </div>

      <!-- Role Cards -->
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Bounty Hunter Card -->
        <div
          @click="selectRole('BH')"
          @mouseenter="hoveredRole = 'BH'"
          @mouseleave="hoveredRole = null"
          :class="[
            'role-card relative overflow-hidden rounded-lg cursor-pointer transition-all duration transform',
            selectedRole === 'BH'
              ? 'ring-4 ring-arc-green scale-105 shadow-2xl shadow-arc-green/50'
              : hoveredRole === 'BH'
                ? 'scale-105 shadow-xl'
                : 'scale-100',
            selectedRole && selectedRole !== 'BH' ? 'opacity-50' : 'opacity-100',
          ]"
          class="bg-gradient-to-br from-arc-green/10 to-arc-cyan/10 border-2 border-arc-green/50 hover:border-arc-green min-h-[600px]"
        >
          <!-- Background Image -->
          <div class="absolute inset-0 overflow-hidden">
            <img
              src="/bounty_hunter_cropped.png"
              alt="Bounty Hunter"
              class="w-full h-full object-cover opacity-40"
              onerror="this.style.display='none'"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-arc-cream via-arc-dark/80 to-transparent"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-3 bg-arc-green/20 rounded-lg">
                  <Target :size="32" class="text-arc-green" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-arc-green">Bounty Hunter</h2>
                  <p class="text-arc-cyan text-sm">BH</p>
                </div>
              </div>

              <p class="text-lg mb-6 text-gray-600">
                {{ getRoleInfo('BH').description }}
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-green rounded-full"></div>
                <span class="text-sm">Hunt players with bounties</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-green rounded-full"></div>
                <span class="text-sm">Earn rewards for eliminations</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-green rounded-full"></div>
                <span class="text-sm">Climb the hunter leaderboard</span>
              </div>
            </div>

            <!-- Selection Indicator -->
            <div
              v-if="selectedRole === 'BH'"
              class="mt-6 p-4 bg-arc-green/20 border border-arc-green rounded-lg text-center"
            >
              <p class="text-arc-green font-bold">✓ SELECTED</p>
            </div>
          </div>
        </div>

        <!-- Proud Rat Card -->
        <div
          @click="selectRole('PR')"
          @mouseenter="hoveredRole = 'PR'"
          @mouseleave="hoveredRole = null"
          :class="[
            'role-card relative overflow-hidden rounded-lg cursor-pointer transition-all duration transform',
            selectedRole === 'PR'
              ? 'ring-4 ring-arc-red scale-105 shadow-2xl shadow-arc-red/50'
              : hoveredRole === 'PR'
                ? 'scale-105 shadow-xl'
                : 'scale-100',
            selectedRole && selectedRole !== 'PR' ? 'opacity-50' : 'opacity-100',
          ]"
          class="bg-gradient-to-br from-arc-red/10 to-arc-yellow/10 border-2 border-arc-red/50 hover:border-arc-red min-h-[600px]"
        >
          <!-- Background Image -->
          <div class="absolute inset-0 overflow-hidden">
            <img
              src="/rat_player_killer_cropped.png"
              alt="Proud Rat"
              class="w-full h-full object-cover opacity-40"
              onerror="this.style.display='none'"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-arc-cream via-arc-dark/80 to-transparent"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-3 bg-arc-red/20 rounded-lg">
                  <Crosshair :size="32" class="text-arc-red" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-arc-red">Proud Rat</h2>
                  <p class="text-arc-yellow text-sm">PR - Player Killer</p>
                </div>
              </div>

              <p class="text-lg mb-6 text-gray-600">
                {{ getRoleInfo('PR').description }}
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-red rounded-full"></div>
                <span class="text-sm">Hunt any player, anywhere</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-red rounded-full"></div>
                <span class="text-sm">Accumulate bounties on your head</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-arc-red rounded-full"></div>
                <span class="text-sm">Become the most wanted player</span>
              </div>
            </div>

            <!-- Selection Indicator -->
            <div
              v-if="selectedRole === 'PR'"
              class="mt-6 p-4 bg-arc-red/20 border border-arc-red rounded-lg text-center"
            >
              <p class="text-arc-red font-bold">✓ SELECTED</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Note -->
      <div v-if="selectedRole" class="mt-8 text-center">
        <p class="text-arc-brown text-sm">
          Don't worry, you can change your role later in your profile settings
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-card {
  backdrop-filter: blur(10px);
}

.role-card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
</style>
