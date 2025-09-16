// import http from './http';

// export function signup(payload) {
//   // payload: {name?, email, password, role} -> match your SignUpRequestDto
//   return http.post('/auth/signup', payload);
// }

// export function login(payload) {
//   // backend returns { accessToken: '...' }; refresh cookie is set by server
//   return http.post('/auth/login', payload);
// }


import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '@/api/auth';
import { extractRole, parseJwt } from '@/utils/jwt';
import http from '@/api/http';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // Load initial state from localStorage
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  const accessToken = computed(() => token.value);
  const isAuthenticated = computed(() => !!token.value);
  const role = computed(() => (token.value ? extractRole(token.value) : null));
  
  const userName = computed(() => user.value?.name || 'User');
<<<<<<< HEAD
  const isStudent = computed(() => role.value === 'EMPLOYEE');
  const isInstructor = computed(() => role.value === 'HR');
=======
  const isEmployee = computed(() => role.value === 'EMPLOYEE');
  const isHr = computed(() => role.value === 'HR');
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b

  // (NEW) Computed property to get user's initials
  const userInitials = computed(() => {
    if (user.value?.name) {
      const parts = user.value.name.split(' ');
      const first = parts[0]?.[0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
      return `${first}${last}`.toUpperCase();
    }
    return '?'; // Fallback if no name
  });

  function setAuthData(newToken, userDetails) {
    user.value = userDetails;
    token.value = newToken;
    localStorage.setItem('user', JSON.stringify(userDetails));
    localStorage.setItem('token', newToken);
    http.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete http.defaults.headers.common['Authorization'];
  }

  async function doLogin(payload) {
    try {
      const { data } = await api.login(payload);
      const responseData = data.data;
      
      setAuthData(responseData.accessToken, responseData.user);

<<<<<<< HEAD
// In store/auth.js inside the doLogin function
const targetRoute = role.value === 'HR' ? { name: 'instructor' } : { name: 'student' };
=======
      const targetRoute = role.value === 'HR' ? { name: 'hr' } : { name: 'employee' };
>>>>>>> 2f8658de462103a8572ff4ad3ac6d85c86a24b8b
      router.replace(targetRoute);

    } catch (error) {
      console.error("Login failed:", error);
      clearAuthData();
      throw error;
    }
  }

  async function doSignup(payload) {
    await api.signup(payload);
    router.push({ name: 'login', query: { signedUp: 'true' } });
  }

  function logout(redirect = true) {
    clearAuthData();
    if (redirect) {
      router.push({ name: 'login' });
    }
  }
  
  if(token.value) {
     const payload = parseJwt(token.value);
     if (payload.exp * 1000 < Date.now()) {
        logout(false);
     }
  }

  return {
    accessToken,
    user,
    userName,
    userInitials, // (NEW) Expose the initials
    isAuthenticated,
    role,
    isEmployee,
    isHr,
    doLogin,
    doSignup,
    logout,
  };
});