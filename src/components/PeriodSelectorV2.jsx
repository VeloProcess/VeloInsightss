import React, { useState, useEffect } from 'react'
import './PeriodSelectorV2.css'

const PeriodSelectorV2 = ({ 
  onPeriodChange, 
  currentPeriod = null,
  customStartDate = null,
  customEndDate = null,
  disabled = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod)
  
  // Estados para o range de datas
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Períodos disponíveis
  const periods = [
    { value: 'previousDay', label: 'Dia anterior' },
    { value: 'currentMonth', label: 'Mês atual' },
    { value: 'last3Months', label: 'Últimos 3 meses' },
    { value: 'customRange', label: 'Personalizado' }
  ]


  const handlePeriodSelect = (period) => {
    // Se for range personalizado, abre o seletor de datas
    if (period === 'customRange') {
      setIsDateRangeOpen(!isDateRangeOpen)
      return
    }
    
    // Para outros períodos, seleciona normalmente
    setSelectedPeriod(period)
    setIsDateRangeOpen(false)
    setIsDropdownOpen(false)
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }
  
  // Sincronizar selectedPeriod quando currentPeriod mudar
  useEffect(() => {
    setSelectedPeriod(currentPeriod)
  }, [currentPeriod])

  const handleCustomRangeSubmit = () => {
    if (startDate && endDate) {
      setSelectedPeriod(`custom-range:${startDate}:${endDate}`)
      setIsDateRangeOpen(false)
      setIsDropdownOpen(false)
      if (onPeriodChange) {
        // Passar o objeto completo com as datas
        const periodData = { type: 'customRange', customStartDate: startDate, customEndDate: endDate }
        onPeriodChange(periodData)
      }
    }
  }

  const getSelectedPeriodLabel = () => {
    if (!selectedPeriod) {
      return 'Selecione um período'
    }
    
    // Range customizado
    if (selectedPeriod.startsWith('custom-range:')) {
      const [, start, end] = selectedPeriod.split(':')
      return `${start} - ${end}`
    }
    
    // Se for customRange mas está no formato de filtro (string)
    if (selectedPeriod === 'customRange' && customStartDate && customEndDate) {
      return `${customStartDate} - ${customEndDate}`
    }
    
    // Períodos normais
    return periods.find(p => p.value === selectedPeriod)?.label || 'Selecione um período'
  }

  return (
    <div className="period-selector-v2">
      <button
        className={`period-selector-button-main ${isDropdownOpen ? 'open' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
      >
        <span>{getSelectedPeriodLabel()}</span>
        <span className="period-arrow">▼</span>
      </button>
      
      {isDropdownOpen && (
      <div className="period-selector-options">
        {periods.map(period => {
          const isCustomRange = period.value === 'customRange'
          
          return (
            <div key={period.value} className="period-option-container">
              <button
                className={`period-option-main ${selectedPeriod === period.value && !isCustomRange ? 'selected' : ''}`}
                onClick={() => handlePeriodSelect(period.value)}
                disabled={disabled}
              >
                {period.label}
                {isCustomRange && isDateRangeOpen && <span className="period-arrow">▼</span>}
                {isCustomRange && !isDateRangeOpen && <span className="period-arrow">▶</span>}
              </button>
              
              {/* Submenu de "Range personalizado" */}
              {isCustomRange && isDateRangeOpen && (
                <div className="period-date-range">
                  <div className="date-range-inputs">
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', padding: '0 10px' }}>
                      Selecione o período desejado (de ... até)
                    </p>
                    <label>
                      📅 De:
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                        placeholder="Data inicial"
                      />
                    </label>
                    <label>
                      📅 Até:
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                        placeholder="Data final"
                      />
                    </label>
                    <button 
                      className="date-range-submit"
                      onClick={handleCustomRangeSubmit}
                      disabled={!startDate || !endDate}
                    >
                      ✓ Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

export default PeriodSelectorV2
