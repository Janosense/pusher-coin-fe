<script setup>
import SignUpForm from '@/components/SignUpForm.vue'
</script>

<template>
  <div class="content">
    <div class="wrapper content__wrapper">
      <div class="content__header">
        <h1 class="content__heading">Sign Up</h1>
        <p class="content__caption">
          Already registered?
          <RouterLink :to="{ name: 'sign-in' }">Sign in</RouterLink>
        </p>
      </div>
      <div class="content__form-holder">
        <SignUpForm />
      </div>
    </div>
  </div>
</template>
