<script setup>
import { ref, onMounted } from 'vue'
import googleAuthService from '@/services/googleAuthService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'signin_with' // 'signin_with', 'signup_with', 'continue_with'
  },
  redirect: Object
})

const authenticationStore = useAuthenticationStore()
const router = useRouter()

const isLoading = ref(false)
const error = ref('')
const googleButtonRef = ref(null)

const handleGoogleSignIn = async () => {
  try {
    error.value = ''
    isLoading.value = true

    console.log('[GoogleSignInButton] Starting Google Sign-In flow')

    // Authenticate with Google and backend
    const result = await googleAuthService.signInAndAuthenticate()

    if (result.success) {
      // Update authentication store
      authenticationStore.user.value = result.user
      authenticationStore.token.value = result.token

      // Save to localStorage
      localStorage.setItem('pusher_coin_auth_token', result.token)
      localStorage.setItem('pusher_coin_user_data', JSON.stringify(result.user))

      console.log('[GoogleSignInButton] Sign-in successful for user:', result.user.username)

      // Navigate to redirect route or home
      const redirectRoute = props.redirect?.path || props.redirect?.name || '/'

      try {
        if (typeof redirectRoute === 'string') {
          await router.push(redirectRoute)
        } else {
          await router.push(redirectRoute)
        }
      } catch (navError) {
        console.warn('[GoogleSignInButton] Navigation error:', navError.message)
        await router.push('/')
      }
    }
  } catch (err) {
    console.error('[GoogleSignInButton] Sign-in error:', err)
    error.value = err.message || 'Google Sign-In failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    // Initialize Google Auth Service
    await googleAuthService.initialize()
  } catch (err) {
    console.error('[GoogleSignInButton] Initialization error:', err)
    error.value = 'Failed to initialize Google Sign-In'
  }
})
</script>

<template>
  <div class="google-signin">
    <button
      @click="handleGoogleSignIn"
      :disabled="isLoading"
      class="google-signin__button"
      :class="{ 'google-signin__button--loading': isLoading }"
      type="button"
    >
      <svg class="google-signin__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span v-if="!isLoading" class="google-signin__text">
        {{ buttonText === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google' }}
      </span>
      <span v-else class="google-signin__text">Authenticating...</span>
    </button>

    <div v-if="error" class="google-signin__error" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.google-signin {
  width: 100%;
  margin-bottom: 1rem;
}

.google-signin__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: 'Roboto', 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.google-signin__button:hover:not(:disabled) {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.google-signin__button:active:not(:disabled) {
  background-color: #f1f3f4;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
}

.google-signin__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-signin__button--loading {
  position: relative;
}

.google-signin__icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
}

.google-signin__text {
  line-height: 1;
}

.google-signin__error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

/* Loading animation */
.google-signin__button--loading::after {
  content: '';
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid rgba(60, 64, 67, 0.2);
  border-radius: 50%;
  border-top-color: #3c4043;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
