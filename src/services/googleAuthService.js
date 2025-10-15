import api from './api.js'

/**
 * Google Authentication Service
 * Handles Google Sign-In integration and backend authentication
 */

class GoogleAuthService {
  constructor() {
    this.googleClient = null
    this.isInitialized = false
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  }

  /**
   * Initialize Google Sign-In
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[Google Auth] Already initialized')
      return true
    }

    if (!this.clientId) {
      console.error('[Google Auth] Client ID not configured')
      throw new Error('Google Client ID is not configured')
    }

    try {
      // Wait for google.accounts.id to be available
      await this.waitForGoogleScript()

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: null // We'll handle this programmatically
      })

      this.isInitialized = true
      console.log('[Google Auth] Initialized successfully')
      return true
    } catch (error) {
      console.error('[Google Auth] Initialization failed:', error)
      throw new Error('Failed to initialize Google Sign-In')
    }
  }

  /**
   * Wait for Google script to load
   * @returns {Promise<void>}
   */
  waitForGoogleScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        resolve()
        return
      }

      // Set a timeout
      const timeout = setTimeout(() => {
        reject(new Error('Google Sign-In script failed to load'))
      }, 10000)

      // Poll for google object
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle)
          clearTimeout(timeout)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Trigger Google Sign-In popup
   * @returns {Promise<string>} Google ID token
   */
  async signIn() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      try {
        // Show the One Tap prompt or redirect to Google Sign-In
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap is not displayed, use the popup flow
            this.signInWithPopup()
              .then(resolve)
              .catch(reject)
          }
        })

        // Set up callback for One Tap
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response) => {
            if (response.credential) {
              resolve(response.credential)
            } else {
              reject(new Error('No credential received from Google'))
            }
          }
        })
      } catch (error) {
        console.error('[Google Auth] Sign-in error:', error)
        reject(error)
      }
    })
  }

  /**
   * Trigger Google Sign-In using popup
   * @returns {Promise<string>} Google ID token
   */
  async signInWithPopup() {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'email profile',
        callback: (response) => {
          if (response.access_token) {
            // Get ID token using access token
            this.getIdTokenFromAccessToken(response.access_token)
              .then(resolve)
              .catch(reject)
          } else if (response.error) {
            reject(new Error(response.error))
          }
        }
      })

      client.requestAccessToken()
    })
  }

  /**
   * Get ID token from access token
   * @param {string} accessToken - Google access token
   * @returns {Promise<string>} ID token
   */
  async getIdTokenFromAccessToken(accessToken) {
    // Note: In production, you'd typically get the ID token directly
    // For now, we'll use the access token approach
    // The backend should validate this token
    return accessToken
  }

  /**
   * Authenticate with backend using Google ID token
   * @param {string} idToken - Google ID token
   * @returns {Promise<Object>} Authentication response
   */
  async authenticateWithBackend(idToken) {
    try {
      console.log('[Google Auth] Authenticating with backend')

      const response = await api.post('/google-auth/authentication', {
        id_token: idToken
      })

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

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Invalid Google token')
      } else if (error.response?.status === 401) {
        throw new Error('Google authentication failed')
      } else if (error.response?.status === 403) {
        throw new Error('Account access denied')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later')
      }

      throw new Error(error.response?.data?.message || 'Google authentication failed')
    }
  }

  /**
   * Complete Google Sign-In flow
   * @returns {Promise<Object>} Authentication result with user data and token
   */
  async signInAndAuthenticate() {
    try {
      // Get Google ID token
      const idToken = await this.signIn()

      // Authenticate with backend
      const authResult = await this.authenticateWithBackend(idToken)

      return authResult
    } catch (error) {
      console.error('[Google Auth] Sign-in and authentication failed:', error)
      throw error
    }
  }

  /**
   * Render Google Sign-In button
   * @param {HTMLElement} element - Container element for the button
   * @param {Object} options - Button customization options
   */
  renderButton(element, options = {}) {
    if (!this.isInitialized) {
      console.warn('[Google Auth] Not initialized, initializing now')
      this.initialize().then(() => {
        this.renderButton(element, options)
      })
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

    window.google.accounts.id.renderButton(element, {
      ...defaultOptions,
      ...options
    })
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService()

export default googleAuthService
