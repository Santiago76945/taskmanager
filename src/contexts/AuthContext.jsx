// src/contexts/AuthContext.jsx

import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const navigate = useNavigate()

    // Sincroniza token con localStorage
    useEffect(() => {
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
    }, [token])

    // Iniciar sesión
    const login = async (username, password) => {
        const { data } = await api.login(username, password)
        setToken(data.token)
        navigate('/dashboard', { replace: true })
    }

    // Registrar usuario (solo hace POST; el componente mostrará el mensaje y cambiará de modo)
    const register = async (username, password, code) => {
        await api.register(username, password, code)
    }

    // Cerrar sesión
    const logout = () => {
        setToken(null)
        navigate('/', { replace: true })
    }

    return (
        <AuthContext.Provider value={{ token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
