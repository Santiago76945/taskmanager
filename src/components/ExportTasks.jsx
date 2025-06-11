// src/components/ExportTasks.jsx

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import * as api from '../services/api'
import Popup from './Popup'
import { copyText } from '../utils/clipboard'

export default function ExportTasks() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    const [tasks, setTasks] = useState([])
    const [filterType, setFilterType] = useState('pending') // 'pending' | 'completed' | 'all'
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [tagFilter, setTagFilter] = useState('all')
    const [availableTags, setAvailableTags] = useState([])
    const [format, setFormat] = useState('json') // 'json' | 'txt'
    const [helpOpen, setHelpOpen] = useState(false)
    const [resultOpen, setResultOpen] = useState(false)
    const [resultText, setResultText] = useState('')

    useEffect(() => {
        async function load() {
            if (!token) return
            try {
                const { data } = await api.getTasks()
                setTasks(data)
                // Build unique tag list (exclude empty)
                const tags = Array.from(new Set(data.filter(t => t.tag).map(t => t.tag)))
                setAvailableTags(tags)
            } catch (err) {
                console.error('Error fetching tasks for export:', err)
            }
        }
        load()
    }, [token])

    const handleExport = () => {
        let selected = tasks.filter(t => {
            // status filter
            if (filterType === 'pending' && t.status === 'finalizada') return false
            if (filterType === 'completed' && t.status !== 'finalizada') return false
            // priority filter
            if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
            // tag filter
            if (tagFilter !== 'all' && t.tag !== tagFilter) return false
            return true
        })

        // sort
        selected.sort((a, b) => {
            if (filterType === 'completed') {
                return new Date(a.completionDate || 0) - new Date(b.completionDate || 0)
            } else {
                return new Date(a.deadline) - new Date(b.deadline)
            }
        })

        // format
        let output = ''
        if (format === 'json') {
            output = JSON.stringify(selected, null, 2)
        } else {
            output = selected
                .map(t => {
                    const parts = [
                        `Título: ${t.title}`,
                        `Estado: ${t.status}`,
                        `Deadline: ${new Date(t.deadline).toLocaleString()}`
                    ]
                    if (t.status === 'finalizada') {
                        parts.push(`Completada: ${new Date(t.completionDate).toLocaleString()}`)
                    }
                    if (t.priority) {
                        parts.push(`Prioridad: ${t.priority}`)
                    }
                    if (t.tag) {
                        parts.push(`Tag: ${t.tag}`)
                    }
                    return parts.join(' | ')
                })
                .join('\n')
        }

        setResultText(output)
        setResultOpen(true)
    }

    return (
        <div className="main-menu-card p-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-md">
                <h2 className="title">Exportar tareas</h2>
                <button className="btn btn-secondary" onClick={() => setHelpOpen(true)}>
                    ❔
                </button>
            </div>

            {/* Filtros */}
            <div className="form-group">
                <label>Mostrar:</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="pending">Tareas pendientes</option>
                    <option value="completed">Tareas completadas</option>
                    <option value="all">Todas las tareas</option>
                </select>
            </div>

            <div className="form-group">
                <label>Prioridad:</label>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                    <option value="all">Todas</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>

            <div className="form-group">
                <label>Tag:</label>
                <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    {availableTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Formato:</label>
                <select value={format} onChange={e => setFormat(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="txt">TXT</option>
                </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-sm mt-md">
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                    Volver al menú
                </button>
                <button className="btn btn-primary" onClick={handleExport}>
                    Exportar
                </button>
            </div>

            {/* Help Popup */}
            <Popup isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Cómo exportar tareas">
                <p>Elige filtros y formato. Se incluyen estos campos:</p>
                <ul className="ml-md list-disc">
                    <li>title, status, deadline</li>
                    <li>priority</li>
                    <li>tag</li>
                    <li>…y completionDate si aplica</li>
                </ul>
            </Popup>

            {/* Result Popup */}
            <Popup isOpen={resultOpen} onClose={() => setResultOpen(false)} title="Resultado de exportación">
                <div className="flex justify-end mb-sm">
                    <button className="btn btn-secondary copy-button" onClick={() => copyText(resultText)}>
                        📄 Copiar
                    </button>
                </div>
                <textarea readOnly className="export-textarea" rows="12" value={resultText} />
            </Popup>
        </div>
    )
}
