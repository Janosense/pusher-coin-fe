import api from './api.js'

// Custom error class for registration errors
class RegistrationError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'RegistrationError'
    this.status = status
    this.data = data
  }
}

// User registration service
export const userService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.nickname - User nickname
   * @param {string} userData.phone - User phone number
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} API response data
   */
  async signUp(userData) {
    try {
      const response = await api.post('/user/sign-up', userData)
      return response.data
    } catch (error) {
      // Handle different types of errors with meaningful messages
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const data = error.response.data

        switch (status) {
          case 400:
            throw new RegistrationError(
              data?.message || 'Invalid registration data. Please check your input.',
              status,
              data
            )
          case 401:
            throw new RegistrationError(
              'Authentication failed. Please check your credentials.',
              status,
              data
            )
          case 409:
            throw new RegistrationError(
              'User already exists. Please try with different email or nickname.',
              status,
              data
            )
          case 422:
            throw new RegistrationError(
              data?.message || 'Validation failed. Please check your input data.',
              status,
              data
            )
          case 500:
            throw new RegistrationError(
              'Server error occurred. Please try again later.',
              status,
              data
            )
          default:
            throw new RegistrationError(
              data?.message || `Registration failed with status ${status}.`,
              status,
              data
            )
        }
      } else if (error.request) {
        // Network error or no response received
        throw new RegistrationError(
          'Network error. Please check your internet connection and try again.',
          0,
          null
        )
      } else {
        // Request configuration error
        throw new RegistrationError('Request configuration error. Please try again.', 0, null)
      }
    }
  }
}

export default userService
