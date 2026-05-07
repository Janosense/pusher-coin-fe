<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication.js'

const authStore = useAuthenticationStore()
const route = useRoute()
const router = useRouter()

const NICKNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

const suggestNickname = () => {
  const hex = [...crypto.getRandomValues(new Uint8Array(3))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `User-${hex}`
}

const nickname = ref(suggestNickname())
const fieldError = ref('')
const submitError = ref('')

const validate = (value) => {
  if (!value || !value.trim()) return 'Nickname is required.'
  if (!NICKNAME_PATTERN.test(value.trim())) {
    return 'Use 3–20 letters, digits, or underscores.'
  }
  return ''
}

const handleSubmit = async () => {
  fieldError.value = validate(nickname.value)
  if (fieldError.value) return

  submitError.value = ''
  const result = await authStore.setNickname(nickname.value.trim())
  if (!result.success) {
    submitError.value = result.error || 'Could not save nickname.'
    return
  }
  const target = typeof route.query.redirect === 'string' && route.query.redirect ? route.query.redirect : '/'
  router.replace(target).catch(() => router.replace('/'))
}

const handleSuggest = () => {
  nickname.value = suggestNickname()
  fieldError.value = ''
}
</script>

<template>
  <div class="view-holder">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form__header">
        <span class="form__title">Choose a nickname</span>
      </div>
      <p class="form__caption">
        Pick a unique name other players will see in chat and the queue.
        Letters, digits, and underscores; 3–20 characters.
      </p>

      <div v-if="submitError" class="form__error form__error--general">{{ submitError }}</div>

      <div class="form__item">
        <label for="nickname" class="form__textfield-label"><sup>*</sup> Nickname</label>
        <input
          id="nickname"
          v-model="nickname"
          type="text"
          class="form__textfield"
          :class="{ 'form__textfield--error': fieldError }"
          autocomplete="off"
          required
        />
        <div v-if="fieldError" class="form__error">{{ fieldError }}</div>
        <button type="button" class="form__suggest" @click="handleSuggest">Suggest a different one</button>
      </div>

      <div class="form__actions">
        <button
          type="submit"
          class="button button--yellow form__submit"
          :disabled="authStore.isLoading"
        >
          <span v-if="!authStore.isLoading">Save and continue</span>
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
.form__suggest {
  margin-top: 6px;
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--yellow);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
</style>
