<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Queue from '@/components/Queue.vue'
import supportService from '@/services/supportService.js'
import accountService from '@/services/accountService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'

const authentication = useAuthenticationStore()

const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 5000

const subjects = ref([])
const captchaConfig = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const form = ref({ email: '', subjectId: '', description: '' })
const isSending = ref(false)
const formError = ref('')
const sentTicketId = ref(null)

// Logged-in submitters never type their address: the backend files the
// ticket under the account email regardless, so showing an editable
// field would be a lie about what gets sent.
const me = ref(null)
const isLoggedIn = computed(() => authentication.isUserLoggedIn)
const emailVerified = computed(() => !!me.value?.emailVerified)
const emailLocked = computed(() => isLoggedIn.value)
const needsCaptcha = computed(() => !isLoggedIn.value && !!captchaConfig.value)

const descriptionLength = computed(() => form.value.description.trim().length)
const canSubmit = computed(() => {
  if (isSending.value) return false
  if (isLoggedIn.value && !emailVerified.value) return false
  if (!form.value.subjectId) return false
  if (descriptionLength.value < DESCRIPTION_MIN || descriptionLength.value > DESCRIPTION_MAX) return false
  if (!isLoggedIn.value && !form.value.email) return false
  if (needsCaptcha.value && !captchaToken.value) return false
  return true
})

/* ---- captcha ------------------------------------------------------ */

const captchaToken = ref('')
const captchaHost = ref(null)
let captchaWidgetId = null

const SCRIPTS = {
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  hcaptcha: 'https://js.hcaptcha.com/1/api.js?render=explicit'
}

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.dataset.loaded ? resolve() : existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    })
    script.addEventListener('error', () => reject(new Error('captcha script failed to load')))
    document.head.appendChild(script)
  })

const renderCaptcha = async () => {
  const config = captchaConfig.value
  if (!config || !captchaHost.value || captchaWidgetId !== null) return

  try {
    await loadScript(SCRIPTS[config.provider] || SCRIPTS.turnstile)
    const widget = config.provider === 'hcaptcha' ? window.hcaptcha : window.turnstile
    if (!widget) return

    captchaWidgetId = widget.render(captchaHost.value, {
      sitekey: config.siteKey,
      callback: (token) => {
        captchaToken.value = token
      },
      'expired-callback': () => {
        captchaToken.value = ''
      },
      'error-callback': () => {
        captchaToken.value = ''
      }
    })
  } catch {
    // A blocked or unreachable captcha CDN leaves the widget unrendered.
    // Submitting then fails server-side with `captcha_failed`, which is
    // the honest outcome — better than silently dropping the challenge.
    formError.value = 'The captcha could not be loaded. Please reload the page and try again.'
  }
}

const resetCaptcha = () => {
  captchaToken.value = ''
  const widget = captchaConfig.value?.provider === 'hcaptcha' ? window.hcaptcha : window.turnstile
  if (widget && captchaWidgetId !== null) {
    try {
      widget.reset(captchaWidgetId)
    } catch {
      // Widget already gone; nothing to reset.
    }
  }
}

/* ---- lifecycle ---------------------------------------------------- */

onMounted(async () => {
  isLoading.value = true
  try {
    const { subjects: items, captcha } = await supportService.getSubjects()
    subjects.value = items
    captchaConfig.value = captcha
    if (items.length === 1) form.value.subjectId = items[0].id
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Could not load support subjects.'
  } finally {
    isLoading.value = false
  }

  if (isLoggedIn.value) {
    try {
      me.value = await accountService.getMe()
      form.value.email = me.value.email
    } catch {
      // A failed /user/me leaves the email field empty and the send
      // button disabled; the banner below explains why.
    }
  }

  await nextTick()
  if (needsCaptcha.value) renderCaptcha()
})

watch(needsCaptcha, async (needed) => {
  if (needed) {
    await nextTick()
    renderCaptcha()
  }
})

onBeforeUnmount(() => {
  const widget = captchaConfig.value?.provider === 'hcaptcha' ? window.hcaptcha : window.turnstile
  if (widget && captchaWidgetId !== null) {
    try {
      widget.remove(captchaWidgetId)
    } catch {
      // Provider without a remove() — the node goes with the component.
    }
  }
})

/* ---- submit ------------------------------------------------------- */

