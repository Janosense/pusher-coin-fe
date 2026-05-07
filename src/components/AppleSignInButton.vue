<script setup>
import { ref, onMounted, computed } from 'vue'
import appleAuthService from '@/services/appleAuthService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'

defineProps({
  buttonText: { type: String, default: 'Sign in with Apple' }
})
const emit = defineEmits(['requires-verification'])

const authStore = useAuthenticationStore()
const isLoading = ref(false)
const error = ref('')

const isAvailable = computed(() => appleAuthService.isConfigured())

const handleClick = async () => {
  if (!isAvailable.value) return
  error.value = ''
  isLoading.value = true
  try {
    const idToken = await appleAuthService.signIn()
    if (!idToken) {
      throw new Error('Apple Sign-In was cancelled.')
    }
    const result = await appleAuthService.authenticateWithBackend(idToken)
    if (result.requiresVerification) {
      await authStore.requestGoogleVerification(result.idToken) // reuses pending-verification slot
      emit('requires-verification')
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Apple Sign-In failed.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (isAvailable.value) {
    appleAuthService.initialize().catch((err) => {
      error.value = err.message || 'Failed to initialise Apple Sign-In.'
    })
  }
})
</script>

<template>
  <div v-if="isAvailable" class="apple-signin">
    <button
      type="button"
      class="apple-signin__button"
      :disabled="isLoading"
      @click="handleClick"
    >
      <span v-if="!isLoading"></span>
      <span v-else>Authenticating…</span>
      <span class="apple-signin__label">{{ buttonText }}</span>
    </button>
    <div v-if="error" class="apple-signin__error" role="alert">{{ error }}</div>
  </div>
</template>

<style scoped>
.apple-signin {
  width: 100%;
  margin-bottom: 1rem;
}
.apple-signin__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  background: #000;
  color: #fff;
  border: 0;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.apple-signin__button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.apple-signin__error {
  margin-top: 8px;
  padding: 8px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b00020;
  border-radius: 4px;
  font-size: 13px;
}
</style>
