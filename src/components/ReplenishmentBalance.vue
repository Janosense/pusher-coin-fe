<script setup>
import { computed, onMounted, ref } from 'vue'
import { useWalletStore } from '@/stores/wallet.js'
import { submitLiqpayCheckout } from '@/services/liqpayCheckout.js'

const walletStore = useWalletStore()

const coinQty = ref(5)
const unitPriceInput = ref('40.00')
const submitting = ref(false)
const error = ref('')

const presetQuantities = [1, 3, 5, 10, 25, 50]

const ensureLoaded = async () => {
  if (!walletStore.isInitialized) {
    await walletStore.fetchWallet()
  }
  // Default the price to the operator's `default` once we know it.
  unitPriceInput.value = walletStore.pricing.default
}

onMounted(ensureLoaded)

const priceMin = computed(() => Number(walletStore.pricing.min))
const priceMax = computed(() => Number(walletStore.pricing.max))

const totalAmount = computed(() => {
  const qty = Math.max(0, Math.floor(Number(coinQty.value) || 0))
  const price = Number(unitPriceInput.value) || 0
  return (qty * price).toFixed(2)
})

const priceValid = computed(() => {
  const v = Number(unitPriceInput.value)
  return v >= priceMin.value && v <= priceMax.value
})

const qtyValid = computed(() => Number.isFinite(Number(coinQty.value)) && Number(coinQty.value) >= 1)

const canSubmit = computed(() => priceValid.value && qtyValid.value && !submitting.value)

const increaseQty = () => {
  coinQty.value = (Number(coinQty.value) || 0) + 1
}

const decreaseQty = () => {
  coinQty.value = Math.max(1, (Number(coinQty.value) || 0) - 1)
}

const onQtyInput = (e) => {
  const digits = String(e.target.value).replace(/[^\d]/g, '')
  coinQty.value = digits === '' ? '' : Math.max(1, Number(digits))
}

const onSubmit = async () => {
  error.value = ''
  if (!canSubmit.value) return
  submitting.value = true

  const result = await walletStore.startTopup({
    coinQty: Number(coinQty.value),
    unitPrice: Number(unitPriceInput.value).toFixed(2)
  })

  if (!result.success) {
    error.value = result.error || 'Top-up failed.'
    submitting.value = false
    return
  }

  // Hand off to LiqPay. The browser navigates away, so we don't reset
  // `submitting` — leaving the button disabled prevents double-submit
  // if the user backs up before LiqPay's page loads.
  try {
    submitLiqpayCheckout({
      checkoutUrl: result.checkoutUrl,
      data: result.liqpay.data,
      signature: result.liqpay.signature
    })
  } catch (err) {
    error.value = err.message
    submitting.value = false
  }
}
</script>

<template>
  <div class="replenishment-balance">
    <p class="replenishment-balance__pricing">
      ₴{{ walletStore.pricing.min }} – ₴{{ walletStore.pricing.max }} per coin
    </p>

    <ul class="replenishment-balance__list">
      <li v-for="q in presetQuantities" :key="q" class="replenishment-balance__item">
        <button
          class="replenishment-balance__button button button--yellow"
          :class="{ 'is-active': Number(coinQty) === q }"
          @click="coinQty = q"
        >
          <span>{{ q }}</span>
        </button>
      </li>
    </ul>

    <div class="replenishment-balance__custom-amount">
      <button type="button" @click="decreaseQty">-</button>
      <input
        :value="coinQty"
        inputmode="numeric"
        pattern="[0-9]*"
        @input="onQtyInput"
      />
      <button type="button" @click="increaseQty">+</button>
    </div>

    <label class="replenishment-balance__price-field">
      <span>Price per coin (UAH)</span>
      <input
        v-model="unitPriceInput"
        type="number"
        :min="walletStore.pricing.min"
        :max="walletStore.pricing.max"
        step="0.01"
      />
    </label>

    <p v-if="!priceValid && unitPriceInput" class="replenishment-balance__warn">
      Price must be between ₴{{ walletStore.pricing.min }} and ₴{{ walletStore.pricing.max }}.
    </p>

    <p v-if="error" class="replenishment-balance__error">{{ error }}</p>

    <div class="replenishment-balance__submit-holder">
      <button
        class="replenishment-balance__submit button button--yellow"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        <span>{{ submitting ? 'Redirecting…' : 'Buy' }}</span>
        {{ qtyValid ? coinQty : 0 }} coins
      </button>
      <p v-if="qtyValid && priceValid" class="replenishment-balance__price">
        {{ coinQty }} × ₴{{ Number(unitPriceInput).toFixed(2) }} = ₴{{ totalAmount }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.replenishment-balance__pricing {
  margin: 0;
  padding-top: 16px;
  font-weight: 300;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.replenishment-balance__price {
  margin: 8px 0 0;
  font-weight: 300;
  text-align: center;
}

.replenishment-balance__list {
  list-style-type: none;
  margin: 0;
  padding: 16px 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-between;
  column-gap: 16px;
  row-gap: 16px;

  @media (min-width: 1024px) {
    column-gap: 24px;
    row-gap: 24px;
    padding: 16px 0 24px;
  }
}

.replenishment-balance__button {
  width: 100%;
  min-width: 0;
}

.replenishment-balance__button.is-active {
  outline: 2px solid var(--yellow);
  outline-offset: 2px;
}

.replenishment-balance__custom-amount {
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
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
    font-size: 20px;
    text-align: center;
    text-transform: uppercase;
    transition: all 0.3s ease;
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

.replenishment-balance__price-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.replenishment-balance__price-field input {
  width: 140px;
  padding: 10px 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  text-align: center;
  border: none;
  border-radius: 8px;
  color: var(--purple-light);
  background-color: var(--purple);
  outline: none;
}

.replenishment-balance__warn {
  margin: 0 0 8px;
  text-align: center;
  font-size: 12px;
  color: #facc15;
}

.replenishment-balance__error {
  margin: 0 0 12px;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
}

.replenishment-balance__submit-holder {
  text-align: center;
}

.replenishment-balance__submit {
  min-width: 144px;
}

.replenishment-balance__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
