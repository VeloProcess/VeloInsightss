import React from 'react'
import './ProcessingLoader.css'
// Updated: 27/10/2025 - Tema Executivo

const ProcessingLoader = ({ progress = 0, currentRecord = 0, totalRecords = 0, isVisible = false }) => {
  if (!isVisible) return null

  const percentage = Math.round(progress)
  const processedRecords = Math.round((progress / 100) * totalRecords)

  return (
    <div className="processing-loader-overlay-executive">
      <div className="processing-loader-container-executive">
        {/* Header */}
        <div className="processing-header-executive">
          <div className="processing-icon-wrapper">
            <i className="bx bx-check-circle"></i>
          </div>
          <div className="processing-title-wrapper">
            <h2 className="processing-title">Processando Arquivo</h2>
          </div>
        </div>
        
        {/* Status Steps */}
        <div className="processing-status-executive">
          <div className="status-step active">
            <i className="bx bx-check-circle"></i>
            <span>Validando registros...</span>
          </div>
          <div className="status-step active">
            <i className="bx bx-loader-circle"></i>
            <span>Carregando dados...</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="processing-progress-executive">
          <div className="progress-percentage-executive">{percentage}%</div>
          <div className="progress-bar-executive">
            <div 
              className="progress-bar-fill-executive" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="processing-metrics-executive">
          <div className="metric-item">
            <span className="metric-label">Progresso:</span>
            <span className="metric-value">{processedRecords}</span>
            <span className="metric-separator">de</span>
            <span className="metric-total">{totalRecords}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Tempo decorrido:</span>
            <span className="metric-value">0:04</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Tempo estimado:</span>
            <span className="metric-value">0:04</span>
          </div>
        </div>
        
        {/* Loading Indicator */}
        <div className="processing-loading-executive">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="loading-text">Processando...</span>
        </div>
      </div>
    </div>
  )
}

export default ProcessingLoader
