import React from 'react'
import './TemporalComparison.css'

const TemporalComparison = ({ currentData, previousData, metricName, metricLabel, format = 'number', showPercentage = true }) => {
  if (!currentData || !previousData) {
    return null
  }

  // Calcular variação
  const calculateVariation = (current, previous) => {
    if (previous === 0) return { percentage: 100, absolute: current, direction: 'up' }
    
    const percentage = ((current - previous) / previous) * 100
    const absolute = current - previous
    
    return {
      percentage: Math.abs(percentage),
      absolute,
      direction: percentage >= 0 ? 'up' : 'down',
      isSignificant: Math.abs(percentage) >= 5
    }
  }

  const variation = calculateVariation(currentData, previousData)

  // Função para formatar valores
  const formatValue = (value) => {
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`
    } else if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    } else if (format === 'number') {
      return new Intl.NumberFormat('pt-BR').format(value)
    }
    return value.toFixed(1)
  }

  // Função para obter classe CSS baseada na direção e significância
  const getTrendClass = () => {
    if (variation.isSignificant) {
      return variation.direction === 'up' ? 'trend-up-significant' : 'trend-down-significant'
    } else {
      return variation.direction === 'up' ? 'trend-up' : 'trend-down'
    }
  }

  // Função para obter ícone
  const getTrendIcon = () => {
    if (variation.direction === 'up') {
      return variation.isSignificant ? '📈' : '↗️'
    } else {
      return variation.isSignificant ? '📉' : '↘️'
    }
  }

  // Função para obter texto de interpretação
  const getInterpretation = () => {
    if (variation.percentage < 1) return 'Manteve-se estável'
    
    if (variation.direction === 'up') {
      if (variation.isSignificant) {
        return 'Crescimento significativo'
      }
      return 'Leve crescimento'
    } else {
      if (variation.isSignificant) {
        return 'Queda significativa'
      }
      return 'Leve queda'
    }
  }

  return (
    <div className={`temporal-comparison ${getTrendClass()}`}>
      <div className="metric-header">
        <div className="metric-title">{metricLabel}</div>
        <div className="metric-icon">{getTrendIcon()}</div>
      </div>

      <div className="metric-values">
        <div className="current-value">
          {formatValue(currentData)}
        </div>
        <div className="previous-value">
          {formatValue(previousData)}
        </div>
      </div>

      <div className="metric-comparison">
        {showPercentage && (
          <div className="percentage-change">
            {variation.direction === 'up' ? '+' : ''}{variation.percentage.toFixed(1)}%
          </div>
        )}
        
        <div className="absolute-change">
          {formatValue(Math.abs(variation.absolute))} 
          <span className="change-label">
            ({variation.direction === 'up' ? 'a mais' : 'a menos'})
          </span>
        </div>

        <div className="interpretation">
          {getInterpretation()}
        </div>
      </div>

      <div className="metric-percentage-bar">
        <div className="percentage-bar-fill" style={{
          width: `${Math.min(variation.percentage, 100)}%`,
          backgroundColor: variation.direction === 'up' ? 'var(--color-success)' : 'var(--color-error)'
        }} />
      </div>
    </div>
  )
}

export default TemporalComparison
