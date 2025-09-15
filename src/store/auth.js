import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authAPI from '@/api/auth.js'
import { setAuthToken, removeAuthToken } from '@/utils/jwt.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const userRoles = computed(() => user.value?.roles || [])
  
  const isHR = computed(() => userRoles.value.includes('HR'))
  
  const isEmployee = computed(() => userRoles.value.includes('EMPLOYEE'))

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const [accessToken, refreshToken] = response.data

      token.value = accessToken
      refreshToken.value = refreshToken

      // Store tokens
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      
      // Set auth header for future requests
      setAuthToken(accessToken)

      // Decode token to get user info (or fetch user profile)
      await fetchUserProfile()

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const logout = async () => {
    try {
      // Call logout API if available
      if (token.value) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state regardless of API call success
      user.value = null
      token.value = null
      refreshToken.value = null
      
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      removeAuthToken()
    }
  }

  const fetchUserProfile = async () => {
    try {
      // Decode JWT token to get basic user info
      if (token.value) {
        const payload = JSON.parse(atob(token.value.split('.')[1]))
        user.value = {
          id: payload.sub,
          email: payload.email,
          roles: payload.roles ? JSON.parse(payload.roles.replace(/\[|\]/g, '').split(', ').map(r => r.trim())) : []
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      await logout()
    }
  }

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refreshToken.value)
      const newAccessToken = response.data

      token.value = newAccessToken
      localStorage.setItem('access_token', newAccessToken)
      setAuthToken(newAccessToken)

      return newAccessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      throw error
    }
  }

  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) {
      token.value = savedToken
      setAuthToken(savedToken)
      await fetchUserProfile()
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    
    // Getters
    isAuthenticated,
    userRoles,
    isHR,
    isEmployee,
    
    // Actions
    login,
    signup,
    logout,
    fetchUserProfile,
    refreshAuthToken,
    initializeAuth
  }
})
