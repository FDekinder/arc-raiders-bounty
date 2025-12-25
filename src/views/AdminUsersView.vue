<!-- src/views/AdminUsersView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, UserPlus, Clock, Filter, Search, Shield, Crown, Calendar, Trophy, Target, Skull } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { getCurrentUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader.vue'
import IconInput from '@/components/IconInput.vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

const router = useRouter()
const { success, error: showError } = useToast()

const currentUser = getCurrentUser()

// Redirect non-admin users
if (!currentUser || currentUser.role !== 'admin') {
  showError('Access denied. Admin privileges required.')
  router.push('/')
}

const users = ref<User[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedRole = ref<string>('all')
const selectedGameRole = ref<string>('all')
const sortBy = ref<'newest' | 'oldest' | 'most-active' | 'points'>('newest')

const roleOptions = [
  { value: 'all', label: 'All Roles', icon: Users },
  { value: 'admin', label: 'Admins', icon: Shield },
  { value: 'user', label: 'Users', icon: Users },
]

const gameRoleOptions = [
  { value: 'all', label: 'All Game Roles' },
  { value: 'BH', label: 'Bounty Hunters' },
  { value: 'PR', label: 'Proud Rats' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-active', label: 'Most Active' },
  { value: 'points', label: 'Highest Points' },
]

const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      u =>
        u.username.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.steam_id?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(u => u.role === selectedRole.value)
  }

  // Game role filter
  if (selectedGameRole.value !== 'all') {
    filtered = filtered.filter(u => u.game_role === selectedGameRole.value)
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'most-active':
        return (
          b.bounties_completed + b.bounties_created + b.kill_count - (a.bounties_completed + a.bounties_created + a.kill_count)
        )
      case 'points':
        return b.total_points - a.total_points
      default:
        return 0
    }
  })

  return filtered
})

