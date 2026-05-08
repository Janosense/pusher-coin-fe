<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import accountService from '@/services/accountService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()

const status = ref('pending') // 'pending' | 'success' | 'failure'
const errorCode = ref('')
const errorMessage = ref('')
const resendBusy = ref(false)
const resendNotice = ref('')

const friendlyMessage = (code) => {
  switch (code) {
    case 'token_invalid':
      return 'This confirmation link is not recognised. It may have already been used.'
    case 'token_expired':
      return 'This confirmation link has expired. Request a new one and try again.'
    default:
      return 'Could not confirm your email. Please try again.'
  }
}

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    status.value = 'failure'
    errorCode.value = 'token_invalid'
    errorMessage.value = friendlyMessage('token_invalid')
    return
  }

  try {
    await accountService.confirmEmail(token)
    status.value = 'success'
    if (authStore.isAuthenticated) {
      await authStore.refreshMe()
    }
    setTimeout(() => router.replace('/account').catch(() => {}), 2000)
  } catch (err) {
    status.value = 'failure'
    errorCode.value = err.response?.data?.code || ''
    errorMessage.value = friendlyMessage(errorCode.value)
  }
})

const handleResend = async () => {
  resendBusy.value = true
  resendNotice.value = ''
  try {
    await accountService.requestEmailConfirmation()
    resendNotice.value = 'A new confirmation link has been sent to your email.'
  } catch (err) {
    resendNotice.value = err.response?.data?.message || 'Could not send a new link right now.'
  } finally {
    resendBusy.value = false
  }
}
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="confirm-email">
            <div v-if="status === 'pending'">
              <h1 class="confirm-email__title">Confirming your email…</h1>
              <p class="confirm-email__body">Hold on a moment.</p>
            </div>
            <div v-else-if="status === 'success'">
              <h1 class="confirm-email__title">Email confirmed</h1>
              <p class="confirm-email__body">Redirecting you to your account…</p>
            </div>
            <div v-else>
              <h1 class="confirm-email__title">Couldn't confirm your email</h1>
              <p class="confirm-email__body">{{ errorMessage }}</p>
              <div v-if="authStore.isAuthenticated" class="confirm-email__actions">
                <button
                  type="button"
                  class="button button--yellow"
                  :disabled="resendBusy"
                  @click="handleResend"
                >
                  <span v-if="!resendBusy">Send a new link</span>
                  <span v-else>Sending…</span>
                </button>
                <p v-if="resendNotice" class="confirm-email__notice">{{ resendNotice }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-email {
  text-align: center;
  padding: 48px 16px;
}
.confirm-email__title {
  margin: 0 0 16px;
  font-size: 28px;
}
.confirm-email__body {
  margin: 0 0 24px;
  color: var(--purple-light);
}
.confirm-email__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.confirm-email__notice {
  margin: 0;
  color: var(--purple-light);
  font-size: 14px;
}
</style>
