import api from './api.js'
import { mapEnvelope } from './authService.js'

/**
 * Apple Sign-In service. The button only renders when
 * `VITE_APPLE_CLIENT_ID` is set; the backend returns
 * `apple_not_configured` until it is wired up too.
 *
 * Mirrors the public surface of `googleAuthService`: initialize a
 * provider script, obtain an identity token, exchange it with the
 * backend (which returns `requires_verification`), then redeem the
 * 6-digit code via `/apple-auth/verify-code`.
 */
class AppleAuthService {
  constructor() {
    this.isInitialized = false
    this.clientId = import.meta.env.VITE_APPLE_CLIENT_ID || ''
    this.redirectUri =
      import.meta.env.VITE_APPLE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : '')
  }

  isConfigured() {
    return !!this.clientId
  }

  async initialize() {
    if (this.isInitialized || !this.isConfigured()) return
    await this.waitForLibrary()
    window.AppleID.auth.init({
      clientId: this.clientId,
      scope: 'name email',
      redirectURI: this.redirectUri,
      usePopup: true
    })
    this.isInitialized = true
  }

  waitForLibrary() {
    return new Promise((resolve, reject) => {
      if (window.AppleID?.auth) {
        resolve()
        return
      }
      const timeout = setTimeout(() => reject(new Error('Apple Sign-In SDK failed to load')), 10000)
      const interval = setInterval(() => {
        if (window.AppleID?.auth) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve()
        }
      }, 100)
    })
  }

  async signIn() {
    if (!this.isConfigured()) {
      throw new Error('Apple Sign-In is not configured on this client')
    }
    await this.initialize()
    const result = await window.AppleID.auth.signIn()
    return result?.authorization?.id_token || null
  }

  async authenticateWithBackend(idToken) {
    const response = await api.post('/apple-auth/authentication', { id_token: idToken })
    if (response.data?.requires_verification) {
      return {
        success: true,
        requiresVerification: true,
        idToken,
        message: response.data.message || 'Verification code sent'
      }
    }
    return { success: true, requiresVerification: false, idToken }
  }

  async verifyCode(idToken, code) {
    const response = await api.post('/apple-auth/verify-code', {
      id_token: idToken,
      verification_code: code
    })
    return { success: true, ...mapEnvelope(response.data) }
  }
}

const appleAuthService = new AppleAuthService()
export default appleAuthService
