<script setup>
import Rooms from '@/components/Rooms.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const enterRoom = (roomId) => {
  router.push({ name: 'room', params: { id: roomId } })
}
</script>

<template>
  <Rooms @on-room-click="enterRoom" />
</template>

<style scoped></style>
