import { defineStore } from 'pinia';
import { extractRole, isExpired } from '@/utils/jwt';
import router from '@/router';
import http from '@/api/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    role: localStorage.getItem('role') || null, // 'STUDENT' or 'INSTRUCTOR'
    userEmail: null,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken && !isExpired(state.accessToken),
    isStudent: state => state.role === 'STUDENT',
    isInstructor: state => state.role === 'INSTRUCTOR',
  },

  actions: {
    setToken(token) {
  this.accessToken = token;
  if (token) {
    const role = (extractRole(token) || '').toUpperCase();
    console.log("Decoded role from JWT:", role);   // 👈 debug
    this.role = role;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('role', role);
  } else {
    this.role = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
  }
},


   async doLogin({ email, password }) {
  const { data } = await http.post('/auth/login', { email, password });
  
  // FIX: token is inside data.data.accessToken
  const token = data?.data?.accessToken;

  console.log("Raw login response:", data);  // 👈 debug
  console.log("Extracted token:", token);    // 👈 debug

  this.setToken(token);

  const role = (extractRole(token) || '').toUpperCase();
  console.log("Redirecting based on role:", role);  // 👈 debug
  if (role === 'INSTRUCTOR') router.replace({ name: 'instructor' });
  else router.replace({ name: 'student' });
}
,

    async doSignup(payload) {
      await http.post('/auth/signup', payload);
      // after signup, go to login
      router.replace({ name: 'login' });
    },

    logout(forceToLogin = false) {
      this.setToken(null);
      if (forceToLogin) router.replace({ name: 'login' });
    },
  },
});
