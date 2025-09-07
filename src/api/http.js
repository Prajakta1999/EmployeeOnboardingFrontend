import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // needed so the refresh cookie is sent
});

let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

// Attach token
http.interceptors.request.use(config => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// Handle 401 -> try /auth/refresh -> retry once
http.interceptors.response.use(
  res => res,
  async error => {
    const auth = useAuthStore();
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // queue requests until refresh resolves
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return http(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken || data.token || data.access_token;
        auth.setToken(newToken);
        resolveQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        resolveQueue(e, null);
        auth.logout(true);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
