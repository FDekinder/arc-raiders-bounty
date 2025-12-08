import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/bounties',
      name: 'bounties',
      component: () => import('../views/BountiesView.vue'),
    },
    {
      path: '/create-bounty',
      name: 'create-bounty',
      component: () => import('../views/CreateBountyView.vue'),
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/LeaderboardView.vue'),
    },
    {
      path: '/claim/:id',
      name: 'claim-bounty',
      component: () => import('../views/ClaimBountyView.vue'),
    },
    {
      path: '/verify',
      name: 'verify-claims',
      component: () => import('../views/VerificationView.vue'),
    },
    {
      path: '/my-claims',
      name: 'my-claims',
      component: () => import('../views/MyClaimsView.vue'),
    },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('../views/ActivityFeedView.vue'),
    },
    {
      path: '/profile/:id',
      name: 'user-profile',
      component: () => import('../views/UserProfileView.vue'),
    },
  ],
})

export default router
