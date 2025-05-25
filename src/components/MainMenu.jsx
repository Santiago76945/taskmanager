// src/components/MainMenu.jsx

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import '../styles/unified.css'
import demeterLogo from '../assets/logo.png'

export default function MainMenu({ streak = 0 }) {
    const navigate = useNavigate()
    const { logout } = useContext(AuthContext)

    const [darkMode, setDarkMode] = useState(false)

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

    return (
        <main className="main-menu-card">
            <header className="header">
                <img
                    className="mascot"
                    src={demeterLogo}
                    alt="Deméter regando la cosecha"
                />
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

                <button
                    className="logout-btn"
                    aria-label="Cerrar sesión"
                    onClick={logout}
                >
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
                    <span className="stat-value">📅 8</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Alta prioridad</span>
                    <span className="stat-value">⚡️ 5</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Atrasadas</span>
                    <span className="stat-value">⏳ 2</span>
                </div>
            </section>

            <nav className="menu">
                <button
                    className="action main-menu-button"
                    onClick={() => navigate('/dashboard/tasks')}
                >
                    Mis tareas
                </button>
                <button
                    className="action main-menu-button"
                    onClick={() => navigate('/dashboard/import')}
                >
                    Importar tareas
                </button>
                <button
                    className="action main-menu-button"
                    onClick={() => navigate('/dashboard/export')}
                >
                    Exportar tareas
                </button>
                <button
                    className="action main-menu-button"
                    onClick={() => {/* futura funcionalidad Demetria */ }}
                >
                    Asistente AI Demetria
                </button>
                <button
                    className="action main-menu-button"
                    onClick={() => {/* futura funcionalidad Demetrios+ */ }}
                >
                    Adquirir Demetrios+
                </button>
                <button
                    className="action main-menu-button"
                    onClick={() => {/* futura funcionalidad Borrar tareas */ }}
                >
                    Borrar todas mis tareas
                </button>
            </nav>
        </main>
    )
}
