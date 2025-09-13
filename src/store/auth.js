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
    token: state => state.accessToken, // <- expose token for axios requests
  },

  actions: {
    setToken(token) {
      this.accessToken = token;
      if (token) {
        const role = (extractRole(token) || '').toUpperCase();
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
      const token = data?.data?.accessToken;
      if (!token) throw new Error('No token received');

      this.setToken(token);

      if (this.role === 'INSTRUCTOR') router.replace({ name: 'instructor' });
      else router.replace({ name: 'student' });
    },

    async doSignup(payload) {
      await http.post('/auth/signup', payload);
      router.replace({ name: 'login' });
    },

    logout(forceToLogin = false) {
      this.setToken(null);
      if (forceToLogin) router.replace({ name: 'login' });
    },
  },
});
