// src/components/AIChat.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getProfile,
    aiQuery,
    aiAddTask,
    previewQuery,
    previewAddTask,
    addCoins,
} from '../services/api'
import demiIcon from '../assets/demi-coin.png'
import demiProfile from '../assets/demetria-profile.png'
import CoinPurchaseModal from './CoinPurchaseModal'

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
    const [isModalVisible, setModalVisible] = useState(false)
    const chatEndRef = useRef(null)

    // Traer saldo al montar
    useEffect(() => {
        getProfile()
            .then(res => setCoins(res.data.demiCoins))
            .catch(() => setCoins(0))
    }, [])

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const pushBot = async (text) => {
        setMessages(ms => [...ms, { from: 'bot', text: '', typing: true }])
        await new Promise(r => setTimeout(r, 800))
        setMessages(ms => ms.map(m => m.typing ? { from: 'bot', text, typing: false } : m))
    }

    const showOptions = () => {
        setMode(null)
        setMessages(ms => [...ms, { from: 'bot', type: 'options' }])
    }

    const chooseOption = async (selectedMode) => {
        const userText = selectedMode === 'query'
            ? 'Necesito saber algo sobre mis tareas'
            : 'Necesito añadas una tarea por mí'
        setMode(selectedMode)
        setMessages(ms =>
            ms.filter(m => m.type !== 'options').concat({ from: 'user', text: userText })
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

    // Paso 1: preview de coste real
    const handleSend = async () => {
        if (!mode) {
            setMessages(ms => [
                ...ms,
                { from: 'bot', text: 'Por favor, primero elige una de las siguientes opciones:', typing: false },
                { from: 'bot', type: 'options' }
            ])
            return
        }
        if (!input.trim()) return

        const userText = input
        setQueuedInput(userText)
        setInput('')

        // ⚡ Llamamos al preview en el servidor, que ya cuenta tokens y aplica COINS_PER_TOKEN
        let cost = 0
        try {
            if (mode === 'query') {
                const { data } = await previewQuery({ prompt: userText })
                cost = data.actualCost
            } else {
                const { data } = await previewAddTask({ instruction: userText })
                cost = data.actualCost
            }
        } catch {
            cost = 0
        }

        setPendingCost(cost)
        setMessages(ms => [
            ...ms,
            { from: 'bot', type: 'cost', text: `Tu consulta tendrá un costo aproximado de ${cost.toFixed(2)} Demi Coins. ¿Quieres proseguir?`, typing: false },
            { from: 'bot', type: 'confirm' }
        ])
    }

    // Paso 2: confirmar o cancelar
    const handleConfirm = async (confirm) => {
        setMessages(ms => ms.filter(m => m.type !== 'confirm' && m.type !== 'cost'))
        if (!confirm) {
            setPendingCost(null)
            setQueuedInput(null)
            await pushBot('Entendido, volvamos al inicio.')
            return showOptions()
        }
        if (coins < pendingCost) {
            await pushBot('Saldo insuficiente. Por favor, compra Demi Coins.')
            setModalVisible(true)
            return
        }

        // Mostrar el mensaje del usuario
        setMessages(ms => [...ms, { from: 'user', text: queuedInput }])
        const instruction = queuedInput
        setPendingCost(null)
        setQueuedInput(null)

        if (mode === 'query') {
            try {
                const res = await aiQuery({ prompt: instruction })
                setCoins(res.data.demiCoins)
                await pushBot(res.data.reply)
            } catch (err) {
                const msg = err.response?.data?.msg || err.message || 'Error desconocido'
                await pushBot(`❌ No pude crear la consulta: ${msg}`)
            }
        } else {
            try {
                const ahora = new Date()
                const fecha = ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                const instrWithDate = `(Fecha actual: ${fecha} ${hora}). ${instruction}`

                const res = await aiAddTask({ instruction: instrWithDate })
                setCoins(res.data.demiCoins)

                let task = res.data.task
                if (!task.status) task.status = 'no comenzada'
                if (!task.deadline) {
                    const d = new Date(); d.setDate(d.getDate() + 7)
                    task.deadline = d.toISOString()
                }

                const formatted = new Date(task.deadline).toLocaleString('es-AR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })

                await pushBot(
                    `✅ Tarea creada:\n` +
                    `• Título: ${task.title}\n` +
                    `• Estado: ${task.status}\n` +
                    `• Fecha límite: ${formatted}`
                )
            } catch {
                await pushBot('❌ Error al crear la tarea. Intenta de nuevo.')
            }
        }

        await pushBot('¿Necesitas algo más?')
        showOptions()
    }

    const handleOpenModal = () => setModalVisible(true)

    const handlePurchase = async (amount) => {
        try {
            const res = await addCoins(amount)
            setCoins(res.data.demiCoins)
            setMessages(ms => ms.filter(m => m.type !== 'options'))
            await pushBot(`✔️ Has comprado ${amount} Demi Coins.`)
            showOptions()
        } catch {
            await pushBot('❌ No se pudo completar la compra. Inténtalo de nuevo.')
        } finally {
            setModalVisible(false)
        }
    }

    return (
        <div className="aiassistant__container">
            <CoinPurchaseModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onPurchase={handlePurchase}
            />

            <header className="aiassistant__header">
                <button className="aiassistant__back-btn" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <div className="aiassistant__balance">
                    <img src={demiIcon} alt="Demi Coins" className="aiassistant__coin-icon" />
                    <span>{coins.toFixed(2)}</span>
                    <button className="aiassistant__buy-btn" onClick={handleOpenModal}>
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
