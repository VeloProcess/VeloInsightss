import React, { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import './TMAChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

const TMAChart = ({ data = [], periodo = null, groupBy = 'fila' }) => {
  // Estado para controlar quais filas estão visíveis
  const [visibleQueues, setVisibleQueues] = useState(new Set())
  const [showFilter, setShowFilter] = useState(false)
  // Função para converter tempo HH:MM:SS para minutos
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 0
    
    try {
      const parts = timeString.split(':')
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseInt(parts[2]) || 0
        return hours * 60 + minutes + seconds / 60
      }
    } catch (error) {
      console.warn('Erro ao converter tempo:', timeString, error)
    }
    return 0
  }

  // Função para formatar minutos para HH:MM:SS ou DD dias, HH:MM:SS
  const formatMinutesToDisplay = (minutes) => {
    if (minutes === 0) return '00:00:00'
    
    const totalMinutes = Math.floor(minutes)
    const seconds = Math.floor((minutes % 1) * 60)
    
    // Se passar de 24 horas (1440 minutos), usar formato DD dias, HH:MM:SS
    if (totalMinutes >= 1440) {
      const days = Math.floor(totalMinutes / 1440)
      const remainingMinutes = totalMinutes % 1440
      const hours = Math.floor(remainingMinutes / 60)
      const mins = remainingMinutes % 60
      
      return `${days} dias, ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    } else {
      // Formato normal HH:MM:SS
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }

  // Função para verificar se uma data está dentro do período
  const isDateInPeriod = (dateStr) => {
    if (!periodo) return true
    
    try {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const year = parseInt(parts[2])
        const rowDate = new Date(year, month, day)
        
        const startDate = new Date(periodo.startDate)
        const endDate = new Date(periodo.endDate)
        
        return rowDate >= startDate && rowDate <= endDate
      }
    } catch (error) {
      console.warn('Erro ao verificar período:', dateStr, error)
    }
    return true
  }

  // Processar dados de TMA
  const processTMAData = (data, periodo, groupBy) => {
    if (!data || data.length === 0) {
      console.log('⚠️ TMAChart: Sem dados para processar')
      return {
        labels: [],
        values: [],
        totalCalls: 0,
        averageTMA: 0
      }
    }

    console.log('🔍 TMAChart: Processando dados...', {
      dataLength: data.length,
      groupBy,
      periodo
    })

    const groupedData = {}
    let processedRecords = 0
    let totalTimeMinutes = 0
    let totalCalls = 0

    // Processar dados linha por linha
    data.forEach((record, index) => {
      // Pular cabeçalho e linhas iniciais
      if (index < 14) return

      if (Array.isArray(record) && record.length > 14) {
        // Extrair dados das colunas
        const dateField = record[3] // Coluna D - Data
        const filaField = record[10] // Coluna K - Fila/Produto
        const tempoField = record[14] // Coluna O - Tempo Total

        // Verificar se está no período
        if (dateField && !isDateInPeriod(dateField)) {
          return
        }

        // Validar dados necessários
        if (!filaField || !tempoField) return

        const fila = String(filaField).trim()
        
        // Filtrar filas de cobrança
        if (fila.toLowerCase().includes('cobrança') || 
            fila.toLowerCase().includes('cobranca') ||
            fila.toLowerCase().includes('cobran')) {
          return
        }
        
        const tempoMinutos = parseTimeToMinutes(tempoField)

        // Ignorar tempos zerados
        if (tempoMinutos <= 0) return

        // Inicializar grupo se não existir
        if (!groupedData[fila]) {
          groupedData[fila] = {
            totalTime: 0,
            callCount: 0
          }
        }

        // Acumular dados
        groupedData[fila].totalTime += tempoMinutos
        groupedData[fila].callCount += 1
        totalTimeMinutes += tempoMinutos
        totalCalls += 1
        processedRecords++

        // Debug das primeiras linhas
        if (processedRecords <= 5) {
          console.log(`✅ TMAChart - Registro ${index}:`, {
            fila,
            tempoField,
            tempoMinutos,
            dateField
          })
        }
      }
    })

    console.log('📊 TMAChart - Resumo do processamento:', {
      processedRecords,
      totalCalls,
      totalTimeMinutes,
      groupedDataKeys: Object.keys(groupedData),
      groupedData
    })

    // Calcular TMA por grupo e ordenar
    const tmaData = Object.entries(groupedData)
      .map(([fila, data]) => ({
        fila,
        tma: data.totalTime / data.callCount,
        callCount: data.callCount
      }))
      .sort((a, b) => b.tma - a.tma) // Ordenar por TMA decrescente

    const labels = tmaData.map(item => item.fila)
    const values = tmaData.map(item => item.tma)
    const averageTMA = totalCalls > 0 ? totalTimeMinutes / totalCalls : 0

    return {
      labels,
      values,
      totalCalls,
      averageTMA,
      callCounts: tmaData.map(item => item.callCount)
    }
  }

  // Processar dados com useMemo
  const chartData = useMemo(() => {
    const processedData = processTMAData(data, periodo, groupBy)

    // Criar gradiente baseado no valor
    const createGradient = (ctx, value, maxValue) => {
      const gradient = ctx.createLinearGradient(0, 0, 400, 0)
      
      // Calcular intensidade (0-1)
      const intensity = maxValue > 0 ? value / maxValue : 0
      
      if (intensity > 0.7) {
        // Vermelho para TMA alto
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)')
        gradient.addColorStop(1, 'rgba(185, 28, 28, 0.9)')
      } else if (intensity > 0.4) {
        // Laranja para TMA médio
        gradient.addColorStop(0, 'rgba(251, 146, 60, 0.9)')
        gradient.addColorStop(1, 'rgba(234, 88, 12, 0.9)')
      } else {
        // Verde para TMA baixo
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)')
        gradient.addColorStop(1, 'rgba(22, 163, 74, 0.9)')
      }
      
      return gradient
    }

    const maxTMA = Math.max(...processedData.values, 1)

    // Aplicar filtro de filas visíveis
    let filteredLabels = processedData.labels
    let filteredValues = processedData.values
    let filteredCallCounts = processedData.callCounts
    
    if (visibleQueues.size > 0) {
      const filteredIndices = []
      processedData.labels.forEach((label, index) => {
        if (visibleQueues.has(label)) {
          filteredIndices.push(index)
        }
      })
      filteredLabels = filteredIndices.map(i => processedData.labels[i])
      filteredValues = filteredIndices.map(i => processedData.values[i])
      filteredCallCounts = filteredIndices.map(i => processedData.callCounts[i])
    }

    return {
      labels: filteredLabels,
      datasets: [
        {
          label: 'TMA (HH:MM:SS / DD dias, HH:MM:SS)',
          data: filteredValues,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const value = context.parsed.x
            return createGradient(ctx, value, maxTMA)
          },
          borderColor: (context) => {
            const ctx = context.chart.ctx
            const value = context.parsed.x
            const intensity = maxTMA > 0 ? value / maxTMA : 0
            
            if (intensity > 0.7) return '#DC2626'
            if (intensity > 0.4) return '#EA580C'
            return '#16A34A'
          },
          borderWidth: 3,
          borderRadius: 6,
          maxBarThickness: 80,
          hoverBorderWidth: 3,
          hoverBorderColor: '#FFFFFF'
        }
      ],
      totalCalls: processedData.totalCalls,
      averageTMA: processedData.averageTMA,
      callCounts: filteredCallCounts
    }
  }, [data, periodo, groupBy, visibleQueues])

  // Funções de filtro
  const toggleQueue = (queueName) => {
    const newVisibleQueues = new Set(visibleQueues)
    if (newVisibleQueues.has(queueName)) {
      newVisibleQueues.delete(queueName)
    } else {
      newVisibleQueues.add(queueName)
    }
    setVisibleQueues(newVisibleQueues)
  }

  const selectAllQueues = () => {
    if (!chartData.labels) return
    setVisibleQueues(new Set(chartData.labels))
  }

  const clearAllQueues = () => {
    setVisibleQueues(new Set())
  }

  const selectTopQueues = () => {
    if (!chartData.labels) return
    const top5 = chartData.labels.slice(0, 5)
    setVisibleQueues(new Set(top5))
  }

  // Função para clicar no título e esconder/mostrar item
  const handleTitleClick = (queueName) => {
    toggleQueue(queueName)
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Barras horizontais
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tempo Médio (HH:MM:SS / DD dias, HH:MM:SS)',
          color: '#374151',
          font: {
            size: 16,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 16,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          callback: function(value) {
            return formatMinutesToDisplay(value)
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Produto URA',
          color: '#374151',
          font: {
            size: 16,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 16,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1F2937',
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const queueName = chartData.labels[index]
            const isVisible = visibleQueues.size === 0 || visibleQueues.has(queueName)
            return isVisible ? queueName : `❌ ${queueName}`
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '700'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            const index = context.dataIndex
            const tma = context.parsed.x
            const callCount = chartData.callCounts[index]
            return [
              `TMA: ${formatMinutesToDisplay(tma)}`,
              `Chamadas: ${callCount.toLocaleString('pt-BR')}`
            ]
          }
        }
      },
      datalabels: {
        display: true,
        color: '#FFFFFF',
        font: {
          size: 15,
          weight: '700',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToDisplay(value)
        },
        anchor: 'end',
        align: 'right',
        offset: 15
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index
        const queueName = chartData.labels[elementIndex]
        handleTitleClick(queueName)
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
    }
  }

  // Estado de loading/erro
  if (!data || data.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados de TMA...</p>
        </div>
      </div>
    )
  }

  if (chartData.labels.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-error">
          <i className='bx bx-error-circle'></i>
          <p>Nenhum dado de TMA encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tma-chart-container">
      {/* Header com filtros */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
          Filtros de Exibição
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={selectAllQueues}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Todos
          </button>
          <button 
            onClick={selectTopQueues}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
          >
            Top 5
          </button>
          <button 
            onClick={clearAllQueues}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Limpar
          </button>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            style={{
              padding: '6px 12px',
              backgroundColor: showFilter ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = showFilter ? '#4b5563' : '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = showFilter ? '#6b7280' : '#3b82f6'}
          >
            {showFilter ? 'Ocultar' : 'Filtros'}
          </button>
        </div>
      </div>

      {/* Painel de filtros compacto */}
      {showFilter && chartData.labels && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          maxHeight: '120px',
          overflowY: 'auto',
          marginBottom: '10px'
        }}>
          {chartData.labels.map((queueName, index) => (
            <label key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: visibleQueues.size === 0 || visibleQueues.has(queueName) ? '#dbeafe' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={visibleQueues.size === 0 || visibleQueues.has(queueName)}
                onChange={() => toggleQueue(queueName)}
                style={{ 
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{ 
                color: visibleQueues.size === 0 || visibleQueues.has(queueName) ? '#1e40af' : '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {queueName}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Informações do TMA */}
      <div className="tma-chart-info">
        <div className="tma-info-item">
          <span className="tma-info-label">TMA Geral:</span>
          <span className="tma-info-value">
            {formatMinutesToDisplay(chartData.averageTMA)}
          </span>
        </div>
        <div className="tma-info-item">
          <span className="tma-info-label">Total Chamadas:</span>
          <span className="tma-info-value">
            {chartData.totalCalls.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="tma-info-item">
          <span className="tma-info-label">Filas/Produtos:</span>
          <span className="tma-info-value">
            {chartData.labels.length}
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="tma-chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default TMAChart
