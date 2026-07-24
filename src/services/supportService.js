import axios from 'axios'
import api from './api.js'

/**
 * Support form endpoints.
 *
 * Subjects are read with a bare axios instance for the same reason as
 * `roomsService` — the route is public, and a stray 401 must not wake the
 * token-refresh interceptor for an anonymous read.
 *
 * Ticket submission goes through `api` so a logged-in player's Bearer
 * token rides along: the backend then uses the account email and skips
 * the captcha. Guests hit the same instance with no token, which is
 * exactly the guest path.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL

export const supportService = {
  /**
   * Returns `{ subjects, captcha }`. `captcha` is null when the operator
   * hasn't configured a provider — the form then renders no widget and
   * the backend demands no token.
   */
  async getSubjects() {
    const response = await axios.get(`${baseURL}/support/subjects`, { timeout: 10000 })
    return {
      subjects: (response.data?.items || []).map((s) => ({ id: s.id, label: s.label })),
      captcha: response.data?.captcha
        ? { provider: response.data.captcha.provider, siteKey: response.data.captcha.site_key }
        : null
    }
  },

  async createTicket({ email, subjectId, description, captchaToken }) {
    const payload = {
      subject_id: Number(subjectId),
      description
    }
    // Both are ignored by the backend for a logged-in submitter; sending
    // them anyway keeps one call site for both paths.
    if (email) payload.email = email
    if (captchaToken) payload.captcha_token = captchaToken

    const response = await api.post('/support/tickets', payload)
    return { ticketId: response.data?.ticket_id }
  }
}

export default supportService
