// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { signInWithGooglePopup } from '../services/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [streak, setStreak] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const navigate = useNavigate();

    // Sincroniza token con localStorage
    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    // Al cambiar el token, sincronizar streak
    useEffect(() => {
        if (!token) return;

        const syncStreak = async () => {
            try {
                const { data: current } = await api.getStreak();
                const serverDate = new Date(current.lastUpdated);
                const today = new Date();

                if (serverDate.toDateString() === today.toDateString()) {
                    setStreak(current.streak);
                    setLastUpdated(current.lastUpdated);
                    return;
                }

                const { data: tasks } = await api.getTasks();
                const hasOverdue = tasks.some(t =>
                    t.status !== 'finalizada' &&
                    new Date(t.deadline) < new Date()
                );

                const { data: updated } = await api.updateStreak({ reset: hasOverdue });
                setStreak(updated.streak);
                setLastUpdated(updated.lastUpdated);
            } catch (err) {
                console.error('Error sincronizando streak:', err);
            }
        };

        syncStreak();
    }, [token]);

    // Iniciar sesión con usuario y contraseña
    const login = async (username, password) => {
        const { data } = await api.login(username, password);
        setToken(data.token);
        navigate('/dashboard', { replace: true });
    };

    // Iniciar sesión con Google
    const loginWithGoogle = async () => {
        const result = await signInWithGooglePopup();
        const idToken = await result.user.getIdToken();
        const { data } = await api.googleLogin(idToken);
        setToken(data.token);
        navigate('/dashboard', { replace: true });
    };

    // Registrar usuario
    const register = async (username, password, code) => {
        await api.register(username, password, code);
    };

    // Cerrar sesión
    const logout = () => {
        setToken(null);
        navigate('/', { replace: true });
    };

    return (
        <AuthContext.Provider value={{
            token,
            login,
            loginWithGoogle,
            register,
            logout,
            streak
        }}>
            {children}
        </AuthContext.Provider>
    );
}
