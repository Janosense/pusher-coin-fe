<script setup>
import UserControls from '@/components/UserControls.vue';
import Queue from '@/components/Queue.vue';
import Chat from '@/components/Chat.vue';
import IconCoin from '@/components/icons/IconCoin.vue';
</script>

<template>
  <div class="room-view">
    <Chat/>
    <div class="room-view__layout">
      <div class="room-view__stream">
        <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/aARdcfsmPto?autoplay=1&controls=0&showinfo=0&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <UserControls/>
    </div>
    <Queue/>
  </div>
</template>

<style scoped>
  .room-view {
    position: relative;

    @media (min-width: 1024px) {
      display: flex;
      align-items: flex-end;
    }
  }

  .room-view__layout {
    @media (min-width: 1024px) {
      flex-grow: 1;
    }
  }

  .room-view__stream {
    position: relative;
    height: calc(100vh - 218px);
    pointer-events: none;

    @media (min-width: 768px) {
      height: calc(100vh - 184px);
    }

    @media (min-width: 1024px) {
      height: calc(100vh - 200px);
    }

    & iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
