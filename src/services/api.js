import axios from 'axios';

const API_BASE_URL = 'http://localhost:3333/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  register: (name, email, password, role = 'Student') =>
    api.post('/auth/register', { name, email, password, role }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  verify: () =>
    api.get('/auth/verify'),

  getMe: () =>
    api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Suggestion service
export const suggestionService = {
  submit: (suggestionData) =>
    api.post('/suggestions', suggestionData),

  getAll: () =>
    api.get('/suggestions'),

  updateStatus: (id, status) =>
    api.put(`/suggestions/${id}/status`, { status }),
};

// Menu service
export const menuService = {
  getAll: () =>
    api.get('/menu'),
};

// Feedback service
export const feedbackService = {
  submit: (feedbackData) =>
    api.post('/feedback', feedbackData),

  getByMenuItem: (menuItemId) =>
    api.get(`/feedback/${menuItemId}`),

  getAll: () =>
    api.get('/feedback'),
};

// Admin service
export const adminService = {
  getStats: () =>
    api.get('/admin/stats'),

  getRatingsAnalytics: () =>
    api.get('/admin/analytics/ratings'),

  getSuggestionsAnalytics: () =>
    api.get('/admin/analytics/suggestions'),
};

export default api;


