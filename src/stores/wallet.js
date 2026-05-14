import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import walletService from '@/services/walletService.js'

export const useWalletStore = defineStore('wallet', () => {
  const balanceMoney = ref('0.00')
  const balanceCoins = ref(0)
  const lots = ref([])
  const pricing = ref({ default: '40.00', min: '10.00', max: '500.00' })
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  const fetchWallet = async () => {
    isLoading.value = true
    error.value = null
    try {
      const wallet = await walletService.getWallet()
      balanceMoney.value = wallet.balanceMoney
      balanceCoins.value = wallet.balanceCoins
      lots.value = wallet.lots
      pricing.value = wallet.pricing
      isInitialized.value = true
      return { success: true, wallet }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Start a top-up. Returns the LiqPay envelope so the caller can
   * submit a form POST to the hosted checkout. Doesn't navigate by
   * itself — the calling component owns that, so it can read the
   * envelope, build the form, and submit synchronously without
   * Vue intervening.
   */
  const startTopup = async ({ coinQty, unitPrice }) => {
    try {
      const result = await walletService.topup({ coinQty, unitPrice })
      return { success: true, ...result }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        code: err.response?.data?.code
      }
    }
  }

  return {
    balanceMoney: computed(() => balanceMoney.value),
    balanceCoins: computed(() => balanceCoins.value),
    lots: computed(() => lots.value),
    pricing: computed(() => pricing.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isInitialized: computed(() => isInitialized.value),
    fetchWallet,
    startTopup
  }
})
