// src/components/TaskList.jsx

import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import * as api from '../services/api'
import Popup from './Popup'
import TaskForm from './TaskForm'

// Función auxiliar para formatear campos de fecha/hora al formato "YYYY-MM-DDThh:mm"
const formatTaskForForm = (task) => {
    if (!task) return null
    return {
        ...task,
        deadline: task.deadline ? task.deadline.slice(0, 16) : '',
        recommendedDate: task.recommendedDate ? task.recommendedDate.slice(0, 16) : '',
        creationDate: task.creationDate ? task.creationDate.slice(0, 16) : '',
        completionDate: task.completionDate ? task.completionDate.slice(0, 16) : ''
    }
}

export default function TaskList() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [selected, setSelected] = useState(null)
    const [showForm, setShowForm] = useState(false)

    // filtros
    const [showCompleted, setShowCompleted] = useState(false)
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [tagFilter, setTagFilter] = useState('all')
    const [availableTags, setAvailableTags] = useState([])

    const fetchTasks = async () => {
        if (!token) return
        try {
            const { data } = await api.getTasks()
            setTasks(data)
            const tags = Array.from(
                new Set(data.filter(t => t.tag).map(t => t.tag))
            )
            setAvailableTags(tags)
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

    const openView = (task) => {
        setSelected(task)
        setShowForm(false)
    }

    const openEdit = () => {
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!token) return
        try {
            await api.deleteTask(id)
            setSelected(null)
            fetchTasks()
        } catch (err) {
            console.error('Error deleting task:', err)
        }
    }

    const handleComplete = async () => {
        if (!token || !selected) return
        try {
            await api.updateTask(selected._id, { status: 'finalizada' })
            setSelected(null)
            fetchTasks()
        } catch (err) {
            console.error('Error marking complete:', err)
        }
    }

    const handleSubmit = async (formData) => {
        if (!token) return
        const payload = { ...formData }
        if (!payload.depends || !payload.dependsOn) {
            delete payload.dependsOn
        }
        try {
            if (selected && showForm) {
                await api.updateTask(selected._id, payload)
            } else {
                await api.createTask(payload)
            }
            setShowForm(false)
            setSelected(null)
            fetchTasks()
        } catch (err) {
            console.error('Error saving task:', err)
        }
    }

    const handleStatusFilterChange = (e) =>
        setShowCompleted(e.target.value === 'completed')
    const handlePriorityChange = (e) =>
        setPriorityFilter(e.target.value)
    const handleTagChange = (e) =>
        setTagFilter(e.target.value)

    const filteredTasks = tasks.filter((t) => {
        if (showCompleted) {
            if (t.status !== 'finalizada') return false
        } else {
            if (t.status === 'finalizada') return false
        }
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
            return false
        }
        if (tagFilter !== 'all' && t.tag !== tagFilter) {
            return false
        }
        return true
    })

    return (
        <div className="tasklist__container">
            {/* Header */}
            <header className="tasklist__header">
                <h2 className="tasklist__title">Tus tareas</h2>
            </header>

            {/* Filters */}
            <div className="tasklist__filters">
                <div className="tasklist__filter-group">
                    <label className="tasklist__filter-label">Estado:</label>
                    <select
                        className="tasklist__filter-select"
                        value={showCompleted ? 'completed' : 'pending'}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="pending">Pendientes</option>
                        <option value="completed">Completadas</option>
                    </select>
                </div>
                <div className="tasklist__filter-group">
                    <label className="tasklist__filter-label">Prioridad:</label>
                    <select
                        className="tasklist__filter-select"
                        value={priorityFilter}
                        onChange={handlePriorityChange}
                    >
                        <option value="all">Todas</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                    </select>
                </div>
                <div className="tasklist__filter-group">
                    <label className="tasklist__filter-label">Tag:</label>
                    <select
                        className="tasklist__filter-select"
                        value={tagFilter}
                        onChange={handleTagChange}
                    >
                        <option value="all">Todas</option>
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="tasklist__actions">
                <button
                    className="tasklist__action-button"
                    onClick={() => navigate('/dashboard')}
                >
                    Volver al menú
                </button>
                <button
                    className="tasklist__action-button"
                    onClick={openCreate}
                >
                    Crear tarea
                </button>
            </div>

            {/* Task list */}
            <ul className="tasklist__list">
                {filteredTasks.map(t => (
                    <li key={t._id} className="tasklist__list-item">
                        <div
                            className="tasklist__item-card"
                            onClick={() => openView(t)}
                        >
                            <div className="tasklist__item-content">
                                <span className="tasklist__item-title">{t.title}</span>
                                <div className="tasklist__item-meta">
                                    <span>Deadline: {new Date(t.deadline).toLocaleString()}</span>
                                    <span className="tasklist__item-status">{t.status}</span>
                                    {t.tag && <span className="tasklist__item-tag">#{t.tag}</span>}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Detail Popup */}
            <Popup
                isOpen={!!(selected && !showForm)}
                onClose={() => setSelected(null)}
                title="Detalle de tarea"
            >
                {selected && (
                    <>
                        <p><strong>Tarea:</strong> {selected.title}</p>
                        <p><strong>Estado:</strong> {selected.status}</p>
                        <p><strong>Deadline:</strong> {new Date(selected.deadline).toLocaleString()}</p>
                        <p><strong>Prioridad:</strong> {selected.priority}</p>
                        {selected.tag && <p><strong>Tag:</strong> {selected.tag}</p>}
                        {selected.location && <p><strong>Lugar:</strong> {selected.location}</p>}
                        {selected.assignedBy && <p><strong>Quién asignó:</strong> {selected.assignedBy}</p>}
                        {selected.recommendedDate && (
                            <p><strong>Fecha recomendada:</strong> {new Date(selected.recommendedDate).toLocaleString()}</p>
                        )}
                        {selected.depends && selected.dependsOn && (
                            <p><strong>Depende de tarea ID:</strong> {selected.dependsOn}</p>
                        )}
                        {selected.stalledReason && <p><strong>Motivo estancamiento:</strong> {selected.stalledReason}</p>}
                        {selected.observation && <p><strong>Observación:</strong> {selected.observation}</p>}
                        {selected.details && <p><strong>Detalle:</strong> {selected.details}</p>}

                        <div className="flex justify-end m-sm">
                            {selected.status !== 'finalizada' && (
                                <button className="btn btn-success" onClick={handleComplete}>
                                    ✅ Completada
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={openEdit}>
                                Editar
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(selected._id)}>
                                Eliminar
                            </button>
                        </div>
                    </>
                )}
            </Popup>

            {/* Form Popup */}
            <Popup
                isOpen={showForm}
                onClose={() => { setShowForm(false); setSelected(null) }}
                title={selected ? 'Editar tarea' : 'Crear tarea'}
            >
                <TaskForm
                    tasks={tasks}
                    initialData={formatTaskForForm(selected)}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </Popup>
        </div>
    )
}