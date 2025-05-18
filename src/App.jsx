// src/App.jsx

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Menu from './routes/Menu';
import TaskListRoute from './routes/TaskList';
// (luego aquí irían ImportRoute, ExportRoute, CreateRoute, etc.)

export default function App() {
    const { token } = useContext(AuthContext);

    return (
        <Routes>
            {/* Ruta pública de login */}
            <Route
                path="/"
                element={token
                    ? <Navigate to="/dashboard" replace />
                    : <Login />
                }
            />

            {/* Rutas protegidas bajo /dashboard */}
            <Route
                path="/dashboard/*"
                element={token
                    ? <Dashboard />
                    : <Navigate to="/" replace />
                }
            >
                {/* Al entrar a /dashboard, muestro el menú */}
                <Route index element={<Menu />} />

                {/* Sección Ver tareas */}
                <Route path="tasks" element={<TaskListRoute />} />

                {/* Ejemplo placeholder para más secciones */}
                {/* <Route path="import" element={<ImportRoute />} /> */}
                {/* <Route path="export" element={<ExportRoute />} /> */}
                {/* <Route path="create" element={<CreateRoute />} /> */}
            </Route>

            {/* Cualquier otra ruta → login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
