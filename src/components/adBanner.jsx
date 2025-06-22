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

/**
 * AdBanner: muestra un anuncio con probabilidad 1/5 al montar,
 * con cuenta regresiva para omitir, botón de "Más información" y "Desactivar Ads".
 * Centraliza aquí todos los imports y la lógica de selección.
 */
export default function AdBanner() {
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
    localStorage.setItem('adsDisabled', 'true')
    setAdsDisabled(true)
    setShow(false)
  }
  const handleMoreInfo = () => {
    if (ad && ad.config.link) {
      window.open(ad.config.link, '_blank', 'noopener')
    }
  }

  if (!show || !ad) return null

  const { title, body, link } = ad.config
  const imageUrl = ad.image

  return (
    <>
      <style>{`
.adbanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.adbanner-container {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.adbanner-header {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
}
.adbanner-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #111;
}
.adbanner-image {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.adbanner-body {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #444;
  line-height: 1.4;
}
.adbanner-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.adbanner-button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}
.adbanner-skip {
  background: #007bff;
  color: #fff;
  opacity: ${count > 0 ? 0.5 : 1};
  pointer-events: ${count > 0 ? 'none' : 'auto'};
}
.adbanner-moreinfo {
  background: #28a745;
  color: #fff;
}
.adbanner-disable {
  background: #dc3545;
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
              {count > 0 ? `Espera ${count} segundo${count !== 1 ? 's' : ''}` : 'Omitir'}
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
