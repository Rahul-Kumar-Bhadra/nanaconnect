import axios from 'axios';

// ─── Base URL ──────────────────────────────────────────────────────────────
// In development  → http://localhost:8000
// In production   → set VITE_API_URL in Netlify / Vercel env variables
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // Increased for Render Free Tier cold starts
});

// ─── Request interceptor: attach JWT token on every request ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 (token expired) ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and we haven't already retried, try to refresh the token
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Use a clean axios instance to avoid infinite loops
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          localStorage.setItem('access_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original); // retry original request
        } catch (refreshError) {
          // Refresh failed — token is likely expired or invalid
          console.error("Refresh token failed, logging out...", refreshError);
          handleLogout();
        }
      } else {
        // No refresh token — redirect to login
        handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  // Only redirect if not already on login page to avoid loops
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=true';
  }
}

// ─── Helper: extract error message from FastAPI response ──────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d: { msg: string }) => d.msg).join(', ');
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export default api;
