// src/components/CoinPurchaseModal.jsx

import basicImg from '../assets/coin-purchase-basic.png';
import popularImg from '../assets/coin-purchase-popular.png';
import premiumImg from '../assets/coin-purchase-premium.png';

const packages = [
    { id: 'basic', label: '100 Demi Coins', amount: 100, price: '$0.99', image: basicImg },
    { id: 'popular', label: '500 Demi Coins', amount: 500, price: '$3.49', image: popularImg },
    { id: 'premium', label: '1000 Demi Coins', amount: 1000, price: '$5.99', image: premiumImg },
];

export default function CoinPurchaseModal({ visible, onClose, onPurchase }) {
    if (!visible) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-card coin-purchase-card">
                <header className="popup-header">
                    <h3>DemiCoins: Potencia tu productividad</h3>
                </header>

                <p className="coin-purchase-subtitle">
                    ✨ Con Demetria AI, agregar tareas es más fácil que nunca: solo descríbele lo que necesitas hacer, menciona detalles clave (como fechas, prioridad o etiquetas) ¡y deja que Demi se ocupe del resto como por arte de magia! 🪄
                </p>

                <div className="popup-body coin-purchase-body">
                    <div className="coin-packages">
                        {packages.map(pkg => (
                            <div key={pkg.id} className="coin-package">
                                <img src={pkg.image} alt={pkg.label} />
                                <p className="coin-package-label">{pkg.label}</p>
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

                    {/* Solo el botón de cerrar al pie */}
                    <button
                        className="coin-package-exit"
                        onClick={onClose}
                    >
                        ✕ Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
