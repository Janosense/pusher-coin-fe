<script setup>
import RoomList from '@/components/RoomList.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const enterRoom = (roomId) => {
  router.push({ name: 'room', params: { id: roomId } })
}
</script>

<template>
  <RoomList @on-room-click="enterRoom" />
</template>

<style scoped></style>
