import React, { useMemo, memo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { showWarningWithLimit } from '../utils/warningManager'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

// Função para calcular métricas dos cards
const calculateMetrics = (processedData) => {
  const total = processedData.total.reduce((sum, val) => sum + val, 0)
  const atendidas = processedData.atendidas.reduce((sum, val) => sum + val, 0)
  const abandonadas = processedData.abandonadas.reduce((sum, val) => sum + val, 0)
  const avaliados = processedData.avaliados ? processedData.avaliados.reduce((sum, val) => sum + val, 0) : 0
  const bom = processedData.bom ? processedData.bom.reduce((sum, val) => sum + val, 0) : 0
  const ruim = processedData.ruim ? processedData.ruim.reduce((sum, val) => sum + val, 0) : 0
  
  const taxaAtendimento = total > 0 ? ((atendidas / total) * 100).toFixed(1) : '0.0'
  const taxaAbandono = total > 0 ? ((abandonadas / total) * 100).toFixed(1) : '0.0'
  
  // Calcular nota média
  let notaMedia = '0.0'
  if (processedData.notaMedia && processedData.notaMedia.length > 0) {
    const somaNotas = processedData.notaMedia.reduce((sum, val) => sum + val, 0)
    const totalNotas = processedData.notaMedia.filter(val => val > 0).length
    notaMedia = totalNotas > 0 ? (somaNotas / totalNotas).toFixed(1) : '0.0'
  }
  
  // Calcular performance geral para tickets
  let performanceGeral = '0.0'
  if (processedData.bom && processedData.ruim) {
    const totalBom = bom
    const totalRuim = ruim
    const totalAvaliacoes = totalBom + totalRuim
    performanceGeral = totalAvaliacoes > 0 ? ((totalBom / totalAvaliacoes) * 100).toFixed(1) : '0.0'
  }
  
  return {
    total,
    atendidas,
    abandonadas,
    avaliados,
    bom,
    ruim,
    taxaAtendimento,
    taxaAbandono,
    notaMedia,
    performanceGeral
  }
}

const TendenciaSemanalChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    const processedData = processDataByPeriod(data, periodo)
    
    // Calcular métricas para os cards
    const metrics = calculateMetrics(processedData)
    
    // Paleta de cores moderna e vibrante
    const azul = '#3B82F6' // Azul vibrante
    const azulFill = 'rgba(59, 130, 246, 0.15)'
    const verde = '#10B981' // Verde esmeralda
    const verdeFill = 'rgba(16, 185, 129, 0.15)'
    const vermelho = '#EF4444' // Vermelho vibrante
    const amarelo = '#F59E0B' // Âmbar vibrante
    const roxo = '#8B5CF6' // Roxo vibrante

    // Verificar se é dados de tickets (tem campo avaliados)
    const isTicketData = processedData.avaliados && processedData.avaliados.some(v => v > 0)
    
    // Calcular porcentagem de performance geral para tickets
    let performancePercent = []
    if (isTicketData && processedData.bom && processedData.ruim) {
      processedData.labels.forEach((_, index) => {
        const bomCount = processedData.bom[index] || 0
        const ruimCount = processedData.ruim[index] || 0
        const total = bomCount + ruimCount
        
        if (total > 0) {
          performancePercent.push(((bomCount / total) * 100).toFixed(1))
        } else {
          performancePercent.push(0)
        }
      })
    }
    
    const datasets = isTicketData ? [
      {
        label: 'Total de Tickets',
        data: processedData.total,
        borderColor: azul,
        backgroundColor: azulFill,
        borderWidth: 6, // Aumentado de 4 para 6
        fill: true,
        tension: 0.3,
        pointRadius: 12, // Aumentado de 10 para 12
        pointHoverRadius: 18, // Aumentado de 15 para 18
        pointBackgroundColor: azul,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 4,
        pointHoverBorderWidth: 6,
        pointHoverBackgroundColor: '#1D4ED8',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(59, 130, 246, 0.3)',
        yAxisID: 'y'
      },
      {
        label: 'Tickets Avaliados',
        data: processedData.avaliados,
        borderColor: amarelo,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 6, // Aumentado de 4 para 6
        fill: true,
        tension: 0.3,
        pointRadius: 10, // Aumentado de 8 para 10
        pointHoverRadius: 15, // Aumentado de 12 para 15
        pointBackgroundColor: amarelo,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 5,
        pointHoverBackgroundColor: '#D97706',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 6,
        shadowColor: 'rgba(245, 158, 11, 0.3)',
        yAxisID: 'y'
      },
      {
        label: 'Pesquisa(%)',
        data: performancePercent,
        borderColor: roxo,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 6, // Aumentado de 4 para 6
        fill: false,
        tension: 0.3,
        pointRadius: 10, // Aumentado de 8 para 10
        pointHoverRadius: 15, // Aumentado de 12 para 15
        pointBackgroundColor: roxo,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 5,
        pointHoverBackgroundColor: '#7C3AED',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 6,
        shadowColor: 'rgba(139, 92, 246, 0.3)',
        yAxisID: 'y1'
      }
    ] : [
      {
        label: 'Total de Chamadas',
        data: processedData.total,
        borderColor: azul,
        backgroundColor: azulFill,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointRadius: 10, // Aumentado de 8 para 10
        pointHoverRadius: 15, // Aumentado de 12 para 15
        pointBackgroundColor: azul,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#1d4ed8',
        yAxisID: 'y',
      },
      {
        label: 'Chamadas Atendidas',
        data: processedData.atendidas,
        borderColor: verde,
        backgroundColor: verdeFill,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: verde,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: '#059669',
        yAxisID: 'y',
      },
      {
        label: 'Chamadas Abandonadas',
        data: processedData.abandonadas,
        borderColor: vermelho,
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 3,
        tension: 0.35,
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: vermelho,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: '#dc2626',
        yAxisID: 'y',
      },
    ]

    return {
      labels: processedData.labels,
      datasets,
      metrics: metrics,
      isTicketData: isTicketData
    }
  }, [data, periodo])

  // Verificar se é dados de tickets para usar nas opções
  const isTicketData = chartData.isTicketData

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { 
      mode: 'index', 
      intersect: false,
      axis: 'x'
    },
    animation: {
      duration: 0 // Desabilitar animação para melhor performance
    },
    onHover: (event, activeElements) => {
      // Mudar cursor para pointer quando hover
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: false,
          boxWidth: 28,
          boxHeight: 12,
          padding: 14,
          color: '#344054',
          font: { weight: '700', size: 16 } // Aumentado de 12 para 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        borderColor: '#3B82F6',
        borderWidth: 3,
        padding: 20,
        cornerRadius: 16,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        titleFont: { 
          weight: '800',
          size: 16,
          family: "'Inter', sans-serif"
        },
        bodyFont: { 
          weight: '700',
          size: 15,
          family: "'Inter', sans-serif"
        },
        displayColors: true,
        boxWidth: 16,
        boxHeight: 16,
        caretSize: 8,
        caretPadding: 8,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex
            const labels = context[0].chart.data.labels
            return `📊 ${labels[dataIndex]}`
          },
          label: function(context) {
            const dataset = context.dataset
            const value = context.parsed.y
            const label = dataset.label
            
            // Formatação especial para cada tipo de métrica
            if (label === 'Total de Chamadas' || label === 'Total de Tickets') {
              return `🔵 ${label}: ${value.toLocaleString('pt-BR')}`
            } else if (label === 'Chamadas Atendidas' || label === 'Tickets Avaliados') {
              return `🟢 ${label}: ${value.toLocaleString('pt-BR')}`
            } else if (label === 'Chamadas Abandonadas') {
              return `🔴 ${label}: ${value.toLocaleString('pt-BR')}`
            } else if (label === 'Performance Geral (%)') {
              return `📊 ${label}: ${value}%`
            } else if (dataset.yAxisID === 'y1') {
              return `⭐ ${label}: ${value.toFixed(2)}`
            }
            
            return `${label}: ${value.toLocaleString('pt-BR')}`
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex
            const datasets = context[0].chart.data.datasets
            
            // Calcular percentuais se for dados de chamadas
            const totalDataset = datasets.find(d => d.label === 'Total de Chamadas' || d.label === 'Total de Tickets')
            const atendidasDataset = datasets.find(d => d.label === 'Chamadas Atendidas' || d.label === 'Tickets Avaliados')
            const abandonadasDataset = datasets.find(d => d.label === 'Chamadas Abandonadas')
            
            if (totalDataset && atendidasDataset && abandonadasDataset) {
              const total = totalDataset.data[dataIndex] || 0
              const atendidas = atendidasDataset.data[dataIndex] || 0
              const abandonadas = abandonadasDataset.data[dataIndex] || 0
              
              if (total > 0) {
                const taxaAtendimento = ((atendidas / total) * 100).toFixed(1)
                const taxaAbandono = ((abandonadas / total) * 100).toFixed(1)
                
                return [
                  '',
                  `📈 Taxa de Atendimento: ${taxaAtendimento}%`,
                  `📉 Taxa de Abandono: ${taxaAbandono}%`
                ]
              }
            }
            
            return []
          }
        }
      },
      datalabels: {
        display: function(context) {
          // Mostrar nos pontos de Total de Chamadas/Tickets E na linha de Pesquisa
          return context.dataset.label === 'Total de Chamadas' || 
                 context.dataset.label === 'Total de Tickets' ||
                 context.dataset.label === 'Pesquisa(%)'
        },
        color: '#1f2937',
        font: {
          size: 16, // Aumentado de 11 para 16
          weight: '700', // Aumentado de 600 para 700
          family: "'Inter', sans-serif"
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8, // Aumentado de 4 para 8
        formatter: function(value, context) {
          // Verificar se o valor é válido e maior que 0
          if (value && value > 0 && !isNaN(value)) {
            // Para linha de Pesquisa, mostrar com %
            if (context.dataset.label === 'Pesquisa(%)') {
              // Garantir que o valor é um número antes de usar toFixed
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
              return numValue.toFixed(1) + '%'
            }
            
            // Para números grandes de tickets/chamadas, formatar de forma compacta
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k'
            }
            return value.toLocaleString('pt-BR')
          }
          return ''
        },
        anchor: function(context) {
          // Para linha de Pesquisa, mostrar acima
          if (context.dataset.label === 'Pesquisa(%)') {
            return 'end'
          }
          // Para outras linhas, manter comportamento padrão
          return 'end'
        },
        align: function(context) {
          // Para linha de Pesquisa, alinhar acima
          if (context.dataset.label === 'Pesquisa(%)') {
            return 'top'
          }
          // Para outras linhas, manter comportamento padrão
          return 'top'
        },
        offset: function(context) {
          // Para linha de Pesquisa, offset maior para ficar bem acima
          if (context.dataset.label === 'Pesquisa(%)') {
            return 10
          }
          // Para outras linhas, offset padrão
          return 6
        },
        rotation: 0
      }
    },
    scales: {
      x: {
        grid: { color: '#eef2fb' },
        ticks: { 
          color: '#6B7280', 
          font: { 
            size: 16, // Aumentado de 13 para 16
            weight: '700', // Aumentado de 600 para 700
            family: "'Inter', sans-serif"
          } 
        }
      },
      y: {
        title: { 
          display: true, 
          text: 'Volume de Chamadas',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        min: 0,
        grid: { color: '#e9eef7' },
        ticks: {
          color: '#6B7280',
          font: {
            size: 16, // Aumentado de 12 para 16
            weight: '700', // Aumentado de 600 para 700
            family: "'Inter', sans-serif"
          },
          callback: (v) => Number(v).toLocaleString('pt-BR')
        }
      },
      y1: {
        position: 'right',
        title: { 
          display: true, 
          text: isTicketData ? 'Performance (%)' : 'Nota Média (1-5)',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        min: isTicketData ? 0 : 1,
        max: isTicketData ? 100 : 5,
        grid: { drawOnChartArea: false },
        ticks: { 
          color: '#6B7280',
          font: {
            size: 16, // Aumentado de 12 para 16
            weight: '700', // Aumentado de 600 para 700
            family: "'Inter', sans-serif"
          },
          stepSize: isTicketData ? 20 : 1,
          callback: function(value) {
            if (isTicketData) {
              return value + '%'
            }
            return value.toFixed(1)
          }
        }
      }
    }
  }

  return <Line data={chartData} options={options} />
}

