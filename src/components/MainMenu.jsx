// src/components/MainMenu.jsx

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import TaskCard from './TaskCard'

export default function MainMenu() {
    const { logout } = useContext(AuthContext)

    return (
        <div className="m-lg">
            <div className="flex justify-between items-center m-md">
                <h1 className="text-center text-primary m-md">Task Manager</h1>
                <button
                    onClick={logout}
                    className="btn btn-secondary"
                >
                    Cerrar sesión
                </button>
            </div>
            <div className="grid grid-cols-2 grid-gap-md">
                <TaskCard title="Mis tareas" to="/dashboard/tasks" />
                <TaskCard title="Importar tareas" to="/dashboard/import" />
                <TaskCard title="Exportar tareas" to="/dashboard/export" />
            </div>
        </div>
    )
}
