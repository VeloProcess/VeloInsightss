import React, { useState, useEffect } from 'react'
import './ProcessingLoader.css'

const ProcessingLoader = ({ progress = 0, currentRecord = 0, totalRecords = 0, isVisible = false, onCancel }) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  const percentage = Math.round(progress)
  const processedRecords = Math.round((progress / 100) * totalRecords)
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="loader-overlay-premium">
      <div className="loader-container-premium">
        {/* Decorative gradient orbs */}
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>

        {/* Main content */}
        <div className="loader-content">
          {/* Logo */}
          <div className="loader-logo">
            <div className="logo-circle">
              <svg viewBox="0 0 100 100" className="logo-svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#1694FF', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1634FF', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.1"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" strokeWidth="3"/>
                <path d="M 30 50 L 45 65 L 70 35" fill="none" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="loader-pulse"></div>
          </div>

          {/* Title */}
          <h2 className="loader-title">Processando Dados</h2>
          <p className="loader-subtitle">Aguarde enquanto carregamos as informações</p>

          {/* Progress bar */}
          <div className="loader-progress-container">
            <div className="loader-progress-bar">
              <div 
                className="loader-progress-fill" 
                style={{ width: `${percentage}%` }}
              >
                <div className="loader-progress-shine"></div>
              </div>
            </div>
            <div className="loader-percentage">{percentage}%</div>
          </div>

          {/* Stats */}
          <div className="loader-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Registros</span>
                <span className="stat-value">{processedRecords} / {totalRecords}</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Tempo decorrido</span>
                <span className="stat-value">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="loader-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button className="loader-cancel-btn" onClick={onCancel} aria-label="Cancelar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default ProcessingLoader
