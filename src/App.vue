<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavigationToggle from "@/components/NavigationToggle.vue";
import Navigation from "@/components/Navigation.vue";

const route = useRoute();
</script>

<template>
  <header v-if="route.name !== 'room'" class="header">
    <div class="wrapper header__wrapper">
      <NavigationToggle/>
      <div class="header__users-counter">41 Players</div>
    </div>
  </header>
  <Navigation/>
  <main>
    <RouterView />
  </main>
  <footer>

  </footer>
</template>

<style scoped>
.header {
  padding: 16px 0;
}

.header__wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
}

.header__users-counter {
  position: relative;
  padding-left: 16px;
  color: var(--yellow);
  text-transform: uppercase;
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  @media (min-width: 1280px) {
    font-size: 18px;
  }
}

.header__users-counter::before {
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
</style>
