// src/components/DeactivateAdsModal.jsx

import '../styles/deactivate-ads.css';

export default function DeactivateAdsModal({ visible, onClose }) {
    if (!visible) return null;

    const handleDisable = () => {
        localStorage.setItem('adsDisabled', 'true');
        onClose();
    };

    return (
        <div className="popup-overlay-deactivate-ads-modal">
            <div className="popup-card deactivate-ads-card">
                <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">
                    ✕
                </button>

                <header className="popup-header">
                    <h3>🚫 Desactivar anuncios</h3>
                </header>

                <div className="popup-body deactivate-ads-body">
                    <p>Elige una de las opciones para desactivar los anuncios:</p>

                    <div className="ads-packages">
                        <div className="ads-package">
                            <p className="ads-package-label">$1 / mes</p>
                            <p className="ads-package-price">Suscripción mensual</p>
                            <button className="ads-package-btn" onClick={handleDisable}>
                                Elegir
                            </button>
                        </div>

                        <div className="ads-package">
                            <p className="ads-package-label">$20</p>
                            <p className="ads-package-price">Pago único</p>
                            <button className="ads-package-btn" onClick={handleDisable}>
                                Elegir
                            </button>
                        </div>
                    </div>
                </div>

                <button className="ads-package-exit" onClick={onClose}>
                    ✕ Cerrar
                </button>
            </div>
        </div>
    );
}
