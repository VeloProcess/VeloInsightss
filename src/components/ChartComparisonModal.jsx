import React from 'react'
import './ChartComparisonModal.css'

const ChartComparisonModal = ({ isOpen, onClose, chart1, chart2 }) => {
  if (!isOpen) return null

  return (
    <div className="comparison-modal-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-modal-header">
          <div className="comparison-modal-title">
            <span className="comparison-icon">📊</span>
            <h3>Comparação de Gráficos</h3>
          </div>
          <button className="comparison-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="comparison-modal-content">
          <div className="comparison-charts-grid">
            <div className="comparison-chart-item left-chart">
              {chart1 || <div className="empty-chart">Selecione um gráfico</div>}
            </div>
            <div className="comparison-chart-item right-chart">
              {chart2 || <div className="empty-chart">Selecione um gráfico</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartComparisonModal

