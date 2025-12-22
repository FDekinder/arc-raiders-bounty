<template>
  <div class="classified-doc" @click="$emit('click')">
    <!-- Header with rank badge -->
    <div class="doc-header">
      <div class="registered-stamp">
        <div class="stamp-text">REGISTERED</div>
        <div class="stamp-number">№ {{ formattedRank }}</div>
      </div>

      <div class="redaction-bars">
        <div class="redaction-bar"></div>
        <div class="redaction-bar"></div>
        <div class="redaction-bar"></div>
      </div>

      <div class="report-number">REPORT: {{ reportNumber }}</div>
    </div>

    <!-- Top Secret Stamp -->
    <div class="top-secret-stamp">TOP SECRET</div>

    <!-- Classified Title -->
    <div class="classified-title">C L A S S I F I E D</div>
    <div class="title-underline"></div>

    <!-- Mission and Object (redacted) -->
    <div class="field-row">
      <span class="field-label">Mission:</span>
      <div class="redacted-field-short"></div>
    </div>

    <div class="field-row">
      <span class="field-label">Object:</span>
      <div class="redacted-field-long"></div>
    </div>

    <div class="section-divider"></div>

    <!-- Agent Name -->
    <div class="field-section">
      <div class="field-label-main">Agent Name:</div>
      <div class="field-value-main">{{ gamertag }}</div>
    </div>

    <!-- Alias (empty) -->
    <div class="field-section">
      <div class="field-label-main">Alias(es):</div>
      <div class="field-value-empty"></div>
    </div>

    <!-- Faction/Organization (Platform) -->
    <div class="field-section">
      <div class="field-label-main">Faction/Organization:</div>
      <div class="field-value-main platform-badge">
        <component :is="getPlatformIcon()" class="platform-icon" />
        {{ getPlatformName() }}
      </div>
    </div>

    <div class="section-divider"></div>

    <!-- Primary Skillset (empty) -->
    <div class="field-section">
      <div class="field-label-main">Primary Skillset:</div>
      <div class="field-value-empty"></div>
    </div>

    <!-- Last Known Location (empty) -->
    <div class="field-section">
      <div class="field-label-main">Last Known Location:</div>
      <div class="field-value-empty"></div>
    </div>

    <!-- Character Dossier/Description -->
    <div class="field-section">
      <div class="field-label-main">Character Dossier/Description:</div>
      <div class="dossier-box">
        <!-- Redacted victim names with kill counts -->
        <div
          v-for="(victim, index) in displayVictims"
          :key="index"
          class="victim-entry"
        >
          <div class="redacted-name"></div>
          <div class="kill-count">{{ victim.count }}</div>
        </div>

        <!-- Show ellipsis if more than 5 victims -->
        <div v-if="hasMoreVictims" class="more-victims">...</div>
      </div>
    </div>

    <!-- Authorized signatures -->
    <div class="signatures">
      <div class="signature-line">Authorized:</div>
      <div class="signature-scribble-1"></div>
      <div class="signature-scribble-2"></div>
    </div>

    <!-- Kill count in bottom right -->
    <div class="total-kills">
      <div class="kills-label">CONFIRMED KILLS</div>
      <div class="kills-value">{{ totalKills }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, Gamepad2 } from 'lucide-vue-next'
import type { Platform } from '@/lib/supabase'

interface VictimKill {
  victim_gamertag: string
  count: number
}

interface Props {
  rank: 1 | 2 | 3
  gamertag: string
  platform?: Platform
  victims: VictimKill[]
  totalKills: number
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const formattedRank = computed(() => {
  return props.rank.toString().padStart(7, '162') + '560'
})

const reportNumber = computed(() => {
  const base = 165789
  return (base + props.rank).toString().padStart(8, '0')
})

const displayVictims = computed(() => {
  return props.victims.slice(0, 5)
})

const hasMoreVictims = computed(() => {
  return props.victims.length > 5
})

function getPlatformIcon() {
  switch (props.platform) {
    case 'steam':
      return Monitor
    case 'xbox':
    case 'playstation':
      return Gamepad2
    default:
      return Monitor
  }
}

function getPlatformName() {
  switch (props.platform) {
    case 'steam':
      return 'PC (Steam)'
    case 'xbox':
      return 'Xbox'
    case 'playstation':
      return 'PlayStation'
    default:
      return 'Unknown'
  }
}
</script>

<style scoped>
.classified-doc {
  position: relative;
  background: linear-gradient(135deg, #db9944 0%, #c88a3e 100%);
  border: 3px solid #8b6028;
  border-radius: 4px;
  padding: 20px 32px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
  overflow: visible;
  max-width: 100%;
}

.classified-doc:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #e5a655 0%, #d29449 100%);
}

/* Header */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.registered-stamp {
  border: 2px solid #000;
  padding: 4px 8px;
  transform: rotate(-15deg);
  background: white;
}

.stamp-text {
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
}

.stamp-number {
  font-size: 8px;
  margin-top: 2px;
}

.redaction-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  max-width: 200px;
  margin: 0 16px;
}

