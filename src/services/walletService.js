import api from './api.js'

/**
 * Player wallet endpoints. All routes here are bearer-protected; the
 * shared api.js interceptor attaches the JWT.
 */

const mapWallet = (data) => ({
  balanceMoney: data.balance_money,
  balanceCoins: Number(data.balance_coins || 0),
  lots: (data.lots || []).map((l) => ({
    qty: Number(l.qty || 0),
    unitPrice: l.unit_price
  })),
  pricing: {
    default: data.coin_pricing?.default || '40.00',
    min: data.coin_pricing?.min || '10.00',
    max: data.coin_pricing?.max || '500.00'
  }
})

const mapTopupResponse = (data) => ({
  transactionId: data.transaction_id,
  orderId: data.order_id,
  amount: data.amount,
  checkoutUrl: data.checkout_url,
  liqpay: {
    data: data.liqpay?.data,
    signature: data.liqpay?.signature
  }
})

export const walletService = {
  async getWallet() {
    const response = await api.get('/wallet')
    return mapWallet(response.data)
  },

  async topup({ coinQty, unitPrice }) {
    const response = await api.post('/wallet/topup', {
      coin_qty: coinQty,
      unit_price: unitPrice
    })
    return mapTopupResponse(response.data)
  }
}

export default walletService