const errorMessageFor = (err) => {
  const code = err.response?.data?.code
  const messages = {
    email_not_verified: 'Verify your email address before contacting support.',
    captcha_failed: 'Captcha verification failed. Please try again.',
    subject_not_found: 'That subject is no longer available. Pick another one.',
    invalid_description: `Your message must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`,
    invalid_email: 'Enter a valid email address.',
    rate_limited: 'Too many messages sent. Please wait a while and try again.'
  }
  return messages[code] || err.response?.data?.message || 'Could not send your message. Please try again.'
}

const onSubmit = async () => {
  if (!canSubmit.value) return

  formError.value = ''
  isSending.value = true

  try {
    const { ticketId } = await supportService.createTicket({
      email: isLoggedIn.value ? undefined : form.value.email,
      subjectId: form.value.subjectId,
      description: form.value.description.trim(),
      captchaToken: captchaToken.value || undefined
    })
    sentTicketId.value = ticketId
    form.value.description = ''
    form.value.subjectId = ''
    resetCaptcha()
  } catch (err) {
    formError.value = errorMessageFor(err)
    resetCaptcha()
  } finally {
    isSending.value = false
  }
}

const startAnother = () => {
  sentTicketId.value = null
  formError.value = ''
}
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="content__header">
            <h1 class="content__heading">Support</h1>
          </div>

          <div class="content__form-holder">
            <p v-if="isLoading" class="support__notice">Loading…</p>

            <p v-else-if="loadError" class="support__error">{{ loadError }}</p>

            <div v-else-if="sentTicketId" class="support__sent">
              <p class="support__success">
                Thanks — your message is with us. Reference
                <strong>#{{ sentTicketId }}</strong
                >. We'll reply by email.
              </p>
              <button type="button" class="button button--yellow" @click="startAnother">
                <span>Send another message</span>
              </button>
            </div>

            <form v-else class="form" @submit.prevent="onSubmit">
              <p v-if="isLoggedIn && !emailVerified" class="support__error">
                Your email address isn't verified yet, so we can't accept a message from your
                account.
                <RouterLink to="/account?reason=verify-email">Verify it on your account page</RouterLink>
                and come back.
              </p>

              <div class="form__item">
                <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  name="email"
                  class="form__textfield"
                  :readonly="emailLocked"
                  :required="!emailLocked"
                  autocomplete="email"
                />
                <p v-if="emailLocked" class="support__hint">
                  We'll reply to your account address.
                </p>
              </div>

              <div class="form__item">
                <label for="subject" class="form__textfield-label"><sup>*</sup> Subject</label>
                <select
                  id="subject"
                  v-model="form.subjectId"
                  name="subject"
                  class="form__textfield"
                  required
                >
                  <option value="" disabled>Choose a subject</option>
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                    {{ subject.label }}
                  </option>
                </select>
              </div>

              <div class="form__item">
                <label for="message" class="form__textfield-label"><sup>*</sup> Message</label>
                <textarea
                  id="message"
                  v-model="form.description"
                  cols="30"
                  rows="10"
                  class="form__textfield"
                  :maxlength="DESCRIPTION_MAX"
                  required
                ></textarea>
                <p class="support__hint">
                  {{ descriptionLength }} / {{ DESCRIPTION_MAX }} characters
                  <span v-if="descriptionLength < DESCRIPTION_MIN">
                    — at least {{ DESCRIPTION_MIN }}
                  </span>
                </p>
              </div>

              <div v-if="needsCaptcha" class="form__item">
                <div ref="captchaHost" class="support__captcha"></div>
              </div>

              <p v-if="formError" class="support__error">{{ formError }}</p>

              <div class="form__actions">
                <button class="button button--yellow form__submit" :disabled="!canSubmit">
                  <span>{{ isSending ? 'Sending…' : 'Send' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Queue v-if="authentication.isUserLoggedIn" />
  </div>
</template>

<style scoped>
.support__notice,
.support__hint {
  margin: 8px 0 0;
  font-size: 13px;
  opacity: 0.7;
}

.support__error {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 6px;
  background: rgba(220, 53, 69, 0.12);
  color: #ff8b95;
  font-size: 14px;
}

.support__success {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 6px;
  background: rgba(40, 167, 69, 0.12);
  color: #7ddc9a;
  font-size: 14px;
}

.support__captcha {
  min-height: 65px;
}

.support__sent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 12px;
}
</style>
