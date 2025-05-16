// src/contexts/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    const handleLogin = async (username, password) => {
        const { data } = await api.login(username, password);
        setToken(data.token);
        navigate('/dashboard');
    };

    const handleRegister = async (username, password, code) => {
        await api.register(username, password, code);
        // tras registro, redirigir a login
        navigate('/');
    };

    const logout = () => {
        setToken(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ token, login: handleLogin, register: handleRegister, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
