// src/components/ImportTasks.jsx

import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import * as api from '../services/api'
import Popup from './Popup'

export default function ImportTasks() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    const [jsonText, setJsonText] = useState('')
    const [helpOpen, setHelpOpen] = useState(false)
    const [message, setMessage] = useState(null)       // { type: 'success'|'warning'|'error', text: string }
    const [errors, setErrors] = useState([])           // array of string

    const getMessageColor = (type) => {
        if (type === 'success') return 'var(--color-success)'
        if (type === 'warning') return 'var(--color-accent)'
        return 'var(--color-danger)'
    }

    const handleImport = async () => {
        if (!jsonText.trim()) {
            setMessage({ type: 'error', text: '❌ Por favor, ingresa un JSON para importar.' })
            return
        }

        setMessage(null)
        setErrors([])

        let parsed
        try {
            parsed = JSON.parse(jsonText)
        } catch {
            setMessage({ type: 'error', text: '❌ El texto pegado no es JSON válido.' })
            return
        }

        const items = Array.isArray(parsed) ? parsed : [parsed]
        const successCount = []
        const errorList = []

        for (let i = 0; i < items.length; i++) {
            const task = items[i]
            if (!task.title || !task.status || !task.deadline) {
                errorList.push(`Tarea #${i + 1}: falta title, status o deadline`)
                continue
            }
            try {
                await api.createTask(task)
                successCount.push(i)
            } catch (err) {
                errorList.push(
                    `Tarea #${i + 1}: error al importar (${err.response?.data || err.message})`
                )
            }
        }

        if (errorList.length === 0) {
            setMessage({
                type: 'success',
                text: `✔️ ${successCount.length} tareas importadas correctamente.`
            })
        } else if (successCount.length === 0) {
            setMessage({ type: 'error', text: '❌ No se pudo importar ninguna tarea.' })
            setErrors(errorList)
        } else {
            setMessage({
                type: 'warning',
                text: `⚠️ ${successCount.length} importadas; ${errorList.length} con errores.`
            })
            setErrors(errorList)
        }

        setJsonText('')
    }

    return (
        <div className="main-menu-card p-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-md">
                <h2 className="title">Importar tareas desde JSON</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setHelpOpen(true)}
                >
                    ❔
                </button>
            </div>

            {/* JSON Input */}
            <div className="form-group">
                <label>JSON de tarea(s):</label>
                <textarea
                    className="import-textarea"
                    rows="12"
                    value={jsonText}
                    onChange={e => setJsonText(e.target.value)}
                    placeholder="Pega aquí un objeto JSON o un arreglo de objetos..."
                />
            </div>

            {/* Feedback Message */}
            {message && (
                <div
                    className="m-sm p-sm"
                    style={{ color: getMessageColor(message.type) }}
                >
                    {message.text}
                </div>
            )}

            {/* Error List */}
            {errors.length > 0 && (
                <ul
                    className="list-reset m-md"
                    style={{ color: 'var(--color-danger)' }}
                >
                    {errors.map((errMsg, idx) => (
                        <li key={idx}>{errMsg}</li>
                    ))}
                </ul>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-sm mt-md">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    Volver al menú
                </button>
                <button className="btn btn-primary" onClick={handleImport}>
                    Importar tarea(s)
                </button>
            </div>

            {/* Help Popup */}
            <Popup
                isOpen={helpOpen}
                onClose={() => setHelpOpen(false)}
                title="Cómo importar tareas"
            >
                <p>
                    Puedes pegar un <strong>objeto JSON</strong> o un{' '}
                    <strong>arreglo de objetos</strong>. Cada objeto admite:
                </p>
                <ul className="ml-md list-disc">
                    <li>
                        <code>title</code> <strong>(string, obligatorio)</strong>
                    </li>
                    <li>
                        <code>status</code> <strong>(string, obligatorio)</strong>:{' '}
                        <em>nueva</em> · <em>no comenzada</em> · <em>comenzada</em> ·{' '}
                        <em>estancada</em> · <em>finalizada</em>
                    </li>
                    <li>
                        <code>deadline</code> <strong>(ISO date, obligatorio)</strong>
                    </li>
                    <li>
                        <code>priority</code> (string, opcional): <em>baja</em> ·{' '}
                        <em>media</em> · <em>alta</em>
                    </li>
                    <li>
                        <code>tag</code> (string, opcional): p.ej. <em>personal</em> ·{' '}
                        <em>laboral</em> · <em>otro</em>
                    </li>
                    <li>
                        <code>location</code>, <code>assignedBy</code>,{' '}
                        <code>recommendedDate</code>, <code>creationDate</code> (opcionales)
                    </li>
                    <li>
                        <code>depends</code> (boolean) y <code>dependsOn</code> (id)
                        si <code>depends: true</code>
                    </li>
                    <li>
                        <code>stalledReason</code> si <code>status: "estancada"</code>
                    </li>
                    <li>
                        <code>completionDate</code> si <code>status: "finalizada"</code>{' '}
                        (si lo omites, se usa la fecha actual)
                    </li>
                    <li>
                        <code>observation</code>, <code>details</code> (opcionales)
                    </li>
                </ul>
                <p>Ejemplo una tarea:</p>
                <pre className="card-nested">
                    {`{
  "title": "Preparar informe",
  "status": "no comenzada",
  "deadline": "2025-06-01T18:00:00Z",
  "priority": "alta",
  "tag": "laboral"
}`}
                </pre>
                <p>Ejemplo múltiples tareas:</p>
                <pre className="card-nested">
                    {`[
  { "title": "Pagar impuestos", "status": "nueva", "deadline": "2025-05-28T12:00:00Z", "tag": "personal" },
  { "title": "Enviar CV", "status": "comenzada", "deadline": "2025-05-30T09:00:00Z", "priority": "media", "tag": "otro" }
]`}
                </pre>
            </Popup>
        </div>
    )
}
