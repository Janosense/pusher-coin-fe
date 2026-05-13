<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserControls from '@/components/UserControls.vue'
import Queue from '@/components/Queue.vue'
import Chat from '@/components/Chat.vue'
import Overlay from '@/components/Overlay.vue'
import ReplenishmentBalance from '@/components/ReplenishmentBalance.vue'
import PlaceBet from '@/components/PlaceBet.vue'
import LiveStream from '@/components/LiveStream.vue'
import SignInForm from '@/components/SignInForm.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRoomsStore } from '@/stores/rooms.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()
const roomsStore = useRoomsStore()

const isAuthed = computed(() => authStore.isAuthenticated)
const roomId = computed(() => Number(route.params.id))
const room = computed(() => roomsStore.items.find((r) => r.id === roomId.value) || null)

const isReplenishmentBalanceOverlayOpen = ref(false)
const isPlaceBetOverlayOpen = ref(false)
const isSignInOverlayOpen = ref(false)

const loadRoom = async () => {
  if (roomsStore.items.length === 0) {
    await roomsStore.fetchRooms()
  }
  await roomsStore.fetchRoom(roomId.value)
}

onMounted(loadRoom)
watch(roomId, loadRoom)

const promptSignIn = () => {
  isSignInOverlayOpen.value = true
}

const onPlayClick = () => {
  if (!isAuthed.value) {
    promptSignIn()
    return
  }
  // Authenticated players can't play until email-verified; the existing
  // router guard on requiresPlayReady redirects to /account. Phase 6 wires
  // the toss flow — for now, opening the bet overlay matches the prior
  // behaviour.
  if (!authStore.emailVerified) {
    router.push({ path: '/account', query: { reason: 'verify-email' } })
    return
  }
  isPlaceBetOverlayOpen.value = true
}
</script>

<template>
  <div class="room-view">
    <Chat :readonly="!isAuthed" @send-attempted="promptSignIn" />
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
    <Queue />
  </div>
  <Overlay
    :is-overlay-open="isReplenishmentBalanceOverlayOpen"
    @close-overlay="isReplenishmentBalanceOverlayOpen = false"
    :title="'Replenish balance'"
    :caption="'Your balance: 14 coins'"
  >
    <ReplenishmentBalance />
  </Overlay>
  <Overlay
    :is-overlay-open="isPlaceBetOverlayOpen"
    @close-overlay="isPlaceBetOverlayOpen = false"
    :title="'Place your bet'"
    :caption="'Your balance: 14 coins'"
  >
    <PlaceBet />
  </Overlay>
  <Overlay :is-overlay-open="isSignInOverlayOpen" @close-overlay="isSignInOverlayOpen = false">
    <SignInForm :redirect="{ name: 'room', params: { id: roomId } }" />
  </Overlay>
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
