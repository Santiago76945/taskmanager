// src/components/MainMenu.jsx

import TaskCard from './TaskCard';

export default function MainMenu() {
    return (
        <div className="m-lg">
            <h1 className="text-center text-primary m-md">Task Manager</h1>
            <div className="grid grid-cols-2 grid-gap-md">
                <TaskCard title="Ver tareas" to="/dashboard/tasks" />
                <TaskCard title="Importar tareas" to="/dashboard/import" />
                <TaskCard title="Exportar tareas" to="/dashboard/export" />
                <TaskCard title="Crear tarea" to="/dashboard/create" />
            </div>
        </div>
    );
}
