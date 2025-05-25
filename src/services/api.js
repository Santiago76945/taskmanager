// src/services/api.js

import axios from 'axios'

const API_ROOT = import.meta.env.VITE_API_URL || '/.netlify/functions'

// Creamos un cliente Axios con baseURL
const apiClient = axios.create({
    baseURL: API_ROOT,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const login = (u, p) =>
    apiClient.post('/login', { username: u, password: p })

export const register = (u, p, c) =>
    apiClient.post('/register', { username: u, password: p, code: c })

// Tasks CRUD
export const getTasks = () =>
    apiClient.get('/tasks')

export const createTask = (_, data) =>
    apiClient.post('/tasks', data)

export const updateTask = (_, id, data) =>
    apiClient.put('/tasks', { id, ...data })

export const deleteTask = (_, id) =>
    apiClient.delete('/tasks', { params: { id } })
