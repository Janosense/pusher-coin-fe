<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Queue from '@/components/Queue.vue'
import Rooms from '@/components/Rooms.vue'
import FacelessAvatar from '@/components/FacelessAvatar.vue'
import Overlay from '@/components/Overlay.vue'
import ReplenishmentBalance from '@/components/ReplenishmentBalance.vue'
import WithdrawalRequest from '@/components/WithdrawalRequest.vue'
import accountService from '@/services/accountService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useWalletStore } from '@/stores/wallet.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthenticationStore()
const walletStore = useWalletStore()

const me = ref(null)
const isLoading = ref(false)
const generalError = ref('')

const verifyBanner = ref(null)

// ---- nickname edit ----
const isEditingNickname = ref(false)
const nicknameDraft = ref('')
const nicknameError = ref('')

// ---- email verify ----
const emailVerifyBusy = ref(false)
const emailVerifyNotice = ref('')

// ---- phone edit ----
const phoneDraft = ref('')
const phoneError = ref('')
const phoneNotice = ref('')

// ---- password change ----
const passwordStep = ref(1) // 1 = enter passwords, 2 = enter code
const passwordForm = ref({ current: '', next: '', repeat: '', code: '' })
const passwordError = ref('')
const passwordNotice = ref('')
const passwordBusy = ref(false)

// Prefer the wallet store (refreshed after a top-up return) over /user/me,
// which is only refetched on full account reloads.
const balanceMoney = computed(() => walletStore.isInitialized
  ? walletStore.balanceMoney
  : Number(me.value?.balanceMoney || 0).toFixed(2))
const balanceCoins = computed(() => walletStore.isInitialized
  ? walletStore.balanceCoins
  : Number(me.value?.balanceCoins || 0))
const emailVerified = computed(() => !!me.value?.emailVerified)

// ---- top-up overlay + return-from-LiqPay banner ----
const isTopupOverlayOpen = ref(false)
const topupBanner = ref(null) // 'success' | 'cancel' | null
const topupRefreshing = ref(false)

// ---- withdrawal overlay + confirmation banner ----
const isWithdrawOverlayOpen = ref(false)
const withdrawConfirmation = ref(null) // { amountCoins, amountMoney } | null

const onWithdrawalSubmitted = (result) => {
  isWithdrawOverlayOpen.value = false
  withdrawConfirmation.value = {
    amountCoins: result.amountCoins,
    amountMoney: result.amountMoney
  }
}

const dismissWithdrawConfirmation = () => {
  withdrawConfirmation.value = null
}

const handleTopupReturn = async (status) => {
  if (status === 'success') {
    topupBanner.value = 'success'
    topupRefreshing.value = true
    await walletStore.fetchWallet()
    topupRefreshing.value = false
  } else if (status === 'cancel') {
    topupBanner.value = 'cancel'
  }
  // Strip the query param so a page reload doesn't re-trigger the banner.
  if (status) {
    const { topup, ...rest } = route.query
    void topup
    router.replace({ path: '/account', query: rest })
  }
}

const dismissTopupBanner = () => {
  topupBanner.value = null
}

