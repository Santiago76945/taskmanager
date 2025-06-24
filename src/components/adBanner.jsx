// src/components/AdBanner.jsx

import React, { useState, useEffect } from 'react'
import '../styles/adbanner.css'  // moved all inline styles here

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
 * Ahora acepta un callback `onRequestDisableAds` para abrir el modal desde MainMenu.
 */
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
      // invoca el modal centralizado
      onRequestDisableAds()
    } else {
      // fallback: desactiva directamente
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
  )
}
