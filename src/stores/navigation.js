import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const isNavigationOpen = ref(false)

  const toggleNavigation = () => {
    isNavigationOpen.value = !isNavigationOpen.value
  }

  const closeNavigation = () => {
    isNavigationOpen.value = false
  }

  return { isNavigationOpen, toggleNavigation, closeNavigation }
})
