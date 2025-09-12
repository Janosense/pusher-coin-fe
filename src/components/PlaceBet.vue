<script setup>
import { onMounted, ref } from 'vue'
import IMask from 'imask'

const amount = ref(1)
const amountInputRef = ref(null)

const increaseAmount = () => {
  if (parseInt(amount.value)) {
    amount.value++
  } else {
    amount.value = 1
  }
}

const decreaseAmount = () => {
  if (parseInt(amount.value)) {
    amount.value = amount.value - 1 >= 0 ? amount.value - 1 : 0
  } else {
    amount.value = 0
  }
}

onMounted(() => {
  IMask(amountInputRef.value, {
    mask: Number,
    scale: 0,
    min: 0
  })
})
</script>

<template>
  <div class="place-bet">
    <div class="place-bet__amount">
      <button @click="decreaseAmount">-</button>
      <input v-model="amount" ref="amountInputRef" />
      <button @click="increaseAmount">+</button>
    </div>
    <div class="place-bet__submit-holder">
      <button class="place-bet__submit button button--yellow">
        <span>Play</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.place-bet__amount {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
  padding: 32px 0;

  @media (min-width: 1024px) {
    padding: 40px 0;
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
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
    font-size: 20px;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    transition: all 0.2s ease;
    line-height: 1;
    border: 1px solid var(--purple-dark);
    border-radius: 6px;
    color: var(--black);
    background-color: var(--purple-light);
    cursor: pointer;

    &:hover {
      background-color: #6b7788;
    }
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
    font-optical-sizing: auto;
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

.place-bet__submit-holder {
  text-align: center;
}
</style>
