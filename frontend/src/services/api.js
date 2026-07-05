import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with base URL and default headers.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brainspace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401 (expired/invalid token)
    if (error.response?.status === 401) {
      localStorage.removeItem('brainspace_token');
      localStorage.removeItem('brainspace_user');
      // Redirect to login unless already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── AUTH SERVICES ─────────────────────────────────────────────────────────────
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── FOLDER SERVICES ───────────────────────────────────────────────────────────
export const folderService = {
  getAll: () => api.get('/folders'),
  create: (data) => api.post('/folders', data),
  update: (id, data) => api.put(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
};

// ── NOTE SERVICES ─────────────────────────────────────────────────────────────
export const noteService = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  getStats: () => api.get('/notes/stats'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  archive: (id) => api.post(`/notes/${id}/archive`),
  pin: (id) => api.post(`/notes/${id}/pin`),
  duplicate: (id) => api.post(`/notes/${id}/duplicate`),
};

// ── AI SERVICES ───────────────────────────────────────────────────────────────
export const aiService = {
  summarize: (noteId) => api.post('/ai/summarize', { noteId }),
};

export default api;
