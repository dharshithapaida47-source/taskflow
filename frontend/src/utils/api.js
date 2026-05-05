import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid tokens: clear session and bounce to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onLoginPage = window.location.pathname === '/login';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!onLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// User endpoints
export const getAllUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const promoteUser = (id) => api.put(`/users/${id}/promote`);
export const demoteUser = (id) => api.put(`/users/${id}/demote`);

// Project endpoints
export const getAllProjects = (params = {}) => api.get('/projects', { params });
export const createProject = (data) => api.post('/projects', data);
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const getProjectProgress = (id) => api.get(`/projects/${id}/progress`);
export const addProjectMember = (id, memberId) => api.post(`/projects/${id}/members`, { memberId });
export const removeProjectMember = (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`);

// Task endpoints
export const getAllTasks = (params = {}) => api.get('/tasks', { params });
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);

// createTask takes a plain object. If `attachment` is a File, the request is
// sent as multipart/form-data so the backend's multer middleware picks it up.
export const createTask = (data) => {
  const { attachment, ...rest } = data || {};
  if (attachment instanceof File) {
    const fd = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    fd.append('attachment', attachment);
    return api.post('/tasks', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/tasks', rest);
};

// updateTask supports plain JSON updates (status, text fields, reassign) and
// multipart updates with `attachment: File` (admin only). Pass
// `removeAttachment: true` to clear the existing file.
export const updateTask = (id, data) => {
  const { attachment, removeAttachment, ...rest } = data || {};
  if (attachment instanceof File) {
    const fd = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    if (removeAttachment) fd.append('removeAttachment', 'true');
    fd.append('attachment', attachment);
    return api.put(`/tasks/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  if (removeAttachment) {
    return api.put(`/tasks/${id}`, { ...rest, removeAttachment: true });
  }
  return api.put(`/tasks/${id}`, rest);
};
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Download a task's attachment as a blob and trigger a browser download.
// Uses the auth interceptor on `api`, so the JWT is included automatically.
export const downloadTaskAttachment = async (taskId, filename) => {
  const response = await api.get(`/tasks/${taskId}/attachment`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'attachment';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
