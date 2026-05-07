import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService.js'
import sessionService from '@/services/sessionService.js'

const TOKEN_KEY = 'pusher_coin_auth_token'
const USER_KEY = 'pusher_coin_user_data'
const INACTIVITY_MS = 15 * 60 * 1000

export const useAuthenticationStore = defineStore('authentication', () => {
  // Core auth state
  const user = ref(null)
  const accessToken = ref(null)
  const refreshTokenValue = ref(null)
  const accessTokenExpiresAt = ref(null)
  const termsAccepted = ref(false)
  const nicknameRequired = ref(false)

  // UI state
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  // Pending Google verification state
  const pendingGoogleAuth = ref(false)
  const googleIdToken = ref(null)

  const router = useRouter()

  // Getters
  const isAuthenticated = computed(() => !!(accessToken.value && user.value))
  const currentUser = computed(() => user.value)
  const authToken = computed(() => accessToken.value)
  const hasError = computed(() => !!error.value)

  // ---------------- helpers ----------------

  const clearError = () => {
    error.value = null
  }

  const clearGoogleAuthState = () => {
    pendingGoogleAuth.value = false
    googleIdToken.value = null
  }

  const persist = () => {
    try {
      if (accessToken.value) {
        localStorage.setItem(TOKEN_KEY, accessToken.value)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
      const payload = {
        user: user.value,
        refreshToken: refreshTokenValue.value,
        accessTokenExpiresAt: accessTokenExpiresAt.value,
        termsAccepted: termsAccepted.value,
        nicknameRequired: nicknameRequired.value
      }
      if (user.value || refreshTokenValue.value) {
        localStorage.setItem(USER_KEY, JSON.stringify(payload))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    } catch (err) {
      console.warn('[Auth Store] Failed to persist auth state:', err.message)
    }
  }

  const hydrate = () => {
    try {
      accessToken.value = localStorage.getItem(TOKEN_KEY)
      const raw = localStorage.getItem(USER_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      user.value = parsed.user || null
      refreshTokenValue.value = parsed.refreshToken || null
      accessTokenExpiresAt.value = parsed.accessTokenExpiresAt || null
      termsAccepted.value = !!parsed.termsAccepted
      nicknameRequired.value = !!parsed.nicknameRequired
    } catch (err) {
      console.warn('[Auth Store] Failed to hydrate auth state:', err.message)
      clearLocal()
    }
  }

  const clearLocal = () => {
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
    accessTokenExpiresAt.value = null
    termsAccepted.value = false
    nicknameRequired.value = false
    error.value = null
    clearGoogleAuthState()
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (err) {
      console.warn('[Auth Store] Failed to clear localStorage:', err.message)
    }
    sessionService.stop()
  }

  const applyEnvelope = (envelope) => {
    user.value = envelope.user
    accessToken.value = envelope.accessToken
    refreshTokenValue.value = envelope.refreshToken
    accessTokenExpiresAt.value = Date.now() + envelope.accessTokenExpiresIn * 1000
    termsAccepted.value = envelope.termsAccepted
    nicknameRequired.value = envelope.nicknameRequired
    persist()
    sessionService.start(handleInactivityTimeout, INACTIVITY_MS)
  }

  // ---------------- actions ----------------

  const requestVerification = async (username, password) => {
    try {
      clearError()
      isLoading.value = true
      const response = await authService.requestVerification(username, password)
      return { success: response.success, message: response.message }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const verifyCode = async (username, password, code) => {
    try {
      clearError()
      isLoading.value = true
      const envelope = await authService.verifyCode(username, password, code)
      applyEnvelope(envelope)
      return { success: true, user: user.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const requestGoogleVerification = async (idToken) => {
    try {
      clearError()
      googleIdToken.value = idToken
      pendingGoogleAuth.value = true
      return { success: true }
    } catch (err) {
      error.value = err.message
      clearGoogleAuthState()
      return { success: false, error: err.message }
    }
  }

  const verifyGoogleCode = async (code) => {
    try {
      clearError()
      isLoading.value = true
      if (!googleIdToken.value) {
        throw new Error('No pending Google authentication')
      }
      const { default: googleAuthService } = await import('@/services/googleAuthService.js')
      const envelope = await googleAuthService.verifyCode(googleIdToken.value, code)
      applyEnvelope(envelope)
      clearGoogleAuthState()
      return { success: true, user: user.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const acceptTerms = async (version) => {
    try {
      clearError()
      isLoading.value = true
      await authService.acceptTerms(version)
      termsAccepted.value = true
      persist()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const setNickname = async (nickname) => {
    try {
      clearError()
      isLoading.value = true
      const result = await authService.setNickname(nickname)
      if (user.value) {
        user.value = { ...user.value, username: result.nickname, displayName: result.nickname }
      }
      nicknameRequired.value = false
      persist()
      return { success: true, nickname: result.nickname }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (redirect = true) => {
    const refreshToServer = refreshTokenValue.value
    if (refreshToServer) {
      await authService.logoutOnServer(refreshToServer)
    }
    clearLocal()
    if (redirect && router) {
      router.push({ name: 'sign-in' }).catch(() => {})
    }
  }

  const handleInactivityTimeout = () => {
    console.log('[Auth Store] Inactivity timeout — logging out')
    logout(true)
  }

  const initializeAuth = async () => {
    if (isInitialized.value) return
    hydrate()
    if (isAuthenticated.value) {
      sessionService.start(handleInactivityTimeout, INACTIVITY_MS)
    }
    isInitialized.value = true
  }

  // ---------------- global event wiring ----------------

  if (typeof window !== 'undefined') {
    window.addEventListener('auth:token-expired', () => {
      console.log('[Auth Store] Received token-expired event')
      clearLocal()
    })

    window.addEventListener('auth:token-refreshed', (evt) => {
      const env = evt.detail
      if (!env || !env.access_token) return
      accessToken.value = env.access_token
      refreshTokenValue.value = env.refresh_token
      accessTokenExpiresAt.value = Date.now() + env.access_token_expires_in * 1000
      termsAccepted.value = !!env.terms_accepted
      nicknameRequired.value = !!env.nickname_required
      persist()
    })
  }

  // Initialize on store creation (Pinia caches this; runs once per app boot).
  initializeAuth()

  return {
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    refreshToken: computed(() => refreshTokenValue.value),
    accessTokenExpiresAt: computed(() => accessTokenExpiresAt.value),
    termsAccepted: computed(() => termsAccepted.value),
    nicknameRequired: computed(() => nicknameRequired.value),

    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isInitialized: computed(() => isInitialized.value),
    pendingGoogleAuth: computed(() => pendingGoogleAuth.value),
    googleIdToken: computed(() => googleIdToken.value),

    isAuthenticated,
    currentUser,
    authToken,
    hasError,
    isUserLoggedIn: isAuthenticated,

    requestVerification,
    verifyCode,
    requestGoogleVerification,
    verifyGoogleCode,
    acceptTerms,
    setNickname,
    logout,
    initializeAuth,
    clearError,
    clearGoogleAuthState
  }
})
