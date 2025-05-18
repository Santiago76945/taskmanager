// src/components/TaskList.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../services/api';
import Popup from './Popup';
import TaskForm from './TaskForm';

export default function TaskList() {
    const { token } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchTasks = async () => {
        if (!token) return;
        const { data } = await api.getTasks(token);
        setTasks(data);
    };

    useEffect(() => {
        fetchTasks();
    }, [token]);

    const openCreate = () => {
        setEditData(null);
        setShowForm(true);
    };

    const openEdit = (task) => {
        setSelected(task);
        setEditData(task);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!token) return;
        await api.deleteTask(token, id);
        setSelected(null);
        fetchTasks();
    };

    const handleSubmit = async (formData) => {
        if (!token) return;
        if (editData) {
            await api.updateTask(token, editData._id, formData);
        } else {
            await api.createTask(token, formData);
        }
        setShowForm(false);
        setSelected(null);
        fetchTasks();
    };

    return (
        <div className="container p-lg">
            <div className="flex justify-between items-center m-md">
                <h2>Tus tareas</h2>
                <button className="btn btn-primary" onClick={openCreate}>
                    Crear tarea
                </button>
            </div>

            <ul className="list-reset">
                {tasks.map((t) => (
                    <li key={t._id}>
                        <div
                            className="card card-secondary p-md flex justify-between items-center m-sm"
                            onClick={() => openEdit(t)}
                        >
                            <span>{t.title}</span>
                            <span>{new Date(t.deadline).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Popup ver/editar existente */}
            <Popup
                isOpen={!!(selected && !showForm)}
                onClose={() => setSelected(null)}
                title={selected?.title}
            >
                {selected && (
                    <>
                        <TaskForm
                            initialData={selected}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowForm(false)}
                        />
                        <button
                            className="btn btn-danger m-sm"
                            onClick={() => handleDelete(selected._id)}
                        >
                            Eliminar
                        </button>
                    </>
                )}
            </Popup>

            {/* Popup crear/editar */}
            <Popup
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelected(null);
                }}
                title={editData ? 'Editar tarea' : 'Crear tarea'}
            >
                <TaskForm
                    initialData={editData}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </Popup>
        </div>
    );
}
