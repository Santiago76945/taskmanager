// src/services/api.js

import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL;
// normalmente "/.netlify/functions"

export function register(username, password, code) {
    return axios.post(`${API_ROOT}/register`, { username, password, code });
}

export function login(username, password) {
    return axios.post(`${API_ROOT}/login`, { username, password });
}
