<script setup>

</script>

<template>
  <form action="" class="form">
    <div class="form__header">
      <span class="form__title">Sign Up</span> /
      <RouterLink :to="{name: 'sign-in'}">Sign in</RouterLink>
    </div>
    <div class="form__item">
      <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
      <input type="email" id="email" name="email" class="form__textfield"  required>
    </div>
    <div class="form__item">
      <label for="nickname" class="form__textfield-label"><sup>*</sup> Nickname</label>
      <input type="text" id="nickname" name="nickname" class="form__textfield"  required>
    </div>
    <div class="form__item">
      <label for="phone" class="form__textfield-label">Phone</label>
      <input type="tel" id="phone" name="phone" class="form__textfield"  required>
    </div>
    <div class="form__item">
      <label for="password" class="form__textfield-label"><sup>*</sup> Password</label>
      <input type="password" id="password" name="password" class="form__textfield"
             required>
    </div>
    <div class="form__item">
      <label for="password-repeat" class="form__textfield-label"><sup>*</sup> Password repeat</label>
      <input type="password" id="password-repeat" name="password-repeat" class="form__textfield"
             required>
    </div>
    <div class="form__item">
      <label class="form__checkbox-label">
        <input type="checkbox" name="rules" class="form__checkbox">
        <span class="form__checkbox-title">I agree with the <a href="">Official rules</a></span>
      </label>
    </div>
    <div class="form__actions">
      <button class="button button--yellow form__submit">Sign Up</button>
    </div>
  </form>
</template>

<style scoped>

</style>
