<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import googleAuthService from '@/services/googleAuthService.js'
import { useAuthenticationStore } from '@/stores/authentication.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'signin_with' // Options: 'signin_with', 'signup_with', 'continue_with'
  },
  redirect: Object
})

const authenticationStore = useAuthenticationStore()
const router = useRouter()

const buttonContainer = ref(null)
const isLoading = ref(false)
const error = ref('')

/**
 * Handle credential response from Google
 * This is called when user successfully signs in with Google
 */
const handleCredentialResponse = async (response) => {
  try {
    error.value = ''
    isLoading.value = true

    console.log('[GoogleSignInButton] Received credential from Google')

    // Authenticate with backend using the Google ID token
    const authResult = await googleAuthService.authenticateWithBackend(response.credential)

    if (authResult.success) {
      console.log(authResult)
      // Store authentication data
      authenticationStore.setUser(authResult.user)
      authenticationStore.setToken(authResult.token)

      // Persist to localStorage
      localStorage.setItem('pusher_coin_auth_token', authResult.token)
      localStorage.setItem('pusher_coin_user_data', JSON.stringify(authResult.user))

      console.log('[GoogleSignInButton] Authentication successful:', authResult.user.username)

      // Navigate to the redirect route or home
      const redirectRoute = props.redirect?.path || props.redirect?.name || '/'

      try {
        await router.push(redirectRoute)
      } catch (navError) {
        console.warn('[GoogleSignInButton] Navigation warning:', navError.message)
        await router.push('/')
      }
    }
  } catch (err) {
    console.error('[GoogleSignInButton] Authentication error:', err)
    error.value = err.message || 'Google Sign-In failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    // Initialize Google Sign-In with callback
    await googleAuthService.initialize(handleCredentialResponse)

    // Render the button if container is available
    if (buttonContainer.value) {
      googleAuthService.renderButton(buttonContainer.value, {
        text: props.buttonText,
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        logo_alignment: 'left'
      })
    }
  } catch (err) {
    console.error('[GoogleSignInButton] Initialization error:', err)
    error.value = 'Failed to load Google Sign-In. Please refresh the page.'
  }
})

onBeforeUnmount(() => {
  // Cancel any pending One Tap prompts
  googleAuthService.cancel()
})
</script>

<template>
  <div class="google-signin">
    <!-- Google button container -->
    <div
      ref="buttonContainer"
      class="google-signin__button-container"
      :class="{ 'google-signin__button-container--loading': isLoading }"
    ></div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="google-signin__loading">
      <div class="google-signin__spinner"></div>
      <span class="google-signin__loading-text">Authenticating...</span>
    </div>

    <!-- Error message -->
    <div v-if="error" class="google-signin__error" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.google-signin {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.google-signin__button-container {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-signin__button-container--loading {
  opacity: 0.6;
  pointer-events: none;
}

.google-signin__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  gap: 0.5rem;
}

.google-signin__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4285f4;
  animation: spin 0.8s linear infinite;
}

.google-signin__loading-text {
  font-size: 0.875rem;
  color: #5f6368;
}

.google-signin__error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Ensure Google button fills the container */
:deep(.google-signin__button-container > div) {
  width: 100% !important;
}
</style>
