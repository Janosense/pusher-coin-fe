<script setup>
import UserControls from '@/components/UserControls.vue';
import Queue from '@/components/Queue.vue';
import Chat from '@/components/Chat.vue';
import Overlay from '@/components/Overlay.vue';
import ReplenishmentBalance from '@/components/ReplenishmentBalance.vue';
import { ref } from 'vue';
import PlaceBet from '@/components/PlaceBet.vue';

const isReplenishmentBalanceOverlayOpen = ref(false);
const isPlaceBetOverlayOpen = ref(false);
</script>

<template>
  <div class="room-view">
    <Chat/>
    <div class="room-view__layout">
      <div class="room-view__stream">
        <iframe width="560" height="315"
                src="https://www.youtube-nocookie.com/embed/oXvPA6l4pts?autoplay=1&controls=0&showinfo=0&mute=1"
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <UserControls
          @open-replenishment-balance-overlay="isReplenishmentBalanceOverlayOpen = true"
          @open-place-bet-overlay="isPlaceBetOverlayOpen = true"
      />
    </div>
    <Queue/>
  </div>
  <Overlay :is-overlay-open="isReplenishmentBalanceOverlayOpen"
           @close-overlay="isReplenishmentBalanceOverlayOpen = false"
           :title="'Replenish balance'"
           :caption="'Your balance: 14 coins'">
    <ReplenishmentBalance/>
  </Overlay>
  <Overlay :is-overlay-open="isPlaceBetOverlayOpen"
           @close-overlay="isPlaceBetOverlayOpen = false"
           :title="'Place your bet'"
           :caption="'Your balance: 14 coins'">
    <PlaceBet/>
  </Overlay>
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
  z-index: 9;
  height: calc(100vh - 218px);
  pointer-events: none;
  min-height: -webkit-fill-available;

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
