import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Request interceptor to inject the token
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('auth-storage');
  if (userStr) {
    try {
      const state = JSON.parse(userStr).state;
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Failed to parse token from local storage');
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
