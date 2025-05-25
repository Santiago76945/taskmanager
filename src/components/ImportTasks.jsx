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
        } catch (err) {
            setMessage({ type: 'error', text: '❌ El texto pegado no es JSON válido.' })
            return
        }

        const items = Array.isArray(parsed) ? parsed : [parsed]
        const successCount = []
        const errorList = []

        for (let i = 0; i < items.length; i++) {
            const task = items[i]
            // validar campos obligatorios
            if (!task.title || !task.status || !task.deadline) {
                errorList.push(`Tarea #${i + 1}: falta title, status o deadline`)
                continue
            }
            try {
                await api.createTask(token, task)
                successCount.push(i)
            } catch (err) {
                errorList.push(`Tarea #${i + 1}: error al importar (${err.response?.data || err.message})`)
            }
        }

        if (errorList.length === 0) {
            setMessage({ type: 'success', text: `✔️ ${successCount.length} tareas importadas correctamente.` })
        } else if (successCount.length === 0) {
            setMessage({ type: 'error', text: '❌ No se pudo importar ninguna tarea.' })
            setErrors(errorList)
        } else {
            setMessage({ type: 'warning', text: `⚠️ ${successCount.length} tareas importadas; ${errorList.length} con errores.` })
            setErrors(errorList)
        }

        setJsonText('')
    }

    return (
        <div className="container p-lg">
            <div className="flex justify-between items-center mb-md">
                <h2>Importar tareas desde JSON</h2>
                <button className="btn btn-secondary" onClick={() => setHelpOpen(true)}>
                    ❔
                </button>
            </div>

            <div className="form-group">
                <label>JSON de tarea(s):</label>
                <textarea
                    className="import-textarea"
                    rows="12"
                    value={jsonText}
                    onChange={e => setJsonText(e.target.value)}
                    placeholder='Pega aquí un objeto JSON o un arreglo de objetos...'
                />
            </div>

            {message && (
                <div className={`m-sm p-sm ${message.type === 'success' ? 'text-green-600' : message.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {message.text}
                </div>
            )}

            {errors.length > 0 && (
                <ul className="text-red-600 ml-md">
                    {errors.map((errMsg, idx) => (
                        <li key={idx}>{errMsg}</li>
                    ))}
                </ul>
            )}

            <div className="flex justify-end gap-sm mt-md">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    Volver al menú
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleImport}
                >
                    Importar tarea(s)
                </button>
            </div>

            <Popup
                isOpen={helpOpen}
                onClose={() => setHelpOpen(false)}
                title="Cómo importar tareas"
            >
                <p>Puedes pegar un <strong>objeto JSON</strong> o un <strong>arreglo de objetos</strong>. Cada objeto admite:</p>
                <ul className="ml-md list-disc">
                    <li><code>title</code> <strong>(string, obligatorio)</strong></li>
                    <li><code>status</code> <strong>(string, obligatorio)</strong>: <em>nueva</em> · <em>no comenzada</em> · <em>comenzada</em> · <em>estancada</em> · <em>finalizada</em></li>
                    <li><code>deadline</code> <strong>(ISO date, obligatorio)</strong></li>
                    <li><code>priority</code> (string, opcional): <em>baja</em> · <em>media</em> · <em>alta</em></li>
                    <li><code>location</code>, <code>assignedBy</code>, <code>recommendedDate</code>, <code>creationDate</code> (opcionales)</li>
                    <li><code>depends</code> (boolean) y <code>dependsOn</code> (id) si <code>depends: true</code></li>
                    <li><code>stalledReason</code> si <code>status: "estancada"</code></li>
                    <li><code>completionDate</code> si <code>status: "finalizada"</code> (si lo omites, se usa la fecha actual)</li>
                    <li><code>observation</code>, <code>details</code> (opcionales)</li>
                </ul>
                <p>Ejemplo una tarea:</p>
                <pre className="bg-gray-100 p-sm rounded">
                    {`{
  "title": "Preparar informe",
  "status": "no comenzada",
  "deadline": "2025-06-01T18:00:00Z",
  "priority": "alta"
}`}
                </pre>
                <p>Ejemplo múltiples tareas:</p>
                <pre className="bg-gray-100 p-sm rounded">
                    {`[
  { "title": "Pagar impuestos", "status": "nueva", "deadline": "2025-05-28T12:00:00Z" },
  { "title": "Enviar CV", "status": "comenzada", "deadline": "2025-05-30T09:00:00Z", "priority": "media" }
]`}
                </pre>
            </Popup>
        </div>
    )
}
