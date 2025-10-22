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

const TMATicketsChart = ({ data = [], periodo = null }) => {
  // Estado para controlar quais assuntos estão visíveis
  const [visibleSubjects, setVisibleSubjects] = useState(new Set())
  const [showFilter, setShowFilter] = useState(false)
  // Função para converter timestamp para minutos
  const parseTimestampToMinutes = (timestampStr) => {
    if (!timestampStr) return 0
    
    try {
      // Extrair apenas a parte da data e hora (remover microssegundos)
      const cleanTimestamp = timestampStr.split('.')[0] // Remove microssegundos
      const date = new Date(cleanTimestamp)
      
      if (isNaN(date.getTime())) return 0
      
      return date.getTime() / (1000 * 60) // Converter para minutos
    } catch (error) {
      console.warn('Erro ao converter timestamp:', timestampStr, error)
      return 0
    }
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
      // Converter formato AAAA-MM-DD HH:MM para Date
      const cleanDate = dateStr.split(' ')[0] // Pegar apenas a data
      const [year, month, day] = cleanDate.split('-')
      const rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return rowDate >= startDate && rowDate <= endDate
    } catch (error) {
      console.warn('Erro ao verificar período:', dateStr, error)
      return true
    }
  }

  // Função para formatar data para exibição
  const formatDateForDisplay = (timestampStr) => {
    if (!timestampStr) return ''
    
    try {
      const cleanTimestamp = timestampStr.split('.')[0]
      const date = new Date(cleanTimestamp)
      
      if (isNaN(date.getTime())) return ''
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.warn('Erro ao formatar data:', timestampStr, error)
      return ''
    }
  }

  // Processar dados de TMA para tickets
  const processTMATicketsData = (data, periodo) => {
    if (!data || data.length === 0) {
      console.log('⚠️ TMATicketsChart: Sem dados para processar')
      return {
        labels: [],
        values: [],
        totalTickets: 0,
        averageTMA: 0
      }
    }

    console.log('🔍 TMATicketsChart: Processando dados de tickets...', {
      dataLength: data.length,
      periodo
    })

    const groupedData = {}
    let processedRecords = 0
    let totalTimeMinutes = 0
    let totalTickets = 0

    // Processar dados linha por linha
    data.forEach((record, index) => {
      // Pular cabeçalho e linhas iniciais
      if (index < 2) return

      if (Array.isArray(record) && record.length > 8) {
        // Extrair dados das colunas
        const assuntoField = record[1] // Coluna B - Assunto do ticket
        const dataEntradaField = record[4] // Coluna E - Data de entrada
        const dataResolucaoField = record[8] // Coluna I - Data da resolução

        // Verificar se está no período (usar data de entrada)
        if (dataEntradaField && !isDateInPeriod(dataEntradaField)) {
          return
        }

        // Validar dados necessários
        if (!assuntoField || !dataEntradaField || !dataResolucaoField) return

        const assunto = String(assuntoField).trim()
        
        // Filtrar assuntos de cobrança
        if (assunto.toLowerCase().includes('cobrança') || 
            assunto.toLowerCase().includes('cobranca') ||
            assunto.toLowerCase().includes('cobran')) {
          return
        }

        // Calcular tempo de resolução
        const entradaMinutos = parseTimestampToMinutes(dataEntradaField)
        const resolucaoMinutos = parseTimestampToMinutes(dataResolucaoField)
        
        if (entradaMinutos <= 0 || resolucaoMinutos <= 0) return
        
        const tempoResolucaoMinutos = resolucaoMinutos - entradaMinutos
        
        // Ignorar tempos negativos ou muito grandes (mais de 30 dias)
        if (tempoResolucaoMinutos <= 0 || tempoResolucaoMinutos > 43200) return

        // Inicializar grupo se não existir
        if (!groupedData[assunto]) {
          groupedData[assunto] = {
            totalTime: 0,
            ticketCount: 0
          }
        }

        // Acumular dados
        groupedData[assunto].totalTime += tempoResolucaoMinutos
        groupedData[assunto].ticketCount += 1
        totalTimeMinutes += tempoResolucaoMinutos
        totalTickets += 1
        processedRecords++

        // Debug das primeiras linhas
        if (processedRecords <= 5) {
          console.log(`✅ TMATicketsChart - Registro ${index}:`, {
            assunto,
            dataEntrada: formatDateForDisplay(dataEntradaField),
            dataResolucao: formatDateForDisplay(dataResolucaoField),
            tempoResolucaoMinutos: tempoResolucaoMinutos.toFixed(2)
          })
        }
      }
    })

    console.log('📊 TMATicketsChart - Resumo do processamento:', {
      processedRecords,
      totalTickets,
      totalTimeMinutes,
      groupedDataKeys: Object.keys(groupedData),
      groupedData
    })

    // Calcular TMA por grupo e ordenar
    const tmaData = Object.entries(groupedData)
      .map(([assunto, data]) => ({
        assunto,
        tma: data.totalTime / data.ticketCount,
        ticketCount: data.ticketCount
      }))
      .sort((a, b) => b.tma - a.tma) // Ordenar por TMA decrescente

    const labels = tmaData.map(item => item.assunto)
    const values = tmaData.map(item => item.tma)
    const averageTMA = totalTickets > 0 ? totalTimeMinutes / totalTickets : 0

    return {
      labels,
      values,
      totalTickets,
      averageTMA,
      ticketCounts: tmaData.map(item => item.ticketCount)
    }
  }

  // Processar dados com useMemo
  const chartData = useMemo(() => {
    const processedData = processTMATicketsData(data, periodo)

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

    // Aplicar filtro de assuntos visíveis
    let filteredLabels = processedData.labels
    let filteredValues = processedData.values
    let filteredTicketCounts = processedData.ticketCounts
    
    if (visibleSubjects.size > 0) {
      const filteredIndices = []
      processedData.labels.forEach((label, index) => {
        if (visibleSubjects.has(label)) {
          filteredIndices.push(index)
        }
      })
      filteredLabels = filteredIndices.map(i => processedData.labels[i])
      filteredValues = filteredIndices.map(i => processedData.values[i])
      filteredTicketCounts = filteredIndices.map(i => processedData.ticketCounts[i])
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
      totalTickets: processedData.totalTickets,
      averageTMA: processedData.averageTMA,
      ticketCounts: filteredTicketCounts
    }
  }, [data, periodo, visibleSubjects])

  // Funções de filtro
  const toggleSubject = (subjectName) => {
    const newVisibleSubjects = new Set(visibleSubjects)
    if (newVisibleSubjects.has(subjectName)) {
      newVisibleSubjects.delete(subjectName)
    } else {
      newVisibleSubjects.add(subjectName)
    }
    setVisibleSubjects(newVisibleSubjects)
  }

  const selectAllSubjects = () => {
    if (!chartData.labels) return
    setVisibleSubjects(new Set(chartData.labels))
  }

  const clearAllSubjects = () => {
    setVisibleSubjects(new Set())
  }

  const selectTopSubjects = () => {
    if (!chartData.labels) return
    const top5 = chartData.labels.slice(0, 5)
    setVisibleSubjects(new Set(top5))
  }

  // Função para clicar no título e esconder/mostrar item
  const handleTitleClick = (subjectName) => {
    toggleSubject(subjectName)
  }

  // Configurações do gráfico
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
          text: 'Tempo Médio de Resolução (HH:MM:SS / DD dias, HH:MM:SS)',
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
          text: 'Assunto do Ticket',
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
            const subjectName = chartData.labels[index]
            const isVisible = visibleSubjects.size === 0 || visibleSubjects.has(subjectName)
            return isVisible ? subjectName : `❌ ${subjectName}`
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
            const ticketCount = chartData.ticketCounts[index]
            return [
              `TMA: ${formatMinutesToDisplay(tma)}`,
              `Tickets: ${ticketCount.toLocaleString('pt-BR')}`
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
        const subjectName = chartData.labels[elementIndex]
        handleTitleClick(subjectName)
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
          <p>Carregando dados de TMA de tickets...</p>
        </div>
      </div>
    )
  }

  if (chartData.labels.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-error">
          <i className='bx bx-error-circle'></i>
          <p>Nenhum dado de TMA de tickets encontrado</p>
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
            onClick={selectAllSubjects}
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
            onClick={selectTopSubjects}
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
            onClick={clearAllSubjects}
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
          {chartData.labels.map((subjectName, index) => (
            <label key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: visibleSubjects.size === 0 || visibleSubjects.has(subjectName) ? '#dbeafe' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={visibleSubjects.size === 0 || visibleSubjects.has(subjectName)}
                onChange={() => toggleSubject(subjectName)}
                style={{ 
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{ 
                color: visibleSubjects.size === 0 || visibleSubjects.has(subjectName) ? '#1e40af' : '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {subjectName}
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
          <span className="tma-info-label">Total Tickets:</span>
          <span className="tma-info-value">
            {chartData.totalTickets.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="tma-info-item">
          <span className="tma-info-label">Assuntos:</span>
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

export default TMATicketsChart
