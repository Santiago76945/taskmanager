// src/App.jsx

import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'

export default function App() {
    const { token } = useContext(AuthContext)

    return (
        <Routes>
            {/* Si ya estoy logueado, / me lleva directo a /dashboard */}
            <Route
                path="/"
                element={token ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            {/* Rutas protegidas */}
            <Route
                path="/dashboard/*"
                element={
                    token
                        ? <Dashboard />
                        : <Navigate to="/" replace />
                }
            />

            {/* Cualquier otra ruta me lleva al login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
