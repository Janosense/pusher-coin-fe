<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SignInForm from '@/components/SignInForm.vue'

const route = useRoute()

// Create redirect object from query parameters
const redirectInfo = computed(() => {
  const redirectPath = route.query.redirect
  if (redirectPath) {
    return { path: redirectPath }
  }
  return null
})
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
        <SignInForm :redirect="redirectInfo" />
      </div>
    </div>
  </div>
</template>
