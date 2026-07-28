import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import queueService from '@/services/queueService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useWalletStore } from '@/stores/wallet.js'

/**
 * Room queue state.
 *
 * Polls `GET /rooms/{id}/queue` on an interval while the player is in a
 * room. The poll is also the heartbeat the backend prunes stale entries
 * on, so it must keep running for as long as the player expects to hold
 * their place — including while they are just watching.
 *
 * Phase 5 Step 7 replaces the poll with a push channel. When it lands,
 * `startPolling` becomes `subscribe` and everything below it — the
 * derived turn state, the components — stays as is.
 */
const POLL_INTERVAL_MS = 3000

export const useQueueStore = defineStore('queue', () => {
  const roomId = ref(null)
  const entries = ref([])
  const currentTurnUserId = ref(null)
  const onlineCount = ref(0)
  const session = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  let pollTimer = null

  const authStore = useAuthenticationStore()
  const walletStore = useWalletStore()

  const myUserId = computed(() => Number(authStore.user?.id) || null)
  const myEntry = computed(() => entries.value.find((e) => e.userId === myUserId.value) || null)
  const isInQueue = computed(() => !!myEntry.value)
  const isMyTurn = computed(
    () => !!myUserId.value && currentTurnUserId.value === myUserId.value
  )
  const myPosition = computed(() => {
    const index = entries.value.findIndex((e) => e.userId === myUserId.value)
    return index === -1 ? null : index + 1
  })
  const coinsRemaining = computed(() => myEntry.value?.coins ?? 0)

  // Winnings belong to the current turn, not the player's lifetime — the
  // counter resets when the turn does. Only shown while it's mine.
  const myWinningsCoins = computed(() =>
    session.value && session.value.userId === myUserId.value ? session.value.coinsWon : 0
  )

  const applyState = (state) => {
    entries.value = state.queue
    currentTurnUserId.value = state.currentTurnUserId
    onlineCount.value = state.onlineCount
    session.value = state.session
  }

  const refresh = async () => {
    if (!roomId.value) return
    try {
      applyState(await queueService.getQueue(roomId.value))
      error.value = null
    } catch (err) {
      // A poll failure is transient by nature; surface it but keep the
      // timer alive so the queue reappears when the network does.
      error.value = err.response?.data?.message || err.message
    }
  }

  const startPolling = async (id) => {
    stopPolling()
    roomId.value = Number(id)
    isLoading.value = true
    await refresh()
    isLoading.value = false
    pollTimer = setInterval(refresh, POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const join = async (coins) => {
    error.value = null
    try {
      applyState(await queueService.join(roomId.value, coins))
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, code: err.response?.data?.code, error: error.value }
    }
  }

  const leave = async () => {
    if (!roomId.value) return
    try {
      applyState(await queueService.leave(roomId.value))
    } catch (err) {
      error.value = err.response?.data?.message || err.message
    }
  }

  const play = async () => {
    error.value = null
    try {
      const result = await queueService.play(roomId.value)
      applyState(result.state)
      walletStore.setBalanceCoins(result.balanceCoins)
      return { success: true, tossId: result.tossId, coinsRemaining: result.coinsRemaining }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, code: err.response?.data?.code, error: error.value }
    }
  }

  const reset = () => {
    stopPolling()
    roomId.value = null
    entries.value = []
    currentTurnUserId.value = null
    onlineCount.value = 0
    session.value = null
    error.value = null
  }

  return {
    roomId,
    entries,
    currentTurnUserId,
    onlineCount,
    session,
    isLoading,
    error,
    myUserId,
    myEntry,
    isInQueue,
    isMyTurn,
    myPosition,
    coinsRemaining,
    myWinningsCoins,
    startPolling,
    stopPolling,
    refresh,
    join,
    leave,
    play,
    reset
  }
})