// Função para processar dados de acordo com o período selecionado
const processDataByPeriod = (data, periodo) => {
  // FILTRAR DADOS PELO PERÍODO ANTES DE AGRUPAR
  let filteredData = data
  
  // Definir start e end com valores padrão
  let start = periodo?.startDate ? new Date(periodo.startDate) : new Date()
  let end = periodo?.endDate ? new Date(periodo.endDate) : new Date()
  
  if (periodo && periodo.startDate && periodo.endDate) {
    // PRIMEIRO: Descobrir qual é a última data disponível em TODOS os dados (otimizado)
    let lastAvailableDate = null
    
    for (let i = 0; i < data.length; i++) {
      let dateField
      const record = data[i]
      if (Array.isArray(record)) {
        dateField = record[28] || record[0]
      } else {
        dateField = record.calldate || record.Data || record.data || record.date || 
                    record['Data de entrada'] || record.dataEntrada || record.Dia
      }
      if (!dateField) continue
      if (typeof dateField === 'string' && dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      const date = parseBrazilianDate(dateField)
      if (!date || isNaN(date.getTime())) continue
      
      if (!lastAvailableDate || date > lastAvailableDate) {
        lastAvailableDate = date
      }
    }
    
    // AJUSTAR PERÍODO: usar última data disponível se for menor que a data fim desejada
    start = new Date(periodo.startDate)
    end = new Date(periodo.endDate)
    
    if (lastAvailableDate && lastAvailableDate < end) {
      // SELEÇÃO ESPECIAL: Para "Mês atual" e "Último mês"
      if (periodo.totalDays >= 28 && periodo.totalDays <= 31) {
        // Verificar se é "Mês atual" ou "Último mês"
        const now = new Date()
        const isCurrentMonth = now.getMonth() === lastAvailableDate.getMonth() && now.getFullYear() === lastAvailableDate.getFullYear()
        
        if (isCurrentMonth) {
          // MÊS ATUAL: do dia 01 até a última data disponível
          const now = new Date()
          const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          start = firstDayOfCurrentMonth
          end = lastAvailableDate
          
          console.log(`📅 Mês atual: ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`)
        } else {
          // ÚLTIMO MÊS: usar mês anterior COMPLETO
          const previousMonth = new Date(lastAvailableDate.getFullYear(), lastAvailableDate.getMonth() - 1, 1)
          const lastDayOfPreviousMonth = new Date(lastAvailableDate.getFullYear(), lastAvailableDate.getMonth(), 0)
          
          start = previousMonth
          end = lastDayOfPreviousMonth
          
          console.log(`📅 Último mês completo (anterior): ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`)
        }
      } else {
        // Para outros períodos, ajustar normalmente
        const daysDiff = Math.floor((end - lastAvailableDate) / (1000 * 60 * 60 * 24))
        start = new Date(lastAvailableDate.getTime() - (periodo.totalDays - 1) * 24 * 60 * 60 * 1000)
        end = lastAvailableDate
        
        console.log(`📅 Ajustando período: última data disponível é ${lastAvailableDate.toLocaleDateString('pt-BR')}, movendo ${daysDiff} dias para trás`)
      }
    } else if (!lastAvailableDate || lastAvailableDate >= end) {
      // Se a última data está depois ou na data fim, ajustar para garantir que não vá além
      const now = new Date()
      const isCurrentMonth = now.getMonth() === end.getMonth() && now.getFullYear() === end.getFullYear()
      
      if (periodo.totalDays >= 28 && periodo.totalDays <= 31 && isCurrentMonth) {
        // MÊS ATUAL: ajustar o fim para não passar da data atual
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        if (end > now) {
          end = now
        }
        if (start > end) {
          start = firstDayOfCurrentMonth
        }
        
        console.log(`📅 Mês atual (sem dados): ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`)
      }
    }
    
    // Normalizar para comparar apenas a data (sem hora)
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    
    filteredData = data.filter(record => {
      let dateField
      
      if (Array.isArray(record)) {
        dateField = record[28] || record[0]
      } else {
        dateField = record.calldate || record.Data || record.data || record.date || 
                    record['Data de entrada'] || record.dataEntrada || record.Dia
      }
      
      if (!dateField) return false
      
      if (typeof dateField === 'string' && dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      
      const date = parseBrazilianDate(dateField)
      if (!date || isNaN(date.getTime())) return false
      
      // DESCARTAR DOMINGOS - não trabalhamos no domingo
      if (date.getDay() === 0) {
        return false // DOMINGO NÃO CONTA
      }
      
      // Normalizar para comparar apenas a data (sem hora)
      const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      return recordDate >= startDate && recordDate <= endDate
    })
    
    console.log(`📅 Análise Geral - Filtro aplicado:`, {
      totalRegistros: data.length,
      registrosFiltrados: filteredData.length,
      periodoOriginal: `${new Date(periodo.startDate).toLocaleDateString('pt-BR')} a ${new Date(periodo.endDate).toLocaleDateString('pt-BR')}`,
      periodoAjustado: `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`,
      ultimaDataDisponivel: lastAvailableDate ? lastAvailableDate.toLocaleDateString('pt-BR') : 'N/A'
    })
  }
  
  // Determinar o tipo de agrupamento baseado no período
  const totalDays = periodo?.totalDays || 0
  let groupBy = 'month' // padrão: agrupar por mês quando não há período ou "Todos os registros"
  
  if (totalDays > 0 && totalDays <= 15) {
    groupBy = 'day' // 15 dias ou menos = agrupar por dia
  } else if (totalDays > 15 && totalDays <= 30) {
    groupBy = 'week' // 15 a 30 dias = agrupar por semana
  } else if (totalDays > 30 || totalDays === 0) {
    groupBy = 'month' // 30+ dias = agrupar por mês
  }
  
  // Normalizar para comparar apenas a data (sem hora)
  const startDateNormalized = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDateNormalized = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  
  return processDataByGrouping(filteredData, groupBy, periodo, startDateNormalized, endDateNormalized)
}

// Função auxiliar para processar dados com agrupamento específico
const processDataByGrouping = (data, groupBy, periodo = null, startDate = null, endDate = null) => {
  
  if (!data || data.length === 0) {
    return {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      total: [0, 0, 0, 0],
      atendidas: [0, 0, 0, 0],
      abandonadas: [0, 0, 0, 0],
      avaliados: [0, 0, 0, 0],
      bom: [0, 0, 0, 0],
      ruim: [0, 0, 0, 0],
      notaMedia: [0, 0, 0, 0]
    }
  }

  // Agrupar dados
  const groupedData = {}
  let processedCount = 0
  
  data.forEach((record, index) => {
    if (index < 3) {
    }
    // Tentar diferentes nomes de campo de data (chamadas e tickets)
    let dateField
    
    // Se for array (dados OCTA), pegar posição 28 (coluna AC = "Dia")
    if (Array.isArray(record)) {
      dateField = record[28] // Coluna "Dia" no OCTA
    } else {
      // Se for objeto (dados de chamadas)
      dateField = record.calldate || record.Data || record.data || record.date || 
                  record['Data de entrada'] || record.dataEntrada || record.Dia
    }
    
    // Se for timestamp completo (ex: "01/01/2025 00:00:00" ou "2025-01-01 18:10:21.272000"), extrair apenas a data
    if (dateField && typeof dateField === 'string') {
      if (dateField.includes(' ')) {
        dateField = dateField.split(' ')[0] // Pegar apenas a parte da data
      }
      // Remover possíveis caracteres extras
      dateField = dateField.trim()
    }
    
    if (!dateField) {
      showWarningWithLimit(
        'tendencia-semanal-data-vazio',
        `⚠️ TendenciaSemanalChart2 - Linha ${index} ignorada: campo de data vazio`,
        {
          record: record,
          dateField: dateField,
          camposDisponiveis: Object.keys(record).slice(0, 10)
        },
        3
      )
      return
    }
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) {
      showWarningWithLimit(
        'tendencia-semanal-data-invalida',
        `⚠️ TendenciaSemanalChart2 - Linha ${index} ignorada: data inválida`,
        {
          dateField: dateField,
          parsedDate: date,
          record: record
        },
        3
      )
      return
    }
    
    // FILTRO ADICIONAL: Para "Mês atual", descartar dados de semanas que cruzam com o mês anterior
    if (startDate && periodo && periodo.totalDays >= 28 && periodo.totalDays <= 31) {
      const now = new Date()
      const isCurrentMonth = now.getMonth() === startDate.getMonth() && now.getFullYear() === startDate.getFullYear()
      
      if (isCurrentMonth) {
        // Se é mês atual, só contar dias do mês atual (descartar dados do mês anterior em semanas)
        if (date.getMonth() < startDate.getMonth() || date.getFullYear() < startDate.getFullYear()) {
          return // Descarta dias do mês anterior
        }
      }
    }
    
    processedCount++
    
    const key = getGroupKey(date, groupBy, startDate, endDate)
    
    if (!groupedData[key]) {
      groupedData[key] = {
        total: 0,
        atendidas: 0,
        abandonadas: 0,
        avaliados: 0,
        bom: 0,
        ruim: 0,
        notas: [],
        date: date // guardar data para ordenação
      }
    }
    
    groupedData[key].total++
    
    // Status: chamadas (Atendida/Abandonada) ou tickets (Bom/Ruim)
    let chamada = ''
    let tipoAvaliacao = ''
    
    if (Array.isArray(record)) {
      // Dados OCTA (array)
      tipoAvaliacao = record[14] || '' // Posição 14 = "Tipo de avaliação"
    } else {
      // Dados de chamadas (objeto)
      chamada = record.chamada || record.disposition || ''
      tipoAvaliacao = record['Tipo de avaliação'] || record.tipoAvaliacao || ''
    }
    
    // Para chamadas
    if (chamada === 'Atendida' || chamada === 'ANSWERED') {
      groupedData[key].atendidas++
    } else if (chamada === 'Abandonada' || chamada === 'NO ANSWER') {
      groupedData[key].abandonadas++
    }
    
    // Para tickets (considerar avaliados como "atendidos")
    if (tipoAvaliacao && tipoAvaliacao !== 'VAZIO' && tipoAvaliacao !== '') {
      groupedData[key].avaliados++
    }
    
    // Notas: chamadas ou tickets - considerar todas as notas de 1 a 5
    let nota = record.notaAtendimento || record.rating_attendance || 0
    
    // Se não há nota direta, mapear tipo de avaliação para nota
    if (!nota && tipoAvaliacao) {
      switch (tipoAvaliacao.toLowerCase()) {
        case 'ruim':
        case 'péssimo':
          nota = 1
          break
        case 'regular':
          nota = 2
          break
        case 'bom':
          nota = 3
          break
        case 'muito bom':
          nota = 4
          break
        case 'ótimo':
        case 'excelente':
          nota = 5
          break
        default:
          nota = 0
      }
    }
    
    // Aceitar notas de 1 a 5 e categorizar
    if (nota && parseFloat(nota) >= 1 && parseFloat(nota) <= 5) {
      const notaNum = parseFloat(nota)
      groupedData[key].notas.push(notaNum)
      
      // Categorizar baseado na nota: 1-2 = Ruim, 3-5 = Bom
      if (notaNum >= 1 && notaNum <= 2) {
        groupedData[key].ruim++
      } else if (notaNum >= 3 && notaNum <= 5) {
        groupedData[key].bom++
      }
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(k => formatLabel(k, groupBy, groupedData[k].date))
  const total = sortedKeys.map(k => groupedData[k].total)
  const atendidas = sortedKeys.map(k => groupedData[k].atendidas)
  const abandonadas = sortedKeys.map(k => groupedData[k].abandonadas)
  const avaliados = sortedKeys.map(k => groupedData[k].avaliados)
  const bom = sortedKeys.map(k => groupedData[k].bom)
  const ruim = sortedKeys.map(k => groupedData[k].ruim)
  const notaMedia = sortedKeys.map(k => {
    const notas = groupedData[k].notas
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })

  return { labels, total, atendidas, abandonadas, avaliados, bom, ruim, notaMedia }
}

// Parsear data brasileira (DD/MM/YYYY) ou ISO (YYYY-MM-DD)
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  
  // Se já é uma data válida
  if (dateStr instanceof Date) return dateStr
  
  // Formato DD/MM/YYYY (brasileiro)
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const year = parseInt(parts[2])
      return new Date(year, month, day)
    }
  }
  
  // Formato YYYY-MM-DD (ISO/tickets)
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])
      return new Date(year, month, day)
    }
  }
  
  // Tentar parse direto
  return new Date(dateStr)
}

// Obter chave de agrupamento
const getGroupKey = (date, groupBy, startDate = null, endDate = null) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    // Se temos um período personalizado (startDate e endDate)
    if (startDate && endDate && startDate instanceof Date && endDate instanceof Date) {
      // Calcular semanas relativas ao início do período
      const diffInDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
      const weekNum = Math.floor(diffInDays / 7) + 1
      return `W${weekNum}`
    } else {
      // Usar número da semana padrão do ano
      const weekNum = getWeekNumber(date)
      return `${year}-W${String(weekNum).padStart(2, '0')}`
    }
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
const formatLabel = (key, groupBy, date = null) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    // Para semanas, calcular início e fim se tiver a data
    if (date) {
      // Calcular início da semana (segunda-feira)
      const dayOfWeek = date.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - diff)
      
      // Calcular fim da semana (domingo)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
    } else {
      const parts = key.split('-W')
      return `Sem ${parts[1]}`
    }
  } else { // month
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default memo(TendenciaSemanalChart)
