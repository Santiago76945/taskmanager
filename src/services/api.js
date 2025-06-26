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

// AI endpoints
export const aiQuery = (prompt) =>
    apiClient.post('/aiQuery', { prompt });

export const aiAddTask = (taskPayload) =>
    apiClient.post('/aiAddTask', taskPayload);

// Preview AI cost endpoints (no side effects)
export const previewQuery = (prompt) =>
    apiClient.post('/aiQuery?preview=true', { prompt });

export const previewAddTask = (taskPayload) =>
    apiClient.post('/aiAddTask?preview=true', taskPayload);

// Comprar Demi Coins (solo testing +100)
export const addCoins = () =>
    apiClient.post('/addCoins', { amount: 100 });

// Perfil de usuario
export const getProfile = () =>
    apiClient.get('/me');
