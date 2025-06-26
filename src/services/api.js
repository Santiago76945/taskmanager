// src/services/api.js

import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL || '/.netlify/functions';

// Creamos un cliente Axios con baseURL
const apiClient = axios.create({
    baseURL: API_ROOT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar respuestas 401/403 y forzar logout
apiClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (username, password) =>
    apiClient.post('/login', { username, password });

export const register = (username, password, code) =>
    apiClient.post('/register', { username, password, code });

// Google login endpoint (new)
export const googleLogin = (idToken) =>
    apiClient.post('/googleLogin', { idToken });

// Tasks CRUD
export const getTasks = () =>
    apiClient.get('/tasks');

export const createTask = (taskData) =>
    apiClient.post('/tasks', taskData);

export const updateTask = (id, taskData) =>
    apiClient.put('/tasks', { id, ...taskData });

export const deleteTask = (id) =>
    apiClient.delete('/tasks', { params: { id } });

// Streak endpoints
export const getStreak = () =>
    apiClient.get('/streak');

export const updateStreak = ({ reset }) =>
    apiClient.post('/streak', { reset });

// AI endpoints — ahora recibimos y enviamos el payload tal cual
export const aiQuery = payload =>
    apiClient.post('/aiQuery', payload);

export const aiAddTask = payload =>
    apiClient.post('/aiAddTask', payload);

// Preview AI cost endpoints (no side effects)
export const previewQuery = payload =>
    apiClient.post('/aiQuery?preview=true', payload);

export const previewAddTask = payload =>
    apiClient.post('/aiAddTask?preview=true', payload);

// Comprar Demi Coins (solo testing +100)
export const addCoins = () =>
    apiClient.post('/addCoins', { amount: 100 });

// Perfil de usuario
export const getProfile = () =>
    apiClient.get('/me');

