import React, { useState } from 'react'
import './PeriodSelector.css'

const PeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  customDateRange, 
  onCustomDateChange,
  isLoading,
  onFetchFullData 
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false)

  const handlePeriodSelect = (period) => {
    onPeriodChange(period)
    if (period === 'full') {
      onFetchFullData()
    }
  }

  const handleCustomDateSubmit = () => {
    if (customDateRange.start && customDateRange.end) {
      onFetchFullData()
    }
  }

  return (
    <div className="period-selector">
      <div className="period-header">
        <h3>📅 Selecionar Período de Análise</h3>
        <p>Escolha o período para análise detalhada dos dados</p>
      </div>

      <div className="period-options">
        <div className="period-buttons">
          <button 
            className={`period-btn ${selectedPeriod === 'recent' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('recent')}
            disabled={isLoading}
          >
            <span className="period-icon">⚡</span>
            <div className="period-info">
              <div className="period-title">Dados Recentes</div>
              <div className="period-desc">Últimos 5.000 registros (Rápido)</div>
            </div>
          </button>

          <button 
            className={`period-btn ${selectedPeriod === 'full' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('full')}
            disabled={isLoading}
          >
            <span className="period-icon">📊</span>
            <div className="period-info">
              <div className="period-title">Dados Completos</div>
              <div className="period-desc">Todos os 139.458 registros (Detalhado)</div>
            </div>
          </button>

          <button 
            className={`period-btn ${selectedPeriod === 'custom' ? 'active' : ''}`}
            onClick={() => {
              onPeriodChange('custom')
              setShowCustomRange(!showCustomRange)
            }}
            disabled={isLoading}
          >
            <span className="period-icon">📅</span>
            <div className="period-info">
              <div className="period-title">Período Personalizado</div>
              <div className="period-desc">Selecione datas específicas</div>
            </div>
          </button>
        </div>

        {showCustomRange && (
          <div className="custom-range">
            <div className="date-inputs">
              <div className="date-input-group">
                <label>Data Inicial:</label>
                <input 
                  type="date" 
                  value={customDateRange.start}
                  onChange={(e) => onCustomDateChange({ ...customDateRange, start: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              
              <div className="date-input-group">
                <label>Data Final:</label>
                <input 
                  type="date" 
                  value={customDateRange.end}
                  onChange={(e) => onCustomDateChange({ ...customDateRange, end: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button 
              className="apply-custom-btn"
              onClick={handleCustomDateSubmit}
              disabled={isLoading || !customDateRange.start || !customDateRange.end}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Carregando...
                </>
              ) : (
                <>
                  <span className="apply-icon">🚀</span>
                  Aplicar Período
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="period-status">
        <div className="status-item">
          <span className="status-icon">ℹ️</span>
          <span>
            {selectedPeriod === 'recent' && 'Carregamento rápido para análise geral'}
            {selectedPeriod === 'full' && 'Carregamento completo para análise detalhada'}
            {selectedPeriod === 'custom' && 'Filtro por período personalizado'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PeriodSelector
