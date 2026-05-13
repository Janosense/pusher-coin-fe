import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import roomsService from '@/services/roomsService.js'

const LIST_CACHE_MS = 30 * 1000

export const useRoomsStore = defineStore('rooms', () => {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchedAt = ref(0)

  const hasFresh = computed(
    () => items.value.length > 0 && Date.now() - lastFetchedAt.value < LIST_CACHE_MS
  )

  const fetchRooms = async ({ force = false } = {}) => {
    if (!force && hasFresh.value) {
      return { success: true, items: items.value }
    }
    isLoading.value = true
    error.value = null
    try {
      const result = await roomsService.listRooms({ page: 1, perPage: 100 })
      items.value = result.items
      total.value = result.total
      lastFetchedAt.value = Date.now()
      return { success: true, items: items.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const fetchRoom = async (id) => {
    try {
      const room = await roomsService.getRoom(id)
      const idx = items.value.findIndex((r) => r.id === room.id)
      if (idx >= 0) items.value.splice(idx, 1, room)
      return { success: true, room }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const fetchSchedule = async (id) => {
    try {
      const schedule = await roomsService.getSchedule(id)
      return { success: true, schedule }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    items: computed(() => items.value),
    total: computed(() => total.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchRooms,
    fetchRoom,
    fetchSchedule
  }
})
