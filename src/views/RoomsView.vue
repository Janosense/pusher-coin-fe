<script setup>
import { ref } from 'vue'
import SignInForm from '@/components/SignInForm.vue'
import Overlay from '@/components/Overlay.vue'
import Rooms from '@/components/Rooms.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const activeRoomId = ref(1)
const isSignInOverlayOpen = ref(false)

const roomEnterGate = (roomId) => {
  if (authenticationStore.isUserLoggedIn) {
    router.push({ name: 'room', params: { id: roomId } })
  } else {
    activeRoomId.value = roomId
    isSignInOverlayOpen.value = true
  }
}
</script>

<template>
  <Rooms @on-room-click="(roomId) => roomEnterGate(roomId)" />
  <Overlay :is-overlay-open="isSignInOverlayOpen" @close-overlay="isSignInOverlayOpen = false">
    <SignInForm :redirect="{ name: 'room', params: { id: activeRoomId } }" />
  </Overlay>
</template>

<style scoped></style>
