<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserControls from '@/components/UserControls.vue'
import RoomQueue from '@/components/RoomQueue.vue'
import RoomChat from '@/components/RoomChat.vue'
import ModalOverlay from '@/components/ModalOverlay.vue'
import ReplenishmentBalance from '@/components/ReplenishmentBalance.vue'
import PlaceBet from '@/components/PlaceBet.vue'
import LiveStream from '@/components/LiveStream.vue'
import SignInForm from '@/components/SignInForm.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRoomsStore } from '@/stores/rooms.js'
import { useWalletStore } from '@/stores/wallet.js'
import { useQueueStore } from '@/stores/queue.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()
const roomsStore = useRoomsStore()
const walletStore = useWalletStore()
const queueStore = useQueueStore()

const isAuthed = computed(() => authStore.isAuthenticated)
const roomId = computed(() => Number(route.params.id))
const room = computed(() => roomsStore.items.find((r) => r.id === roomId.value) || null)
const balanceCoins = computed(() => walletStore.balanceCoins)

const isReplenishmentBalanceOverlayOpen = ref(false)
const isPlaceBetOverlayOpen = ref(false)
const isSignInOverlayOpen = ref(false)

const loadRoom = async () => {
  if (roomsStore.items.length === 0) {
    await roomsStore.fetchRooms()
  }
  await roomsStore.fetchRoom(roomId.value)
}

// The queue poll is also the heartbeat that holds a player's place, so
// it runs for as long as they're in the room — not just while the bet
// overlay is open. Phase 5 Step 7's push channel replaces the interval.
const startQueue = () => {
  if (isAuthed.value && authStore.emailVerified) {
    queueStore.startPolling(roomId.value)
  }
}

onMounted(async () => {
  await loadRoom()
  if (isAuthed.value) {
    walletStore.fetchWallet()
  }
  startQueue()
})

onBeforeUnmount(() => {
  queueStore.reset()
})

// Announce the turn: purple styling comes from the queue components,
// this is the audible half (ROADMAP §6.2). Synthesised rather than an
// asset — one short tone, and it only fires on a real transition.
const playTurnChime = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
    osc.onended = () => ctx.close()
  } catch {
    // Autoplay policy or no audio device — the visual cue still lands.
  }
}

watch(
  () => queueStore.isMyTurn,
  (mine, wasMine) => {
    if (mine && !wasMine) {
      playTurnChime()
      isPlaceBetOverlayOpen.value = true
    }
  }
)
watch(roomId, async (id) => {
  await loadRoom()
  queueStore.reset()
  if (id) startQueue()
})
watch(isAuthed, (authed) => {
  if (authed) {
    walletStore.fetchWallet()
    startQueue()
  } else {
    queueStore.reset()
  }
})

const promptSignIn = () => {
  isSignInOverlayOpen.value = true
}

const onPlayClick = () => {
  if (!isAuthed.value) {
    promptSignIn()
    return
  }
  if (!authStore.emailVerified) {
    router.push({ path: '/account', query: { reason: 'verify-email' } })
    return
  }
  // ROADMAP §4.5.1: balance 0 → Play redirects to top-up.
  if (balanceCoins.value === 0) {
    isReplenishmentBalanceOverlayOpen.value = true
    return
  }
  isPlaceBetOverlayOpen.value = true
}

// PlaceBet's "Add balance" link bubbles up here so we can swap the
// open overlay rather than stacking two.
const switchToReplenishment = () => {
  isPlaceBetOverlayOpen.value = false
  isReplenishmentBalanceOverlayOpen.value = true
}
</script>

<template>
  <div class="room-view">
    <RoomChat :readonly="!isAuthed" @send-attempted="promptSignIn" />
    <div class="room-view__layout">
      <div class="room-view__stream">
        <LiveStream
          :status="room?.status || 'unavailable'"
          :stream-url="room?.streamUrl"
          :current-window="room?.currentWindow"
          :next-window="room?.nextWindow"
          @is-live="roomsStore.fetchRoom(roomId)"
        />
      </div>
      <UserControls
        v-if="isAuthed"
        @open-replenishment-balance-overlay="isReplenishmentBalanceOverlayOpen = true"
        @open-place-bet-overlay="onPlayClick"
      />
      <div v-else class="room-view__guest-cta">
        <p class="room-view__guest-message">Sign in to play and chat.</p>
        <button class="room-view__guest-button" @click="promptSignIn">Sign in to play</button>
      </div>
    </div>
    <RoomQueue />
  </div>
  <ModalOverlay
    :is-overlay-open="isReplenishmentBalanceOverlayOpen"
    @close-overlay="isReplenishmentBalanceOverlayOpen = false"
    :title="'Replenish balance'"
    :caption="`Your balance: ${balanceCoins} coins`"
  >
    <ReplenishmentBalance />
  </ModalOverlay>
  <ModalOverlay
    :is-overlay-open="isPlaceBetOverlayOpen"
    @close-overlay="isPlaceBetOverlayOpen = false"
    :title="'Place your bet'"
    :caption="`Your balance: ${balanceCoins} coins`"
  >
    <PlaceBet @open-replenishment-balance-overlay="switchToReplenishment" />
  </ModalOverlay>
  <ModalOverlay :is-overlay-open="isSignInOverlayOpen" @close-overlay="isSignInOverlayOpen = false">
    <SignInForm :redirect="{ name: 'room', params: { id: roomId } }" />
  </ModalOverlay>
</template>

<style scoped>
.room-view {
  position: relative;

  @media (min-width: 1024px) {
    display: flex;
    align-items: flex-end;
  }
}

.room-view__layout {
  @media (min-width: 1024px) {
    flex-grow: 1;
  }
}

.room-view__stream {
  position: relative;
  z-index: 9;
  height: calc(100vh - 218px);

  @media (min-width: 768px) {
    height: calc(100vh - 184px);
  }

  @media (min-width: 1024px) {
    height: calc(100vh - 200px);
  }
}

.room-view__guest-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 12px;
  padding: 20px;
  text-align: center;
  background-color: var(--purple-dark, #1a1530);
  color: var(--white);
}

.room-view__guest-message {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.room-view__guest-button {
  padding: 10px 24px;
  font: inherit;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--yellow);
  color: var(--black);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}
</style>
