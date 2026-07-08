import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://43.204.141.242:5000'}/api`;

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
  updateStatus: (id, status, paymentMethod, paymentStatus) => api.patch(`/orders/${id}/status`, { status, paymentMethod, paymentStatus }),
  updatePayment: (id, paymentStatus) => api.patch(`/orders/${id}/payment`, { paymentStatus }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const customerApi = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
