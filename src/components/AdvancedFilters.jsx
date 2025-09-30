import React, { useState, useEffect, memo } from 'react'
import './AdvancedFilters.css'
import { useDebounce } from '../hooks/useLazyComponent'

const AdvancedFilters = memo(({ 
  filters, 
  onFiltersChange, 
  operatorMetrics = [],
  data = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [quickFilters, setQuickFilters] = useState({
    highVolume: false,
    highRating: false,
    longDuration: false,
    recentCalls: false
  })

  // Debounce para otimizar performance dos filtros
  const debouncedFilters = useDebounce(localFilters, 300)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Aplicar filtros com debounce
  useEffect(() => {
    if (JSON.stringify(debouncedFilters) !== JSON.stringify(filters)) {
      onFiltersChange(debouncedFilters)
    }
  }, [debouncedFilters, filters, onFiltersChange])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newFilters = { 
      ...localFilters, 
      [name]: type === 'checkbox' ? checked : value 
    }
    setLocalFilters(newFilters)
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    const newDateRange = { ...localFilters.dateRange, [name]: value }
    const newFilters = { ...localFilters, dateRange: newDateRange, period: 'custom' }
    setLocalFilters(newFilters)
  }

  const handleQuickFilter = (filterType, enabled) => {
    setQuickFilters(prev => ({ ...prev, [filterType]: enabled }))
    
    if (enabled) {
      let newFilters = { ...localFilters }
      
      switch (filterType) {
        case 'highVolume':
          newFilters.minCalls = 10
          break
        case 'highRating':
          newFilters.minRating = 4.0
          break
        case 'longDuration':
          newFilters.minDuration = 5
          break
        case 'recentCalls':
          newFilters.period = 'last7days'
          break
      }
      
      setLocalFilters(newFilters)
    } else {
      // Remover filtro específico
      let newFilters = { ...localFilters }
      delete newFilters.minCalls
      delete newFilters.minRating
      delete newFilters.minDuration
      if (filterType === 'recentCalls') {
        newFilters.period = 'all'
      }
      
      setLocalFilters(newFilters)
    }
  }

  const clearAllFilters = () => {
    const defaultFilters = {
      period: 'all',
      operator: '',
      dateRange: {},
      minCalls: '',
      minRating: '',
      minDuration: '',
      maxDuration: ''
    }
    setLocalFilters(defaultFilters)
    setQuickFilters({
      highVolume: false,
      highRating: false,
      longDuration: false,
      recentCalls: false
    })
  }

  const availableOperators = Object.keys(operatorMetrics).sort()

  // Calcular estatísticas para tooltips
  const stats = {
    totalCalls: data.length,
    avgRating: data.reduce((sum, record) => sum + (record.rating_attendance || 0), 0) / data.filter(r => r.rating_attendance).length || 0,
    avgDuration: data.reduce((sum, record) => sum + (record.duration_minutes || 0), 0) / data.length || 0,
    uniqueOperators: new Set(data.map(r => r.operator)).size
  }

  return (
    <div className="advanced-filters card">
      <div className="filters-header">
        <h3>🔍 Filtros Avançados</h3>
        <div className="filters-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Ocultar' : 'Avançado'}
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={clearAllFilters}
          >
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="quick-filters">
        <h4>⚡ Filtros Rápidos</h4>
        <div className="quick-filters-grid">
          <label className="quick-filter-item">
            <input
              type="checkbox"
              checked={quickFilters.highVolume}
              onChange={(e) => handleQuickFilter('highVolume', e.target.checked)}
            />
            <span className="filter-label">
              📞 Alto Volume ({stats.totalCalls} chamadas)
            </span>
          </label>
          
          <label className="quick-filter-item">
            <input
              type="checkbox"
              checked={quickFilters.highRating}
              onChange={(e) => handleQuickFilter('highRating', e.target.checked)}
            />
            <span className="filter-label">
              ⭐ Alta Avaliação ({stats.avgRating.toFixed(1)} média)
            </span>
          </label>
          
          <label className="quick-filter-item">
            <input
              type="checkbox"
              checked={quickFilters.longDuration}
              onChange={(e) => handleQuickFilter('longDuration', e.target.checked)}
            />
            <span className="filter-label">
              ⏱️ Longa Duração ({stats.avgDuration.toFixed(1)}min média)
            </span>
          </label>
          
          <label className="quick-filter-item">
            <input
              type="checkbox"
              checked={quickFilters.recentCalls}
              onChange={(e) => handleQuickFilter('recentCalls', e.target.checked)}
            />
            <span className="filter-label">
              🕐 Chamadas Recentes (últimos 7 dias)
            </span>
          </label>
        </div>
      </div>

      {/* Filtros Básicos */}
      <div className="basic-filters">
        <div className="filter-group">
          <label htmlFor="period">📅 Período:</label>
          <select
            id="period"
            name="period"
            value={localFilters.period || 'all'}
            onChange={handleInputChange}
          >
            <option value="all">Todo o Período</option>
            <option value="last7days">Últimos 7 Dias</option>
            <option value="last30days">Últimos 30 Dias</option>
            <option value="last3months">Últimos 3 Meses</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="operator">👤 Operador:</label>
          <select
            id="operator"
            name="operator"
            value={localFilters.operator || ''}
            onChange={handleInputChange}
          >
            <option value="">Todos os Operadores ({stats.uniqueOperators})</option>
            {availableOperators.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="advanced-filters-content">
          <h4>🔧 Filtros Detalhados</h4>
          
          <div className="advanced-filters-grid">
            <div className="filter-group">
              <label htmlFor="minCalls">📞 Mín. Chamadas:</label>
              <input
                type="number"
                id="minCalls"
                name="minCalls"
                value={localFilters.minCalls || ''}
                onChange={handleInputChange}
                placeholder="Ex: 5"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="minRating">⭐ Mín. Avaliação:</label>
              <input
                type="number"
                id="minRating"
                name="minRating"
                value={localFilters.minRating || ''}
                onChange={handleInputChange}
                placeholder="Ex: 3.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="minDuration">⏱️ Duração Mín. (min):</label>
              <input
                type="number"
                id="minDuration"
                name="minDuration"
                value={localFilters.minDuration || ''}
                onChange={handleInputChange}
                placeholder="Ex: 2"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxDuration">⏱️ Duração Máx. (min):</label>
              <input
                type="number"
                id="maxDuration"
                name="maxDuration"
                value={localFilters.maxDuration || ''}
                onChange={handleInputChange}
                placeholder="Ex: 30"
                min="0"
              />
            </div>
          </div>

          {/* Filtro de Data Personalizada */}
          {localFilters.period === 'custom' && (
            <div className="custom-date-range">
              <h5>📅 Período Personalizado</h5>
              <div className="date-inputs">
                <div className="filter-group">
                  <label htmlFor="startDate">Data Inicial:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="start"
                    value={localFilters.dateRange?.start || ''}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="endDate">Data Final:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="end"
                    value={localFilters.dateRange?.end || ''}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resumo dos Filtros Ativos */}
      <div className="active-filters-summary">
        <h5>📋 Filtros Ativos:</h5>
        <div className="active-filters-tags">
          {localFilters.period !== 'all' && (
            <span className="filter-tag">
              📅 {localFilters.period === 'custom' ? 'Período Personalizado' : 
                   localFilters.period === 'last7days' ? 'Últimos 7 dias' :
                   localFilters.period === 'last30days' ? 'Últimos 30 dias' :
                   localFilters.period === 'last3months' ? 'Últimos 3 meses' : localFilters.period}
            </span>
          )}
          {localFilters.operator && (
            <span className="filter-tag">👤 {localFilters.operator}</span>
          )}
          {localFilters.minCalls && (
            <span className="filter-tag">📞 Min. {localFilters.minCalls} chamadas</span>
          )}
          {localFilters.minRating && (
            <span className="filter-tag">⭐ Min. {localFilters.minRating} estrelas</span>
          )}
          {localFilters.minDuration && (
            <span className="filter-tag">⏱️ Min. {localFilters.minDuration}min</span>
          )}
          {localFilters.maxDuration && (
            <span className="filter-tag">⏱️ Máx. {localFilters.maxDuration}min</span>
          )}
        </div>
      </div>
    </div>
  )
}

)

AdvancedFilters.displayName = 'AdvancedFilters'

export default AdvancedFilters
