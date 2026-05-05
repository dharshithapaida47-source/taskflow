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

// Project endpoints
export const getAllProjects = (params = {}) => api.get('/projects', { params });
export const createProject = (data) => api.post('/projects', data);
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addProjectMember = (id, memberId) => api.post(`/projects/${id}/members`, { memberId });
export const removeProjectMember = (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`);

// Task endpoints
export const getAllTasks = (params = {}) => api.get('/tasks', { params });
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
