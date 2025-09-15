import axios from 'axios'
import { getAuthToken, isTokenExpired, clearTokens } from '@/utils/jwt.js'

// Create axios instance
const http = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor to add auth token
http.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
const onSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    console.log('📝 Form submitted, calling auth.login...')
    
    // ✅ Make sure this calls login, not logout
    const result = await auth.login(credentials)
    
    console.log('📋 Login result:', result)
    
    if (result.success) {
      // Redirect based on user role
      if (auth.isHR) {
        router.push('/hr')
      } else if (auth.isEmployee) {
        router.push('/employee')
      } else {
        router.push('/dashboard')
      }
    } else {
      error.value = result.message || 'Login failed'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'An error occurred during login'
  } finally {
    loading.value = false
  }
}

export default http
