<script setup>
import ModalOverlay from '@/components/ModalOverlay.vue'
import { useAuthenticationStore } from '@/stores/authentication.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const authStore = useAuthenticationStore()

const handleConfirm = async () => {
  await authStore.logout(true)
  emit('close')
}
</script>

<template>
  <ModalOverlay :is-overlay-open="props.isOpen" title="Log out" @closeOverlay="emit('close')">
    <p class="logout-modal__caption">Are you sure you want to log out?</p>
    <div class="logout-modal__actions">
      <button type="button" class="button button--ghost" @click="emit('close')">Cancel</button>
      <button
        type="button"
        class="button button--yellow"
        :disabled="authStore.isLoading"
        @click="handleConfirm"
      >
        <span v-if="!authStore.isLoading">Log out</span>
        <span v-else>Logging out…</span>
      </button>
    </div>
  </ModalOverlay>
</template>

<style scoped>
.logout-modal__caption {
  margin: 0 0 24px;
  text-align: center;
  color: var(--white);
}
.logout-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.button--ghost {
  background: transparent;
  border: 2px solid var(--purple-light);
  color: var(--white);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