const loadMe = async () => {
  isLoading.value = true
  try {
    me.value = await accountService.getMe()
    phoneDraft.value = me.value.phone || ''
    await authStore.refreshMe()
  } catch (err) {
    generalError.value = err.response?.data?.message || 'Failed to load account.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadMe(), walletStore.fetchWallet()])
  if (route.query.reason === 'verify-email') {
    await nextTick()
    verifyBanner.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  if (route.query.topup) {
    handleTopupReturn(String(route.query.topup))
  }
})

watch(
  () => route.query.reason,
  async (val) => {
    if (val === 'verify-email') {
      await nextTick()
      verifyBanner.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
)

// ---------- nickname ----------
const startNicknameEdit = () => {
  nicknameDraft.value = me.value?.nickname || ''
  nicknameError.value = ''
  isEditingNickname.value = true
}
const cancelNicknameEdit = () => {
  isEditingNickname.value = false
  nicknameError.value = ''
}
const saveNickname = async () => {
  const trimmed = nicknameDraft.value.trim()
  if (!/^[A-Za-z0-9_]{3,20}$/.test(trimmed)) {
    nicknameError.value = 'Use 3–20 letters, digits, or underscores.'
    return
  }
  const result = await authStore.setNickname(trimmed)
  if (!result.success) {
    nicknameError.value = result.error || 'Could not save nickname.'
    return
  }
  isEditingNickname.value = false
  await loadMe()
}

// ---------- email verify ----------
const requestEmailConfirmation = async () => {
  emailVerifyBusy.value = true
  emailVerifyNotice.value = ''
  try {
    const result = await accountService.requestEmailConfirmation()
    emailVerifyNotice.value = result.message || 'Check your inbox for the confirmation link.'
  } catch (err) {
    emailVerifyNotice.value = err.response?.data?.message || 'Could not send confirmation email.'
  } finally {
    emailVerifyBusy.value = false
  }
}

// ---------- phone ----------
const savePhone = async () => {
  phoneError.value = ''
  phoneNotice.value = ''
  const trimmed = phoneDraft.value.trim()
  if (trimmed && !/^[0-9 +()-]{6,20}$/.test(trimmed)) {
    phoneError.value = 'Phone format is invalid.'
    return
  }
  try {
    const updated = await accountService.updateMe({ phone: trimmed })
    me.value = updated
    phoneNotice.value = 'Phone saved.'
  } catch (err) {
    phoneError.value = err.response?.data?.message || 'Could not save phone.'
  }
}

// ---------- password change ----------
const requestPasswordChange = async () => {
  passwordError.value = ''
  passwordNotice.value = ''
  if (!passwordForm.value.current || !passwordForm.value.next || !passwordForm.value.repeat) {
    passwordError.value = 'All fields are required.'
    return
  }
  if (passwordForm.value.next.length < 6) {
    passwordError.value = 'New password must be at least 6 characters.'
    return
  }
  if (passwordForm.value.next !== passwordForm.value.repeat) {
    passwordError.value = 'New passwords do not match.'
    return
  }
  passwordBusy.value = true
  try {
    const result = await accountService.requestPasswordChange()
    passwordStep.value = 2
    passwordNotice.value = result.message || 'A 6-digit code has been sent to your email.'
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Could not start password change.'
  } finally {
    passwordBusy.value = false
  }
}

const confirmPasswordChange = async () => {
  passwordError.value = ''
  passwordNotice.value = ''
  if (!/^\d{6}$/.test(passwordForm.value.code)) {
    passwordError.value = 'Code must be 6 digits.'
    return
  }
  passwordBusy.value = true
  try {
    const envelope = await accountService.confirmPasswordChange({
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.next,
      code: passwordForm.value.code
    })
    authStore.applyEnvelope(envelope)
    passwordForm.value = { current: '', next: '', repeat: '', code: '' }
    passwordStep.value = 1
    passwordNotice.value = 'Password changed. Other sessions have been signed out.'
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Could not change password.'
  } finally {
    passwordBusy.value = false
  }
}

const cancelPasswordCode = () => {
  passwordStep.value = 1
  passwordForm.value.code = ''
  passwordError.value = ''
  passwordNotice.value = ''
}

const handleGatedAction = (action) => {
  if (!emailVerified.value) {
    router.replace({ path: '/account', query: { reason: 'verify-email' } })
    return
  }
  if (action === 'topup') {
    isTopupOverlayOpen.value = true
    return
  }
  if (action === 'withdraw') {
    isWithdrawOverlayOpen.value = true
    return
  }
}
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="content__header">
            <h1 class="content__heading">Account</h1>
          </div>

          <div v-if="generalError" class="account__error">{{ generalError }}</div>

          <div v-if="me" class="account">
            <div
              v-if="topupBanner === 'success'"
              class="account__banner account__banner--success"
              role="status"
            >
              <span class="account__banner-dot account__banner-dot--success" aria-hidden="true"></span>
              <div class="account__banner-body">
                <strong>Payment received.</strong>
                <span v-if="topupRefreshing">Updating your balance…</span>
                <span v-else>Your balance has been updated.</span>
              </div>
              <button type="button" class="button" @click="dismissTopupBanner">Dismiss</button>
            </div>

            <div
              v-if="topupBanner === 'cancel'"
              class="account__banner"
              role="status"
            >
              <span class="account__banner-dot" aria-hidden="true"></span>
              <div class="account__banner-body">
                <strong>Top-up canceled.</strong>
                Your wallet was not charged.
              </div>
              <button type="button" class="button" @click="dismissTopupBanner">Dismiss</button>
            </div>

            <div
              v-if="withdrawConfirmation"
              class="account__banner account__banner--success"
              role="status"
            >
              <span class="account__banner-dot account__banner-dot--success" aria-hidden="true"></span>
              <div class="account__banner-body">
                <strong>Withdrawal requested.</strong>
                {{ withdrawConfirmation.amountCoins }} coins (₴{{ withdrawConfirmation.amountMoney }})
                will be paid out after admin review.
              </div>
              <button type="button" class="button" @click="dismissWithdrawConfirmation">Dismiss</button>
            </div>

            <div
              v-if="!emailVerified"
              ref="verifyBanner"
              class="account__banner"
              role="alert"
            >
              <span class="account__banner-dot" aria-hidden="true"></span>
              <div class="account__banner-body">
                <strong>Your email is not verified.</strong>
                Some features are unavailable until you verify your email.
              </div>
              <button
                type="button"
                class="button button--yellow"
                :disabled="emailVerifyBusy"
                @click="requestEmailConfirmation"
              >
                <span v-if="!emailVerifyBusy">Verify now</span>
                <span v-else>Sending…</span>
              </button>
            </div>

            <div class="account__information">
              <div class="account__photo-holder">
                <FacelessAvatar :seed="me.id" :size="60" />
              </div>
              <span v-if="!isEditingNickname" class="account__nickname" @click="startNicknameEdit">
                {{ me.nickname }}
                <button type="button" class="account__nickname-edit" @click.stop="startNicknameEdit">Edit</button>
              </span>
              <span v-else class="account__nickname-edit-row">
                <input
                  v-model="nicknameDraft"
                  type="text"
                  class="form__textfield account__nickname-input"
                  maxlength="20"
                />
                <button type="button" class="button button--yellow" @click="saveNickname">Save</button>
                <button type="button" class="button" @click="cancelNicknameEdit">Cancel</button>
                <span v-if="nicknameError" class="form__error">{{ nicknameError }}</span>
              </span>
            </div>

            <div class="account__finance">
              <div class="account__action-holder">
                <button class="account__action" :disabled="!emailVerified" @click="handleGatedAction('topup')">
                  <span>{{ balanceCoins }}</span>
                  <span>Add balance</span>
                </button>
              </div>
              <div class="account__action-holder">
                <button class="account__action" :disabled="!emailVerified" @click="handleGatedAction('withdraw')">
                  <span>₴{{ balanceMoney }}</span>
                  <span>Get money</span>
                </button>
              </div>
            </div>

            <div class="account__form-holder">
              <form @submit.prevent="savePhone" class="form account__form">
                <div class="form__header">
                  <span class="form__title">Personal information</span>
                </div>
                <div class="form__item">
                  <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    class="form__textfield"
                    :value="me.email"
                    readonly
                  />
                  <span
                    class="form__verification"
                    :class="{ 'form__verification--active': emailVerified }"
                  >
                    <span v-if="emailVerified">Verified</span>
                    <button
                      v-else
                      type="button"
                      class="form__verification-button"
                      :disabled="emailVerifyBusy"
                      @click="requestEmailConfirmation"
                    >
                      <span v-if="!emailVerifyBusy">Verify</span>
                      <span v-else>Sending…</span>
                    </button>
                  </span>
                  <div v-if="emailVerifyNotice" class="form__notice">{{ emailVerifyNotice }}</div>
                </div>
                <div class="form__item">
                  <label for="phone" class="form__textfield-label">Phone</label>
                  <input
                    id="phone"
                    v-model="phoneDraft"
                    type="tel"
                    name="phone"
                    class="form__textfield"
                  />
                  <span class="form__verification form__verification--neutral" title="Phone verification will land in a later phase.">
                    Not yet supported
                  </span>
                  <div v-if="phoneError" class="form__error">{{ phoneError }}</div>
                  <div v-if="phoneNotice" class="form__notice">{{ phoneNotice }}</div>
                </div>
                <button type="submit" class="form__submit button button--yellow"><span>Save</span></button>
              </form>
            </div>

            <div class="account__form-holder">
              <form
                class="form account__form"
                @submit.prevent="passwordStep === 1 ? requestPasswordChange() : confirmPasswordChange()"
              >
                <div class="form__header">
                  <span class="form__title">Password</span>
                </div>

                <div v-if="passwordError" class="form__error form__error--general">{{ passwordError }}</div>
                <div v-if="passwordNotice" class="form__notice">{{ passwordNotice }}</div>

                <template v-if="passwordStep === 1">
                  <div class="form__item">
                    <label for="current-password" class="form__textfield-label"><sup>*</sup> Current password</label>
                    <input
                      id="current-password"
                      v-model="passwordForm.current"
                      type="password"
                      class="form__textfield"
                      autocomplete="current-password"
                      required
                    />
                  </div>
                  <div class="form__item">
                    <label for="new-password" class="form__textfield-label"><sup>*</sup> New password</label>
                    <input
                      id="new-password"
                      v-model="passwordForm.next"
                      type="password"
                      class="form__textfield"
                      autocomplete="new-password"
                      required
                    />
                  </div>
                  <div class="form__item">
                    <label for="new-password-repeat" class="form__textfield-label"><sup>*</sup> Repeat new password</label>
                    <input
                      id="new-password-repeat"
                      v-model="passwordForm.repeat"
                      type="password"
                      class="form__textfield"
                      autocomplete="new-password"
                      required
                    />
                  </div>
                  <button type="submit" class="form__submit button button--yellow" :disabled="passwordBusy">
                    <span v-if="!passwordBusy">Send code</span>
                    <span v-else>Sending…</span>
                  </button>
                </template>

                <template v-else>
                  <div class="form__item">
                    <label for="password-code" class="form__textfield-label"><sup>*</sup> 6-digit code</label>
                    <input
                      id="password-code"
                      v-model="passwordForm.code"
                      type="text"
                      inputmode="numeric"
                      maxlength="6"
                      class="form__textfield"
                      required
                    />
                  </div>
                  <div class="form__actions">
                    <button type="submit" class="button button--yellow form__submit" :disabled="passwordBusy">
                      <span v-if="!passwordBusy">Verify and save</span>
                      <span v-else>Saving…</span>
                    </button>
                    <button type="button" class="button" @click="cancelPasswordCode">Back</button>
                  </div>
                </template>
              </form>
            </div>

            <div v-if="me.googleLinked" class="account__form-holder">
              <div class="form account__form">
                <div class="form__header">
                  <span class="form__title">Google 2FA</span>
                </div>
                <p class="account__help">
                  Pusher Coin requires that 2-Step Verification is enabled on your Google account.
                  We can't query Google directly — manage 2FA from your Google security settings.
                </p>
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="button button--yellow"
                >
                  Open Google security settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Queue v-if="!authStore.isUserLoggedIn" />
    <Rooms
      v-else
      view="sidebar"
      @on-room-click="(roomId) => router.push({ name: 'room', params: { id: roomId } })"
    />
  </div>
  <Overlay
    :is-overlay-open="isTopupOverlayOpen"
    @close-overlay="isTopupOverlayOpen = false"
    :title="'Replenish balance'"
    :caption="`Your balance: ${balanceCoins} coins`"
  >
    <ReplenishmentBalance />
  </Overlay>
  <Overlay
    :is-overlay-open="isWithdrawOverlayOpen"
    @close-overlay="isWithdrawOverlayOpen = false"
    :title="'Withdraw coins'"
    :caption="`Your balance: ${balanceCoins} coins`"
  >
    <WithdrawalRequest @submitted="onWithdrawalSubmitted" />
  </Overlay>
</template>

<style scoped>
.account__information {
  display: flex;
  align-items: center;
  column-gap: 20px;
  margin-bottom: 40px;
}

.account__photo-holder {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--yellow);
  overflow: hidden;
}

.account__nickname {
  font-size: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 1024px) {
    font-size: 24px;
  }
}

.account__nickname-edit {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 12px;
  text-decoration: underline;
  color: var(--yellow);
  cursor: pointer;
}

.account__nickname-edit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.account__nickname-input {
  width: auto;
  flex: 1 1 200px;
}

.account__form-holder {
  margin-bottom: 48px;
}

.account__form {
  width: auto;
  max-width: 460px;
  margin: 0;
}

.account__finance {
  display: flex;
  column-gap: 20px;
  margin-bottom: 48px;
}

.account__action-holder {
  width: 50%;
  max-width: 220px;
}

.account__action {
  position: relative;
  -webkit-appearance: none;
  display: block;
  width: 100%;
  padding: 16px 16px 16px 24px;
  text-align: left;
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  line-height: 1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: var(--purple);
  color: var(--white);
}

.account__action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.account__action span:first-child {
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
  font-size: 24px;
  color: var(--yellow);
}

.account__banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  background-color: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: 6px;
}

.account__banner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.2);
  flex-shrink: 0;
}

.account__banner--success {
  background-color: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.4);
}

.account__banner-dot--success {
  background-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2);
}

.account__banner-body {
  flex: 1;
  font-size: 14px;
  color: var(--white);
}

.account__error {
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: 4px;
  color: #fff;
}

.account__help {
  margin: 0 0 16px;
  color: var(--purple-light);
  font-size: 14px;
  line-height: 1.5;
}

.form__verification--neutral {
  color: var(--purple-light);
  cursor: help;
}

.form__verification-button {
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--yellow);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.form__notice {
  margin-top: 6px;
  font-size: 13px;
  color: var(--purple-light);
}

.form__error--general {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b00020;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.form__actions {
  display: flex;
  gap: 12px;
}
</style>
