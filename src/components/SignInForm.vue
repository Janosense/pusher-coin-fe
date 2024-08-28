<script setup>
import { useAuthenticationStore } from '@/stores/authentication.js';

const authenticationStore = useAuthenticationStore();
const props = defineProps({
  redirect: Object,
});
</script>

<template>
  <form action="" class="form">
    <div class="form__header">
      <span class="form__title">Sign in</span> /
      <RouterLink :to="{name: 'sign-up'}">Sign Up</RouterLink>
    </div>
    <div class="form__item">
      <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
      <input type="email" id="email" name="email" class="form__textfield"  required>
    </div>
    <div class="form__item">
      <label for="password" class="form__textfield-label"><sup>*</sup> Password</label>
      <input type="password" id="password" name="password" class="form__textfield"
             required>
    </div>
    <div class="form__actions">
      <button class="button button--yellow form__submit" @click.prevent="authenticationStore.authenticateUser(props.redirect)">Sign In</button>
    </div>
  </form>
</template>

<style scoped>

</style>
