<script setup>
import { ref, computed } from 'vue'
import userService from '../services/userService.js'
import { useRouter } from 'vue-router'
import GoogleSignInButton from './GoogleSignInButton.vue'

const router = useRouter()

const formData = ref({
  email: '',
  nickname: '',
  phone: '',
  password: '',
  passwordRepeat: '',
  agreeToRules: false
})

const errors = ref({})
const isLoading = ref(false)

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = () => {
  const newErrors = {}

  // Required field validation
  if (!formData.value.email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!validateEmail(formData.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  }

  if (!formData.value.nickname.trim()) {
    newErrors.nickname = 'Nickname is required'
  }

  if (!formData.value.password) {
    newErrors.password = 'Password is required'
  } else if (formData.value.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters long'
  }

  if (!formData.value.passwordRepeat) {
    newErrors.passwordRepeat = 'Password confirmation is required'
  } else if (formData.value.password !== formData.value.passwordRepeat) {
    newErrors.passwordRepeat = 'Passwords do not match'
  }

  if (!formData.value.agreeToRules) {
    newErrors.agreeToRules = 'You must agree to the official rules'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (event) => {
  event.preventDefault()

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // Create user object with collected data
    const userData = {
      email: formData.value.email.trim(),
      nickname: formData.value.nickname.trim(),
      phone: formData.value.phone.trim(),
      password: formData.value.password
    }

    // Make API call to register the user
    const response = await userService.signUp(userData)

    console.log('Registration successful:', response)

    // Reset form after successful submission
    formData.value = {
      email: '',
      nickname: '',
      phone: '',
      password: '',
      passwordRepeat: '',
      agreeToRules: false
    }
    errors.value = {}
    await router.push({ name: 'sign-in' })
  } catch (error) {
    // Handle registration errors with specific messages
    if (error.name === 'RegistrationError') {
      errors.value.general = error.message
    } else {
      errors.value.general = 'Registration failed. Please try again.'
    }
    console.error('Registration error:', error)
  } finally {
    isLoading.value = false
  }
}

const isFormValid = computed(() => {
  return (
    formData.value.email &&
    formData.value.nickname &&
    formData.value.password &&
    formData.value.passwordRepeat &&
    formData.value.agreeToRules
  )
})
</script>

<template>
  <form @submit="handleSubmit" class="form">
    <div class="form__header">
      <span class="form__title">Sign Up</span> /
      <RouterLink :to="{ name: 'sign-in' }">Sign in</RouterLink>
    </div>

    <!-- Google Sign-Up Button -->
    <GoogleSignInButton button-text="signup_with" />

    <div class="form__divider">
      <span class="form__divider-text">Or sign up with email</span>
    </div>

    <!-- General error message -->
    <div v-if="errors.general" class="form__error form__error--general">
      {{ errors.general }}
    </div>

    <div class="form__item">
      <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
      <input
        type="email"
        id="email"
        name="email"
        class="form__textfield"
        v-model="formData.email"
        :class="{ 'form__textfield--error': errors.email }"
        required
      />
      <div v-if="errors.email" class="form__error">{{ errors.email }}</div>
    </div>
    <div class="form__item">
      <label for="nickname" class="form__textfield-label"><sup>*</sup> Nickname</label>
      <input
        type="text"
        id="nickname"
        name="nickname"
        class="form__textfield"
        v-model="formData.nickname"
        :class="{ 'form__textfield--error': errors.nickname }"
        required
      />
      <div v-if="errors.nickname" class="form__error">{{ errors.nickname }}</div>
    </div>
    <div class="form__item">
      <label for="phone" class="form__textfield-label">Phone</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        class="form__textfield"
        v-model="formData.phone"
        required
      />
    </div>
    <div class="form__item">
      <label for="password" class="form__textfield-label"><sup>*</sup> Password</label>
      <input
        type="password"
        id="password"
        name="password"
        class="form__textfield"
        v-model="formData.password"
        :class="{ 'form__textfield--error': errors.password }"
        required
      />
      <div v-if="errors.password" class="form__error">{{ errors.password }}</div>
    </div>
    <div class="form__item">
      <label for="password-repeat" class="form__textfield-label"
        ><sup>*</sup> Password repeat</label
      >
      <input
        type="password"
        id="password-repeat"
        name="password-repeat"
        class="form__textfield"
        v-model="formData.passwordRepeat"
        :class="{ 'form__textfield--error': errors.passwordRepeat }"
        required
      />
      <div v-if="errors.passwordRepeat" class="form__error">{{ errors.passwordRepeat }}</div>
    </div>
    <div class="form__item">
      <label class="form__checkbox-label">
        <input
          type="checkbox"
          name="rules"
          class="form__checkbox"
          v-model="formData.agreeToRules"
        />
        <span class="form__checkbox-title">I agree with the <a href="">Official rules</a></span>
      </label>
      <div v-if="errors.agreeToRules" class="form__error">{{ errors.agreeToRules }}</div>
    </div>
    <div class="form__actions">
      <button
        type="submit"
        class="button button--yellow form__submit"
        :disabled="isLoading || !isFormValid"
        :class="{ 'button--loading': isLoading }"
      >
        <span v-if="!isLoading">Sign Up</span>
        <span v-else>Registering...</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.form__divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.form__divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
}

.form__divider-text {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background-color: #ffffff;
  color: #6b7280;
  font-size: 0.875rem;
}

.form__error {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form__error--general {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form__textfield--error {
  border-color: #ff4444 !important;
  box-shadow: 0 0 0 1px #ff4444;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button--loading {
  position: relative;
}

.button--loading::after {
  content: '';
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
