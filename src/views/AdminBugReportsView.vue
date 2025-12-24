<!-- src/views/AdminBugReportsView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bug, CheckCircle, Clock, XCircle, AlertCircle, Filter, Edit, Save, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()

// Redirect non-admin users
if (!currentUser || currentUser.role !== 'admin') {
  showError('Access denied. Admin privileges required.')
  router.push('/')
}

interface BugReport {
  id: string
  user_id: string | null
  username: string
  bug_type: 'bug' | 'feature' | 'improvement' | 'other'
  title: string
  description: string
  steps_to_reproduce: string | null
  expected_behavior: string | null
  actual_behavior: string | null
  browser_info: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
  admin_notes: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

const reports = ref<BugReport[]>([])
const loading = ref(true)
const selectedType = ref<string>('all')
const selectedStatus = ref<string>('all')
const editingReport = ref<string | null>(null)
const editingNotes = ref('')
const editingStatus = ref<BugReport['status']>('open')

const bugTypeOptions = [
  { value: 'all', label: 'All Types', emoji: '📋' },
  { value: 'bug', label: 'Bug Reports', emoji: '🐛' },
  { value: 'feature', label: 'Feature Requests', emoji: '💡' },
  { value: 'improvement', label: 'Improvements', emoji: '⚡' },
  { value: 'other', label: 'Other', emoji: '📝' },
]

const statusOptions = [
  { value: 'all', label: 'All Status', color: 'gray' },
  { value: 'open', label: 'Open', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
  { value: 'wont_fix', label: "Won't Fix", color: 'red' },
]

const filteredReports = computed(() => {
  let filtered = reports.value

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(r => r.bug_type === selectedType.value)
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(r => r.status === selectedStatus.value)
  }

  return filtered
})

const stats = computed(() => ({
  total: reports.value.length,
  open: reports.value.filter(r => r.status === 'open').length,
  in_progress: reports.value.filter(r => r.status === 'in_progress').length,
  resolved: reports.value.filter(r => r.status === 'resolved').length,
}))

async function fetchReports() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    reports.value = data || []
  } catch (err: any) {
    showError('Failed to load bug reports')
    console.error(err)
  } finally {
    loading.value = false
  }
}

function startEditing(report: BugReport) {
  editingReport.value = report.id
  editingNotes.value = report.admin_notes || ''
  editingStatus.value = report.status
}

function cancelEditing() {
  editingReport.value = null
  editingNotes.value = ''
}

