

// import { createRouter, createWebHistory } from 'vue-router';
// import { useAuthStore } from '@/store/auth';

// const LoginView = () => import('@/pages/LoginView.vue');
// const SignupView = () => import('@/pages/SignupView.vue');
// const DashboardStudent = () => import('@/pages/DashboardStudent.vue');
// const DashboardInstructor = () => import('@/pages/DashboardInstructor.vue');
// // (NEW) Import the student course view page
// const StudentCourseView = () => import('@/pages/StudentCourseView.vue');
// const NotFound = () => import('@/pages/NotFound.vue');

// const router = createRouter({
//   history: createWebHistory(),
//   routes: [
//     { path: '/', redirect: '/login' },
//     { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
//     { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },
//     { path: '/student', name: 'student', component: DashboardStudent, meta: { requiresAuth: true, role: 'STUDENT' } },
    
//     // (THIS IS THE MISSING PART)
//     // Add the route for viewing a specific course's modules
//     { 
//       path: '/courses/:id/view', 
//       name: 'student-course-view', 
//       component: StudentCourseView, 
//       meta: { requiresAuth: true, role: 'STUDENT' } 
//     },

//     { path: '/instructor', name: 'instructor', component: DashboardInstructor, meta: { requiresAuth: true, role: 'INSTRUCTOR' } },
//     { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
//   ],
// });


// // This part should already be in your file, keep it as is.
// router.beforeEach(async (to) => {
//   const auth = useAuthStore();

//   if (to.meta.guestOnly && auth.isAuthenticated) {
//     return auth.role === 'INSTRUCTOR' ? { name: 'instructor' } : { name: 'student' };
//   }

//   if (to.meta.requiresAuth) {
//     if (!auth.isAuthenticated) {
//       return { name: 'login', query: { next: to.fullPath } };
//     }

//     const need = (to.meta.role || '').toUpperCase();
//     if (need && auth.role !== need) {
//       return { name: auth.role === 'INSTRUCTOR' ? 'instructor' : 'student' };
//     }
//   }
// });


// export default router;


import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const LoginView = () => import('@/pages/LoginView.vue');
const SignupView = () => import('@/pages/SignupView.vue');
const DashboardStudent = () => import('@/pages/DashboardEmployee.vue');
const DashboardInstructor = () => import('@/pages/DashboardHR.vue');
const StudentCourseView = () => import('@/pages/StudentCourseView.vue');
const NotFound = () => import('@/pages/NotFound.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },
    
    // CHANGED: Role updated from 'STUDENT' to 'EMPLOYEE'
    { path: '/student', name: 'student', component: DashboardStudent, meta: { requiresAuth: true, role: 'EMPLOYEE' } },
    
    { 
      path: '/courses/:id/view', 
      name: 'student-course-view', 
      component: StudentCourseView, 
      // CHANGED: Role updated from 'STUDENT' to 'EMPLOYEE'
      meta: { requiresAuth: true, role: 'EMPLOYEE' } 
    },

    // CHANGED: Role updated from 'INSTRUCTOR' to 'HR'
    { path: '/instructor', name: 'instructor', component: DashboardInstructor, meta: { requiresAuth: true, role: 'HR' } },
    
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ],
});


router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.guestOnly && auth.isAuthenticated) {
    // CHANGED: Logic updated to check for 'HR'
    return auth.role === 'HR' ? { name: 'instructor' } : { name: 'student' };
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { next: to.fullPath } };
    }

    const need = (to.meta.role || '').toUpperCase();
    if (need && auth.role !== need) {
      // CHANGED: Logic updated to check for 'HR'
      return { name: auth.role === 'HR' ? 'instructor' : 'student' };
    }
  }
});

export default router;