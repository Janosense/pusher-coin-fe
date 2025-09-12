<script setup>
import { onMounted, ref } from 'vue'
import iconCoin from '@/assets/images/iconCoin.png'
import { useRoute } from 'vue-router'

const route = useRoute()
const isQueueOpen = ref(false)
const listItemHeight = ref(document.documentElement.clientWidth >= 1280 ? 60 : 48)
const queueListRef = ref(null)
const activeUsers = [...Array(24).keys()]
let queueOpenStateTimer = null

const setListItemHeight = () => {
  window.addEventListener('resize', () => {
    listItemHeight.value = document.documentElement.clientWidth >= 1280 ? 60 : 48
  })
}

const toggleQueue = () => {
  if (document.documentElement.clientWidth < 1024) {
    clearTimeout(queueOpenStateTimer)
    isQueueOpen.value = !isQueueOpen.value
    if (isQueueOpen.value) {
      queueOpenStateTimer = setTimeout(() => {
        isQueueOpen.value = false
        queueListRef.value.scrollTop = 0
      }, 5000)
    } else {
      clearTimeout(queueOpenStateTimer)
      queueListRef.value.scrollTop = 0
    }
  }
}

const setQueueTimeout = () => {
  if (document.documentElement.clientWidth < 1024) {
    queueOpenStateTimer = setTimeout(() => {
      isQueueOpen.value = false
      queueListRef.value.scrollTop = 0
    }, 5000)
  }
}

const clearQueueTimeout = () => {
  if (document.documentElement.clientWidth < 1024) {
    clearTimeout(queueOpenStateTimer)
  }
}

onMounted(() => {
  setListItemHeight()
})
</script>

<template>
  <div class="queue" :class="{ 'queue--open': isQueueOpen }" @click="toggleQueue">
    <header class="queue__header">
      <h2 class="queue__title">Queue</h2>
      <span class="queue__users-counter">42{{ route.name === 'room' ? '/100' : '' }} Players</span>
    </header>
    <ul
      class="queue__list"
      ref="queueListRef"
      @scroll="clearQueueTimeout"
      @scrollend="setQueueTimeout"
    >
      <li class="queue__item-fixed">
        <span class="queue__number">1</span>
        <div class="queue__photo-holder"></div>
        <span class="queue__nickname">Player 1</span>
        <div class="queue__balance">
          <img :src="iconCoin" alt="coin" />
          {{ 1000 }}
        </div>
        <span class="queue__dots"></span>
      </li>
      <li class="queue__item-fixed">
        <span class="queue__number">17</span>
        <div class="queue__photo-holder"></div>
        <span class="queue__nickname">Player 17</span>
        <div class="queue__balance">
          <img :src="iconCoin" alt="coin" />
          {{ 1000 }}
        </div>
      </li>
      <li
        v-for="(item, index) in activeUsers"
        :key="index"
        :style="{
          top: listItemHeight * index + 'px',
          transitionDelay: isQueueOpen ? 0.3 + index / 30 + 's' : 0 + 's'
        }"
        class="queue__item"
        :class="{ 'queue__item--active-user': item + 1 === 17 }"
      >
        <span class="queue__number">{{ item + 1 }}</span>
        <div class="queue__photo-holder"></div>
        <span class="queue__nickname">Player {{ item + 1 }}</span>
        <div class="queue__balance">
          <img :src="iconCoin" alt="coin" />
          {{ 1000 }}
        </div>
      </li>
    </ul>
    <div class="queue__active-user">
      <span class="queue__number">17</span>
      <div class="queue__photo-holder"></div>
      <span class="queue__nickname">Player 17</span>
      <div class="queue__balance">
        <img :src="iconCoin" alt="coin" />
        1000
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 11;
  width: 200px;
  height: 96px;
  background-color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  transition: height 0.4s ease-out;

  @media (min-width: 1024px) {
    flex-shrink: 0;
    position: relative;
    top: auto;
    right: auto;
    width: 220px;
    height: 100vh;
    background-color: var(--black);
  }

  @media (min-width: 1440px) {
    width: 320px;
  }
}

.queue--open {
  @media (min-width: 100px) and (max-width: 767px) {
    height: calc(100vh - 218px);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    height: calc(100vh - 232px);
  }

  @media (min-width: 100px) and (max-width: 1023px) {
    .queue__list {
      overflow: auto;
    }

    .queue__item-fixed {
      &:nth-child(2) {
        opacity: 0;
        transform: translateX(-60px);
        pointer-events: none;
      }
    }

    .queue__dots {
      opacity: 0;
      transition-delay: 0.2s;

      &::after {
        transition-delay: 0.1s;
      }

      &::before,
      &::after {
        opacity: 0;
      }
    }

    .queue__item {
      transform: translateX(0);
      opacity: 1;
    }
  }
}

