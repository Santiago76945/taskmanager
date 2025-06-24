// src/App.jsx

import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Menu from './routes/Menu'
import TaskListRoute from './routes/TaskList'
import ImportRoute from './routes/Import'
import ExportRoute from './routes/Export'
import AIChatRoute from './routes/AIChat'

export default function App() {
    const { token } = useContext(AuthContext)

    return (
        <Routes>
            {/* Ruta pública de login */}
            <Route
                path="/"
                element={token ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            {/* Rutas protegidas bajo /dashboard */}
            <Route
                path="/dashboard/*"
                element={token ? <Dashboard /> : <Navigate to="/" replace />}
            >
                {/* Al entrar a /dashboard, muestro el menú */}
                <Route index element={<Menu />} />

                {/* Sección Ver tareas */}
                <Route path="tasks" element={<TaskListRoute />} />

                {/* Sección Importar tareas */}
                <Route path="import" element={<ImportRoute />} />

                {/* Sección Exportar tareas */}
                <Route path="export" element={<ExportRoute />} />

                {/* Sección Demetria AI */}
                <Route path="ai" element={<AIChatRoute />} />
            </Route>

            {/* Cualquier otra ruta → login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
