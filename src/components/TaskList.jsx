// src/components/TaskList.jsx

import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import * as api from '../services/api'
import Popup from './Popup'
import TaskForm from './TaskForm'

export default function TaskList() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [selected, setSelected] = useState(null)
    const [showForm, setShowForm] = useState(false)

    const fetchTasks = async () => {
        if (!token) return
        try {
            const { data } = await api.getTasks(token)
            setTasks(data)
        } catch (err) {
            console.error('Error fetching tasks:', err)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [token])

    const openCreate = () => {
        setSelected(null)
        setShowForm(true)
    }

    // mostrar detalles
    const openView = (task) => {
        setSelected(task)
        setShowForm(false)
    }

    // editar desde vista
    const openEdit = () => {
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!token) return
        try {
            await api.deleteTask(token, id)
            setSelected(null)
            fetchTasks()
        } catch (err) {
            console.error('Error deleting task:', err)
        }
    }

    const handleSubmit = async (formData) => {
        if (!token) return
        const payload = { ...formData }
        if (!payload.depends || !payload.dependsOn) {
            delete payload.dependsOn
        }
        try {
            if (selected) {
                await api.updateTask(token, selected._id, payload)
            } else {
                await api.createTask(token, payload)
            }
            setShowForm(false)
            setSelected(null)
            fetchTasks()
        } catch (err) {
            console.error('Error saving task:', err)
        }
    }

    return (
        <div className="container p-lg">
            <div className="flex justify-between items-center m-md">
                <h2>Tus tareas</h2>
                <div>
                    <button
                        className="btn btn-secondary m-sm"
                        onClick={() => navigate('/dashboard')}
                    >
                        Volver al menú
                    </button>
                    <button className="btn btn-primary m-sm" onClick={openCreate}>
                        Crear tarea
                    </button>
                </div>
            </div>

            <ul className="list-reset">
                {tasks.map((t) => (
                    <li key={t._id}>
                        <div
                            className="card card-secondary p-md flex justify-between items-center m-sm"
                            onClick={() => openView(t)}
                        >
                            <span>{t.title}</span>
                            <span>{new Date(t.deadline).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Vista detallada de la tarea */}
            <Popup
                isOpen={!!(selected && !showForm)}
                onClose={() => setSelected(null)}
                title="Vista detallada de tu tarea"
            >
                {selected && (
                    <>
                        <p><strong>Tarea:</strong> {selected.title}</p>
                        <p><strong>Estado:</strong> {selected.status}</p>
                        <p><strong>Deadline:</strong> {new Date(selected.deadline).toLocaleString()}</p>
                        <p><strong>Prioridad:</strong> {selected.priority}</p>
                        {selected.location && <p><strong>Lugar:</strong> {selected.location}</p>}
                        {selected.assignedBy && <p><strong>Quién asignó:</strong> {selected.assignedBy}</p>}
                        {selected.recommendedDate && (
                            <p>
                                <strong>Fecha recomendada:</strong>{' '}
                                {new Date(selected.recommendedDate).toLocaleString()}
                            </p>
                        )}
                        {selected.depends && selected.dependsOn && (
                            <p><strong>Depende de tarea ID:</strong> {selected.dependsOn}</p>
                        )}
                        {selected.stalledReason && (
                            <p><strong>Motivo estancamiento:</strong> {selected.stalledReason}</p>
                        )}
                        {selected.observation && <p><strong>Observación:</strong> {selected.observation}</p>}
                        {selected.details && <p><strong>Detalle:</strong> {selected.details}</p>}

                        <div className="flex justify-end mt-sm">
                            <button className="btn btn-secondary m-sm" onClick={openEdit}>
                                Editar
                            </button>
                            <button
                                className="btn btn-danger m-sm"
                                onClick={() => handleDelete(selected._id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </>
                )}
            </Popup>

            {/* Formulario Crear/Editar */}
            <Popup
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setSelected(null)
                }}
                title={selected ? 'Editar tarea' : 'Crear tarea'}
            >
                <TaskForm
                    tasks={tasks}
                    initialData={selected}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </Popup>
        </div>
    )
}
