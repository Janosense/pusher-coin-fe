import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false);

  const toggleChat = () => {
    isOpen.value = !isOpen.value
  }

  return { isOpen, toggleChat }
})
