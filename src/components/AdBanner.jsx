// src/components/AdBanner.jsx

import React, { useState, useEffect } from 'react'

// Importa aquí todas las configuraciones de anuncios y sus imágenes
import ad1Config from '../ads/super-luckys-adventure/config.json'
import ad1Image from '../ads/super-luckys-adventure/super-luckys-adventure.png'

const ADS = [
  { config: ad1Config, image: ad1Image },
]

export default function AdBanner({ onRequestDisableAds }) {
  const [show, setShow] = useState(false)
  const [count, setCount] = useState(5)
  const [adsDisabled, setAdsDisabled] = useState(
    () => localStorage.getItem('adsDisabled') === 'true'
  )
  const [ad, setAd] = useState(null)

  useEffect(() => {
    if (adsDisabled) return
    if (Math.random() < 0.2) {
      const choice = ADS[Math.floor(Math.random() * ADS.length)]
      setAd(choice)
      setShow(true)
    }
  }, [adsDisabled])

  useEffect(() => {
    if (!show) return
    if (count > 0) {
      const timer = setTimeout(() => setCount(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [show, count])

  const handleSkip = () => setShow(false)
  const handleDisable = () => {
    if (typeof onRequestDisableAds === 'function') {
      onRequestDisableAds()
    } else {
      localStorage.setItem('adsDisabled', 'true')
      setAdsDisabled(true)
      setShow(false)
    }
  }
  const handleMoreInfo = () => {
    if (ad?.config.link) {
      window.open(ad.config.link, '_blank', 'noopener')
    }
  }

  if (!show || !ad) return null

  const { title, body, link } = ad.config
  const imageUrl = ad.image

  return (
    <>
      <style>{`
        /* Overlay: permite scroll vertical y padding */
        .adbanner-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
          z-index: 1000;
        }

        /* Contenedor: usa variables para modo claro/oscuro */
        .adbanner-container {
          background: var(--color-bg);
          border-radius: var(--border-radius-lg);
          width: 100%;
          max-width: 400px;
          max-height: 90vh;
          max-height: 90dvh;
          padding: var(--spacing-md);
          box-sizing: border-box;
          overflow-y: auto;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .adbanner-header {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }
        .adbanner-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--color-text);
          margin-bottom: var(--spacing-sm);
        }
        .adbanner-image {
          width: 100%;
          height: auto;
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-md);
        }
        .adbanner-body {
          font-size: 1rem;
          color: var(--color-text);
          margin-bottom: var(--spacing-lg);
        }

        /* Botones: variables de color y buen contraste */
        .adbanner-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          justify-content: center;
        }
        .adbanner-button {
          flex: 1 1 100px;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 1rem;
        }
        .adbanner-skip {
          background: var(--color-secondary);
          color: var(--color-bg);
        }
        .adbanner-skip:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .adbanner-moreinfo {
          background: var(--color-primary);
          color: var(--color-bg);
        }
        .adbanner-disable {
          background: var(--color-secondary);
          color: var(--color-bg);
        }

        /* Responsive pequeños */
        @media (max-width: 360px) {
          .adbanner-container {
            padding: var(--spacing-sm);
          }
          .adbanner-title {
            font-size: 1.1rem;
          }
          .adbanner-body {
            font-size: 0.9rem;
          }
          .adbanner-button {
            flex: 1 1 100%;
          }
        }
      `}</style>

      <div className="adbanner-overlay">
        <div className="adbanner-container">
          <div className="adbanner-header">Publicidad:</div>
          <div className="adbanner-title">{title}</div>
          <img className="adbanner-image" src={imageUrl} alt={title} />
          <div className="adbanner-body">{body}</div>
          <div className="adbanner-buttons">
            <button
              className="adbanner-button adbanner-skip"
              onClick={handleSkip}
              disabled={count > 0}
            >
              {count > 0
                ? `Espera ${count} segundo${count !== 1 ? 's' : ''}`
                : 'Omitir'}
            </button>
            {link && (
              <button
                className="adbanner-button adbanner-moreinfo"
                onClick={handleMoreInfo}
              >
                Más información
              </button>
            )}
            <button
              className="adbanner-button adbanner-disable"
              onClick={handleDisable}
            >
              Desactivar Ads
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

