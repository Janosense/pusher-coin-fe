import axios from 'axios'
import api from './api.js'
import { mapEnvelope } from './authService.js'

/**
 * Account-page endpoints. Kept separate from `authService` so that file
 * stays focused on session lifecycle.
 */

const mapMe = (data) => ({
  id: data.id,
  email: data.email,
  emailVerified: !!data.email_verified,
  emailVerifiedAt: data.email_verified_at || null,
  nickname: data.nickname,
  phone: data.phone || '',
  phoneVerified: !!data.phone_verified,
  termsAccepted: !!data.terms_accepted,
  termsAcceptedVersion: data.terms_accepted_version || null,
  googleLinked: !!data.google_linked,
  appleLinked: !!data.apple_linked,
  balanceMoney: Number(data.balance_money) || 0,
  balanceCoins: Number(data.balance_coins) || 0
})

export const accountService = {
  async getMe() {
    const response = await api.get('/user/me')
    return mapMe(response.data)
  },

  async updateMe(payload) {
    const body = {}
    if (typeof payload.phone === 'string') body.phone = payload.phone.trim()
    const response = await api.patch('/user/me', body)
    return mapMe(response.data)
  },

  async requestEmailConfirmation() {
    const response = await api.post('/user/request-email-confirmation')
    return {
      success: !!response.data?.success,
      message: response.data?.message
    }
  },

  /**
   * Public endpoint — does not require Bearer auth. Use a bare axios
   * instance so the standard 401-refresh interceptor doesn't try to
   * rotate tokens for an anonymous request.
   */
  async confirmEmail(token) {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/confirm-email`,
      { token },
      { timeout: 10000 }
    )
    return {
      success: !!response.data?.success,
      emailVerifiedAt: response.data?.email_verified_at || null
    }
  },

  async requestPasswordChange() {
    const response = await api.post('/user/request-password-change')
    return {
      success: !!response.data?.success,
      message: response.data?.message
    }
  },

  /**
   * Returns the canonical auth envelope (mapped). Caller should pass it
   * to `authStore.applyEnvelope` to swap in the freshly-issued pair.
   */
  async confirmPasswordChange({ currentPassword, newPassword, code }) {
    const response = await api.post('/user/confirm-password-change', {
      current_password: currentPassword,
      new_password: newPassword,
      code
    })
    return mapEnvelope(response.data)
  }
}

export default accountService
