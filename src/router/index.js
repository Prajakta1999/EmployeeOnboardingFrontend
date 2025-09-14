import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const LoginView = () => import('@/pages/LoginView.vue');
const SignupView = () => import('@/pages/SignupView.vue');
const DashboardEmployee = () => import('@/pages/DashboardEmployee.vue');
const DashboardHR = () => import('@/pages/DashboardHR.vue');
const EmployeeTaskView = () => import('@/pages/EmployeeTaskView.vue');
const NotFound = () => import('@/pages/NotFound.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },

    // Employee routes
    { path: '/employee', name: 'employee', component: DashboardEmployee, meta: { requiresAuth: true, role: 'EMPLOYEE' } },
    { path: '/tasks/:id/view', name: 'employee-task-view', component: EmployeeTaskView, meta: { requiresAuth: true, role: 'EMPLOYEE' } },

    // HR routes
    { path: '/hr', name: 'hr', component: DashboardHR, meta: { requiresAuth: true, role: 'HR' } },

    // Catch-all
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Prevent logged-in users from hitting login/signup
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.role === 'HR' ? { name: 'hr' } : { name: 'employee' };
  }

  // Protect authed routes
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { next: to.fullPath } };
    }

    const need = (to.meta.role || '').toUpperCase();
    if (need && auth.role !== need) {
      return { name: auth.role === 'HR' ? 'hr' : 'employee' };
    }
  }
});

export default router;
