import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from '@/store/auth.js'

// Import Bootstrap CSS & JS locally
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Import your custom styles
import '@/assets/styles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth before mounting app
const initApp = async () => {
  try {
    const authStore = useAuthStore()
    await authStore.initializeAuth()
    console.log('🔐 Auth initialized:', authStore.isAuthenticated ? 'Authenticated' : 'Not authenticated')
  } catch (error) {
    console.error('Auth initialization failed:', error)
  } finally {
    app.mount('#app')
  }
}

initApp()
