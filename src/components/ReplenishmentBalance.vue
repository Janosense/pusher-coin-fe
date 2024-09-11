<script setup>
import { onMounted, ref } from 'vue';
import IMask from 'imask';

const amount = ref(50);
const amountInputRef = ref(null);

const increaseAmount = () => {
  if (parseInt(amount.value)) {
    amount.value++;
  } else {
    amount.value = 1;
  }
};

const decreaseAmount = () => {
  if (parseInt(amount.value)) {
    amount.value = amount.value - 1 >= 0 ? amount.value - 1 : 0;
  } else {
    amount.value = 0;
  }
};

onMounted(() => {
  IMask(amountInputRef.value, {
    mask: Number,
    scale: 0,
    min: 0,
  });
});
</script>

<template>
  <div class="replenishment-balance">
    <p class="replenishment-balance__price">1coin = ₴20</p>
    <ul class="replenishment-balance__list">
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 1"><span>1</span></button>
      </li>
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 3"><span>3</span></button>
      </li>
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 5"><span>5</span></button>
      </li>
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 10"><span>10</span></button>
      </li>
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 25"><span>25</span></button>
      </li>
      <li class="replenishment-balance__item">
        <button class="replenishment-balance__button button button--yellow" @click="amount = 50"><span>50</span></button>
      </li>
    </ul>
    <div class="replenishment-balance__custom-amount">
      <button @click="decreaseAmount">-</button>
      <input v-model="amount" ref="amountInputRef">
      <button @click="increaseAmount">+</button>
    </div>
    <div class="replenishment-balance__submit-holder">
      <button class="replenishment-balance__submit button button--yellow"><span>Buy</span>
        {{ parseInt(amount) ? amount : 0 }} coins
      </button>
      <p v-if="amount" class="replenishment-balance__price">{{ amount }} coins = ₴{{ amount * 20 }}</p>
    </div>
  </div>
</template>

<style scoped>
.replenishment-balance__price {
  margin: 0;
  padding-top: 32px;
  font-weight: 300;
  text-align: center;
}
.replenishment-balance__list {
  list-style-type: none;
  margin: 0;
  padding: 12px 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-between;
  column-gap: 16px;
  row-gap: 16px;

  @media (min-width: 1024px) {
    column-gap: 24px;
    row-gap: 24px;
    padding: 16px 0 40px;
  }
}

.replenishment-balance__button {
  width: 100%;
  min-width: 0;
}

.replenishment-balance__custom-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
  margin-bottom: 32px;

  @media (min-width: 1024px) {
    margin-bottom: 40px;
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
    font-family: "Oswald", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
    font-size: 20px;
    text-align: center;
    text-decoration: none;
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
    height: auto;
    padding: 12px;
    margin: 0;
    box-sizing: border-box;
    font-family: "Oswald", sans-serif;
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

.replenishment-balance__submit-holder {
  text-align: center;
}

.replenishment-balance__submit {
  min-width: 144px;
}
</style>