const stats = computed(() => ({
  total: users.value.length,
  admins: users.value.filter(u => u.role === 'admin').length,
  bountyHunters: users.value.filter(u => u.game_role === 'BH').length,
  proudRats: users.value.filter(u => u.game_role === 'PR').length,
  premium: users.value.filter(u => u.subscription_tier === 'premium').length,
  today: users.value.filter(u => {
    const createdAt = new Date(u.created_at)
    const today = new Date()
    return createdAt.toDateString() === today.toDateString()
  }).length,
  thisWeek: users.value.filter(u => {
    const createdAt = new Date(u.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdAt >= weekAgo
  }).length,
}))

async function fetchUsers() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    users.value = data || []
  } catch (err: any) {
    showError('Failed to load users')
    console.error(err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

function getPlatformBadgeColor(platform?: string) {
  switch (platform) {
    case 'steam':
      return 'bg-blue-500/20 text-blue-300'
    case 'xbox':
      return 'bg-green-500/20 text-green-300'
    case 'playstation':
      return 'bg-indigo-500/20 text-indigo-300'
    default:
      return 'bg-gray-500/20 text-gray-300'
  }
}

function getGameRoleBadge(role?: string) {
  if (role === 'BH') {
    return { label: 'Bounty Hunter', color: 'bg-arc-orange/20 text-arc-orange' }
  } else if (role === 'PR') {
    return { label: 'Proud Rat', color: 'bg-red-500/20 text-red-400' }
  }
  return { label: 'No Role', color: 'bg-gray-500/20 text-gray-400' }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="admin-users-view">
    <PageHeader title="User Management">
      <template #subtitle>
        <p class="subtitle-text">View and manage all registered users</p>
      </template>
    </PageHeader>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users-icon">
          <Users :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon new-icon">
          <UserPlus :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.today }}</div>
          <div class="stat-label">Today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon week-icon">
          <Calendar :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.thisWeek }}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon admin-icon">
          <Shield :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.admins }}</div>
          <div class="stat-label">Admins</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bh-icon">
          <Target :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.bountyHunters }}</div>
          <div class="stat-label">Bounty Hunters</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pr-icon">
          <Skull :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.proudRats }}</div>
          <div class="stat-label">Proud Rats</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon premium-icon">
          <Crown :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.premium }}</div>
          <div class="stat-label">Premium</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <IconInput v-model="searchQuery" :icon="Search" placeholder="Search by username, email, or Steam ID..." />

      <div class="filter-group">
        <label class="filter-label">
          <Filter :size="16" />
          Role
        </label>
        <select v-model="selectedRole" class="filter-select">
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Game Role</label>
        <select v-model="selectedGameRole" class="filter-select">
          <option v-for="option in gameRoleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Sort By</label>
        <select v-model="sortBy" class="filter-select">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-count">
      Showing {{ filteredUsers.length }} of {{ stats.total }} users
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Clock :size="32" class="spin" />
      <p>Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="filteredUsers.length > 0" class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Platform</th>
            <th>Game Role</th>
            <th>Stats</th>
            <th>Tier</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <!-- User Info -->
            <td class="user-cell">
              <div class="user-info">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.username"
                  class="user-avatar"
                />
                <div v-else class="user-avatar-placeholder">
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
                <div class="user-details">
                  <div class="user-name">
                    <span class="username">{{ user.username }}</span>
                    <span v-if="user.clan_tag" class="clan-tag">[{{ user.clan_tag }}]</span>
                    <Shield v-if="user.role === 'admin'" :size="14" class="admin-badge" title="Admin" />
                  </div>
                  <div v-if="user.steam_id" class="user-steam">{{ user.steam_id }}</div>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="email-cell">
              <span v-if="user.email" class="email">{{ user.email }}</span>
              <span v-else class="no-email">No email</span>
            </td>

            <!-- Platform -->
            <td class="platform-cell">
              <span v-if="user.platform" :class="['platform-badge', getPlatformBadgeColor(user.platform)]">
                {{ user.platform }}
              </span>
              <span v-else class="no-platform">-</span>
            </td>

            <!-- Game Role -->
            <td class="role-cell">
              <span :class="['role-badge', getGameRoleBadge(user.game_role).color]">
                {{ getGameRoleBadge(user.game_role).label }}
              </span>
            </td>

            <!-- Stats -->
            <td class="stats-cell">
              <div class="user-stats">
                <div class="stat-item" title="Total Points">
                  <Trophy :size="14" />
                  {{ user.total_points }}
                </div>
                <div class="stat-item" title="Bounties Completed">
                  <Target :size="14" />
                  {{ user.bounties_completed }}
                </div>
                <div v-if="user.game_role === 'PR'" class="stat-item" title="Kill Count">
                  <Skull :size="14" />
                  {{ user.kill_count }}
                </div>
              </div>
            </td>

            <!-- Subscription Tier -->
            <td class="tier-cell">
              <span
                v-if="user.subscription_tier === 'premium'"
                class="tier-badge premium"
                title="Premium Member"
              >
                <Crown :size="14" />
                Premium
              </span>
              <span v-else class="tier-badge free">Free</span>
            </td>

            <!-- Joined Date -->
            <td class="date-cell">
              <div class="date-info">
                <Clock :size="14" />
                {{ formatDate(user.created_at) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Users :size="48" />
      <p class="empty-title">No users found</p>
      <p class="empty-subtitle">Try adjusting your filters</p>
    </div>
  </div>
</template>

<style scoped>
.admin-users-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
}

.subtitle-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(230, 126, 34, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.users-icon {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.new-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.week-icon {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.admin-icon {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.bh-icon {
  background: rgba(230, 126, 34, 0.15);
  color: #e67e22;
}

.pr-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.premium-icon {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

/* Filters */
.filters-section {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(230, 126, 34, 0.3);
}

.filter-select:focus {
  outline: none;
  border-color: #e67e22;
  background: rgba(255, 255, 255, 0.08);
}

/* Results Count */
.results-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1rem;
  font-weight: 500;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.4);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Users Table */
.users-table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.user-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.user-row:last-child {
  border-bottom: none;
}

.users-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* User Cell */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(230, 126, 34, 0.2);
  border: 2px solid rgba(230, 126, 34, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #e67e22;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
}

.clan-tag {
  font-size: 0.85rem;
  color: rgba(230, 126, 34, 0.8);
  font-weight: 500;
}

.admin-badge {
  color: #a78bfa;
  flex-shrink: 0;
}

.user-steam {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Courier New', monospace;
}

/* Email Cell */
.email {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.no-email {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* Platform Cell */
.platform-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.no-platform {
  color: rgba(255, 255, 255, 0.3);
}

/* Role Cell */
.role-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Stats Cell */
.user-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-item svg {
  color: rgba(230, 126, 34, 0.7);
}

/* Tier Cell */
.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tier-badge.premium {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.tier-badge.free {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
}

/* Date Cell */
.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.date-info svg {
  color: rgba(255, 255, 255, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.empty-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 900px;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
