<script setup>

import Queue from '@/components/Queue.vue';
import {useAuthenticationStore} from '@/stores/authentication.js'

const authentication = useAuthenticationStore();
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="content__header">
            <h1 class="content__heading">Support</h1>
          </div>
          <div class="content__form-holder">
            <form action="" class="form">
              <div class="form__item">
                <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
                <input type="email" id="email" name="email" class="form__textfield"  required>
              </div>
              <div class="form__item">
                <label for="subject" class="form__textfield-label"><sup>*</sup> Subject</label>
                <input type="text" id="subject" name="password" class="form__textfield" required>
              </div>
              <div class="form__item">
                <label for="message" class="form__textfield-label"><sup>*</sup> Message</label>
                <textarea id="message" cols="30" rows="10" class="form__textfield" required></textarea>
              </div>
              <div class="form__actions">
                <button class="button button--yellow form__submit">
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Queue v-if="authentication.isUserLoggedIn"/>
  </div></template>

<style scoped>

</style>