.redaction-bar {
  height: 14px;
  background: #000;
  border-radius: 2px;
}

.report-number {
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
}

/* Top Secret Stamp */
.top-secret-stamp {
  position: absolute;
  top: 40px;
  right: 40px;
  border: 4px solid #ff0000;
  color: #ff0000;
  padding: 8px 16px;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
  transform: rotate(15deg);
  background: rgba(255, 255, 255, 0.9);
}

/* Classified Title */
.classified-title {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 4px;
  text-align: center;
  margin: 12px 0 6px;
  white-space: nowrap;
  overflow: hidden;
}

.title-underline {
  height: 2px;
  background: #000;
  margin-bottom: 12px;
}

/* Field Rows */
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.field-label {
  font-weight: bold;
  font-size: 14px;
}

.redacted-field-short {
  height: 16px;
  width: 120px;
  background: #000;
  border-radius: 2px;
}

.redacted-field-long {
  height: 16px;
  flex: 1;
  max-width: 300px;
  background: #000;
  border-radius: 2px;
}

/* Section Divider */
.section-divider {
  height: 1px;
  background: #000;
  margin: 10px 0;
}

/* Field Sections */
.field-section {
  margin-bottom: 8px;
}

.field-label-main {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  text-decoration: underline;
}

.field-value-main {
  font-size: 16px;
  font-weight: 600;
  padding-left: 8px;
}

.field-value-empty {
  height: 1px;
  background: #666;
  width: 100%;
  margin-top: 4px;
}

.platform-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-icon {
  width: 20px;
  height: 20px;
}

/* Dossier Box */
.dossier-box {
  border: 2px solid #000;
  background: rgba(255, 255, 255, 0.3);
  padding: 12px;
  min-height: 100px;
  margin-top: 6px;
}

.victim-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.redacted-name {
  height: 14px;
  flex: 1;
  background: #000;
  border-radius: 2px;
}

.kill-count {
  font-size: 18px;
  font-weight: bold;
  color: #ff0000;
  min-width: 30px;
  text-align: right;
}

.more-victims {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-top: 8px;
  letter-spacing: 4px;
}

/* Signatures */
.signatures {
  position: relative;
  margin-top: 16px;
  margin-bottom: 32px;
}

.signature-line {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}

.signature-scribble-1,
.signature-scribble-2 {
  position: absolute;
  height: 40px;
  width: 200px;
}

.signature-scribble-1 {
  left: 100px;
  top: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40"><path d="M10,20 Q30,5 50,20 T90,20 Q110,30 130,15 T170,25" stroke="black" stroke-width="2" fill="none"/></svg>') no-repeat center;
  background-size: contain;
}

.signature-scribble-2 {
  right: 50px;
  top: 5px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40"><path d="M10,15 Q20,25 40,15 T80,20 Q100,10 120,25 T160,18" stroke="black" stroke-width="2" fill="none"/></svg>') no-repeat center;
  background-size: contain;
}

/* Total Kills */
.total-kills {
  position: absolute;
  bottom: 16px;
  right: 24px;
  text-align: right;
}

.kills-label {
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.kills-value {
  font-size: 32px;
  font-weight: 900;
  color: #ff0000;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .classified-doc {
    padding: 24px 16px 20px;
  }

  .classified-title {
    font-size: 18px;
    letter-spacing: 2px;
  }

  .top-secret-stamp {
    font-size: 16px;
    padding: 6px 12px;
    top: 30px;
    right: 20px;
  }

  .redaction-bars {
    max-width: 120px;
  }

  .field-value-main {
    font-size: 14px;
  }

  .kills-value {
    font-size: 24px;
  }
}
</style>
