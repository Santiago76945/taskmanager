// src/components/MainMenu.jsx

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import logoAndText from '../assets/logo-and-text.png'
import logoAndTextDark from '../assets/logo-and-text-dark-mode.png'
import Popup from './Popup'
import AdBanner from './AdBanner'
import DeactivateAdsModal from './DeactivateAdsModal'
import * as api from '../services/api'

export default function MainMenu() {
    const navigate = useNavigate()
    const { token, logout, streak } = useContext(AuthContext)

    const [darkMode, setDarkMode] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [inputText, setInputText] = useState('')
    const [confirmError, setConfirmError] = useState('')
    const [confirmSuccess, setConfirmSuccess] = useState('')

    // nuevo estado para el modal de Desactivar Ads
    const [deactivateOpen, setDeactivateOpen] = useState(false)

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

    useEffect(() => {
        if (!token) return

        const fetchStats = async () => {
            try {
                const { data: tasks } = await api.getTasks()
                const now = new Date()
                const diff = (now.getDay() + 6) % 7
                const startOfWeek = new Date(now)
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
                        if (dl < now) countOverdue++
                        if (t.priority === 'alta') countHigh++
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
        <>
            {/* AdBanner se mostrará con probabilidad 1 de 5 */}
            <AdBanner
                title="¡Mejora tu productividad!"
                imageUrl="/ads/productivity.png"
                body="Prueba Demetria+ gratis durante 7 días. ¡Inténtalo ya!"
            />

            <main className="mainmenu__card">
                <header className="mainmenu__header">
                    <img
                        src={darkMode ? logoAndTextDark : logoAndText}
                        alt="Demi logo and name"
                        className="mainmenu__logo-text"
                    />
                    <div className="mainmenu__controls">
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
                        <button
                            className="logout-btn"
                            aria-label="Cerrar sesión"
                            onClick={logout}
                        >
                            ⏻
                        </button>
                    </div>
                </header>

                <section className="mainmenu__stats">
                    <div className="mainmenu__stat">
                        <span className="mainmenu__stat-label">Racha</span>
                        <span className="mainmenu__stat-value">🔥 {streak}</span>
                    </div>
                    <div className="mainmenu__stat">
                        <span className="mainmenu__stat-label">Esta semana</span>
                        <span className="mainmenu__stat-value">📅 {weekCount}</span>
                    </div>
                    <div className="mainmenu__stat">
                        <span className="mainmenu__stat-label">Alta prioridad</span>
                        <span className="mainmenu__stat-value">⚡️ {highPriorityCount}</span>
                    </div>
                    <div className="mainmenu__stat">
                        <span className="mainmenu__stat-label">Atrasadas</span>
                        <span className="mainmenu__stat-value">⏳ {overdueCount}</span>
                    </div>
                </section>

                <nav className="mainmenu__actions">
                    <button
                        className="mainmenu__action-button"
                        onClick={() => navigate('/dashboard/tasks')}
                    >
                        Mis tareas
                    </button>
                    <button
                        className="mainmenu__action-button"
                        onClick={() => navigate('/dashboard/import')}
                    >
                        Importar tareas
                    </button>
                    <button
                        className="mainmenu__action-button"
                        onClick={() => navigate('/dashboard/export')}
                    >
                        Exportar tareas
                    </button>
                    <button
                        className="mainmenu__action-button"
                        onClick={() => navigate('/dashboard/ai')}
                    >
                        Demetria: Asistente AI
                    </button>
                    <button
                        className="mainmenu__action-button"
                        onClick={() => setDeactivateOpen(true)}
                    >
                        Desactivar Ads
                    </button>
                    <button
                        className="mainmenu__action-button"
                        onClick={openConfirm}
                    >
                        Borrar todas mis tareas
                    </button>
                </nav>

                <p className="mainmenu__tip">
                    Cada día sin tareas atrasadas aumentas tu racha 🔥.
                </p>

                <Popup
                    isOpen={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    title="Confirmar borrado de todas las tareas"
                >
                    <p className="confirm-popup__message">
                        ¿Estás seguro que deseas borrar <strong>todas</strong> tus tareas? Esta acción es <strong>irreversible</strong>.
                    </p>
                    <p className="confirm-popup__subtitle">
                        Para confirmar, escribe exactamente:
                    </p>
                    <pre className="confirm-popup__code">quiero borrar todo</pre>
                    <input
                        type="text"
                        className="confirm-popup__input"
                        placeholder="Escribe aquí..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                    />
                    {confirmError && (
                        <p className="confirm-popup__error">{confirmError}</p>
                    )}
                    {confirmSuccess && (
                        <p className="confirm-popup__success">{confirmSuccess}</p>
                    )}
                    <div className="confirm-popup__actions">
                        <button
                            className="confirm-popup__btn confirm-popup__btn--cancel"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="confirm-popup__btn confirm-popup__btn--confirm"
                            onClick={handleDeleteAll}
                        >
                            Confirmar borrado
                        </button>
                    </div>
                </Popup>
            </main>

            {/* Modal de Desactivar Ads */}
            <DeactivateAdsModal
                visible={deactivateOpen}
                onClose={() => setDeactivateOpen(false)}
            />
        </>
    )
}
