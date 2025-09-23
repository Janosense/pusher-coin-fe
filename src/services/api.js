import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://pusher-coin.ddev.site/wp-json/pc/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging and JWT authentication
api.interceptors.request.use(
  (config) => {
    // Add JWT token to requests if available
    const token = localStorage.getItem('pusher_coin_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers,
      hasAuth: !!token
    })
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging, error handling, and token management
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error('[API Response Error]', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401) {
      console.warn('[API] Token expired or invalid, clearing authentication')

      // Clear stored authentication data
      localStorage.removeItem('pusher_coin_auth_token')
      localStorage.removeItem('pusher_coin_user_data')

      // Dispatch custom event to notify authentication store
      window.dispatchEvent(new CustomEvent('auth:token-expired'))
    }

    return Promise.reject(error)
  }
)

export default api
