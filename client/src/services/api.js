import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (userData) => api.post("/api/auth/signup", userData),
  me: () => api.get("/api/auth/me"),
};

// Named helpers for teams endpoints
export const teamsApi = {
  getAll:       ()                 => api.get('/api/teams'),
  getById:      (id)               => api.get(`/api/teams/${id}`),
  create:       (data)             => api.post('/api/teams', data),
  update:       (id, data)         => api.patch(`/api/teams/${id}`, data),
  delete:       (id)               => api.delete(`/api/teams/${id}`),
  addMember:    (id, data)         => api.post(`/api/teams/${id}/members`, data),
  updateMember: (id, userId, data) => api.patch(`/api/teams/${id}/members/${userId}`, data),
  removeMember: (id, userId)       => api.delete(`/api/teams/${id}/members/${userId}`),
};

export const projectsApi = {
  getAll: (teamId) => api.get('/api/projects', { params: { teamId } }),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
};

export const tasksApi = {
  getAll: (params = {}) => api.get('/api/tasks', { params }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;
