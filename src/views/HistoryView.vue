<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import RoomQueue from '@/components/RoomQueue.vue'
import historyService from '@/services/historyService.js'

const items = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 20
const isLoading = ref(false)
const error = ref(null)

const filters = ref({
  type: '', // '' | 'topup' | 'withdraw'
  from: '',
  to: ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const fetchPage = async () => {
  isLoading.value = true
  error.value = null
  try {
    const result = await historyService.list({
      page: page.value,
      perPage,
      type: filters.value.type || undefined,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined
    })
    items.value = result.items
    total.value = result.total
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPage)

// Reset to page 1 whenever filters change, then refetch.
watch(
  () => [filters.value.type, filters.value.from, filters.value.to],
  () => {
    page.value = 1
    fetchPage()
  }
)

const goPrev = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchPage()
  }
}
const goNext = () => {
  if (page.value < totalPages.value) {
    page.value += 1
    fetchPage()
  }
}

const clearFilters = () => {
  filters.value = { type: '', from: '', to: '' }
}

const formatDate = (sql) => {
  if (!sql) return '—'
  // Server stores MySQL datetimes in the WP site timezone; render as
  // user-local for readability.
  return new Date(sql.replace(' ', 'T') + 'Z').toLocaleString()
}

const TYPE_LABEL = {
  topup: 'Top-up',
  withdraw: 'Withdrawal'
}

const STATUS_LABEL = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded'
}

const isCredit = (row) => row.type === 'topup' && row.status === 'completed'
const isDebit = (row) =>
  row.type === 'withdraw' && (row.status === 'completed' || row.status === 'pending')
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="content__header">
            <h1 class="content__heading">History</h1>
          </div>

          <div class="history">
            <div class="history__filters">
              <label>
                <span>Type</span>
                <select v-model="filters.type">
                  <option value="">All</option>
                  <option value="topup">Top-ups</option>
                  <option value="withdraw">Withdrawals</option>
                </select>
              </label>
              <label>
                <span>From</span>
                <input v-model="filters.from" type="date" />
              </label>
              <label>
                <span>To</span>
                <input v-model="filters.to" type="date" />
              </label>
              <button v-if="filters.type || filters.from || filters.to" class="history__clear" @click="clearFilters">
                Clear
              </button>
            </div>

            <p v-if="error" class="history__error">{{ error }}</p>

            <div class="history__table-holder">
              <table class="history__table">
                <thead>
                  <tr class="history__row">
                    <td class="history__col">#</td>
                    <td class="history__col">Datetime</td>
                    <td class="history__col">Type</td>
                    <td class="history__col">Coins</td>
                    <td class="history__col">Amount (₴)</td>
                    <td class="history__col">Status</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoading && items.length === 0">
                    <td class="history__col history__col--empty" colspan="6">Loading…</td>
                  </tr>
                  <tr v-else-if="items.length === 0">
                    <td class="history__col history__col--empty" colspan="6">
                      No transactions yet.
                    </td>
                  </tr>
                  <tr v-else v-for="(row, index) in items" :key="row.id" class="history__row">
                    <td class="history__col">{{ (page - 1) * perPage + index + 1 }}</td>
                    <td class="history__col">{{ formatDate(row.createdAt) }}</td>
                    <td class="history__col">{{ TYPE_LABEL[row.type] || row.type }}</td>
                    <td
                      class="history__col"
                      :class="{ 'history__col--credit': isCredit(row), 'history__col--debit': isDebit(row) }"
                    >
                      <span v-if="isCredit(row)">+{{ row.amountCoins }}</span>
                      <span v-else-if="isDebit(row)">−{{ row.amountCoins }}</span>
                      <span v-else>{{ row.amountCoins }}</span>
                    </td>
                    <td class="history__col">{{ row.amountMoney }}</td>
                    <td class="history__col">
                      <span class="status-badge" :class="`status-badge--${row.status}`">
                        {{ STATUS_LABEL[row.status] || row.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="history__pagination">
              <button :disabled="page <= 1 || isLoading" @click="goPrev">← Prev</button>
              <span>Page {{ page }} of {{ totalPages }} ({{ total }} total)</span>
              <button :disabled="page >= totalPages || isLoading" @click="goNext">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <RoomQueue />
  </div>
</template>

<style scoped>
.history__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.history__filters label {
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.history__filters input,
.history__filters select {
  padding: 8px 12px;
  background-color: var(--purple);
  color: var(--white);
  border: 1px solid var(--purple-light);
  border-radius: 6px;
  font-family: 'Oswald', sans-serif;
  font-size: 14px;
  outline: none;
}

.history__filters input:focus,
.history__filters select:focus {
  border-color: var(--yellow);
}

.history__clear {
  padding: 8px 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--purple-light);
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.history__clear:hover {
  border-color: var(--yellow);
  color: var(--yellow);
}

.history__error {
  margin: 0 0 12px;
  padding: 10px 12px;
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
  font-size: 13px;
}

.history__table-holder {
  width: 100%;
  overflow: auto;
}

.history__table {
  width: 100%;
  min-width: 600px;
  overflow: auto;
  border: 1px solid var(--purple-light);
  border-collapse: collapse;
}

.history__row:first-child td {
  font-weight: 500;
  text-transform: uppercase;
  background-color: var(--purple);
}

.history__col {
  padding: 8px 12px;
  border: 1px solid var(--purple-light);
  font-size: 14px;
}

.history__col:first-child {
  width: 48px;
  text-align: center;
}

.history__col--empty {
  text-align: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.5);
}

.history__col--credit {
  color: #4ade80;
  font-weight: 500;
}

.history__col--debit {
  color: #f87171;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.status-badge--pending { color: #facc15; }
.status-badge--completed { color: #4ade80; }
.status-badge--failed { color: #f87171; }
.status-badge--refunded { color: rgba(255, 255, 255, 0.6); }

.history__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.history__pagination button {
  padding: 8px 16px;
  background: transparent;
  color: var(--white);
  border: 1px solid var(--purple-light);
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.history__pagination button:hover:not(:disabled) {
  border-color: var(--yellow);
  color: var(--yellow);
}

.history__pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
