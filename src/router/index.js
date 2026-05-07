import { createRouter, createWebHistory } from 'vue-router'
import RoomsView from '@/views/RoomsView.vue'
import RoomView from '@/views/RoomView.vue'
import SignUpView from '@/views/SignUpView.vue'
import SignInView from '@/views/SignInView.vue'
import AccountView from '@/views/AccountView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SupportView from '@/views/SupportView.vue'
import AcceptTermsView from '@/views/AcceptTermsView.vue'
import ChooseNicknameView from '@/views/ChooseNicknameView.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: RoomsView },
    { path: '/sign-up', name: 'sign-up', component: SignUpView, meta: { requiresGuest: true } },
    { path: '/sign-in', name: 'sign-in', component: SignInView, meta: { requiresGuest: true } },
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
    { path: '/support', name: 'support', component: SupportView },
    {
      path: '/room/:id',
      name: 'room',
      component: RoomView,
      meta: { requiresAuth: true, requiresPlayReady: true }
    },
    {
      path: '/accept-terms',
      name: 'accept-terms',
      component: AcceptTermsView,
      meta: { requiresAuth: true, allowsBeforeGate: true }
    },
    {
      path: '/choose-nickname',
      name: 'choose-nickname',
      component: ChooseNicknameView,
      meta: { requiresAuth: true, allowsBeforeGate: true }
    }
  ]
})

// Navigation guards: auth → nickname-required → terms-accepted → route-specific.
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthenticationStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresGuest = to.matched.some((r) => r.meta.requiresGuest)
  const allowsBeforeGate = to.matched.some((r) => r.meta.allowsBeforeGate)

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'sign-in', query: { redirect: to.fullPath } })
  }
  if (requiresGuest && isAuthenticated) {
    return next({ name: 'home' })
  }

  if (isAuthenticated && !allowsBeforeGate) {
    if (authStore.nicknameRequired) {
      return next({ name: 'choose-nickname', query: { redirect: to.fullPath } })
    }
    if (!authStore.termsAccepted) {
      return next({ name: 'accept-terms', query: { redirect: to.fullPath } })
    }
  }

  // Don't show gate views once they're no longer needed.
  if (to.name === 'choose-nickname' && isAuthenticated && !authStore.nicknameRequired) {
    return next({ name: 'home' })
  }
  if (to.name === 'accept-terms' && isAuthenticated && authStore.termsAccepted) {
    return next({ name: 'home' })
  }

  next()
})

export default router
