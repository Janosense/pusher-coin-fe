<script setup>
import Queue from '@/components/Queue.vue';
import IconCoin from '@/components/icons/IconCoin.vue';
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
            <div class="history__table-holder">
              <table class="history__table">
                <tr class="history__row">
                  <td class="history__col">#</td>
                  <td class="history__col">Datetime</td>
                  <td class="history__col">Type operation</td>
                  <td class="history__col">Amount</td>
                  <td class="history__col">Status</td>
                </tr>
                <tr v-for="(row, index) in [...Array(50).keys()]" :key="index" class="history__row">
                  <td class="history__col">{{ index + 1 }}</td>
                  <td class="history__col"></td>
                  <td class="history__col"></td>
                  <td class="history__col"></td>
                  <td class="history__col"></td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Queue/>
  </div>
</template>

<style scoped>
.history__table-holder {
  width: 100%;
  overflow: auto;
}

.history__table {
  min-width: 600px;
  overflow: auto;
  border: 1px solid var(--purple-light);
  border-collapse: collapse;

  @media (min-width: 1024px) {
    min-width: 100%;
  }
}

.history__row {
  &:first-child {
    td {
      font-weight: 500;
      text-transform: uppercase;
    }
  }
}

.history__col {
  padding: 8px;
  border: 1px solid var(--purple-light);

  &:first-child {
    width: 32px;
  }

  &:last-child {
    border-right: none;
  }
}
</style>
