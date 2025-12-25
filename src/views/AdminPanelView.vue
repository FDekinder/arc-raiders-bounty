<!-- src/views/AdminPanelView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Video } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import { supabase } from '@/lib/supabase'
import type { User, RatOfTheDay } from '@/lib/supabase'

// Import admin components
import AdminUsersTab from '@/components/admin/AdminUsersTab.vue'
import AdminRatOfTheDayTab from '@/components/admin/AdminRatOfTheDayTab.vue'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()

// Redirect non-admin users
if (!currentUser || currentUser.role !== 'admin') {
  showError('Access denied. Admin privileges required.')
  router.push('/')
}
</script>

<template>
  <div class="admin-panel">
    <PageHeader title="Admin Panel">
      <template #subtitle>
        <p class="subtitle-text">Manage users and featured content</p>
      </template>
    </PageHeader>

    <!-- Rat of the Day Section -->
    <div class="admin-section">
      <div class="section-header">
        <Video :size="24" class="section-icon" />
        <h2 class="section-title">Rat of the Day</h2>
      </div>
      <AdminRatOfTheDayTab />
    </div>

    <!-- User Management Section -->
    <div class="admin-section">
      <div class="section-header">
        <Users :size="24" class="section-icon" />
        <h2 class="section-title">User Management</h2>
      </div>
      <AdminUsersTab />
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

.admin-section {
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.admin-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(220, 202, 4, 0.2);
}

.section-icon {
  color: #dcca04ff;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-section {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .section-header {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 640px) {
  .admin-section {
    padding: 1rem;
  }
}
</style>
