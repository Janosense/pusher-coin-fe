<script setup>
import { computed, ref, watch } from 'vue'
import { useWalletStore } from '@/stores/wallet.js'
import { useQueueStore } from '@/stores/queue.js'

/**
 * In-game coin selector and play action.
 *
 * Phase 4 owns the input rules (clamp to balance, +/- buttons,
 * numeric-only input). Phase 6 adds the three states around them:
 * declare coins and join the queue, wait your turn, then toss one coin
 * at a time until the declaration runs out.
 */

defineEmits(['openReplenishmentBalanceOverlay'])

const walletStore = useWalletStore()
const queueStore = useQueueStore()

const isInQueue = computed(() => queueStore.isInQueue)
const isMyTurn = computed(() => queueStore.isMyTurn)
const myPosition = computed(() => queueStore.myPosition)
const coinsRemaining = computed(() => queueStore.coinsRemaining)

const isBusy = ref(false)
const actionError = ref('')

// Server-side reasons the toss can be refused, phrased for a player
// mid-game rather than as raw API codes.
const PLAY_ERRORS = {
  relay_closed: 'The machine is paying out. Try again in a second.',
  not_player_turn: "It's not your turn any more.",
  insufficient_balance: 'You are out of coins.',
  machine_offline: 'The machine is not responding. Your coin was not taken.',
  machine_call_failed: 'The machine refused the toss. Your coin was not taken.',
  machine_not_configured: 'The machine is not set up yet.'
}

const messageFor = (result) =>
  PLAY_ERRORS[result.code] || result.error || 'Something went wrong.'

const onJoin = async () => {
  actionError.value = ''
  isBusy.value = true
  const result = await queueStore.join(Number(coinQty.value) || 1)
  isBusy.value = false
  if (!result.success) actionError.value = messageFor(result)
}

const onLeave = async () => {
  isBusy.value = true
  await queueStore.leave()
  isBusy.value = false
}

const onToss = async () => {
  actionError.value = ''
  isBusy.value = true
  const result = await queueStore.play()
  isBusy.value = false
  if (!result.success) actionError.value = messageFor(result)
}

const maxCoins = computed(() => walletStore.balanceCoins)
const coinQty = ref(1)

const clamp = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return 1
  if (num < 1) return 1
  if (num > maxCoins.value) return maxCoins.value
  return Math.floor(num)
}

// Keep the input in sync if the wallet balance drops below the
// currently-selected qty (e.g. another tab debited).
watch(maxCoins, (newMax) => {
  if (newMax === 0) {
    coinQty.value = 0
  } else if (coinQty.value > newMax) {
    coinQty.value = newMax
  } else if (coinQty.value < 1) {
    coinQty.value = 1
  }
})

const onQtyInput = (e) => {
  const digits = String(e.target.value).replace(/[^\d]/g, '')
  if (digits === '') {
    coinQty.value = ''
    return
  }
  coinQty.value = clamp(digits)
}

const onQtyBlur = () => {
  // If the user left the field empty, snap back to a valid value.
  if (coinQty.value === '' || Number(coinQty.value) < 1) {
    coinQty.value = maxCoins.value === 0 ? 0 : 1
  }
}

const increase = () => {
  if (maxCoins.value === 0) return
  coinQty.value = clamp((Number(coinQty.value) || 0) + 1)
}

const decrease = () => {
  if (maxCoins.value === 0) return
  coinQty.value = Math.max(1, (Number(coinQty.value) || 1) - 1)
}

const atMax = computed(() => maxCoins.value > 0 && Number(coinQty.value) >= maxCoins.value)
const empty = computed(() => maxCoins.value === 0)
const canPlay = computed(
  () => !empty.value && Number(coinQty.value) >= 1 && Number(coinQty.value) <= maxCoins.value
)
</script>

