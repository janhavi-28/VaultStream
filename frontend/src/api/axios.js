import axios from 'axios';

// ─────────────────────────────────────────────
// Resolve the API base URL
// ─────────────────────────────────────────────
// Priority:
//   1. VITE_API_URL env var (explicit override)
//   2. Vercel production  → same-domain relative path /_/backend/api
//   3. Local dev fallback → http://localhost:5000/api
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // On Vercel both services share the same domain — use relative path
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return '/_/backend/api';
  }
  return 'http://localhost:5000/api';
};

// ─────────────────────────────────────────────
// Create centralized Axios instance
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// Request Interceptor: Attach JWT Token
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Grab the token from localStorage (where we'll save it after login)
    const token = localStorage.getItem('token');
    
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// Response Interceptor: Global Error Handling
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    
    // 1. Handle 401 Unauthorized (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Token might be expired.');
      // Clear the invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if we aren't already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // 2. Handle 403 Forbidden (Valid token, but not enough permissions)
    if (error.response && error.response.status === 403) {
      console.error('Forbidden: You do not have permission to perform this action.');
    }

    // 3. Handle network errors (Server down, no internet)
    if (!error.response) {
      console.error('Network error. Please check your connection or the server status.');
    }

    return Promise.reject(error);
  }
);

export default api;
