import axios from 'axios'

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Create separate axios instance for JWT authentication
const authApi = axios.create({
  baseURL: import.meta.env.VITE_JWT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for authentication API
authApi.interceptors.request.use(
  (config) => {
    console.log(`[Auth API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[Auth API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor for authentication API
authApi.interceptors.response.use(
  (response) => {
    console.log(`[Auth API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Authentication failed'
    console.error('[Auth API Response Error]', {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage
    })

    // Create a standardized error object
    const authError = new Error(errorMessage)
    authError.status = error.response?.status
    authError.code = error.response?.data?.code
    authError.originalError = error

    return Promise.reject(authError)
  }
)

export const authService = {
  /**
   * Authenticate user and get JWT token
   * @param {string} username - User's username or email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response with token and user data
   */
  async login(username, password) {
    try {
      // Validate input parameters
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Make authentication request
      const response = await authApi.post('/token', {
        username: username.trim(),
        password: password
      })

      // Validate response structure
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format from authentication server')
      }

      return {
        success: true,
        token: response.data.token,
        user: {
          id: response.data.user_id,
          username: response.data.user_nicename,
          email: response.data.user_email,
          displayName: response.data.user_display_name
        },
        tokenExpires: response.data.token_expires || null
      }
    } catch (error) {
      // Handle different types of errors
      if (error.status === 401) {
        throw new Error('Invalid username or password')
      } else if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later')
      } else if (error.status >= 500) {
        throw new Error('Server error. Please try again later')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Login request timed out. Please check your connection')
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network')
      }

      // Re-throw the error if it's already been processed
      throw error
    }
  },

  /**
   * Validate JWT token
   * @param {string} token - JWT token to validate
   * @returns {Promise<Object>} Validation response
   */
  async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required for validation')
      }

      const response = await authApi.post('/token/validate', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return {
        valid: true,
        user: response.data.data || null
      }
    } catch (error) {
      console.warn('[Auth Service] Token validation failed:', error.message)
      return {
        valid: false,
        error: error.message
      }
    }
  },

  /**
   * Refresh JWT token if supported by backend
   * @param {string} token - Current JWT token
   * @returns {Promise<Object>} New token response
   */
  async refreshToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required for refresh')
      }

      const response = await authApi.post('/token/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return {
        success: true,
        token: response.data.token,
        tokenExpires: response.data.token_expires || null
      }
    } catch (error) {
      console.warn('[Auth Service] Token refresh failed:', error.message)
      throw new Error('Unable to refresh token. Please login again')
    }
  },

  /**
   * Request verification code - Step 1 of two-step authentication
   * @param {string} username - User's username or email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response indicating code was sent
   */
  async requestVerification(username, password) {
    try {
      // Validate input parameters
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Make request to send verification code
      const response = await userApi.post('/user/request-verification/', {
        login: username.trim(),
        password: password
      })

      // Check if verification code was sent successfully
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Verification code sent successfully'
        }
      } else {
        throw new Error(response.data?.message || 'Failed to send verification code')
      }
    } catch (error) {
      // Handle different types of errors
      if (error.status === 401) {
        throw new Error('Invalid username or password')
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later')
      } else if (error.status >= 500) {
        throw new Error('Server error. Please try again later')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection')
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network')
      }

      // Re-throw the error if it's already been processed
      throw error
    }
  },

  /**
   * Verify code and complete authentication - Step 2 of two-step authentication
   * @param {string} username - User's username or email
   * @param {string} password - User's password
   * @param {string} code - 6-digit verification code
   * @returns {Promise<Object>} Authentication response with token and user data
   */
  async verifyCode(username, password, code) {
    try {
      // Validate input parameters
      if (!username || !password || !code) {
        throw new Error('Username, password, and verification code are required')
      }

      // Validate code format (6 digits)
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Verification code must be 6 digits')
      }

      // Make verification request
      const response = await userApi.post('/user/verify-code/', {
        login: username.trim(),
        password: password,
        code: code
      })

      // Validate response structure
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format from authentication server')
      }

      return {
        success: true,
        token: response.data.token,
        user: {
          id: response.data.user_id,
          username: response.data.user_nicename,
          email: response.data.user_email,
          displayName: response.data.user_display_name
        },
        tokenExpires: response.data.token_expires || null
      }
    } catch (error) {
      // Handle different types of errors
      if (error.status === 401) {
        throw new Error('Invalid verification code or credentials')
      } else if (error.status === 429) {
        throw new Error('Too many verification attempts. Please try again later')
      } else if (error.status >= 500) {
        throw new Error('Server error. Please try again later')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection')
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network')
      }

      // Re-throw the error if it's already been processed
      throw error
    }
  }
}

export default authService