async function saveReport(report: BugReport) {
  try {
    const updates: Partial<BugReport> = {
      status: editingStatus.value,
      admin_notes: editingNotes.value.trim() || null,
      updated_at: new Date().toISOString(),
    }

    // Set resolved_at if status is resolved
    if (editingStatus.value === 'resolved' && report.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('bug_reports')
      .update(updates)
      .eq('id', report.id)

    if (error) throw error

    success('Report updated successfully')
    editingReport.value = null
    await fetchReports()
  } catch (err: any) {
    showError('Failed to update report')
    console.error(err)
  }
}

function getStatusColor(status: BugReport['status']) {
  const option = statusOptions.find(s => s.value === status)
  return option?.color || 'gray'
}

function getBugTypeEmoji(type: BugReport['bug_type']) {
  const option = bugTypeOptions.find(t => t.value === type)
  return option?.emoji || '📝'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <div class="min-h-screen bg-transparent py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <PageHeader
        title="Bug Reports Admin"
        subtitle="Manage bug reports, feature requests, and user feedback"
      />

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-label">Total Reports</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Open</div>
          <div class="stat-value text-blue-600">{{ stats.open }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">In Progress</div>
          <div class="stat-value text-yellow-600">{{ stats.in_progress }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Resolved</div>
          <div class="stat-value text-green-600">{{ stats.resolved }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section mb-6">
        <div class="filter-group">
          <label class="filter-label">
            <Filter :size="16" />
            Type
          </label>
          <select v-model="selectedType" class="filter-select">
            <option v-for="type in bugTypeOptions" :key="type.value" :value="type.value">
              {{ type.emoji }} {{ type.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <Filter :size="16" />
            Status
          </label>
          <select v-model="selectedStatus" class="filter-select">
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin inline-block w-12 h-12 border-4 border-arc-red border-t-transparent rounded-full"></div>
        <p class="mt-4 text-gray-600">Loading reports...</p>
      </div>

      <!-- No Reports -->
      <div v-else-if="filteredReports.length === 0" class="text-center py-12">
        <Bug :size="64" class="mx-auto text-gray-400 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
        <p class="text-gray-600">No bug reports match your current filters.</p>
      </div>

      <!-- Reports List -->
      <div v-else class="space-y-4">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="report-card"
        >
          <!-- Header -->
          <div class="report-header">
            <div class="flex items-start gap-3 flex-1">
              <span class="text-3xl">{{ getBugTypeEmoji(report.bug_type) }}</span>
              <div class="flex-1 min-w-0">
                <h3 class="report-title">{{ report.title }}</h3>
                <div class="report-meta">
                  <span>By {{ report.username }}</span>
                  <span>•</span>
                  <span>{{ formatDate(report.created_at) }}</span>
                </div>
              </div>
            </div>
            <div :class="['status-badge', `status-${getStatusColor(report.status)}`]">
              {{ statusOptions.find(s => s.value === report.status)?.label }}
            </div>
          </div>

          <!-- Body -->
          <div class="report-body">
            <div class="mb-4">
              <h4 class="section-title">Description</h4>
              <p class="text-gray-700 whitespace-pre-wrap">{{ report.description }}</p>
            </div>

            <template v-if="report.bug_type === 'bug'">
              <div v-if="report.steps_to_reproduce" class="mb-4">
                <h4 class="section-title">Steps to Reproduce</h4>
                <p class="text-gray-700 whitespace-pre-wrap">{{ report.steps_to_reproduce }}</p>
              </div>

              <div v-if="report.expected_behavior || report.actual_behavior" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div v-if="report.expected_behavior">
                  <h4 class="section-title">Expected Behavior</h4>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ report.expected_behavior }}</p>
                </div>
                <div v-if="report.actual_behavior">
                  <h4 class="section-title">Actual Behavior</h4>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ report.actual_behavior }}</p>
                </div>
              </div>
            </template>

            <div class="mb-4">
              <h4 class="section-title">Browser Info</h4>
              <p class="text-xs text-gray-600 font-mono">{{ report.browser_info }}</p>
            </div>

            <!-- Admin Section -->
            <div class="admin-section">
              <template v-if="editingReport === report.id">
                <!-- Edit Mode -->
                <div class="space-y-4">
                  <div>
                    <label class="form-label">Status</label>
                    <select v-model="editingStatus" class="input-field">
                      <option
                        v-for="status in statusOptions.filter(s => s.value !== 'all')"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label">Admin Notes</label>
                    <textarea
                      v-model="editingNotes"
                      class="input-field"
                      rows="3"
                      placeholder="Add internal notes about this report..."
                    ></textarea>
                  </div>

                  <div class="flex gap-2">
                    <button @click="saveReport(report)" class="btn-save">
                      <Save :size="16" />
                      Save Changes
                    </button>
                    <button @click="cancelEditing" class="btn-cancel-edit">
                      <X :size="16" />
                      Cancel
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <!-- View Mode -->
                <div v-if="report.admin_notes" class="mb-3">
                  <h4 class="section-title">Admin Notes</h4>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ report.admin_notes }}</p>
                </div>

                <button @click="startEditing(report)" class="btn-edit">
                  <Edit :size="16" />
                  Edit Report
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply bg-arc-card border-2 border-arc-brown/20 rounded-lg p-4;
}

.stat-label {
  @apply text-sm text-gray-600 mb-1;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.filters-section {
  @apply bg-arc-card border-2 border-arc-brown/20 rounded-lg p-4 flex flex-wrap gap-4;
}

.filter-group {
  @apply flex-1 min-w-[200px];
}

.filter-label {
  @apply flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2;
}

.filter-select {
  @apply w-full px-4 py-2 bg-white border-2 border-arc-brown/20 rounded-lg focus:outline-none focus:border-arc-red transition text-gray-900;
}

.report-card {
  @apply bg-arc-card border-2 border-arc-brown/20 rounded-lg overflow-hidden;
}

.report-header {
  @apply p-4 sm:p-6 border-b border-arc-brown/20 flex items-start justify-between gap-4;
}

.report-title {
  @apply text-lg sm:text-xl font-bold text-gray-900 mb-1;
}

.report-meta {
  @apply text-sm text-gray-600 flex items-center gap-2;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap;
}

.status-blue {
  @apply bg-blue-100 text-blue-800;
}

.status-yellow {
  @apply bg-yellow-100 text-yellow-800;
}

.status-green {
  @apply bg-green-100 text-green-800;
}

.status-gray {
  @apply bg-gray-100 text-gray-800;
}

.status-red {
  @apply bg-red-100 text-red-800;
}

.report-body {
  @apply p-4 sm:p-6;
}

.section-title {
  @apply text-sm font-bold text-gray-900 mb-2;
}

.admin-section {
  @apply mt-6 pt-6 border-t-2 border-arc-brown/20;
}

.form-label {
  @apply block text-sm font-semibold text-gray-900 mb-2;
}

.input-field {
  @apply w-full px-4 py-2 bg-white border-2 border-arc-brown/20 rounded-lg focus:outline-none focus:border-arc-red transition text-gray-900;
}

.btn-edit {
  @apply flex items-center gap-2 px-4 py-2 bg-arc-red hover:bg-arc-red/80 text-white rounded-lg font-semibold transition;
}

.btn-save {
  @apply flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition;
}

.btn-cancel-edit {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition;
}
</style>
