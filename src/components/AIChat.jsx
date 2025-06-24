// src/components/AIChat.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import demiIcon from '../assets/demi-coin.png'
import demiProfile from '../assets/demetria-profile.png'

export default function AIChat() {
    const navigate = useNavigate()
    const [mode, setMode] = useState(null)
    const [messages, setMessages] = useState([
        { from: 'bot', text: '¡Hola! soy Demetria, tu asistente inteligente, ¿en qué puedo ayudarte?', typing: false },
        { from: 'bot', type: 'options' }
    ])
    const [input, setInput] = useState('')
    const [coins, setCoins] = useState(0)
    const [pendingCost, setPendingCost] = useState(null)
    const [queuedInput, setQueuedInput] = useState(null)
    const chatEndRef = useRef(null)

    // Al montar, traemos el saldo real
    useEffect(() => {
        api.getProfile()
            .then(res => setCoins(res.data.demiCoins))
            .catch(() => setCoins(0))
    }, [])

    // Auto-scroll al final del chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Simula “escribiendo…”
    const pushBot = async (text) => {
        setMessages(msgs => [...msgs, { from: 'bot', text: '', typing: true }])
        await new Promise(r => setTimeout(r, 800))
        setMessages(msgs =>
            msgs.map(m => m.typing ? { from: 'bot', text, typing: false } : m)
        )
    }

    // Mostrar opciones iniciales
    const showOptions = () => {
        setMode(null)
        setMessages(msgs => [
            ...msgs,
            { from: 'bot', type: 'options' }
        ])
    }

    // Manejar elección de modo
    const chooseOption = async (selectedMode) => {
        const userText = selectedMode === 'query'
            ? 'Necesito saber algo sobre mis tareas'
            : 'Necesito añadas una tarea por mí'
        setMode(selectedMode)
        setMessages(msgs =>
            msgs.filter(m => m.type !== 'options')
                .concat({ from: 'user', text: userText })
        )

        if (selectedMode === 'add') {
            await pushBot(
                'Perfecto! Contame todo lo relevante sobre la tarea que querés crear y sobre todo no olvides la fecha límite. ' +
                'Si no mencionás dicha fecha, la fijaré automáticamente para dentro de una semana.'
            )
        } else {
            await pushBot('Entendido. ¿En qué puedo ayudarte?')
        }
    }

    // Estimación de coste (1 coin ≈ 10 tokens)
    const estimateCost = (text, tasksJson) => {
        const tokens = Math.ceil((text.length + tasksJson.length) / 4)
        return Math.max(1, Math.ceil(tokens / 10))
    }

    // Paso 1: enviar mensaje y pedir confirmación de coste
    const handleSend = async () => {
        if (!mode) {
            setMessages(msgs => [
                ...msgs,
                { from: 'bot', text: 'Por favor, primero elige una de las siguientes opciones:', typing: false },
                { from: 'bot', type: 'options' }
            ])
            return
        }
        if (!input.trim()) return

        const userText = input
        setQueuedInput(userText)
        setInput('')

        let tasksJson = ''
        if (mode === 'query') {
            const res = await api.getTasks()
            tasksJson = JSON.stringify(res.data)
        }

        const cost = estimateCost(userText, tasksJson)
        setPendingCost(cost)

        setMessages(msgs => [
            ...msgs,
            { from: 'bot', type: 'cost', text: `Tu consulta tendrá un costo aproximado de ${cost.toFixed(2)} Demi Coins. ¿Quieres proseguir?`, typing: false },
            { from: 'bot', type: 'confirm' }
        ])
    }

    // Paso 2: confirmar o cancelar la operación
    const handleConfirm = async (confirm) => {
        // Limpiar prompts de coste y confirmación
        setMessages(msgs => msgs.filter(m => m.type !== 'confirm' && m.type !== 'cost'))

        if (!confirm) {
            setPendingCost(null)
            setQueuedInput(null)
            await pushBot('Entendido, volvamos al inicio.')
            return showOptions()
        }
        if (coins < pendingCost) {
            await pushBot('Saldo insuficiente. Por favor, compra Demi Coins.')
            return showOptions()
        }

        // Mostrar mensaje del usuario
        setMessages(msgs => [...msgs, { from: 'user', text: queuedInput }])
        let instruction = queuedInput
        setPendingCost(null)
        setQueuedInput(null)

        if (mode === 'query') {
            try {
                const res = await api.aiQuery(instruction)
                setCoins(res.data.demiCoins)
                await pushBot(res.data.reply)
            } catch (err) {
                console.error('Error al crear consulta:', err)
                const msg = err.response?.data?.msg
                    || err.response?.data
                    || err.message
                    || 'Error desconocido'
                await pushBot(`❌ No pude crear la consulta: ${msg}`)
            }

        } else {
            try {
                // --- INYECCIÓN DE FECHA LOCAL EN EL PROMPT ---
                const ahora = new Date()
                const fechaParte = ahora.toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })
                const horaParte = ahora.toLocaleTimeString('es-AR', {
                    hour: '2-digit', minute: '2-digit'
                })
                const instruccionConFecha = `(Fecha actual: ${fechaParte} ${horaParte}). ${instruction}`

                const res = await api.aiAddTask({ instruction: instruccionConFecha })
                let task = res.data.task
                if (!task.status) task.status = 'no comenzada'
                if (!task.deadline) {
                    const d = new Date()
                    d.setDate(d.getDate() + 7)
                    task.deadline = d.toISOString()
                }
                setCoins(res.data.demiCoins)

                // Formatear fecha límite en español
                const fechaFormateada = new Date(task.deadline)
                    .toLocaleString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })

                await pushBot(
                    `✅ Tarea creada:\n` +
                    `• Título: ${task.title}\n` +
                    `• Estado: ${task.status}\n` +
                    `• Fecha límite: ${fechaFormateada}`
                )
            } catch {
                await pushBot('❌ Error al crear la tarea. Intenta de nuevo.')
            }
        }

        // Ofrecer nueva acción
        await pushBot('¿Necesitas algo más?')
        showOptions()
    }

    // Comprar Demi Coins (testing)
    const buyCoins = async () => {
        try {
            const res = await api.addCoins()
            setCoins(res.data.demiCoins)
            await pushBot('✔️ Has comprado 100 Demi Coins.')
        } catch {
            await pushBot('❌ No se pudo completar la compra. Inténtalo de nuevo.')
        }
    }

    return (
        <div className="aiassistant__container">
            <header className="aiassistant__header">
                <button className="aiassistant__back-btn" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <div className="aiassistant__balance">
                    <img src={demiIcon} alt="Demi Coins" className="aiassistant__coin-icon" />
                    <span>{coins.toFixed(2)}</span>
                    <button className="aiassistant__buy-btn" onClick={buyCoins}>
                        +100
                    </button>
                </div>
            </header>

            <div className="aiassistant__chat">
                {messages.map((m, i) =>
                    m.type === 'options' ? (
                        <div key={i} className="aiassistant__options">
                            <button className="aiassistant__option-btn" onClick={() => chooseOption('query')}>
                                Necesito saber algo sobre mis tareas
                            </button>
                            <button className="aiassistant__option-btn" onClick={() => chooseOption('add')}>
                                Necesito añadas una tarea por mí
                            </button>
                        </div>
                    ) : m.type === 'confirm' ? (
                        <div key={i} className="aiassistant__options">
                            <button className="aiassistant__option-btn" onClick={() => handleConfirm(true)}>
                                ✅ Sí, proseguir
                            </button>
                            <button className="aiassistant__option-btn" onClick={() => handleConfirm(false)}>
                                ❌ Cancelar
                            </button>
                        </div>
                    ) : (
                        <div key={i} className={`aiassistant__message aiassistant__message--${m.from}`}>
                            {m.from === 'bot' && !m.typing && (
                                <img src={demiProfile} alt="Demetria" className="aiassistant__avatar" />
                            )}
                            {m.typing
                                ? <span className="aiassistant__typing">Escribiendo...</span>
                                : <span>{m.text}</span>}
                        </div>
                    )
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="aiassistant__input-wrapper">
                <input
                    type="text"
                    className="aiassistant__input"
                    placeholder={mode ? "Escribe tu mensaje..." : "Elige primero una opción"}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    disabled={!mode || pendingCost != null}
                />
                <button
                    className="aiassistant__send-btn"
                    onClick={() => (pendingCost != null ? handleConfirm(true) : handleSend())}
                    disabled={!mode}
                >
                    {pendingCost != null ? '✓' : '➤'}
                </button>
            </div>
        </div>
    )
}
