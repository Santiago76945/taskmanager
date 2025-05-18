// src/services/api.js

import axios from 'axios';
const API_ROOT = import.meta.env.VITE_API_URL;

export const login = (u, p) => axios.post(`${API_ROOT}/login`, { username: u, password: p });
export const register = (u, p, c) => axios.post(`${API_ROOT}/register`, { username: u, password: p, code: c });

export const getTasks = (token) =>
    axios.get(`${API_ROOT}/tasks`, { headers: { Authorization: `Bearer ${token}` } });

export const createTask = (token, data) =>
    axios.post(`${API_ROOT}/tasks`, data, { headers: { Authorization: `Bearer ${token}` } });

export const updateTask = (token, id, data) =>
    axios.put(`${API_ROOT}/tasks`, { id, ...data }, { headers: { Authorization: `Bearer ${token}` } });

export const deleteTask = (token, id) =>
    axios.delete(`${API_ROOT}/tasks`, { headers: { Authorization: `Bearer ${token}` }, params: { id } });
