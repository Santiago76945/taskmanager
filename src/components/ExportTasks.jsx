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
    const [format, setFormat] = useState('json') // 'json' | 'txt'
    const [helpOpen, setHelpOpen] = useState(false)
    const [resultOpen, setResultOpen] = useState(false)
    const [resultText, setResultText] = useState('')

    useEffect(() => {
        async function load() {
            if (!token) return
            try {
                const { data } = await api.getTasks(token)
                setTasks(data)
            } catch (err) {
                console.error('Error fetching tasks for export:', err)
            }
        }
        load()
    }, [token])

    const handleExport = () => {
        let selected = tasks.filter(t => {
            if (filterType === 'pending') return t.status !== 'finalizada'
            if (filterType === 'completed') return t.status === 'finalizada'
            return true
        })

        selected.sort((a, b) => {
            if (filterType === 'completed') {
                return new Date(a.completionDate || 0) - new Date(b.completionDate || 0)
            } else {
                return new Date(a.deadline) - new Date(b.deadline)
            }
        })

        let output = ''
        if (format === 'json') {
            output = JSON.stringify(selected, null, 2)
        } else {
            output = selected
                .map(t => {
                    const parts = [
                        `Título: ${t.title} `,
                        `Estado: ${t.status} `,
                        `Deadline: ${new Date(t.deadline).toLocaleString()} `
                    ]
                    if (t.status === 'finalizada') {
                        parts.push(`Completada: ${new Date(t.completionDate).toLocaleString()} `)
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
                <button
                    className="btn btn-secondary"
                    onClick={() => setHelpOpen(true)}
                >
                    ❔
                </button>
            </div>

            {/* Filtros */}
            <div className="form-group">
                <label>Mostrar:</label>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="pending">Tareas pendientes</option>
                    <option value="completed">Tareas completadas</option>
                    <option value="all">Todas las tareas</option>
                </select>
            </div>

            {/* Formato */}
            <div className="form-group">
                <label>Formato de exportación:</label>
                <select
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                >
                    <option value="json">JSON</option>
                    <option value="txt">TXT</option>
                </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-sm mt-md">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    Volver al menú
                </button>
                <button className="btn btn-primary" onClick={handleExport}>
                    Exportar
                </button>
            </div>

            {/* Ayuda */}
            <Popup
                isOpen={helpOpen}
                onClose={() => setHelpOpen(false)}
                title="Cómo exportar tareas"
            >
                <p>Selecciona qué tareas quieres exportar y en qué formato:</p>
                <ul className="ml-md list-disc">
                    <li><strong>Tareas pendientes:</strong> todas salvo las finalizadas.</li>
                    <li><strong>Tareas completadas:</strong> solo las finalizadas.</li>
                    <li><strong>Todas las tareas:</strong> incluidas completas y pendientes.</li>
                    <li><strong>Formato JSON:</strong> un array de objetos con todos los campos.</li>
                    <li><strong>Formato TXT:</strong> cada tarea en una línea con campos separados por “|”.</li>
                    <li>En el popup de resultado podrás copiar al portapapeles.</li>
                </ul>
            </Popup>

            {/* Resultado */}
            <Popup
                isOpen={resultOpen}
                onClose={() => setResultOpen(false)}
                title="Resultado de exportación"
            >
                <div className="flex justify-end mb-sm">
                    <button
                        className="btn btn-secondary copy-button"
                        onClick={() => copyText(resultText)}
                    >
                        📄 Copiar
                    </button>
                </div>
                <textarea
                    readOnly
                    className="import-textarea"
                    rows="12"
                    value={resultText}
                />
            </Popup>
        </div>
    )
}

