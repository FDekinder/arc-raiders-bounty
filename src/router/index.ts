import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getCurrentUser } from '@/lib/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/auth/steam/callback',
      name: 'steam-callback',
      component: () => import('../views/SteamCallbackView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallbackView.vue'),
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
    {
      path: '/profile/:id/trophies',
      name: 'trophy-wall',
      component: () => import('../views/TrophyWallView.vue'),
    },
    {
      path: '/select-role',
      name: 'select-role',
      component: () => import('../views/RoleSelectionView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/EmailRegisterView.vue'),
    },
    {
      path: '/email-login',
      name: 'email-login',
      component: () => import('../views/EmailLoginView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/top-killers',
      name: 'top-killers',
      component: () => import('../views/TopKillersView.vue'),
    },
    {
      path: '/submit-kill',
      name: 'submit-kill',
      component: () => import('../views/SubmitKillView.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue'),
    },
    {
      path: '/design-demo',
      name: 'design-demo',
      component: () => import('../views/DesignDemoView.vue'),
    },
    {
      path: '/community-guidelines',
      name: 'community-guidelines',
      component: () => import('../views/CommunityGuidelinesView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/auth/steam/callback', '/auth/callback', '/register', '/email-login', '/select-role', '/forgot-password', '/reset-password', '/faq', '/privacy', '/design-demo', '/community-guidelines']
  const authRequired = !publicPages.includes(to.path)
  const currentUser = getCurrentUser()

  // In development, skip authentication checks (except for admin routes)
  const isDevelopment = import.meta.env.DEV

  // Check authentication (skip in development)
  if (authRequired && !currentUser && !isDevelopment) {
    return next('/login')
  }

  // Check admin-only routes (always enforce, even in dev)
  const adminOnlyRoutes = ['/verify']
  if (adminOnlyRoutes.includes(to.path)) {
    if (!currentUser || currentUser.role !== 'admin') {
      // Redirect non-admins to home
      return next('/')
    }
  }

  next()
})

export default router
