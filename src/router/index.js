import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

// Import pages
import LoginView from '@/pages/LoginView.vue'
import SignupView from '@/pages/SignupView.vue'
import DashboardHR from '@/pages/DashboardHR.vue'
import DashboardEmployee from '@/pages/DashboardEmployee.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup', 
    component: SignupView,
    meta: { requiresGuest: true }
  },
  {
    path: '/hr',
    name: 'HRDashboard',
    component: DashboardHR,
    meta: { 
      requiresAuth: true,
      requiredRole: 'HR'
    }
  },
  {
    path: '/employee',
    name: 'EmployeeDashboard',
    component: DashboardEmployee,
    meta: { 
      requiresAuth: true,
      requiredRole: 'EMPLOYEE'
    }
  },
  {
    path: '/dashboard',
    redirect: (to) => {
      const authStore = useAuthStore()
      if (authStore.user?.roles?.includes('HR')) {
        return '/hr'
      } else if (authStore.user?.roles?.includes('EMPLOYEE')) {
        return '/employee'
      }
      return '/login'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (authStore.user?.roles?.includes('HR')) {
      next('/hr')
    } else if (authStore.user?.roles?.includes('EMPLOYEE')) {
      next('/employee')
    } else {
      next('/dashboard')
    }
    return
  }
  
  // Check role-based access
  if (to.meta.requiredRole && authStore.isAuthenticated) {
    const userRoles = authStore.user?.roles || []
    if (!userRoles.includes(to.meta.requiredRole)) {
      // Redirect to appropriate dashboard
      if (userRoles.includes('HR')) {
        next('/hr')
      } else if (userRoles.includes('EMPLOYEE')) {
        next('/employee')
      } else {
        next('/login')
      }
      return
    }
  }
  
  next()
})

export default router
