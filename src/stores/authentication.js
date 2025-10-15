import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService.js'

const TOKEN_KEY = 'pusher_coin_auth_token'
const USER_KEY = 'pusher_coin_user_data'

export const useAuthenticationStore = defineStore('authentication', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  const router = useRouter()

  // Getters
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  const currentUser = computed(() => user.value)

  const authToken = computed(() => token.value)

  const hasError = computed(() => !!error.value)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const saveToLocalStorage = (tokenValue, userData) => {
    try {
      if (tokenValue) {
        localStorage.setItem(TOKEN_KEY, tokenValue)
      }
      if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
      }
    } catch (err) {
      console.warn('[Auth Store] Failed to save to localStorage:', err.message)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedUser = localStorage.getItem(USER_KEY)

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return true
      }
    } catch (err) {
      console.warn('[Auth Store] Failed to load from localStorage:', err.message)
      clearLocalStorage()
    }
    return false
  }

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (err) {
      console.warn('[Auth Store] Failed to clear localStorage:', err.message)
    }
  }

  const login = async (username, password) => {
    try {
      clearError()
      setLoading(true)

      const response = await authService.login(username, password)

      if (response.success) {
        token.value = response.token
        user.value = response.user

        // Save to localStorage
        saveToLocalStorage(response.token, response.user)

        console.log('[Auth Store] Login successful for user:', response.user.username)
        return { success: true, user: response.user }
      } else {
        throw new Error('Login failed')
      }
    } catch (err) {
      console.error('[Auth Store] Login error:', err.message)
      error.value = err.message

      // Clear any partial auth data
      logout(false)

      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (authResult) => {
    try {
      clearError()
      setLoading(true)

      if (authResult.success) {
        token.value = authResult.token
        user.value = authResult.user

        // Save to localStorage
        saveToLocalStorage(authResult.token, authResult.user)

        console.log('[Auth Store] Google login successful for user:', authResult.user.username)
        return { success: true, user: authResult.user }
      } else {
        throw new Error('Google login failed')
      }
    } catch (err) {
      console.error('[Auth Store] Google login error:', err.message)
      error.value = err.message

      // Clear any partial auth data
      logout(false)

      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = (redirect = true) => {
    console.log('[Auth Store] Logging out user')

    // Clear state
    user.value = null
    token.value = null
    error.value = null

    // Clear localStorage
    clearLocalStorage()

    // Redirect to login page
    if (redirect && router) {
      router.push({ name: 'sign-in' }).catch(err => {
        console.warn('[Auth Store] Navigation error during logout:', err.message)
      })
    }
  }

  const validateToken = async () => {
    if (!token.value) {
      return false
    }

    try {
      const validation = await authService.validateToken(token.value)

      if (!validation.valid) {
        console.warn('[Auth Store] Token validation failed, logging out')
        logout(false)
        return false
      }

      return true
    } catch (err) {
      console.warn('[Auth Store] Token validation error:', err.message)
      logout(false)
      return false
    }
  }

  const refreshToken = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await authService.refreshToken(token.value)

      if (response.success) {
        token.value = response.token
        saveToLocalStorage(response.token, user.value)
        console.log('[Auth Store] Token refreshed successfully')
        return true
      }
    } catch (err) {
      console.warn('[Auth Store] Token refresh failed:', err.message)
      logout(false)
    }

    return false
  }

  const initializeAuth = async () => {
    if (isInitialized.value) {
      return
    }

    console.log('[Auth Store] Initializing authentication state')

    // Try to load from localStorage first
    const hasStoredAuth = loadFromLocalStorage()

    if (hasStoredAuth) {
      // Validate the stored token
      const isValid = await validateToken()
      if (!isValid) {
        console.log('[Auth Store] Stored token is invalid, cleared auth state')
      } else {
        console.log('[Auth Store] Restored authentication from localStorage')
      }
    }

    isInitialized.value = true
  }

  const authenticateUser = async (route = null) => {
    console.log('[Auth Store] Legacy authenticateUser called with route:', route)

    // This is the legacy method - maintain compatibility
    if (isAuthenticated.value) {
      const targetRoute = route || '/'
      router.push(targetRoute).catch(err => {
        console.warn('[Auth Store] Navigation error:', err.message)
      })
    } else {
      console.warn('[Auth Store] Cannot authenticate user - not logged in')
      router.push({ name: 'sign-in' }).catch(err => {
        console.warn('[Auth Store] Navigation error:', err.message)
      })
    }
  }

  const checkAuthStatus = () => {
    return {
      isAuthenticated: isAuthenticated.value,
      user: user.value,
      hasToken: !!token.value,
      isLoading: isLoading.value,
      error: error.value
    }
  }

  // Listen for token expiration events from API interceptors
  const handleTokenExpiration = () => {
    console.log('[Auth Store] Received token expiration event')
    logout(false)
  }

  // Set up event listener for token expiration
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:token-expired', handleTokenExpiration)
  }

  // Initialize auth state when store is created
  initializeAuth()

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isInitialized: computed(() => isInitialized.value),

    // Getters
    isAuthenticated,
    currentUser,
    authToken,
    hasError,

    // Legacy getter for backward compatibility
    isUserLoggedIn: isAuthenticated,

    // Actions
    login,
    loginWithGoogle,
    logout,
    validateToken,
    refreshToken,
    initializeAuth,
    clearError,
    checkAuthStatus,

    // Legacy method for backward compatibility
    authenticateUser
  }
})
