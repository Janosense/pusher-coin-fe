import { createRouter, createWebHistory } from 'vue-router'
import RoomsView from '@/views/RoomsView.vue'
import RoomView from '@/views/RoomView.vue'
import SignUpView from '@/views/SignUpView.vue'
import SignInView from '@/views/SignInView.vue'
import AccountView from '@/views/AccountView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SupportView from '@/views/SupportView.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: RoomsView
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUpView,
      meta: { requiresGuest: true }
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignInView,
      meta: { requiresGuest: true }
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/support',
      name: 'support',
      component: SupportView
    },
    {
      path: '/room/:id',
      name: 'room',
      component: RoomView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthenticationStore()

  // Wait for auth store to be initialized
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  console.log('[Router] Navigation guard:', {
    to: to.name,
    from: from.name,
    isAuthenticated,
    requiresAuth,
    requiresGuest
  })

  if (requiresAuth && !isAuthenticated) {
    // Protected route but user is not authenticated
    console.log('[Router] Redirecting to sign-in: protected route requires authentication')
    next({
      name: 'sign-in',
      query: { redirect: to.fullPath }
    })
  } else if (requiresGuest && isAuthenticated) {
    // Guest-only route but user is authenticated
    console.log('[Router] Redirecting to home: guest route but user is authenticated')
    next({ name: 'home' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
