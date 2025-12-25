<!-- src/views/AdminPanelView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Bug, Video, Settings } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import { supabase } from '@/lib/supabase'
import type { User, RatOfTheDay } from '@/lib/supabase'

// Import admin components (we'll create these as separate components)
import AdminUsersTab from '@/components/admin/AdminUsersTab.vue'
import AdminBugReportsTab from '@/components/admin/AdminBugReportsTab.vue'
import AdminRatOfTheDayTab from '@/components/admin/AdminRatOfTheDayTab.vue'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()

// Redirect non-admin users
if (!currentUser || currentUser.role !== 'admin') {
  showError('Access denied. Admin privileges required.')
  router.push('/')
}

const activeTab = ref<'users' | 'bug-reports' | 'rat-of-the-day'>('users')

const tabs = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'bug-reports', label: 'Bug Reports', icon: Bug },
  { id: 'rat-of-the-day', label: 'Rat of the Day', icon: Video },
]

function switchTab(tabId: 'users' | 'bug-reports' | 'rat-of-the-day') {
  activeTab.value = tabId
}
</script>

<template>
  <div class="admin-panel">
    <PageHeader title="Admin Panel">
      <template #subtitle>
        <p class="subtitle-text">Manage users, bug reports, and featured content</p>
      </template>
    </PageHeader>

    <!-- Tab Navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="switchTab(tab.id as any)"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          <component :is="tab.icon" :size="20" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <AdminUsersTab v-if="activeTab === 'users'" />
      <AdminBugReportsTab v-if="activeTab === 'bug-reports'" />
      <AdminRatOfTheDayTab v-if="activeTab === 'rat-of-the-day'" />
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
}

.subtitle-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

/* Tabs Navigation */
.tabs-container {
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.tab-button.active {
  color: #dcca04ff;
  border-bottom-color: #dcca04ff;
  background: rgba(220, 202, 4, 0.05);
}

.tab-button svg {
  flex-shrink: 0;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .tabs-nav {
    gap: 0;
  }

  .tab-button {
    flex: 1;
    justify-content: center;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }

  .tab-button span {
    display: none;
  }

  .tab-button svg {
    margin: 0;
  }
}

@media (min-width: 769px) {
  .tabs-nav::-webkit-scrollbar {
    display: none;
  }
}
</style>
