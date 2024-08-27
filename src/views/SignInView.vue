<script setup>
import {useAuthenticationStore} from "@/stores/authentication.js";

const authentication = useAuthenticationStore();
</script>

<template>
  <div class="content">
    <div class="wrapper content__wrapper">
      <div class="content__header">
        <h1 class="content__heading">Sign In</h1>
        <p class="content__caption">Not registered yet??
          <RouterLink :to="{name: 'sign-up'}">Sign up</RouterLink>
        </p>
      </div>
      <div class="content__form-holder">
        <form action="" class="form">
          <div class="form__header">
            <RouterLink :to="{name: 'sign-up'}">Sign Up</RouterLink> /
            <span class="form__title">Sign in</span>
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
            <button class="button button--yellow form__submit" @click="authentication.authenticateUser()">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
