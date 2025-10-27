import React from 'react'
import './ChartModal.css'

const ChartModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children 
}) => {
  if (!isOpen) return null

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div className="chart-modal-title-section">
            <div className="chart-modal-icon">{icon}</div>
            <h2 className="chart-modal-title">{title}</h2>
          </div>
          <button 
            className="chart-modal-close"
            onClick={onClose}
            title="Fechar gráfico"
          >
            ✕
          </button>
        </div>
        
        <div className="chart-modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ChartModal
