// src/contexts/AuthContext.jsx

import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const navigate = useNavigate()

    useEffect(() => {
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
    }, [token])

    const login = async (u, p) => {
        const { data } = await api.login(u, p)
        setToken(data.token)
        navigate('/dashboard', { replace: true })
    }

    const register = async (u, p, code) => {
        await api.register(u, p, code)
        navigate('/', { replace: true })
    }

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