<template>
  <div class="place-bet">
    <p v-if="empty" class="place-bet__empty">
      Your balance is 0 coins. Top up to play.
      <button class="place-bet__topup-link" @click="$emit('openReplenishmentBalanceOverlay')">
        Add balance
      </button>
    </p>

    <template v-else>
      <p class="place-bet__hint">
        Coins available: <strong>{{ maxCoins }}</strong>
      </p>

      <div class="place-bet__amount">
        <button type="button" @click="decrease" :disabled="Number(coinQty) <= 1">-</button>
        <input
          :value="coinQty"
          inputmode="numeric"
          pattern="[0-9]*"
          @input="onQtyInput"
          @blur="onQtyBlur"
        />
        <button type="button" @click="increase" :disabled="atMax">+</button>
      </div>

      <p v-if="atMax" class="place-bet__note">You've reached your coin balance.</p>
    </template>

    <div class="place-bet__submit-holder">
      <!-- Three states: not queued → queued and waiting → holding the
           machine. The coin selector above only matters in the first. -->
      <template v-if="!isInQueue">
        <button
          class="place-bet__submit button button--yellow"
          :disabled="!canPlay || isBusy"
          @click="onJoin"
        >
          <span>{{ isBusy ? 'Joining…' : 'Join queue' }}</span>
        </button>
        <p class="place-bet__phase-note">
          You'll play {{ coinQty || 0 }} coin(s) when your turn comes.
        </p>
      </template>

      <template v-else-if="!isMyTurn">
        <p class="place-bet__waiting">
          You're <strong>#{{ myPosition }}</strong> in the queue with
          <strong>{{ coinsRemaining }}</strong> coin(s) declared.
        </p>
        <button class="place-bet__leave" :disabled="isBusy" @click="onLeave">
          Leave queue
        </button>
      </template>

      <template v-else>
        <button
          class="place-bet__submit place-bet__submit--turn button button--yellow"
          :disabled="isBusy || coinsRemaining < 1"
          @click="onToss"
        >
          <span>{{ isBusy ? 'Tossing…' : 'Toss a coin' }}</span>
        </button>
        <p class="place-bet__phase-note">
          Your turn — <strong>{{ coinsRemaining }}</strong> coin(s) left to play.
        </p>
        <button class="place-bet__leave" :disabled="isBusy" @click="onLeave">
          Give up the turn
        </button>
      </template>

      <p v-if="actionError" class="place-bet__error">{{ actionError }}</p>
    </div>
  </div>
</template>

<style scoped>
.place-bet__hint {
  margin: 24px 0 0;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.place-bet__empty {
  margin: 32px 0;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.place-bet__topup-link {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background: transparent;
  color: var(--yellow);
  border: 1px solid var(--yellow);
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
}

.place-bet__amount {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
  padding: 24px 0 12px;

  @media (min-width: 1024px) {
    padding: 32px 0 12px;
  }

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
    font-style: normal;
    font-size: 20px;
    text-align: center;
    line-height: 1;
    border: 1px solid var(--purple-dark);
    border-radius: 6px;
    color: var(--black);
    background-color: var(--purple-light);
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  & button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  & input {
    -webkit-appearance: none;
    display: block;
    width: 140px;
    height: auto;
    padding: 12px;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    color: var(--purple-light);
    background-color: var(--purple);
    text-align: center;
    outline: none;
  }
}

.place-bet__note {
  margin: 0 0 16px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.place-bet__submit-holder {
  text-align: center;
  padding-bottom: 12px;
}

.place-bet__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.place-bet__phase-note {
  margin: 8px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
}

.place-bet__submit--turn {
  box-shadow: 0 0 0 3px rgba(138, 79, 255, 0.55);
}

.place-bet__waiting {
  margin: 0 0 8px;
  font-size: 14px;
}

.place-bet__leave {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  opacity: 0.75;
}

.place-bet__error {
  margin: 8px 0 0;
  color: #ff8b95;
  font-size: 13px;
}
</style>
