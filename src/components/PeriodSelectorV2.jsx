import React, { useState } from 'react'
import './PeriodSelectorV2.css'

const PeriodSelectorV2 = ({ 
  onPeriodChange, 
  currentPeriod = 'currentMonth',
  disabled = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPersonalizadoOpen, setIsPersonalizadoOpen] = useState(false)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  
  // Estados para o range de datas
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Períodos principais
  const mainPeriods = [
    { value: 'previousDay', label: 'Dia anterior' },
    { value: 'currentMonth', label: 'Mês atual' },
    { value: 'last3Months', label: 'Últimos 3 meses' },
    { value: 'personalizado', label: 'Personalizado', hasSubMenu: true }
  ]

  // Subperíodos dentro de "Personalizado"
  const personalizadoSubPeriods = [
    { value: 'customRange', label: 'Range personalizado', hasSubSubMenu: true },
    { value: 'last7Days', label: '7 dias' },
    { value: 'last15Days', label: '15 dias' },
    { value: 'allRecords', label: 'Todos os registros' }
  ]


  const handlePeriodSelect = (period) => {
    // Se for "Personalizado", apenas abre o submenu
    if (period === 'personalizado') {
      setIsPersonalizadoOpen(!isPersonalizadoOpen)
      return
    }
    
    // Se for range personalizado, apenas abre o seletor
    if (period === 'customRange') {
      setIsDateRangeOpen(!isDateRangeOpen)
      return
    }
    
    // Para outros períodos, seleciona normalmente
    setSelectedPeriod(period)
    setIsPersonalizadoOpen(false)
    setIsDateRangeOpen(false)
    setIsDropdownOpen(false)
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }

  const handleCustomRangeSubmit = () => {
    if (startDate && endDate) {
      setSelectedPeriod(`custom-range:${startDate}:${endDate}`)
      setIsPersonalizadoOpen(false)
      setIsDateRangeOpen(false)
      setIsDropdownOpen(false)
      if (onPeriodChange) {
        onPeriodChange({ type: 'customRange', startDate, endDate })
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
    
    // Subperíodos de personalizado
    const personalizadoPeriod = personalizadoSubPeriods.find(p => p.value === selectedPeriod)
    if (personalizadoPeriod) {
      return personalizadoPeriod.label
    }
    
    // Períodos principais
    return mainPeriods.find(p => p.value === selectedPeriod)?.label || 'Selecione um período'
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
        {mainPeriods.map(period => {
          const isPersonalizado = period.value === 'personalizado'
          
          return (
            <div key={period.value} className="period-option-container">
              <button
                className={`period-option-main ${selectedPeriod === period.value && !isPersonalizado ? 'selected' : ''}`}
                onClick={() => handlePeriodSelect(period.value)}
                disabled={disabled}
              >
                {period.label}
                {(isPersonalizado && isPersonalizadoOpen) && <span className="period-arrow">▼</span>}
                {isPersonalizado && !isPersonalizadoOpen && <span className="period-arrow">▶</span>}
              </button>
              
              {/* Submenu de "Personalizado" */}
              {isPersonalizado && isPersonalizadoOpen && (
                <div className="period-submenu">
                  {personalizadoSubPeriods.map(subPeriod => {
                    const isCustomRange = subPeriod.value === 'customRange'
                    
                    return (
                      <div key={subPeriod.value} className="period-suboption-container">
                        <button
                          className={`period-suboption ${selectedPeriod === subPeriod.value ? 'selected' : ''}`}
                          onClick={() => handlePeriodSelect(subPeriod.value)}
                          disabled={disabled}
                        >
                          {subPeriod.label}
                          {isCustomRange && isDateRangeOpen && <span className="period-arrow">▼</span>}
                          {isCustomRange && !isDateRangeOpen && <span className="period-arrow">▶</span>}
                        </button>
                        
                        {/* Sub-submenu de "Range personalizado" */}
                        {isCustomRange && isDateRangeOpen && (
                          <div className="period-date-range">
                            <div className="date-range-inputs">
                              <label>
                                Data inicial:
                                <input 
                                  type="date" 
                                  value={startDate} 
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="date-input"
                                />
                              </label>
                              <label>
                                Data final:
                                <input 
                                  type="date" 
                                  value={endDate} 
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="date-input"
                                />
                              </label>
                              <button 
                                className="date-range-submit"
                                onClick={handleCustomRangeSubmit}
                                disabled={!startDate || !endDate}
                              >
                                Aplicar
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
        })}
      </div>
      )}
    </div>
  )
}

export default PeriodSelectorV2
