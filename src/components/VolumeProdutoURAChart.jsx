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
import { useTicketsData } from '../hooks/useTicketsData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Componente para mostrar distribuição de volume por fila da URA

const VolumeProdutoURAChart = ({ data = [], periodo = null, isTicketsTab = false }) => {
  // Hook para buscar dados específicos de tickets (apenas para aba Tickets)
  const { ticketsData, isLoading: isLoadingTickets, error: ticketsError, processQueueData } = useTicketsData()
  
  
  
  const chartData = useMemo(() => {
    let processedData
    
    // Usar dados de tickets se explicitamente indicado ou se temos dados de tickets e não temos dados principais
    const shouldUseTicketsData = isTicketsTab || (ticketsData && ticketsData.length > 0 && (!data || data.length === 0))
    
    if (shouldUseTicketsData) {
      
      const ticketsProcessedData = processQueueData(ticketsData)
      processedData = processTicketsData(ticketsProcessedData)
    } else {
      processedData = processVolumeProdutoRadar(data, periodo)
    }
    
    // Gerar cores dinâmicas para cada produto
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',   // Verde
      'rgba(245, 101, 101, 0.8)',  // Vermelho
      'rgba(251, 191, 36, 0.8)',   // Amarelo
      'rgba(139, 92, 246, 0.8)',   // Roxo
      'rgba(236, 72, 153, 0.8)',   // Rosa
      'rgba(34, 197, 94, 0.8)',    // Verde claro
      'rgba(249, 115, 22, 0.8)',   // Laranja
      'rgba(99, 102, 241, 0.8)',   // Índigo
      'rgba(20, 184, 166, 0.8)',   // Ciano
      'rgba(168, 85, 247, 0.8)',   // Violeta
      'rgba(244, 63, 94, 0.8)',    // Rosa escuro
      'rgba(14, 165, 233, 0.8)',   // Azul claro
      'rgba(34, 197, 94, 0.8)',    // Verde
      'rgba(251, 146, 60, 0.8)',   // Laranja claro
      'rgba(147, 51, 234, 0.8)',   // Roxo escuro
      'rgba(6, 182, 212, 0.8)',    // Ciano claro
      'rgba(251, 113, 133, 0.8)'    // Rosa claro
    ]
    
    // Garantir que processedData seja válido
    if (!processedData || !processedData.labels || !processedData.values) {
      processedData = {
        labels: ['Sem dados'],
        values: [0]
      }
    }
    
    return {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Distribuição por Fila (%)',
          data: processedData.values,
          backgroundColor: processedData.labels.map((_, index) => colors[index % colors.length]),
          borderColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          borderWidth: 2,
          hoverBackgroundColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '0.9')),
          hoverBorderColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          hoverBorderWidth: 3
        }
      ]
    }
  }, [data, periodo, ticketsData, processQueueData])

  // Aplicar tamanho grande para aba Tickets ou quando há dados de tickets
  const shouldUseLargeSize = isTicketsTab || (ticketsData && ticketsData.length > 0)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: shouldUseLargeSize ? 1.5 : 1,
    indexAxis: 'y',
    layout: {
      padding: {
        top: shouldUseLargeSize ? 20 : 10,
        bottom: shouldUseLargeSize ? 20 : 10,
        left: shouldUseLargeSize ? 20 : 10,
        right: shouldUseLargeSize ? 20 : 10
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: shouldUseLargeSize ? 14 : 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          callback: function(value) {
            return value + '%'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: shouldUseLargeSize ? 14 : 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const queueName = chartData.labels[index]
            return queueName
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: shouldUseLargeSize ? 16 : 14,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          padding: shouldUseLargeSize ? 20 : 15,
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: shouldUseLargeSize ? 16 : 12,
          boxHeight: shouldUseLargeSize ? 16 : 12,
          color: '#1f2937',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                return {
                  text: `${label} (${value}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor[index],
                  lineWidth: data.datasets[0].borderWidth,
                  pointStyle: 'rect',
                  hidden: false,
                  index: index
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 16,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '700'
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: '500'
        },
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 6,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return `📊 ${context[0].label}`
          },
          label: function(context) {
            const fila = context.label
            const percentual = context.parsed
            
            return [
              `📋 ${fila} - ${percentual}%`
            ]
          },
          afterBody: function(context) {
            return `\n📊 Distribuição por filas da URA`
          },
          labelTextColor: function(context) {
            return '#ffffff'
          }
        }
      }
    }
  }

  // Mostrar loading apenas se estiver carregando dados de tickets E não temos dados principais
  if (isLoadingTickets && (!data || data.length === 0)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '700px',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div className="loading-spinner"></div>
        <p>Carregando dados de tickets...</p>
      </div>
    )
  }

  // Mostrar erro apenas se houver erro de tickets E não temos dados principais
  if (ticketsError && (!data || data.length === 0)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '700px',
        flexDirection: 'column',
        gap: '10px',
        color: '#ef4444'
      }}>
        <p>❌ Erro ao carregar dados de tickets</p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>{ticketsError}</p>
      </div>
    )
  }

  return (
    <div style={{ 
      width: '100%', 
      height: shouldUseLargeSize ? '900px' : '400px',
      minHeight: shouldUseLargeSize ? '900px' : '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Header com filtros */}

      {/* Gráfico */}
      <div style={{ 
        width: '100%', 
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%'
      }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

// Processar dados para gráfico de radar (filas da coluna K)
// Função para processar dados de tickets da aba Tickets
const processTicketsData = (processedData) => {
  
  
  const { queueCounts, totalTickets } = processedData
  
  if (totalTickets === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }
  
  // Ordenar filas por volume (maior para menor)
  const filasOrdenadas = Object.keys(queueCounts).sort((a, b) => queueCounts[b] - queueCounts[a])
  
  // Calcular total para porcentagens
  const total = filasOrdenadas.reduce((sum, fila) => sum + queueCounts[fila], 0)
  
  const result = {
    labels: filasOrdenadas,
    values: filasOrdenadas.map(fila => {
      const count = queueCounts[fila]
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0
    })
  }
  
  
  return result
}

const processVolumeProdutoRadar = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (rowIndex) => {
    if (!periodo) return true // Se não há período, incluir todos os dados
    
    try {
      // Buscar a data na linha atual (coluna A - índice 0)
      const row = data[rowIndex + 14] // Ajustar para o índice real
      if (!row || !row[0]) return true // Se não encontrar data, incluir
      
      const rowDate = parseBrazilianDate(row[0])
      if (!rowDate) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return rowDate >= startDate && rowDate <= endDate
    } catch (error) {
      return true // Em caso de erro, incluir o dado
    }
  }

  // Mapear filas da coluna K
  const filaCounts = {}
  let processedRows = 0
  
  
  // Processar dados a partir da linha 15 (índice 14) para evitar cabeçalhos
  data.slice(14).forEach((row, index) => {
    if (Array.isArray(row) && row[10] !== undefined && row[10] !== null && row[10] !== '') {
      const fila = String(row[10]).trim() // Coluna K = índice 10
      
      // Debug: verificar o que está sendo lido
      if (processedRows < 10) {
        
      }
      
      if (fila && fila !== '0' && fila !== '' && fila !== 'null' && fila !== 'undefined') {
        // Desconsiderar "Cobrança"
        if (fila.toLowerCase().includes('cobrança') || fila.toLowerCase().includes('cobranca')) {
          
          return
        }
        
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(index)) {
          return
        }
        
        processedRows++
        
        // Normalizar o nome da fila - remover números no início e hífens
        const filaNormalizada = fila.trim().replace(/^\d+\s*/, '').replace(/^-+\s*/, '').trim()
        
        filaCounts[filaNormalizada] = (filaCounts[filaNormalizada] || 0) + 1
        
        // Log das primeiras filas encontradas
        if (processedRows <= 5) {
          
        }
      }
    }
  })
  
  
  
  // Filtrar filas que não têm dados no período selecionado
  const filasComDados = Object.keys(filaCounts).filter(fila => filaCounts[fila] > 0)
  
  // Ordenar filas por volume (maior para menor)
  const filasOrdenadas = filasComDados.sort((a, b) => filaCounts[b] - filaCounts[a])

  if (filasOrdenadas.length === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }
  
  // Calcular total para porcentagens
  const total = filasOrdenadas.reduce((sum, fila) => sum + filaCounts[fila], 0)
  
  const result = {
    labels: filasOrdenadas,
    values: filasOrdenadas.map(fila => {
      const count = filaCounts[fila]
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0
    })
  }
  
  
  return result
}

// Funções auxiliares
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  return new Date(dateStr)
}

const getGroupKey = (date, groupBy) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekNum = getWeekNumber(date)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  } else {
    return `${year}-${String(month).padStart(2, '0')}`
  }
}

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const formatLabel = (key, groupBy) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    const parts = key.split('-W')
    return `Sem ${parts[1]}`
  } else {
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default VolumeProdutoURAChart
