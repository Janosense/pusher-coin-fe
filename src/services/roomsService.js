import axios from 'axios'

/**
 * Public rooms endpoints. Uses a bare axios instance — no Bearer auth is
 * required and we don't want a stray 401 (e.g. server misconfig) to
 * trigger the api.js token-refresh interceptor for anonymous reads.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL

const mapWindow = (w) =>
  w ? { startAt: w.start_at, endAt: w.end_at } : null

const mapRoom = (r) => ({
  id: r.id,
  name: r.name,
  status: r.status,
  themeSongUrl: r.theme_song_url || null,
  streamUrl: r.stream_url || null,
  currentWindow: mapWindow(r.current_window),
  nextWindow: mapWindow(r.next_window)
})

const mapRule = (rule) => ({
  weekday: rule.weekday,
  startTime: rule.start_time,
  endTime: rule.end_time,
  recurrence: rule.recurrence,
  onceDate: rule.once_date || null
})

export const roomsService = {
  async listRooms({ page = 1, perPage = 20 } = {}) {
    const response = await axios.get(`${baseURL}/rooms`, {
      params: { page, per_page: perPage },
      timeout: 10000
    })
    return {
      items: (response.data?.items || []).map(mapRoom),
      total: response.data?.total || 0,
      page: response.data?.page || page,
      perPage: response.data?.per_page || perPage
    }
  },

  async getRoom(id) {
    const response = await axios.get(`${baseURL}/rooms/${id}`, { timeout: 10000 })
    return mapRoom(response.data)
  },

  async getSchedule(id) {
    const response = await axios.get(`${baseURL}/rooms/${id}/schedule`, { timeout: 10000 })
    return {
      rules: (response.data?.rules || []).map(mapRule),
      nextWindow: mapWindow(response.data?.next_window)
    }
  }
}

export default roomsService
