import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const LoginView = () => import('@/pages/LoginView.vue');
const SignupView = () => import('@/pages/SignupView.vue');
const DashboardStudent = () => import('@/pages/DashboardStudent.vue');
const DashboardInstructor = () => import('@/pages/DashboardInstructor.vue');
const NotFound = () => import('@/pages/NotFound.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },
    { path: '/student', name: 'student', component: DashboardStudent, meta: { requiresAuth: true, role: 'STUDENT' } },
    { path: '/instructor', name: 'instructor', component: DashboardInstructor, meta: { requiresAuth: true, role: 'INSTRUCTOR' } },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // block authed users from visiting login/signup
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.role === 'INSTRUCTOR' ? { name: 'instructor' } : { name: 'student' };
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      // Try to rely on interceptor/refresh:
      // We'll ping a no-op protected route if you have one; else just send to login.
      return { name: 'login', query: { next: to.fullPath } };
    }

    // role check
    const need = (to.meta.role || '').toUpperCase();
    if (need && auth.role !== need) {
      return { name: auth.role === 'INSTRUCTOR' ? 'instructor' : 'student' };
    }
  }
});

export default router;
