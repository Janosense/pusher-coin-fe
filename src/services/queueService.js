import api from './api.js'

/**
 * Queue + play endpoints (Phase 6).
 *
 * All are Bearer + play-ready gated, so they go through `api` and
 * inherit its 401-refresh handling. `getQueue` doubles as the heartbeat
 * that keeps the caller in the queue — the backend prunes entries that
 * stop polling, so the store must keep calling it while a player is in
 * a room.
 */

const mapSession = (s) =>
  s
    ? {
        id: s.id,
        userId: s.user_id,
        roomId: s.room_id,
        startedAt: s.started_at,
        coinsPlayed: Number(s.coins_played || 0),
        coinsWon: Number(s.coins_won || 0),
        moneyWon: s.money_won
      }
    : null

const mapState = (data) => ({
  queue: (data?.queue || []).map((e) => ({
    userId: e.user_id,
    nickname: e.nickname,
    coins: Number(e.coins || 0)
  })),
  currentTurnUserId: data?.current_turn_user_id ?? null,
  onlineCount: Number(data?.online_count || 0),
  session: mapSession(data?.session),
  idleTimeoutSeconds: Number(data?.idle_timeout_seconds || 60)
})

export const queueService = {
  async getQueue(roomId) {
    const response = await api.get(`/rooms/${roomId}/queue`)
    return mapState(response.data)
  },

  async join(roomId, coins) {
    const response = await api.post(`/rooms/${roomId}/queue/join`, { coins: Number(coins) })
    return mapState(response.data)
  },

  async leave(roomId) {
    const response = await api.post(`/rooms/${roomId}/queue/leave`)
    return mapState(response.data)
  },

  async play(roomId) {
    const response = await api.post(`/rooms/${roomId}/play`)
    return {
      tossId: response.data?.toss_id,
      coinsRemaining: Number(response.data?.coins_remaining || 0),
      balanceCoins: Number(response.data?.balance_coins || 0),
      state: mapState(response.data?.queue)
    }
  }
}

export default queueService