.queue__header {
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 12px;
  }

  @media (min-width: 1440px) {
    padding: 24px 20px;
  }
}

.queue__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
}

.queue__users-counter {
  position: relative;
  padding-left: 16px;
  color: var(--yellow);
  text-transform: uppercase;
  font-size: 14px;
}

.queue__users-counter::before {
  content: '';
  position: absolute;
  top: calc(50% - 4px);
  left: 0;
  display: block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: green;
}

.queue__list {
  position: relative;
  list-style-type: none;
  display: block;
  margin: 0;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 1024px) {
    height: calc(100% - 140px);
    overflow: auto;
  }

  @media (min-width: 1280px) {
    height: calc(100% - 152px);
  }
}

.queue__item-fixed {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  column-gap: 4px;
  width: 100%;
  padding: 12px 10px;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s ease-in;

  @media (min-width: 1024px) {
    display: none;
  }

  &:nth-child(1) {
    .queue__photo-holder {
      border-color: #643bf7;
    }
  }

  &:nth-child(2) {
    top: 50px;

    .queue__photo-holder {
      border-color: var(--yellow);
    }
  }
}

.queue__dots {
  position: absolute;
  bottom: -9px;
  left: 41px;
  display: block;
  width: 3px;
  height: 3px;
  background-color: var(--white);
  border-radius: 50%;
  opacity: 1;
  transition: opacity 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    display: block;
    width: 3px;
    height: 3px;
    background-color: var(--white);
    border-radius: 50%;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  &::before {
    top: -6px;
    transition-delay: 0.1s;
  }

  &::after {
    top: -12px;
    transition-delay: 0.2s;
  }
}

.queue__item {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  column-gap: 4px;
  width: 100%;
  padding: 12px 10px;
  box-sizing: border-box;
  font-size: 14px;
  transform: translateX(40px);
  opacity: 0;
  transition: all 0.3s ease-in;

  &:nth-child(3) {
    display: none;

    .queue__photo-holder {
      border-color: #643bf7;
    }
  }

  @media (min-width: 1024px) {
    padding: 12px;
    transform: translateX(0);
    opacity: 1;

    &:nth-child(3) {
      display: flex;

      .queue__number,
      .queue__nickname {
        opacity: 1;
      }
    }
  }

  @media (min-width: 1440px) {
    padding: 12px 20px;
    column-gap: 8px;
    font-size: 16px;
  }
}

.queue__item--active-user {
  .queue__photo-holder {
    border-color: var(--yellow);
  }

  .queue__number,
  .queue__nickname {
    color: var(--yellow);
    opacity: 1;
  }
}

.queue__number {
  flex-shrink: 0;
  width: 16px;
  font-weight: 700;
  text-align: center;
  opacity: 0.8;
}

.queue__photo-holder {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(161, 158, 92, 1);

  @media (min-width: 1280px) {
    width: 32px;
    height: 32px;
  }
}

.queue__nickname {
  display: block;
  width: 56px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--white);
  opacity: 0.8;

  @media (min-width: 1024px) {
    width: 90px;
  }

  @media (min-width: 1440px) {
    width: 140px;
  }
}

.queue__balance {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 4px;
  min-width: 32px;
  margin: 0 0 0 auto;
  padding: 2px 6px 4px 22px;
  color: var(--white);
  font-size: 12px;
  font-weight: 300;
  line-height: 1;
  background-color: rgba(0, 0, 0, 0);
  border: 2px solid var(--yellow);
  border-left: none;
  border-radius: 16px;
  cursor: pointer;

  & img {
    position: absolute;
    top: calc(50% - 16px);
    left: -6px;
    display: block;
    width: 25px;
    height: 30px;
  }

  @media (min-width: 1440px) {
    font-size: 14px;
  }
}

.queue__active-user {
  display: none;

  @media (min-width: 1024px) {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    column-gap: 4px;
    width: 100%;
    padding: 24px 12px;
    box-sizing: border-box;
    background-color: var(--purple);

    .queue__number,
    .queue__nickname {
      opacity: 1;
    }
  }

  @media (min-width: 1440px) {
    padding: 24px 20px;
    column-gap: 8px;
    font-size: 16px;
  }
}
</style>
