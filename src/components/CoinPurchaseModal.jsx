// src/components/CoinPurchaseModal.jsx

import React from 'react'
import basicImg from '../assets/coin-purchase-basic.png'
import popularImg from '../assets/coin-purchase-popular.png'
import premiumImg from '../assets/coin-purchase-premium.png'

const packages = [
    {
        id: 'basic',
        label: '100 Demi Coins',
        amount: 100,
        price: '$0.99',
        note: 'Para probar la magia ✨',
        image: basicImg,
    },
    {
        id: 'popular',
        label: '500 Demi Coins',
        amount: 500,
        price: '$3.49',
        note: 'Favorito de los usuarios 💚',
        image: popularImg,
    },
    {
        id: 'premium',
        label: '1000 Demi Coins',
        amount: 1000,
        price: '$5.99',
        note: 'Máximo ahorro 🏆',
        image: premiumImg,
    },
]

export default function CoinPurchaseModal({ visible, onClose, onPurchase }) {
    if (!visible) return null

    return (
        <div className="popup-overlay-coin-purchase-modal">
            <div className="popup-card coin-purchase-card">
                {/* Close button */}
                <button
                    className="popup-close-btn"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                {/* Header */}
                <header className="popup-header">
                    <h3>🚀 Potencia tu productividad con DemiCoins®</h3>
                </header>

                {/* 1. Paquetes de compra */}
                <div className="popup-body coin-purchase-body">
                    <div className="coin-packages">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="coin-package">
                                <img src={pkg.image} alt={pkg.label} />
                                <p className="coin-package-label">{pkg.label}</p>
                                <p className="coin-package-note">{pkg.note}</p>
                                <p className="coin-package-price">{pkg.price}</p>
                                <button
                                    className="coin-package-btn"
                                    onClick={() => onPurchase(pkg.amount)}
                                >
                                    Obtener
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Beneficios de Demetria AI */}
                <div className="coin-purchase-features">
                    <div className="feature-container">
                        <h4>Crea tareas con solo pedirlo ✨ — Con Demetria AI®</h4>
                        <p>
                            ¿Te da pereza llenar formularios o prefieres ahorrar tiempo? Solo
                            pídele a Demetria lo que necesitas y ella lo convertirá
                            automáticamente en una tarea lista para usar. Por ejemplo:
                        </p>
                        <ul>
                            <li>
                                Recoger los expedientes del Tribunal 3 la próxima semana.
                            </li>
                            <li>
                                Preparar el regalo de cumpleaños de Sarah con fecha límite
                                para el 7 de octubre.
                            </li>
                            <li>
                                Corregir los exámenes de los alumnos con fecha límite este
                                viernes; observación: presentar en la plataforma docente.
                            </li>
                        </ul>
                    </div>

                    <div className="feature-container">
                        <h4>
                            Consulta inteligente sobre tus tareas 💡 — Con Demetria AI®
                        </h4>
                        <p>
                            Tus tareas guardan información valiosísima. Demetria la analiza
                            en segundos para responder preguntas como:
                        </p>
                        <ul>
                            <li>¿Tengo algo pendiente para hoy? ¿Hay algo urgente?</li>
                            <li>¿Cuál fue la última tarea que completé? ¿Quién me la asignó?</li>
                            <li>
                                ¿A qué hora terminé mi último trabajo práctico? ¿De qué materia
                                era?
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 3. Botón de cierre */}
                <button className="coin-package-exit" onClick={onClose}>
                    ✕ Cerrar
                </button>
            </div>
        </div>
    )
}
