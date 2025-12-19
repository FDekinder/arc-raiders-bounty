<script setup lang="ts">
import { Target, Trophy, Users } from 'lucide-vue-next'
import Card from '@/components/Card.vue'
import TacticalButton from '@/components/TacticalButton.vue'
import IconTarget from '@/components/icons/IconTarget.vue'
import IconBounty from '@/components/icons/IconBounty.vue'
import IconHunter from '@/components/icons/IconHunter.vue'
import IconTrophy from '@/components/icons/IconTrophy.vue'
</script>

<template>
  <div class="min-h-screen bg-arc-cream p-8">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-arc-dark mb-2">Design System Comparison</h1>
        <p class="text-arc-brown">Old vs New - See the difference</p>
      </div>

      <!-- Cards Comparison -->
      <section>
        <h2 class="text-2xl font-bold text-arc-dark mb-6">Card Shapes</h2>

        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <p class="text-sm text-arc-brown mb-2 font-semibold">OLD: Rounded Corners</p>
            <div class="bg-arc-card rounded-lg p-6 border border-arc-brown/20">
              <Target :size="32" class="text-arc-cyan mb-3" />
              <h3 class="text-xl font-bold text-arc-dark mb-2">Target Located</h3>
              <p class="text-arc-brown">Standard rounded card with generic icon</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-arc-brown mb-2 font-semibold">NEW: Angled Corners</p>
            <Card variant="angled" padding="lg">
              <IconTarget :size="32" className="text-arc-cyan mb-3" />
              <h3 class="text-xl font-bold text-arc-dark mb-2">Target Located</h3>
              <p class="text-arc-brown">Tactical angled card with custom icon</p>
            </Card>
          </div>

          <div>
            <p class="text-sm text-arc-brown mb-2 font-semibold">NEW: With Corner Brackets</p>
            <Card variant="bordered" padding="lg" :corners="true">
              <IconTarget :size="32" className="text-arc-cyan mb-3" />
              <h3 class="text-xl font-bold text-arc-dark mb-2">Target Located</h3>
              <p class="text-arc-brown">HUD-style corner brackets</p>
            </Card>
          </div>
        </div>
      </section>

      <!-- Icons Comparison -->
      <section>
        <h2 class="text-2xl font-bold text-arc-dark mb-6">Icon Styles</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <Card variant="default" padding="lg">
            <h3 class="text-lg font-semibold text-arc-dark mb-4">OLD: Lucide Icons (Rounded)</h3>
            <div class="flex gap-6">
              <div class="text-center">
                <Target :size="48" class="text-arc-cyan mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Target</p>
              </div>
              <div class="text-center">
                <Trophy :size="48" class="text-arc-yellow mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Trophy</p>
              </div>
              <div class="text-center">
                <Users :size="48" class="text-arc-brown mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Users</p>
              </div>
            </div>
          </Card>

          <Card variant="angled" padding="lg">
            <h3 class="text-lg font-semibold text-arc-dark mb-4">NEW: Custom Icons (Angular)</h3>
            <div class="flex gap-6">
              <div class="text-center">
                <IconTarget :size="48" className="text-arc-cyan mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Target</p>
              </div>
              <div class="text-center">
                <IconTrophy :size="48" className="text-arc-yellow mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Trophy</p>
              </div>
              <div class="text-center">
                <IconHunter :size="48" className="text-arc-brown mx-auto mb-2" />
                <p class="text-sm text-arc-brown">Hunter</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <!-- Buttons Comparison -->
      <section>
        <h2 class="text-2xl font-bold text-arc-dark mb-6">Button Styles</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <Card variant="default" padding="lg">
            <h3 class="text-lg font-semibold text-arc-dark mb-4">OLD: Standard Rounded Buttons</h3>
            <div class="space-y-3">
              <button class="w-full px-4 py-2 bg-arc-brown text-white rounded-lg hover:bg-arc-brown/90">
                Primary Action
              </button>
              <button class="w-full px-4 py-2 bg-arc-cyan/20 text-arc-brown border border-arc-cyan rounded-lg hover:bg-arc-cyan/30">
                Secondary Action
              </button>
              <button class="w-full px-4 py-2 bg-transparent text-arc-brown border border-arc-brown rounded-lg hover:bg-arc-brown/10">
                Outline Action
              </button>
            </div>
          </Card>

          <Card variant="angled" padding="lg">
            <h3 class="text-lg font-semibold text-arc-dark mb-4">NEW: Tactical Angular Buttons</h3>
            <div class="space-y-3">
              <TacticalButton variant="primary" :fullWidth="true">
                <template #icon>
                  <IconBounty :size="20" />
                </template>
                Primary Action
              </TacticalButton>
              <TacticalButton variant="secondary" :fullWidth="true">
                <template #icon>
                  <IconTarget :size="20" />
                </template>
                Secondary Action
              </TacticalButton>
              <TacticalButton variant="outline" :fullWidth="true">
                <template #icon>
                  <IconHunter :size="20" />
                </template>
                Outline Action
              </TacticalButton>
            </div>
          </Card>
        </div>
      </section>

      <!-- Bounty Card Example -->
      <section>
        <h2 class="text-2xl font-bold text-arc-dark mb-6">Bounty Card Example</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-arc-brown mb-2 font-semibold">OLD STYLE</p>
            <div class="bg-arc-card rounded-lg p-6 border border-arc-brown/20">
              <div class="flex items-center gap-4 mb-4">
                <Target :size="24" class="text-arc-red" />
                <div>
                  <h3 class="text-xl font-bold text-arc-dark">xXSniperXx</h3>
                  <p class="text-sm text-arc-brown">Target ID: #12345</p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-arc-brown">Bounty Amount</p>
                  <p class="text-2xl font-bold text-arc-yellow">5,000 pts</p>
                </div>
                <button class="px-4 py-2 bg-arc-red text-white rounded-lg hover:bg-arc-red/90">
                  Hunt Target
                </button>
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm text-arc-brown mb-2 font-semibold">NEW STYLE</p>
            <Card variant="angled" :corners="true" hover>
              <div class="flex items-center gap-4 mb-4">
                <IconTarget :size="24" className="text-arc-red" />
                <div>
                  <h3 class="text-xl font-bold text-arc-dark">xXSniperXx</h3>
                  <p class="text-sm text-arc-brown">Target ID: #12345</p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-arc-brown">Bounty Amount</p>
                  <p class="text-2xl font-bold text-arc-yellow">5,000 pts</p>
                </div>
                <TacticalButton variant="danger">
                  <template #icon>
                    <IconHunter :size="18" />
                  </template>
                  Hunt Target
                </TacticalButton>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <!-- Key Differences -->
      <section>
        <Card variant="bordered" padding="lg">
          <h2 class="text-2xl font-bold text-arc-dark mb-4">Key Differences</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-arc-red mb-2">❌ Old Design Problems:</h3>
              <ul class="space-y-1 text-arc-brown">
                <li>• Generic rounded corners (like every other site)</li>
                <li>• Standard Lucide icons (boring, overused)</li>
                <li>• No distinctive identity</li>
                <li>• Looks like AI template</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-arc-green mb-2">✅ New Design Benefits:</h3>
              <ul class="space-y-1 text-arc-brown">
                <li>• Tactical angular corners (unique, game-appropriate)</li>
                <li>• Custom angular icons (matches Arc Raiders aesthetic)</li>
                <li>• HUD-style corner brackets (immersive)</li>
                <li>• Animated corner accents on buttons</li>
                <li>• Professional, polished look</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <!-- Note -->
      <Card variant="angled" padding="lg">
        <div class="text-center">
          <IconTarget :size="48" className="text-arc-cyan mx-auto mb-4" />
          <h3 class="text-xl font-bold text-arc-dark mb-2">Ready to Apply?</h3>
          <p class="text-arc-brown mb-4">
            This demo shows the new design components. To apply them to your site,
            I can update your main pages (Home, Bounties, Leaderboard) to use these new styles.
          </p>
          <TacticalButton variant="primary" size="lg">
            <template #icon>
              <IconBounty :size="20" />
            </template>
            Let's Update the Site!
          </TacticalButton>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Any additional demo-specific styles */
</style>
