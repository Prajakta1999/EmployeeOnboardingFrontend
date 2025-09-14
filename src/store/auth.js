import { defineStore } from 'pinia';
import { extractRole, isExpired } from '@/utils/jwt';
import router from '@/router';
import http from '@/api/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    role: localStorage.getItem('role') || null, // 'EMPLOYEE' or 'HR'
    userEmail: null,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken && !isExpired(state.accessToken),
    isEmployee: state => state.role === 'EMPLOYEE',
    isHr: state => state.role === 'HR',
    token: state => state.accessToken,
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

      if (this.role === 'HR') router.replace({ name: 'hr' });
      else router.replace({ name: 'employee' });
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
