import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH APIs ================= */
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),

  // 🔐 Change Password
  changePassword: (data) =>
    api.put('/auth/change-password', data),

  // 🖼 Upload Avatar
  uploadAvatar: (formData) =>
    api.put('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

/* ================= USER APIs ================= */
export const userAPI = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),


  updatePermissions: (id, permissions) =>
    api.put(`/users/${id}/permissions`, { permissions })
};

/* ================= QUOTATION APIs ================= */
export const quotationAPI = {
  
  getAll: (params) =>
    api.get('/quotations', { params }),

  getDeleted: () => api.get('/quotations/deleted'),
  getOne: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),

  updateStatus: (id, status) =>
    api.put(`/quotations/${id}`, { status }),

  delete: (id) => api.delete(`/quotations/${id}`),
  restore: (id) => api.put(`/quotations/${id}/restore`),
  permanentDelete: (id) =>
    api.delete(`/quotations/${id}/permanent`)
};



/* ================= COMPANY APIs ================= */
export const companyAPI = {
  getMyCompany: () => api.get('/company/my-company'),
  create: (data) => api.post('/company', data),
  update: (data) => api.put('/company', data),
  check: () => api.get('/company/check')
};

/* ================= PRODUCT APIs ================= */
export const productAPI = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`),
  delete: (id) => api.delete(`/products/${id}`)
};

/* ================= CUSTOMER APIs ================= */
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`),
  delete: (id) => api.delete(`/customers/${id}`)
};

export default api;
