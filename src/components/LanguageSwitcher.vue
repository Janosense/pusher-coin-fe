<script setup>
import { ref } from 'vue'

const toggle = ref(false)
</script>

<template>
  <div class="language-switcher">
    <ul class="language-switcher__list" :class="{ 'language-switcher__list--active': toggle }">
      <li class="language-switcher__item">
        <button class="language-switcher__button">UA</button>
      </li>
      <li class="language-switcher__item">
        <button class="language-switcher__button">GER</button>
      </li>
    </ul>
    <button
      class="language-switcher__button language-switcher__button--current"
      @click="toggle = !toggle"
    >
      ENG
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  position: relative;
  display: block;
  width: 72px;
  margin: auto auto 20px;
  background-color: var(--purple-dark);
}

.language-switcher__list {
  position: absolute;
  bottom: 100%;
  left: 0;
  list-style-type: none;
  width: 100%;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  transition: height 0.4s ease-out;
}

.language-switcher__list--active {
  height: 200%;
}

.language-switcher__button {
  -webkit-appearance: none;
  display: flex;
  column-gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 8px;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  font-family: 'Oswald', sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
  border: none;
  color: var(--black);
  background-color: var(--purple-light);
  cursor: pointer;
  transition: color 0.4s ease-out;
}

.language-switcher__button:not(.language-switcher__button--current):hover {
  opacity: 0.8;
}

.language-switcher__button--current {
  color: var(--yellow);
  background-color: var(--purple);

  &::after {
    content: '';
    position: relative;
    top: 2px;
    display: inline-block;
    width: 7px;
    height: 7px;
    transform: rotate(45deg);
    border-left: 2px solid var(--purple-light);
    border-top: 2px solid var(--purple-light);
  }
}
</style>
