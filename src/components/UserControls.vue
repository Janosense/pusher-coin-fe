<script setup>

import IconSound from '@/components/icons/IconSound.vue';
import IconChat from '@/components/icons/IconChat.vue';
import IconAccount from '@/components/icons/IconAccount.vue';
import IconCoin from '@/components/icons/IconCoin.vue';

import {useChatStore} from "@/stores/chat.js";

const chatStore = useChatStore();
</script>

<template>
  <div class="user-controls">
    <div class="user-controls__wrapper">
      <div class="user-controls__layout">
        <div class="user-controls__layout-inner">
          <RouterLink :to="{name: 'account'}" class="user-controls__account">
            <div class="user-controls__photo-holder">
              <IconAccount class="user-controls__icon user-controls__icon--account"/>
            </div>
            <span class="user-controls__nickname">Player 17</span>
          </RouterLink>
        </div>
        <div class="user-controls__layout-inner user-controls__layout-inner--controls">
          <button class="user-controls__control user-controls__control--chat"
                  @click="chatStore.toggleChat"
                  :class="{'user-controls__control--active': chatStore.isOpen}">
            <IconChat class="user-controls__icon"/>
          </button>
          <button class="user-controls__control">
            <IconSound class="user-controls__icon"/>
          </button>
        </div>
      </div>
      <div class="user-controls__layout">
        <button class="user-controls__button-play" @click="$emit('openPlaceBetOverlay')">Play</button>
      </div>
      <div class="user-controls__layout">
        <div class="user-controls__layout-inner">
          <div class="user-controls__balance">
            <span class="user-controls__title">Balance</span>
            <button class="user-controls__balance-replenishment" @click="$emit('openReplenishmentBalanceOverlay')">
              <IconCoin/> 1000
            </button>
          </div>
        </div>
        <div class="user-controls__layout-inner">
          <div class="user-controls__counter">
            <span class="user-controls__title">Winning</span>
            <span class="user-controls__counter-value">1267890</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-controls {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 10;
  width: 100%;
  padding: 0;

  @media (min-width: 768px) {
    left: 88px;
    width: calc(100% - 88px);
    padding: 12px 0;
  }

  @media (min-width: 1024px) {
    position: relative;
    left: auto;
    bottom: auto;
    width: 100%;
  }

  @media (min-width: 1440px) {
    padding: 20px 0;
  }
}

.user-controls__wrapper {
  display: grid;
  grid-template-columns: 3fr 2fr 3fr;
  align-items: center;
  column-gap: 12px;
}

.user-controls__layout-inner {
  position: relative;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-child {
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      display: block;
      width: 100%;
      height: 2px;
      background-image: linear-gradient(to left, var(--purple-light), rgba(0, 0, 0, 0));
    }
  }
}

.user-controls__layout-inner--controls {
  column-gap: 8px;
}

.user-controls__layout:nth-child(3) .user-controls__layout-inner:first-child {
  &::after {
    background-image: linear-gradient(to right, var(--purple-light), rgba(0, 0, 0, 0));
  }
}

.user-controls__button-play {
  -webkit-appearance: none;
  display: block;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  padding: 0;
  font-family: "Oswald", sans-serif;
  font-size: 26px;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--black);
  background-color: var(--sand);
  border-radius: 50%;
  border: 5px solid var(--yellow);
  box-shadow: -1px 1px 2px 0 rgba(0, 0, 0, 0.6) inset;
  cursor: pointer;

  @media (min-width: 768px) {
    width: 132px;
    height: 132px;
    font-size: 28px;
    border-width: 7px;
  }

  @media (min-width: 1440px) {
    width: 148px;
    height: 148px;
  }
}

.user-controls__account {
  display: flex;
  align-items: center;
  column-gap: 8px;
  text-decoration: none;
}

.user-controls__photo-holder {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--yellow);

  @media (min-width: 1280px) {
    width: 44px;
    height: 44px;
  }
}

.user-controls__icon {
  display: block;
  width: 36px;
  height: 36px;
  fill: var(--purple-light);
}

.user-controls__icon--account {
  display: block;
  width: 24px;
  height: 24px;
  fill: var(--purple);
}

.user-controls__nickname {
  display: block;
  width: 60px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--white);

  @media (min-width: 1280px) {
    width: auto;
    font-size: 20px;
  }
}

.user-controls__control {
  -webkit-appearance: none;
  display: block;
  width: 36px;
  height: auto;
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  font-size: 0;
}

.user-controls__control--active {
  .user-controls__icon {
    fill: var(--yellow)
  }
}

.user-controls__control--chat {

  @media (min-width: 1024px) {
    display: none;
  }
}

.user-controls__balance {
  text-align: center;

  @media (min-width: 1280px) {
    display: flex;
    align-items: center;
    column-gap: 20px;
  }
}

.user-controls__balance-replenishment {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 4px;
  min-width: 90px;
  margin: 8px 0 0;
  padding: 2px 28px 4px 28px;
  font-family: "Oswald", sans-serif;
  font-size: 12px;
  font-weight: 300;
  line-height: 1;
  color: var(--white);
  background-color: rgba(0, 0, 0, 0);
  border: 3px solid var(--yellow);
  border-left: none;
  border-radius: 16px;
  cursor: pointer;

  @media (min-width: 1024px) {
    font-size: 14px;
  }

  @media (min-width: 1280px) {
    margin-top: 0;
  }
}

.user-controls__balance-replenishment svg {
  position: absolute;
  top: calc(50% - 15px);
  left: -6px;
  display: block;
  width: 29px;
  height: 30px;

  @media (min-width: 1024px) {
    top: calc(50% - 17px);
    left: -7px;
    width: 33px;
    height: 34px;
  }
}

.user-controls__balance-replenishment::after {
  content: '+';
  position: absolute;
  top: calc(50% - 8px);
  right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--white);
  text-align: center;
  background-color: green;
  border-radius: 50%;

  @media (min-width: 1024px) {
    right: 4px;
  }
}

.user-controls__title {
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-size: 14px;

  @media (min-width: 1280px) {
    margin-bottom: 0;
    font-size: 16px;
  }
}

.user-controls__counter {
  text-align: center;

  @media (min-width: 1280px) {
    display: flex;
    align-items: center;
    column-gap: 8px;
  }
}

.user-controls__counter-value {
  display: inline-flex;
  padding: 6px 12px;
  color: var(--yellow);
  font-size: 20px;
  letter-spacing: 1px;
  justify-content: center;
  background-color: var(--black);
  border-radius: 8px;

  @media (min-width: 1280px) {
    font-size: 22px;
  }
}
</style>
