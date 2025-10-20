import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const CSATChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    const processedData = processCSATByPeriod(data, periodo)
    
    // Criar gradientes para as barras
    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    // Verificar se é dados de tickets (tem campo bom/ruim)
    const isTicketData = processedData.bom && processedData.bom.some(v => v > 0)
    
    // Converter para porcentagem
    let bomPercent = []
    let ruimPercent = []
    let mediaTendencia = []
    
    if (isTicketData) {
      // Para tickets, calcular porcentagens
      processedData.labels.forEach((_, index) => {
        const bomCount = processedData.bom[index] || 0
        const ruimCount = processedData.ruim[index] || 0
        const total = bomCount + ruimCount
        
        if (total > 0) {
          bomPercent.push(((bomCount / total) * 100))
          ruimPercent.push(((ruimCount / total) * 100))
          mediaTendencia.push(((bomCount / total) * 100)) // Tendência = % de Bom
        } else {
          bomPercent.push(0)
          ruimPercent.push(0)
          mediaTendencia.push(0)
        }
      })
    } else {
      // Para chamadas, manter lógica original
      mediaTendencia = processedData.labels.map((_, index) => {
        const notaAtend = processedData.notaAtendimento[index] || 0
        const notaSol = processedData.notaSolucao[index] || 0
        return (notaAtend + notaSol) / 2
      })
    }

    const datasets = isTicketData ? [
      {
        label: '😊 Bom',
        data: bomPercent,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(34, 197, 94, 0.95)', 'rgba(22, 163, 74, 0.95)')
        },
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 0,
        borderRadius: 12,
        maxBarThickness: 50,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(34, 197, 94, 1)', 'rgba(22, 163, 74, 1)')
        },
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
        order: 1,
        bomCount: processedData.bom // Guardar contagem para tooltip
      },
      {
        label: '😞 Ruim',
        data: ruimPercent,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(239, 68, 68, 0.95)', 'rgba(220, 38, 38, 0.95)')
        },
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 0,
        borderRadius: 12,
        maxBarThickness: 50,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(239, 68, 68, 1)', 'rgba(220, 38, 38, 1)')
        },
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
        order: 2,
        ruimCount: processedData.ruim // Guardar contagem para tooltip
      },
      {
        label: '📈 Tendência Geral',
        data: mediaTendencia,
        type: 'line',
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderWidth: 4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        tension: 0.4,
        fill: true,
        order: 0,
        yAxisID: 'y'
      }
    ] : [
      {
        label: '📈 Tendência Geral',
        data: mediaTendencia,
        type: 'line',
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        order: 0,
        yAxisID: 'y'
      },
      {
        label: '⭐ Nota Atendimento',
        data: processedData.notaAtendimento,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)')
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 1)', 'rgba(5, 150, 105, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 1
      },
      {
        label: '🎯 Nota Solução',
        data: processedData.notaSolucao,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)')
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 1)', 'rgba(37, 99, 235, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 2
      }
    ]

    return {
      labels: processedData.labels,
      datasets
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 12,
          boxHeight: 12,
          color: '#1f2937'
        }
      },
      tooltip: {
        enabled: true,
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
            return `📅 ${context[0].label}`
          },
          label: function(context) {
            const label = context.dataset.label
            const value = context.parsed.y
            const dataIndex = context.dataIndex
            
            // Se for a linha de tendência
            if (label.includes('📈')) {
              const data = context.dataset.data
              if (dataIndex > 0) {
                const prev = data[dataIndex - 1]
                const current = data[dataIndex]
                const diff = current - prev
                const arrow = diff > 0 ? '📈 ↗' : diff < 0 ? '📉 ↘' : '➡'
                const change = Math.abs(diff).toFixed(1)
                return `Tendência: ${value.toFixed(1)}% ${arrow} (${diff > 0 ? '+' : diff < 0 ? '-' : ''}${change}%)`
              }
              return `Tendência: ${value.toFixed(1)}%`
            }
            
            // Para barras de Bom/Ruim - mostrar porcentagem e contagem
            const count = label.includes('😊') ? 
              context.dataset.bomCount?.[dataIndex] : 
              context.dataset.ruimCount?.[dataIndex]
            
            return `${label}: ${value.toFixed(1)}% (${count || 0} avaliações)`
          },
          afterBody: function(context) {
            // Calcular total de avaliações
            const bomItem = context.find(item => item.dataset.label.includes('😊'))
            const ruimItem = context.find(item => item.dataset.label.includes('😞'))
            
            if (bomItem && ruimItem) {
              const dataIndex = bomItem.dataIndex
              const bomCount = bomItem.dataset.bomCount?.[dataIndex] || 0
              const ruimCount = ruimItem.dataset.ruimCount?.[dataIndex] || 0
              const total = bomCount + ruimCount
              
              if (total > 0) {
                return `\n📊 Total: ${total} avaliações`
              }
            }
            return ''
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#6b7280',
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#4b5563',
          padding: 12,
          callback: function(value) {
            return value + '%'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
          lineWidth: 1.5
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

// Função para processar dados de acordo com o período selecionado
const processCSATByPeriod = (data, periodo) => {
  // Determinar o tipo de agrupamento baseado no período
  const totalDays = periodo?.totalDays || 0
  let groupBy = 'month' // padrão para quando não há período
  
  if (totalDays > 0 && totalDays <= 7) {
    groupBy = 'day' // 7 dias ou menos = agrupar por dia
  } else if (totalDays > 7 && totalDays <= 60) {
    groupBy = 'day' // 8 a 60 dias = agrupar por dia também
  } else if (totalDays > 60) {
    groupBy = 'month' // mais de 60 dias = agrupar por mês
  }
  
  return processCSATByGrouping(data, groupBy)
}

// Função auxiliar para processar dados com agrupamento específico
const processCSATByGrouping = (data, groupBy) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      notaAtendimento: [0],
      notaSolucao: [0],
      bom: [0],
      ruim: [0]
    }
  }

  // Agrupar dados
  const groupedData = {}
  
  data.forEach(record => {
    // Tentar diferentes nomes de campo de data
    let dateField
    
    // Se for array (dados OCTA), pegar posição 28 (coluna AC = "Dia")
    if (Array.isArray(record)) {
      dateField = record[28] // Coluna "Dia" no OCTA
    } else {
      // Se for objeto (dados de chamadas)
      dateField = record.calldate || record.Data || record.data || record.date
    }
    
    // Limpar timestamp
    if (dateField && typeof dateField === 'string') {
      if (dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      dateField = dateField.trim()
    }
    
    if (!dateField) return
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) return
    
    const key = getGroupKey(date, groupBy)
    
    if (!groupedData[key]) {
      groupedData[key] = {
        notasAtendimento: [],
        notasSolucao: [],
        bom: 0,
        ruim: 0,
        date: date // guardar data para ordenação
      }
    }
    
    // Para dados OCTA (array)
    if (Array.isArray(record)) {
      const tipoAvaliacao = record[14] || '' // Posição 14 = "Tipo de avaliação"
      
      if (tipoAvaliacao === 'Bom' || tipoAvaliacao === 'Ótimo') {
        groupedData[key].bom++
        groupedData[key].notasAtendimento.push(5) // Bom = 5
      } else if (tipoAvaliacao === 'Ruim') {
        groupedData[key].ruim++
        groupedData[key].notasAtendimento.push(1) // Ruim = 1
      }
    } else {
      // Para dados de chamadas (objeto)
      const notaAtendimento = record.notaAtendimento || record.rating_attendance
      const notaSolucao = record.notaSolucao || record.rating_solution
      
      if (notaAtendimento && parseFloat(notaAtendimento) > 0) {
        groupedData[key].notasAtendimento.push(parseFloat(notaAtendimento))
      }
      
      if (notaSolucao && parseFloat(notaSolucao) > 0) {
        groupedData[key].notasSolucao.push(parseFloat(notaSolucao))
      }
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(k => formatLabel(k, groupBy))
  const notaAtendimento = sortedKeys.map(k => {
    const notas = groupedData[k].notasAtendimento
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const notaSolucao = sortedKeys.map(k => {
    const notas = groupedData[k].notasSolucao
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const bom = sortedKeys.map(k => groupedData[k].bom)
  const ruim = sortedKeys.map(k => groupedData[k].ruim)

  return { labels, notaAtendimento, notaSolucao, bom, ruim }
}

// Parsear data brasileira (DD/MM/YYYY)
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  
  // Se já é uma data válida
  if (dateStr instanceof Date) return dateStr
  
  // Formato DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  // Tentar parse direto
  return new Date(dateStr)
}

// Obter chave de agrupamento
const getGroupKey = (date, groupBy) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekNum = getWeekNumber(date)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  } else { // month
    return `${year}-${String(month).padStart(2, '0')}`
  }
}

// Obter número da semana do ano
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Formatar label de acordo com o agrupamento
const formatLabel = (key, groupBy) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    const parts = key.split('-W')
    return `Sem ${parts[1]}`
  } else { // month
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default CSATChart
