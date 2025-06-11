// src/components/MainMenu.jsx

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import '../styles/unified.css'
import demeterLogo from '../assets/logo.png'
import Popup from './Popup'
import * as api from '../services/api'

export default function MainMenu() {
    const navigate = useNavigate()
    const { token, logout, streak } = useContext(AuthContext)

    const [darkMode, setDarkMode] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [inputText, setInputText] = useState('')
    const [confirmError, setConfirmError] = useState('')
    const [confirmSuccess, setConfirmSuccess] = useState('')

    // Estadísticas dinámicas
    const [weekCount, setWeekCount] = useState(0)
    const [highPriorityCount, setHighPriorityCount] = useState(0)
    const [overdueCount, setOverdueCount] = useState(0)

    useEffect(() => {
        const saved = localStorage.getItem('theme')
        if (saved === 'dark' || saved === 'light') {
            setDarkMode(saved === 'dark')
        } else {
            setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
    }, [])

    useEffect(() => {
        const root = document.documentElement
        if (darkMode) {
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    // Carga tareas y calcula estadísticas
    useEffect(() => {
        if (!token) return

        const fetchStats = async () => {
            try {
                const { data: tasks } = await api.getTasks()
                const now = new Date()
                const startOfWeek = new Date(now)
                // establecer al lunes de esta semana
                const day = startOfWeek.getDay() // 0=domingo
                const diff = (day + 6) % 7 // diferencia hacia lunes
                startOfWeek.setDate(startOfWeek.getDate() - diff)
                startOfWeek.setHours(0, 0, 0, 0)
                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(endOfWeek.getDate() + 7)

                let countWeek = 0
                let countHigh = 0
                let countOverdue = 0

                tasks.forEach(t => {
                    const dl = new Date(t.deadline)
                    const isDone = t.status === 'finalizada'
                    if (!isDone) {
                        // atrasadas
                        if (dl < now) countOverdue++
                        // alta prioridad
                        if (t.priority === 'alta') countHigh++
                        // esta semana
                        if (dl >= startOfWeek && dl < endOfWeek) countWeek++
                    }
                })

                setWeekCount(countWeek)
                setHighPriorityCount(countHigh)
                setOverdueCount(countOverdue)
            } catch (err) {
                console.error('Error cargando estadísticas:', err)
            }
        }

        fetchStats()
    }, [token])

    const openConfirm = () => {
        setInputText('')
        setConfirmError('')
        setConfirmSuccess('')
        setConfirmOpen(true)
    }

    const handleDeleteAll = async () => {
        if (inputText.trim().toLowerCase() !== 'quiero borrar todo') {
            setConfirmError('Debes escribir exactamente "quiero borrar todo" para confirmar.')
            return
        }
        try {
            const { data: tasks } = await api.getTasks()
            await Promise.all(tasks.map(t => api.deleteTask(t._id)))
            setConfirmSuccess('✔️ Todas tus tareas han sido borradas.')
            setConfirmError('')
        } catch (err) {
            setConfirmError('❌ Error al borrar tareas. Intenta de nuevo.')
        }
    }

    return (
        <main className="main-menu-card">
            <header className="header">
                <img className="mascot" src={demeterLogo} alt="Deméter regando la cosecha" />
                <div className="title-container">
                    <h1 className="title">Demetrios</h1>
                    <p className="subtitle">The Ritual of Getting Things Done</p>
                </div>

                <label className="theme-switch">
                    {darkMode ? '🌙' : '☀️'}
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(prev => !prev)}
                        aria-label="Alternar modo claro/oscuro"
                    />
                    <span className="slider" />
                </label>

                <button className="logout-btn" aria-label="Cerrar sesión" onClick={logout}>
                    ⏻
                </button>
            </header>

            <section className="stats">
                <div className="stat">
                    <span className="stat-label">Racha</span>
                    <span className="stat-value">🔥 {streak}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Esta semana</span>
                    <span className="stat-value">📅 {weekCount}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Alta prioridad</span>
                    <span className="stat-value">⚡️ {highPriorityCount}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Atrasadas</span>
                    <span className="stat-value">⏳ {overdueCount}</span>
                </div>
            </section>

            <nav className="menu">
                <button className="action main-menu-button" onClick={() => navigate('/dashboard/tasks')}>
                    Mis tareas
                </button>
                <button className="action main-menu-button" onClick={() => navigate('/dashboard/import')}>
                    Importar tareas
                </button>
                <button className="action main-menu-button" onClick={() => navigate('/dashboard/export')}>
                    Exportar tareas
                </button>
                <button className="action main-menu-button" onClick={() => { /* futura funcionalidad AI */ }}>
                    Asistente AI Demetria
                </button>
                <button className="action main-menu-button" onClick={() => { /* futura funcionalidad Premium */ }}>
                    Adquirir Demetrios+
                </button>
                <button className="action main-menu-button" onClick={openConfirm}>
                    Borrar todas mis tareas
                </button>
            </nav>

            <p className="streak-tip">
                Cada día sin tareas atrasadas aumentas tu racha 🔥.
            </p>

            <Popup isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar borrado de todas las tareas">
                <p>
                    ¿Estás seguro que deseas borrar <strong>todas</strong> tus tareas? Esta acción es <strong>irreversible</strong>.
                </p>
                <p>Para confirmar, escribe exactamente:</p>
                <pre className="confirmation-text">quiero borrar todo</pre>
                <input
                    className="form-input mt-sm"
                    placeholder="Escribe aquí..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                />
                {confirmError && <p className="text-danger mt-xs">{confirmError}</p>}
                {confirmSuccess && <p className="text-success mt-xs">{confirmSuccess}</p>}
                <div className="flex justify-end mt-md">
                    <button className="btn btn-secondary m-sm" onClick={() => setConfirmOpen(false)}>
                        Cancelar
                    </button>
                    <button className="btn btn-danger m-sm" onClick={handleDeleteAll}>
                        Confirmar borrado
                    </button>
                </div>
            </Popup>
        </main>
    )
}
