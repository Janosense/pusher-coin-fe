import api from './api.js'

/**
 * Wraps `GET /pc/v1/transactions`. Returns mapped items + the
 * pagination envelope so the view can render Prev/Next.
 */

const mapItem = (r) => ({
  id: r.id,
  type: r.type,
  amountMoney: r.amount_money,
  amountCoins: Number(r.amount_coins || 0),
  unitPrice: r.unit_price,
  status: r.status,
  createdAt: r.created_at,
  settledAt: r.settled_at
})

export const historyService = {
  async list({ page = 1, perPage = 20, type, from, to } = {}) {
    const params = { page, per_page: perPage }
    if (type) params.type = type
    if (from) params.from = from
    if (to) params.to = to

    const response = await api.get('/transactions', { params })
    return {
      items: (response.data?.items || []).map(mapItem),
      total: response.data?.total || 0,
      page: response.data?.page || page,
      perPage: response.data?.per_page || perPage
    }
  }
}

export default historyService
