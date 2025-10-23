<script setup>
import { ref, computed } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRouter } from 'vue-router'
import GoogleSignInButton from './GoogleSignInButton.vue'

const authenticationStore = useAuthenticationStore()
const router = useRouter()

const props = defineProps({
  redirect: Object
})

// Form step management
const currentStep = ref(1) // 1 = credentials, 2 = verification code

// Form data
const formData = ref({
  username: '',
  password: '',
  verificationCode: ''
})

// Form validation state
const fieldErrors = ref({
  username: '',
  password: '',
  verificationCode: ''
})

const hasFieldErrors = computed(() => {
  if (currentStep.value === 1) {
    return fieldErrors.value.username || fieldErrors.value.password
  } else {
    return fieldErrors.value.verificationCode
  }
})

// Form state
const isSubmitting = ref(false)
const submitError = ref('')

// Methods
const clearErrors = () => {
  fieldErrors.value.username = ''
  fieldErrors.value.password = ''
  fieldErrors.value.verificationCode = ''
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
    case 'verificationCode':
      if (!formData.value.verificationCode) {
        fieldErrors.value.verificationCode = 'Verification code is required'
      } else if (!/^\d{6}$/.test(formData.value.verificationCode)) {
        fieldErrors.value.verificationCode = 'Code must be 6 digits'
      } else {
        fieldErrors.value.verificationCode = ''
      }
      break
  }
}

const validateForm = () => {
  if (currentStep.value === 1) {
    validateField('username')
    validateField('password')
  } else {
    validateField('verificationCode')
  }
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

    if (currentStep.value === 1) {
      // Step 1: Request verification code
      const result = await authenticationStore.requestVerification(
        formData.value.username.trim(),
        formData.value.password
      )

      if (result.success) {
        // Move to step 2
        currentStep.value = 2
        console.log('[SignInForm] Verification code sent, moving to step 2')
      } else {
        submitError.value = result.error || 'Failed to send verification code. Please try again.'
      }
    } else {
      // Step 2: Verify code and complete login
      const result = await authenticationStore.verifyCode(
        formData.value.username.trim(),
        formData.value.password,
        formData.value.verificationCode
      )

      if (result.success) {
        // Clear form data for security
        formData.value.username = ''
        formData.value.password = ''
        formData.value.verificationCode = ''

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
        submitError.value = result.error || 'Verification failed. Please try again.'
      }
    }
  } catch (error) {
    console.error('[SignInForm] Submit error:', error)
    submitError.value = error.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const goBackToCredentials = () => {
  currentStep.value = 1
  formData.value.verificationCode = ''
  fieldErrors.value.verificationCode = ''
  clearErrors()
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
  if (currentStep.value === 1) {
    return formData.value.username.trim() &&
      formData.value.password &&
      !isSubmitting.value &&
      !hasFieldErrors.value
  } else {
    return formData.value.verificationCode &&
      !isSubmitting.value &&
      !hasFieldErrors.value
  }
})

const displayError = computed(() => {
  return submitError.value || authenticationStore.error
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return currentStep.value === 1 ? 'Sending Code...' : 'Verifying...'
  }
  return currentStep.value === 1 ? 'Continue' : 'Sign In'
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="form">
    <div class="form__header">
      <span class="form__title">Sign in</span> /
      <RouterLink :to="{ name: 'sign-up' }">Sign Up</RouterLink>
    </div>

    <!-- Step 1: Username and Password -->
    <template v-if="currentStep === 1">
      <!-- Google Sign-In Button -->
      <GoogleSignInButton :redirect="redirect" button-text="signin_with" />

      <div class="form__divider">
        <span class="form__divider-text">Or sign in with email</span>
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
    </template>

    <!-- Step 2: Verification Code -->
    <template v-else>
      <!-- Error message display -->
      <div v-if="displayError" class="form__error" role="alert">
        {{ displayError }}
      </div>

      <div class="form__info-message">
        A 6-digit verification code has been sent. Please enter it below to complete sign in.
      </div>

      <div class="form__item">
        <label for="verificationCode" class="form__textfield-label">
          <sup>*</sup> Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          name="verificationCode"
          class="form__textfield"
          :class="{ 'form__textfield--error': fieldErrors.verificationCode }"
          v-model="formData.verificationCode"
          @input="handleFieldInput('verificationCode')"
          @blur="validateField('verificationCode')"
          :disabled="isSubmitting"
          required
          maxlength="6"
          pattern="\d{6}"
          placeholder="000000"
          autocomplete="one-time-code"
        />
        <div v-if="fieldErrors.verificationCode" class="form__field-error" role="alert">
          {{ fieldErrors.verificationCode }}
        </div>
      </div>

      <div class="form__back-link">
        <button
          type="button"
          @click="goBackToCredentials"
          class="form__link-button"
          :disabled="isSubmitting"
        >
          Back to login
        </button>
      </div>
    </template>

    <div class="form__actions">
      <button
        type="submit"
        class="button button--yellow form__submit"
        :class="{ 'button--loading': isSubmitting }"
        :disabled="!canSubmit"
      >
        {{ submitButtonText }}
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
  background-color: var(--purple-light);
}

.form__divider-text {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background-color: var(--purple-dark);
  color: var(--purple-light);
  font-size: 16px;
}

.form__error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form__info-message {
  background-color: #dbeafe;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.5;
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

.form__back-link {
  margin-top: 1rem;
  text-align: center;
}

.form__link-button {
  background: none;
  border: none;
  color: var(--yellow);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.form__link-button:hover:not(:disabled) {
  opacity: 0.8;
}

.form__link-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
