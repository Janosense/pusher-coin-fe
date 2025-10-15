import api from './api.js'

/**
 * Google Sign-In Service
 * Implements Google Identity Services for authentication
 * Based on: https://developers.google.com/identity/gsi/web/guides/overview
 */

class GoogleAuthService {
  constructor() {
    this.isInitialized = false
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  }

  /**
   * Wait for Google library to load
   * @returns {Promise<void>}
   */
  waitForGoogleLibrary() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Google Sign-In library failed to load'))
      }, 10000)

      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          clearTimeout(timeout)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Initialize Google Sign-In
   * @param {Function} callback - Function to handle credential response
   * @returns {Promise<void>}
   */
  async initialize(callback) {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured in environment variables')
    }

    try {
      await this.waitForGoogleLibrary()

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true
      })

      this.isInitialized = true
      console.log('[Google Auth] Initialized successfully')
    } catch (error) {
      console.error('[Google Auth] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Render Google Sign-In button
   * @param {HTMLElement} element - Container element for the button
   * @param {Object} options - Button configuration options
   */
  renderButton(element, options = {}) {
    if (!this.isInitialized) {
      console.warn('[Google Auth] Not initialized yet')
      return
    }

    const defaultOptions = {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: element.offsetWidth || 300
    }

    try {
      window.google.accounts.id.renderButton(element, {
        ...defaultOptions,
        ...options
      })
    } catch (error) {
      console.error('[Google Auth] Failed to render button:', error)
      throw error
    }
  }

  /**
   * Send Google ID token to backend for authentication
   * @param {string} credential - JWT ID token from Google
   * @returns {Promise<Object>} Authentication response from backend
   */
  async authenticateWithBackend(credential) {
    try {
      console.log('[Google Auth] Sending credential to backend')

      const response = await api.post('/google-auth/authentication', {
        id_token: credential
      })

      if (!response.data) {
        throw new Error('Invalid response from backend')
      }

      console.log('[Google Auth] Backend authentication successful')

      return {
        success: true,
        token: response.data.token,
        user: {
          id: response.data.user_id,
          username: response.data.user_nicename || response.data.user_email,
          email: response.data.user_email,
          displayName: response.data.user_display_name || response.data.user_email
        },
        tokenExpires: response.data.token_expires || null
      }
    } catch (error) {
      console.error('[Google Auth] Backend authentication failed:', error)

      // Handle specific HTTP error codes
      if (error.response?.status === 400) {
        throw new Error('Invalid Google token')
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please try again.')
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Your account may not be authorized.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to authenticate with Google'
      )
    }
  }

  /**
   * Disable auto-select for the next sign-in attempt
   * Useful after sign-out to prevent automatic sign-in
   */
  disableAutoSelect() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  /**
   * Cancel the One Tap flow if displayed
   */
  cancel() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel()
    }
  }
}

// Export singleton instance
const googleAuthService = new GoogleAuthService()

export default googleAuthService
