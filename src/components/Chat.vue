<script setup>
import IconSendMessage from '@/components/icons/IconSendMessage.vue'
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat.js'

const chatStore = useChatStore()
const message = ref('')
const messages = ref([
  {
    user: 'Player 17',
    message: 'Hello world!'
  },
  {
    user: 'Player 1',
    message: 'Lorem ipsum dolor sit amet'
  },
  {
    user: 'Player 4',
    message: 'Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus'
  },
  {
    user: 'Player 6',
    message: 'Class aptent taciti sociosqu'
  },
  {
    user: 'Player 17',
    message: 'Nunc consequat rutrum massa vitae'
  },
  {
    user: 'Player 4',
    message: 'Suspendisse potenti.'
  }
])
const chatListRef = ref(null)

const sendMessage = () => {
  if (message.value) {
    messages.value.push({
      user: 'Player 17',
      message: message.value
    })
    message.value = ''
    setTimeout(() => {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }, 100)
  }
}
</script>

<template>
  <div class="chat" :class="{ 'chat--open': chatStore.isOpen }">
    <ul class="chat__list" ref="chatListRef">
      <li
        v-for="(charRecord, index) in messages"
        :key="index"
        class="chat__item"
        :class="{ 'chat__item--active-user': charRecord.user === 'Player 17' }"
      >
        <div class="chat__photo-holder"></div>
        <div class="chat__message-holder">
          <span class="chat__user">{{ charRecord.user }}</span>
          <span class="chat__message">{{ charRecord.message }}</span>
        </div>
      </li>
    </ul>
    <div class="chat__input-holder">
      <input
        v-model="message"
        @keyup.enter="sendMessage"
        type="text"
        class="chat__input"
        placeholder="Type here.."
      />
      <button class="chat__send-message" @click="sendMessage">
        <IconSendMessage />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat {
  position: fixed;
  bottom: 160px;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 0;
  border-left: 1px solid var(--purple);
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
  overflow: hidden;
  transition: height 0.3s ease-out;

  @media (min-width: 768px) {
    left: 88px;
    bottom: 184px;
    width: calc(100% - 88px);
  }

  @media (min-width: 1024px) {
    position: relative;
    left: auto;
    bottom: auto;
    flex-shrink: 0;
    width: 220px;
    height: 100vh;
    background-color: var(--black);
    background-image: none;
    border-left: 1px solid var(--purple);
  }

  @media (min-width: 1440px) {
    width: 320px;
  }
}

.chat--open {
  height: calc(100vh - 218px);
  border-bottom: 1px solid #000;

  @media (min-width: 768px) {
    height: calc(100vh - 184px);
  }

  @media (min-width: 1024px) {
    height: 100vh;
  }
}

.chat__list {
  list-style-type: none;
  height: auto;
  width: 60%;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;

  @media (min-width: 1024px) {
    width: 100%;
  }
}

.chat__item {
  margin-bottom: 12px;
  font-size: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 1024px) {
    display: flex;
    align-items: flex-start;
    column-gap: 4px;
    padding: 8px;
    box-sizing: border-box;
    background-color: var(--purple);
    border-radius: 10px;
  }

  @media (min-width: 1440px) {
    width: 90%;
    padding: 12px;
    column-gap: 8px;
  }
}

.chat__item--active-user {
  .chat__user {
    font-weight: 500;
    color: var(--yellow);
  }

  .chat__photo-holder {
    border-color: var(--yellow);
  }

  @media (min-width: 1440px) {
    margin-left: auto;
  }
}

.chat__photo-holder {
  display: none;

  @media (min-width: 1024px) {
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
}

.chat__user {
  display: block;
  margin-bottom: 2px;
  font-weight: 300;
}

.chat__message {
  display: block;
}

.chat__input-holder {
  display: flex;
  align-items: center;
  column-gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  background-color: var(--purple-dark);

  @media (min-width: 1024px) {
    column-gap: 4px;
  }
}

.chat__input {
  -webkit-appearance: none;
  display: block;
  width: 100%;
  height: auto;
  padding: 12px;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Oswald', sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  line-height: 1;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  color: var(--purple-light);
  background-color: var(--purple);
  outline: none;

  @media (min-width: 1024px) {
    padding: 12px 8px;
  }
}

.chat__send-message {
  flex-shrink: 0;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0);
  border: 0;
  outline: none;
  cursor: pointer;

  & svg {
    position: relative;
    top: -4px;
    display: block;
    width: 32px;
    height: 32px;
    fill: var(--purple-light);
    transform: rotate(-30deg);
    transition: fill 0.5s ease-out;
  }
}

@media (hover: hover) {
  .chat__send-message:hover:deep(svg) {
    fill: var(--yellow);
  }
}
</style>
