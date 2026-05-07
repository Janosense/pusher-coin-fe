<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication.js'

const TERMS_VERSION = import.meta.env.VITE_TERMS_VERSION || '2026-05'

const authStore = useAuthenticationStore()
const route = useRoute()
const router = useRouter()

const accepted = ref(false)
const submitError = ref('')

const handleSubmit = async () => {
  if (!accepted.value) {
    submitError.value = 'You must accept the Terms & Conditions to continue.'
    return
  }
  submitError.value = ''
  const result = await authStore.acceptTerms(TERMS_VERSION)
  if (!result.success) {
    submitError.value = result.error || 'Failed to record acceptance. Please try again.'
    return
  }
  const target = typeof route.query.redirect === 'string' && route.query.redirect ? route.query.redirect : '/'
  router.replace(target).catch(() => router.replace('/'))
}
</script>

<template>
  <div class="view-holder">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form__header">
        <span class="form__title">Terms &amp; Conditions</span>
      </div>
      <p class="form__caption">
        To continue using Pusher Coin you must accept the current Terms &amp; Conditions
        (version <strong>{{ TERMS_VERSION }}</strong>).
      </p>
      <div v-if="submitError" class="form__error form__error--general">{{ submitError }}</div>
      <div class="form__item">
        <label class="form__checkbox-label">
          <input v-model="accepted" type="checkbox" class="form__checkbox" />
          <span class="form__checkbox-title">
            I have read and accept the <a href="#" target="_blank" rel="noopener">Official rules</a>.
          </span>
        </label>
      </div>
      <div class="form__actions">
        <button
          type="submit"
          class="button button--yellow form__submit"
          :disabled="!accepted || authStore.isLoading"
        >
          <span v-if="!authStore.isLoading">Accept and continue</span>
          <span v-else>Saving…</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form__caption {
  margin: 0 0 16px;
  color: var(--purple-light);
  font-size: 14px;
  line-height: 1.5;
}
.form__error--general {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #b00020;
  text-align: center;
}
</style>
