<script setup>
import { onMounted, ref } from 'vue';
import IconRoomEnter from '@/components/icons/IconRoomEnter.vue';

const props = defineProps({
  view: {
    type: String,
    default: 'landscape',
  },
});

const rooms = ref([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]);
const isRoomsOpen = ref(false);
const toggleRooms = () => {
  if (props.view === 'sidebar') {
    isRoomsOpen.value = !isRoomsOpen.value;
  }
};

onMounted(() => {
  if (document.documentElement.clientWidth >= 1024 || props.view !== 'sidebar') {
    isRoomsOpen.value = true;
  }

  window.addEventListener('resize', () => {
    if (document.documentElement.clientWidth >= 1024 || props.view !== 'sidebar') {
      isRoomsOpen.value = true;
    }
  });
})

</script>

<template>
  <div class="rooms" :class="[{'rooms--open': isRoomsOpen}, `rooms--${props.view}`]" @click="toggleRooms">
    <div class="wrapper rooms__wrapper">
      <ul class="rooms__list">
        <li v-for="(room, index) in rooms" class="rooms__item" :key="room.id"
            :style="{animationDelay: index / 10 + 's'}">
          <div @click="() => isRoomsOpen ? $emit('onRoomClick', room.id) : null" class="rooms__link">
            <div class="rooms__image-holder">
            </div>
            <span class="rooms__title">
              Room {{ index + 1 }} <IconRoomEnter class="rooms__icon-enter"/>
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.rooms--sidebar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 11;
  width: 200px;
  height: 120px;
  padding-top: 12px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  transition: height 0.4s ease-out;

  @media (min-width: 1024px) {
    flex-shrink: 0;
    position: relative;
    top: auto;
    right: auto;
    width: 220px;
    height: calc(100vh - 48px);
    background-color: var(--black);
  }

  @media (min-width: 1440px) {
    width: 320px;
  }

  &.rooms--open {
    @media (min-width: 100px) and (max-width: 767px) {
      height: calc(100vh - 58px);
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      height: calc(100vh - 48px);
    }
  }

  .rooms__wrapper {
    padding-left: 0;
    padding-right: 0;

    @media (min-width: 768px) {
      display: block;
    }
  }

  .rooms__list {
    width: 86%;
    column-gap: 16px;
    row-gap: 16px;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      width: 82%;
    }
  }

  .rooms__title {
    font-size: 14px;
  }

  .rooms__image-holder {
    border-radius: 16px;

    &::after {
      border-radius: 16px;
    }
  }
}

.rooms__wrapper {
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
}

.rooms__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-content: center;
  list-style-type: none;
  width: 80%;
  margin: 0 auto;
  padding: 0;
  column-gap: 44px;
  row-gap: 32px;

  @media (min-width: 768px) {
    width: 90%;
    max-width: 1100px;
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    column-gap: 56px;
    row-gap: 40px;
  }

  @media (min-width: 1280px) {
    column-gap: 72px;
    row-gap: 48px;
  }
}

.rooms__item {
  flex-shrink: 0;
  text-align: center;
}

.rooms__link {
  display: block;
  text-decoration: none;
  cursor: pointer;
}

.rooms__image-holder {
  position: relative;
  height: 0;
  padding-bottom: 100%;
  margin-bottom: 8px;
  border-radius: 20px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    z-index: 0;
    width: 200%;
    height: 200%;
    background: conic-gradient(transparent, var(--yellow), transparent 30%);
    animation: rotate 2.5s linear infinite;
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  &::after {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    display: block;
    width: calc(100% - 12px);
    height: calc(100% - 12px);
    background-color: var(--white);
    background-image: url('@/assets/images/room.png');
    background-size: 90%;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 20px;
    animation: 4s linear infinite change-background-size;
    transition: all 0.3s ease;
  }

  @media (min-width: 1280px) {
    margin-bottom: 12px;
  }
}

.rooms__item:nth-child(2) .rooms__image-holder::after {
  animation-delay: 0.2s;
}

.rooms__item:nth-child(3) .rooms__image-holder::after {
  animation-delay: 0.4s;
}

.rooms__item:nth-child(4) .rooms__image-holder::after {
  animation-delay: 0.6s;
}

.rooms__item:nth-child(8) .rooms__image-holder::after {
  animation-delay: 0.8s;
}

.rooms__item:nth-child(7) .rooms__image-holder::after {
  animation-delay: 1s;
}

.rooms__item:nth-child(6) .rooms__image-holder::after {
  animation-delay: 1.2s;
}

.rooms__item:nth-child(5) .rooms__image-holder::after {
  animation-delay: 1.4s;
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}

@keyframes change-background-size {
  0% {
    background-size: 90%;
  }
  86% {
    background-size: 90%;
  }
  93% {
    background-size: 80%;
  }
  100% {
    background-size: 90%;
  }
}

@media (hover: hover) {
  .rooms__link:hover:deep(.rooms__image-holder::before) {
    animation: rotate 2.5s linear infinite;
    opacity: 1;
  }

  .rooms__link:hover:deep(.rooms__image-holder::after) {
    transform: scale(0.97);
  }
}

.rooms__image {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.rooms__title {
  display: inline-flex;
  column-gap: 12px;
  align-items: center;
  text-transform: uppercase;
  color: var(--yellow);

  @media (min-width: 1280px) {
    font-size: 18px;
  }
}

@media (min-width: 1280px) {
  .rooms__title {
    transform: translateX(20px);
    transition: transform 0.5s ease-out;
  }

  .rooms__link:hover:deep(.rooms__title) {
    transform: translateX(0);
  }

  .rooms__link:hover:deep(.rooms__icon-enter) {
    opacity: 1;
  }
}

.rooms__icon-enter {
  display: none;
  width: 28px;
  height: 28px;
  fill: var(--yellow);
  opacity: 0;
  transition: opacity 0.5s ease-out 0.2s;

  @media (min-width: 1280px) {
    display: inline-flex;
  }
}
</style>
