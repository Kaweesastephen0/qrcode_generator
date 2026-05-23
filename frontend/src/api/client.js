import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const profileAPI = {
  createProfile: (data) => api.post('/profiles/create', data),
  getUserProfiles: () => api.get('/profiles/my-profiles'),
};

export const qrCodeAPI = {
  getQRCodeByProfile: (profileId) => api.get(`/qr-codes/profile/${profileId}`),
  generateQR: (profileId) => api.get(`/qr-codes/generate/${profileId}`),
};

export const publicAPI = {
  getPublicProfile: (profileId) => api.get(`/card/${profileId}`),
};

