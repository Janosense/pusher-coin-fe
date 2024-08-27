<script setup>
import {ref} from 'vue';

import {useNavigationStore} from '@/stores/navigation.js'

const navigation = useNavigationStore();
</script>

<template>
  <button class="hamburger hamburger--arrow" :class="{'is-active': navigation.isNavigationOpen}" type="button"
          @click="navigation.toggleNavigation">
    <span class="hamburger-box">
      <span class="hamburger-inner"></span>
    </span>
  </button>
</template>

<style scoped>
.hamburger {
  display: block;
  margin: 0;
  padding: 4px;
  font-size: 0;
  color: inherit;
  text-transform: none;
  background-color: transparent;
  border: 0;
  overflow: visible;
  transition-property: all;
  transition-duration: 0.3s;
  transition-timing-function: ease-out;
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
}

.hamburger.is-active {
  transform: translateX(80px);
}

.hamburger:hover {
  opacity: 0.7;
}

.hamburger.is-active:hover {
  opacity: 0.7;
}

.hamburger.is-active .hamburger-inner,
.hamburger.is-active .hamburger-inner::before,
.hamburger.is-active .hamburger-inner::after {
  background-color: var(--white);
}

.hamburger-box {
  width: 26px;
  height: 18px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -1px;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  position: absolute;
  width: 26px;
  height: 2px;
  background-color: var(--white);
  border-radius: 4px;
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}

.hamburger-inner::before, .hamburger-inner::after {
  content: "";
  display: block;
}

.hamburger-inner::before {
  top: -7px;
}

.hamburger-inner::after {
  bottom: -7px;
}

/*
   * Arrow
   */
.hamburger--arrow.is-active .hamburger-inner::before {
  transform: translate3d(-6px, 1px, 0) rotate(-45deg) scale(0.7, 1);
}

.hamburger--arrow.is-active .hamburger-inner::after {
  transform: translate3d(-6px, -1px, 0) rotate(45deg) scale(0.7, 1);
}

</style>
