<script setup>
import IconClose from '@/components/icons/IconClose.vue'

const props = defineProps({
  isOverlayOpen: Boolean,
  title: String,
  caption: String
})
</script>

<template>
  <div class="overlay" :class="{ 'overlay--open': props.isOverlayOpen }">
    <div class="overlay__inner">
      <button class="overlay__close-button" @click="$emit('closeOverlay')">
        <IconClose />
      </button>
      <div class="overlay__content">
        <h3 v-if="title" class="overlay__title">{{ title }}</h3>
        <p v-if="caption" class="overlay__caption">{{ caption }}</p>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.overlay--open {
  opacity: 1;
  pointer-events: auto;
}

.overlay__inner {
  position: relative;
  flex-shrink: 0;
  padding: 32px 20px;
  box-sizing: border-box;
  background-color: var(--purple-dark);
  width: 90%;
  max-width: 440px;
  max-height: 90%;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 44px 32px;
  }

  @media (min-width: 1024px) {
    max-width: 480px;
    max-height: 98%;
  }
}

.overlay__close-button {
  -webkit-appearance: none;
  position: absolute;
  top: 16px;
  right: 16px;
  display: block;
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0);
  border: 0;
  cursor: pointer;

  svg {
    display: block;
    width: 100%;
    height: 100%;
    fill: var(--purple-light);
    transition: fill 0.2s ease;
  }
}

.overlay__close-button:hover:deep(svg) {
  fill: var(--yellow);
}

.overlay__title {
  margin: 0 0 20px;
  text-transform: uppercase;
  text-align: center;
  font-size: 22px;
  font-weight: 700;

  @media (min-width: 1024px) {
    font-size: 24px;
  }

  @media (min-width: 1440px) {
    font-size: 28px;
  }
}

.overlay__caption {
  margin: 0;
  font-weight: 400;
  text-transform: uppercase;
  text-align: center;

  @media (min-width: 1024px) {
    font-size: 18px;
  }

  @media (min-width: 1440px) {
    font-size: 20px;
  }
}
</style>
