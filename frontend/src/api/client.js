import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Profile API calls
export const profileAPI = {
  createProfile: (data) => api.post('/profiles/create', data),
  getUserProfiles: () => api.get('/profiles/my-profiles'),
  getProfile: (id) => api.get(`/profiles/${id}`),
  updateProfile: (id, data) => api.put(`/profiles/${id}`, data),
  deleteProfile: (id) => api.delete(`/profiles/${id}`),
  getPublicProfile: (id) => api.get(`/profiles/public/${id}`),
};

// QR Code API calls
export const qrCodeAPI = {
  getUserQRCodes: () => api.get('/qr-codes/my-codes'),
  getQRCodeByProfile: (profileId) => api.get(`/qr-codes/profile/${profileId}`),
  regenerateQRCode: (profileId) => api.post(`/qr-codes/regenerate/${profileId}`),
  downloadQRCode: (profileId) => api.get(`/qr-codes/download/${profileId}`, { responseType: 'blob' }),
};

// Analytics API calls
export const analyticsAPI = {
  logScan: (profileId) => api.post(`/analytics/log/${profileId}`),
  getProfileAnalytics: (profileId) => api.get(`/analytics/profile/${profileId}`),
  getScanLogs: (profileId, page = 1, limit = 20) =>
    api.get(`/analytics/scans/${profileId}`, { params: { page, limit } }),
  getUserAnalytics: () => api.get('/analytics/user/overview'),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAllUsers: (page = 1, limit = 20, search = '', status = '', role = '') =>
    api.get('/admin/users', { params: { page, limit, search, status, role } }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllProfiles: (page = 1, limit = 20, search = '') =>
    api.get('/admin/profiles', { params: { page, limit, search } }),
  deleteProfile: (id) => api.delete(`/admin/profiles/${id}`),
  getAllQRCodes: (page = 1, limit = 20) =>
    api.get('/admin/qr-codes', { params: { page, limit } }),
  getAllScanLogs: (page = 1, limit = 50) =>
    api.get('/admin/scan-logs', { params: { page, limit } }),
  getOverallAnalytics: () => api.get('/admin/analytics'),
};

export default api;
