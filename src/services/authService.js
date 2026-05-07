import api from './api.js'

/**
 * Maps the backend auth envelope (snake_case) to the SPA shape (camelCase).
 */
const mapEnvelope = (data) => ({
  accessToken: data.access_token,
  accessTokenExpiresIn: data.access_token_expires_in,
  refreshToken: data.refresh_token,
  refreshTokenExpiresIn: data.refresh_token_expires_in,
  user: {
    id: data.user_id,
    username: data.user_nicename || data.user_email,
    email: data.user_email,
    displayName: data.user_display_name || data.user_email
  },
  termsAccepted: !!data.terms_accepted,
  nicknameRequired: !!data.nickname_required
})

const messageFor = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message
  return error.message || fallback
}

export const authService = {
  /**
   * Step 1 of email/password 2FA: request the verification code.
   */
  async requestVerification(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required')
    }
    try {
      const response = await api.post('/user/request-verification/', {
        login: username.trim(),
        password
      })
      return {
        success: !!response.data?.success,
        message: response.data?.message
      }
    } catch (error) {
      throw new Error(messageFor(error, 'Failed to request verification code'))
    }
  },

  /**
   * Step 2 of email/password 2FA: redeem the code, return the token envelope.
   */
  async verifyCode(username, password, code) {
    if (!username || !password || !code) {
      throw new Error('Username, password, and verification code are required')
    }
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Verification code must be 6 digits')
    }
    try {
      const response = await api.post('/user/verify-code/', {
        login: username.trim(),
        password,
        code
      })
      return mapEnvelope(response.data)
    } catch (error) {
      throw new Error(messageFor(error, 'Verification failed'))
    }
  },

  /**
   * Refresh the access token using the stored refresh token.
   */
  async refresh(refreshToken) {
    if (!refreshToken) throw new Error('Refresh token is required')
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return mapEnvelope(response.data)
  },

  /**
   * Server-side logout: revoke the refresh token.
   */
  async logoutOnServer(refreshToken) {
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken || '' })
    } catch (error) {
      console.warn('[Auth] Server-side logout failed:', error.message)
    }
  },

  /**
   * Accept the current Terms & Conditions version.
   */
  async acceptTerms(version) {
    const response = await api.post('/user/accept-terms', { version })
    return {
      acceptedAt: response.data.terms_accepted_at,
      version: response.data.terms_accepted_version
    }
  },

  /**
   * Pick a unique nickname after first social login.
   */
  async setNickname(nickname) {
    const response = await api.post('/user/set-nickname', { nickname })
    return { nickname: response.data.nickname }
  }
}

export default authService
export { mapEnvelope }
