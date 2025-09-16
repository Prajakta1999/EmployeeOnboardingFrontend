<<<<<<< HEAD


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


=======
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const LoginView = () => import('@/pages/LoginView.vue');
const SignupView = () => import('@/pages/SignupView.vue');
<<<<<<< HEAD
const DashboardStudent = () => import('@/pages/DashboardStudent.vue');
const DashboardInstructor = () => import('@/pages/DashboardInstructor.vue');
const StudentCourseView = () => import('@/pages/StudentCourseView.vue');
=======
const DashboardEmployee = () => import('@/pages/DashboardEmployee.vue');
const DashboardHR = () => import('@/pages/DashboardHR.vue');
const EmployeeTaskView = () => import('@/pages/EmployeeTaskView.vue');
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
const NotFound = () => import('@/pages/NotFound.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },
<<<<<<< HEAD
    
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
    
=======

    // Employee routes
    { path: '/employee', name: 'employee', component: DashboardEmployee, meta: { requiresAuth: true, role: 'EMPLOYEE' } },
    { path: '/tasks/:id/view', name: 'employee-task-view', component: EmployeeTaskView, meta: { requiresAuth: true, role: 'EMPLOYEE' } },

    // HR routes
    { path: '/hr', name: 'hr', component: DashboardHR, meta: { requiresAuth: true, role: 'HR' } },

    // Catch-all
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ],
});

<<<<<<< HEAD

=======
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Prevent logged-in users from hitting login/signup
  if (to.meta.guestOnly && auth.isAuthenticated) {
<<<<<<< HEAD
    // CHANGED: Logic updated to check for 'HR'
    return auth.role === 'HR' ? { name: 'instructor' } : { name: 'student' };
=======
    return auth.role === 'HR' ? { name: 'hr' } : { name: 'employee' };
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
  }

  // Protect authed routes
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { next: to.fullPath } };
    }

    const need = (to.meta.role || '').toUpperCase();
    if (need && auth.role !== need) {
<<<<<<< HEAD
      // CHANGED: Logic updated to check for 'HR'
      return { name: auth.role === 'HR' ? 'instructor' : 'student' };
=======
      return { name: auth.role === 'HR' ? 'hr' : 'employee' };
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
    }
  }
});

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
