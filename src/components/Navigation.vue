<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import IconAccount from '@/components/icons/IconAccount.vue';
import IconMain from '@/components/icons/IconMain.vue';
import IconSupport from '@/components/icons/IconSupport.vue';
import IconHistory from '@/components/icons/IconHistory.vue';
import IconLogIn from '@/components/icons/IconLogIn.vue';
import IconSettings from '@/components/icons/IconSettings.vue';
import IconLogOut from '@/components/icons/IconLogOut.vue';
import { useNavigationStore } from '@/stores/navigation.js';
import { useAuthenticationStore } from '@/stores/authentication.js';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import IconSignUp from '@/components/icons/IconSignUp.vue';

const navigationStore = useNavigationStore();
const authentication = useAuthenticationStore();
const route = useRoute();

watch(() => route.name, () => {
  navigationStore.closeNavigation();
});
</script>

<template>
  <nav class="navigation" :class="{'navigation--active': navigationStore.isNavigationOpen}">
    <a href="" class="navigation__logo-holder">
    </a>
    <ul class="navigation__list">
      <li class="navigation__item">
        <RouterLink :to="{name: 'home'}" class="navigation__link">
          <IconMain class="navigation__icon"/>
          <span class="navigation__title">Main</span>
        </RouterLink>
      </li>
      <li v-if="authentication.isUserLoggedIn" class="navigation__item">
        <RouterLink :to="{name: 'account'}" class="navigation__link">
          <IconAccount class="navigation__icon"/>
          <span class="navigation__title">Account</span>
        </RouterLink>
      </li>
      <li v-if="authentication.isUserLoggedIn" class="navigation__item">
        <RouterLink :to="{name: 'history'}" class="navigation__link">
          <IconHistory class="navigation__icon"/>
          <span class="navigation__title">History</span>
        </RouterLink>
      </li>
      <li v-if="authentication.isUserLoggedIn" class="navigation__item">
        <a href="#" class="navigation__link">
          <IconSettings class="navigation__icon"/>
          <span class="navigation__title">Settings</span>
        </a>
      </li>
      <li class="navigation__item">
        <RouterLink :to="{name: 'support'}" class="navigation__link">
          <IconSupport class="navigation__icon"/>
          <span class="navigation__title">Support</span>
        </RouterLink>
      </li>
      <li v-if="!authentication.isUserLoggedIn" class="navigation__item">
        <RouterLink :to="{name: 'sign-in'}" class="navigation__link">
          <IconLogIn class="navigation__icon"/>
          <span class="navigation__title">Sign in</span>
        </RouterLink>
      </li>
      <li v-if="!authentication.isUserLoggedIn" class="navigation__item">
        <RouterLink :to="{name: 'sign-up'}" class="navigation__link">
          <IconSignUp class="navigation__icon"/>
          <span class="navigation__title">Sign up</span>
        </RouterLink>
      </li>
      <li v-if="authentication.isUserLoggedIn" class="navigation__item">
        <a href="#" class="navigation__link">
          <IconLogOut class="navigation__icon"/>
          <span class="navigation__title">Log out</span>
        </a>
      </li>
    </ul>
    <LanguageSwitcher/>
  </nav>
</template>

<style scoped>
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  width: 88px;
  height: 100vh;
  background-color: var(--black);
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;

  @media (min-width: 768px) {
    transform: translateX(0);
  }

  @media (min-width: 1920px) {
    width: 100px;
  }
}

.navigation--active {
  transform: translateX(0);
}

.navigation__logo-holder {
  display: block;
  width: 100%;
  height: 88px;
  background-color: rgba(255, 255, 255, 0.1);

  @media (min-width: 1920px) {
    height: 100px;
  }
}

.navigation__list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.navigation__link {
  display: block;
  padding: 14px 12px;
  box-sizing: border-box;
  text-decoration: none;
  color: var(--purple-light);
}

.navigation__link.router-link-active:deep(.navigation__title) {
  color: var(--yellow);
}

.navigation__link.router-link-active:deep(.navigation__icon) {
  fill: var(--yellow);
}

@media (hover: hover) {
  .navigation__link:hover:deep(.navigation__icon) {
    fill: var(--yellow);
  }

  .navigation__link:hover:deep(.navigation__title) {
    color: var(--yellow);
  }
}

.navigation__icon {
  display: block;
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  fill: var(--purple-light);
  transition: fill 0.5s ease-out;

  @media (min-width: 1920px) {
    width: 40px;
    height: 40px;
  }
}

.navigation__title {
  display: block;
  text-align: center;
  text-transform: uppercase;
  transition: all 0.5s ease-out;
}
</style>
