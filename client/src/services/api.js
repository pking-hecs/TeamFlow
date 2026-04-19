import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
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
export default api;
