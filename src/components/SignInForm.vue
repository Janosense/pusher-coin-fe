<script setup>
import { ref, computed } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRouter } from 'vue-router'

const authenticationStore = useAuthenticationStore()
const router = useRouter()

const props = defineProps({
  redirect: Object
})

// Form data
const formData = ref({
  username: '',
  password: ''
})

// Form validation state
const fieldErrors = ref({
  username: '',
  password: ''
})

const hasFieldErrors = computed(() => {
  return fieldErrors.value.username || fieldErrors.value.password
})

// Form state
const isSubmitting = ref(false)
const submitError = ref('')

// Methods
const clearErrors = () => {
  fieldErrors.value.username = ''
  fieldErrors.value.password = ''
  submitError.value = ''
  authenticationStore.clearError()
}

const validateField = (field) => {
  switch (field) {
    case 'username':
      if (!formData.value.username.trim()) {
        fieldErrors.value.username = 'Username or email is required'
      } else if (formData.value.username.trim().length < 3) {
        fieldErrors.value.username = 'Username must be at least 3 characters'
      } else {
        fieldErrors.value.username = ''
      }
      break
    case 'password':
      if (!formData.value.password) {
        fieldErrors.value.password = 'Password is required'
      } else if (formData.value.password.length < 6) {
        fieldErrors.value.password = 'Password must be at least 6 characters'
      } else {
        fieldErrors.value.password = ''
      }
      break
  }
}

const validateForm = () => {
  validateField('username')
  validateField('password')
  return !hasFieldErrors.value
}

const handleSubmit = async () => {
  clearErrors()

  // Validate form
  if (!validateForm()) {
    return
  }

  try {
    isSubmitting.value = true

    // Attempt login
    const result = await authenticationStore.login(
      formData.value.username.trim(),
      formData.value.password
    )

    if (result.success) {
      // Clear form data for security
      formData.value.username = ''
      formData.value.password = ''

      // Navigate to redirect route or dashboard
      const redirectRoute = props.redirect?.path || props.redirect?.name || '/'

      try {
        if (typeof redirectRoute === 'string') {
          await router.push(redirectRoute)
        } else {
          await router.push(redirectRoute)
        }
      } catch (navError) {
        console.warn('[SignInForm] Navigation error:', navError.message)
        // Fallback to home
        await router.push('/')
      }
    } else {
      submitError.value = result.error || 'Login failed. Please try again.'
    }
  } catch (error) {
    console.error('[SignInForm] Submit error:', error)
    submitError.value = error.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const handleFieldInput = (field) => {
  // Clear field error when user starts typing
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = ''
  }

  // Clear submit error when user modifies input
  if (submitError.value) {
    submitError.value = ''
  }
}

// Computed properties for form state
const canSubmit = computed(() => {
  return formData.value.username.trim() &&
    formData.value.password &&
    !isSubmitting.value &&
    !hasFieldErrors.value
})

const displayError = computed(() => {
  return submitError.value || authenticationStore.error
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="form">
    <div class="form__header">
      <span class="form__title">Sign in</span> /
      <RouterLink :to="{ name: 'sign-up' }">Sign Up</RouterLink>
    </div>

    <!-- Error message display -->
    <div v-if="displayError" class="form__error" role="alert">
      {{ displayError }}
    </div>

    <div class="form__item">
      <label for="username" class="form__textfield-label">
        <sup>*</sup> Username or Email
      </label>
      <input
        type="text"
        id="username"
        name="username"
        class="form__textfield"
        :class="{ 'form__textfield--error': fieldErrors.username }"
        v-model="formData.username"
        @input="handleFieldInput('username')"
        @blur="validateField('username')"
        :disabled="isSubmitting"
        required
        autocomplete="username"
      />
      <div v-if="fieldErrors.username" class="form__field-error" role="alert">
        {{ fieldErrors.username }}
      </div>
    </div>

    <div class="form__item">
      <label for="password" class="form__textfield-label">
        <sup>*</sup> Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        class="form__textfield"
        :class="{ 'form__textfield--error': fieldErrors.password }"
        v-model="formData.password"
        @input="handleFieldInput('password')"
        @blur="validateField('password')"
        :disabled="isSubmitting"
        required
        autocomplete="current-password"
      />
      <div v-if="fieldErrors.password" class="form__field-error" role="alert">
        {{ fieldErrors.password }}
      </div>
    </div>

    <div class="form__actions">
      <button
        type="submit"
        class="button button--yellow form__submit"
        :class="{ 'button--loading': isSubmitting }"
        :disabled="!canSubmit"
      >
        <span v-if="!isSubmitting">Sign In</span>
        <span v-else>Signing In...</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.form__error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form__textfield--error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 1px #dc2626;
}

.form__field-error {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.button--loading {
  opacity: 0.75;
  cursor: not-allowed;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
