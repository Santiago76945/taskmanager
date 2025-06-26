// src/components/AdBanner.jsx

import React, { useState, useEffect } from 'react'

// Importa aquí todas las configuraciones de anuncios y sus imágenes
import ad1Config from '../ads/super-luckys-adventure/config.json'
import ad1Image from '../ads/super-luckys-adventure/super-luckys-adventure.png'
// Si tienes más anuncios, simplemente importa más:
// import ad2Config from '../ads/otro-anuncio/config.json'
// import ad2Image from '../ads/otro-anuncio/otro-anuncio.png'

const ADS = [
  { config: ad1Config, image: ad1Image },
  // { config: ad2Config, image: ad2Image },
]

export default function AdBanner({ onRequestDisableAds }) {
  const [show, setShow] = useState(false)
  const [count, setCount] = useState(5)
  const [adsDisabled, setAdsDisabled] = useState(
    () => localStorage.getItem('adsDisabled') === 'true'
  )
  const [ad, setAd] = useState(null)

  // Al montar, si no están desactivados y sale 1/5, elige un anuncio aleatorio
  useEffect(() => {
    if (adsDisabled) return
    if (Math.random() < 0.2) {
      const choice = ADS[Math.floor(Math.random() * ADS.length)]
      setAd(choice)
      setShow(true)
    }
  }, [adsDisabled])

  // Cuenta regresiva de 5 a 0
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
      {/* CSS embebido para AdBanner */}
      <style>{`
        .adbanner-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .adbanner-container {
          background: #fff;
          border-radius: 8px;
          max-width: 90%;
          width: 400px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .adbanner-header {
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 8px;
        }
        .adbanner-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .adbanner-image {
          width: 100%;
          height: auto;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .adbanner-body {
          font-size: 1rem;
          color: #333;
          margin-bottom: 16px;
        }
        .adbanner-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .adbanner-button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .adbanner-skip,
        .adbanner-disable {
          background: #ddd;
          color: #333;
        }
        .adbanner-skip:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .adbanner-moreinfo {
          background: #007bff;
          color: #fff;
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
