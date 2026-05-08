import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const productApi = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderApi = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const customerApi = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
