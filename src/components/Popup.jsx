// src/components/Popup.jsx

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/popup.css';

/**
 * Popup component
 *
 * Props
 * ────────────────────────────────────────────────
 * isOpen   : boolean  – controla si se muestra
 * onClose  : () => void – callback para cerrar
 * title    : string   – cabecera opcional
 * width    : string   – css width (ej. "500px", "40rem"). Default 480 px
 * children : ReactNode – contenido (formularios, mensajes, etc.)
 */

export default function Popup({ isOpen, onClose, title, width = '480px', children }) {
    // Evita scroll del body mientras el pop-up está abierto
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => (document.body.style.overflow = '');
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="popup-overlay" onClick={onClose}>
            <div
                className="popup-card"
                style={{ width }}
                onClick={e => e.stopPropagation()} /* evita cerrar al hacer click dentro */
            >
                {title && (
                    <div className="popup-header">
                        <h3>{title}</h3>
                        <button className="popup-close" onClick={onClose}>
                            &times;
                        </button>
                    </div>
                )}

                <div className="popup-body">{children}</div>
            </div>
        </div>,
        document.body
    );
}
