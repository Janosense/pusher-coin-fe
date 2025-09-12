<script setup>
import { useAuthenticationStore } from '@/stores/authentication.js'
import SignInForm from '@/components/SignInForm.vue'

const authentication = useAuthenticationStore()
</script>

<template>
  <div class="content">
    <div class="wrapper content__wrapper">
      <div class="content__header">
        <h1 class="content__heading">Sign In</h1>
        <p class="content__caption">
          Not registered yet??
          <RouterLink :to="{ name: 'sign-up' }">Sign up</RouterLink>
        </p>
      </div>
      <div class="content__form-holder">
        <SignInForm />
      </div>
    </div>
  </div>
</template>
