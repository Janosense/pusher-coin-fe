<script setup>
import { computed, ref } from 'vue'
import { useWalletStore } from '@/stores/wallet.js'

/**
 * Withdrawal request form. Player chooses how many coins to withdraw;
 * the FIFO debit happens server-side and the resulting money payout is
 * shown for confirmation. The actual payout is handled out-of-band by
 * the admin.
 *
 * Designed to be rendered inside an `Overlay`. Emits `submitted` on
 * success so the parent can close the overlay + show a banner.
 */

const emit = defineEmits(['submitted'])

const walletStore = useWalletStore()

const coinQty = ref(1)
const submitting = ref(false)
const error = ref('')

const maxCoins = computed(() => walletStore.balanceCoins)

const onQtyInput = (e) => {
  const digits = String(e.target.value).replace(/[^\d]/g, '')
  const v = digits === '' ? 0 : Number(digits)
  coinQty.value = Math.min(maxCoins.value, Math.max(0, v))
}

const increase = () => {
  coinQty.value = Math.min(maxCoins.value, (Number(coinQty.value) || 0) + 1)
}
const decrease = () => {
  coinQty.value = Math.max(0, (Number(coinQty.value) || 0) - 1)
}

const canSubmit = computed(
  () => Number(coinQty.value) >= 1 && Number(coinQty.value) <= maxCoins.value && !submitting.value
)

/**
 * Money payout preview, computed FIFO over the visible lot stack. The
 * server is the source of truth — this is just a UX preview so the
 * player isn't surprised by the dialog they'll see after submitting.
 */
const previewPayout = computed(() => {
  let remaining = Number(coinQty.value) || 0
  let total = 0
  for (const lot of walletStore.lots) {
    if (remaining <= 0) break
    const take = Math.min(remaining, lot.qty)
    total += take * Number(lot.unitPrice)
    remaining -= take
  }
  return total.toFixed(2)
})

const onSubmit = async () => {
  error.value = ''
  if (!canSubmit.value) return
  submitting.value = true
  const result = await walletStore.requestWithdrawal({ coinQty: Number(coinQty.value) })
  submitting.value = false
  if (!result.success) {
    error.value = result.error || 'Withdrawal failed.'
    return
  }
  emit('submitted', result)
}
</script>

<template>
  <div class="withdraw">
    <p class="withdraw__intro">
      Choose how many coins to withdraw. The payout is processed manually by an
      administrator — usually within a few business days.
    </p>

    <p class="withdraw__balance">
      Available: <strong>{{ maxCoins }} coins</strong>
    </p>

    <div class="withdraw__amount">
      <button type="button" @click="decrease">-</button>
      <input
        :value="coinQty"
        inputmode="numeric"
        pattern="[0-9]*"
        @input="onQtyInput"
      />
      <button type="button" @click="increase">+</button>
    </div>

    <p class="withdraw__preview">
      You'll receive approximately <strong>₴{{ previewPayout }}</strong>
      <span class="withdraw__preview-note">(FIFO from your purchase lots)</span>
    </p>

    <p v-if="error" class="withdraw__error">{{ error }}</p>

    <div class="withdraw__submit-holder">
      <button
        class="withdraw__submit button button--yellow"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        <span v-if="submitting">Submitting…</span>
        <span v-else>Request withdrawal</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.withdraw {
  padding-top: 16px;
}

.withdraw__intro {
  margin: 0 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
}

.withdraw__balance {
  margin: 0 0 16px;
  text-align: center;
  font-size: 14px;
}

.withdraw__amount {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
  margin-bottom: 16px;

  & button {
    -webkit-appearance: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 20px;
    line-height: 1;
    border: 1px solid var(--purple-dark);
    border-radius: 6px;
    color: var(--black);
    background-color: var(--purple-light);
    cursor: pointer;
  }

  & input {
    -webkit-appearance: none;
    display: block;
    width: 140px;
    padding: 12px;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    color: var(--purple-light);
    background-color: var(--purple);
    text-align: center;
    outline: none;
  }
}

.withdraw__preview {
  margin: 0 0 16px;
  text-align: center;
  font-size: 14px;
}

.withdraw__preview-note {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.withdraw__error {
  margin: 0 0 12px;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
}

.withdraw__submit-holder {
  text-align: center;
}

.withdraw__submit {
  min-width: 200px;
}

.withdraw__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
