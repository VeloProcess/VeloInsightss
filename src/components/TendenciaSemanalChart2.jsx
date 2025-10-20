import React, { useMemo } from 'react'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TendenciaSemanalChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    console.log('📊 TendenciaSemanalChart - Total de registros:', data?.length)
    console.log('📊 TendenciaSemanalChart - Primeiro registro:', data?.[0])
    console.log('📊 TendenciaSemanalChart - Período:', periodo)
    
    const processedData = processDataByPeriod(data, periodo)
    
    // Paleta de cores
    const azul = 'rgba(58, 91, 255, 1)'
    const azulFill = 'rgba(58, 91, 255, 0.12)'
    const verde = 'rgba(58, 179, 115, 1)'
    const verdeFill = 'rgba(58, 179, 115, 0.10)'
    const vermelho = 'rgba(231, 88, 88, 1)'
    const amarelo = 'rgba(249, 191, 63, 1)'

    // Verificar se é dados de tickets (tem campo avaliados)
    const isTicketData = processedData.avaliados && processedData.avaliados.some(v => v > 0)
    
    const datasets = isTicketData ? [
      {
        label: 'Total de Tickets',
        data: processedData.total,
        borderColor: azul,
        backgroundColor: azulFill,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: azul
      },
      {
        label: 'Tickets Avaliados',
        data: processedData.avaliados,
        borderColor: amarelo,
        backgroundColor: 'rgba(249, 191, 63, 0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: amarelo
      },
      {
        label: 'Bom',
        data: processedData.bom,
        borderColor: verde,
        backgroundColor: verdeFill,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: verde
      },
      {
        label: 'Ruim',
        data: processedData.ruim,
        borderColor: vermelho,
        backgroundColor: 'rgba(231, 88, 88, 0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: vermelho
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
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: azul,
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
        pointRadius: 0,
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
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        label: 'Nota Média',
        data: processedData.notaMedia,
        borderColor: amarelo,
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 3,
        borderDash: [6, 6],
        tension: 0.25,
        pointRadius: 0,
        yAxisID: 'y1',
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
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: false,
          boxWidth: 28,
          boxHeight: 12,
          padding: 14,
          color: '#344054',
          font: { weight: 600, size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        borderColor: '#0f172a',
        borderWidth: 1,
        padding: 10,
        titleFont: { weight: '700' },
        bodyFont: { weight: '500' },
        callbacks: {
          label: (ctx) => {
            const ds = ctx.dataset.label || ''
            const val = ctx.parsed.y
            if (ctx.dataset.yAxisID === 'y1') return `${ds}: ${val.toFixed(2)}`
            return `${ds}: ${val.toLocaleString('pt-BR')}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#eef2fb' },
        ticks: { color: '#6576aa', font: { size: 11 } }
      },
      y: {
        title: { display: true, text: 'Volume de Chamadas' },
        min: 0,
        grid: { color: '#e9eef7' },
        ticks: {
          color: '#6576aa',
          callback: (v) => Number(v).toLocaleString('pt-BR')
        }
      },
      y1: {
        position: 'right',
        title: { display: true, text: 'Nota Média' },
        min: 0,
        max: 5,
        grid: { drawOnChartArea: false },
        ticks: { color: '#6576aa' }
      }
    }
  }

  return <Line data={chartData} options={options} />
}

// Função para processar dados de acordo com o período selecionado
const processDataByPeriod = (data, periodo) => {
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
  
  return processDataByGrouping(data, groupBy)
}

// Função auxiliar para processar dados com agrupamento específico
const processDataByGrouping = (data, groupBy) => {
  console.log('🔍 processDataByGrouping - Recebeu:', data?.length, 'registros')
  
  if (!data || data.length === 0) {
    console.log('⚠️ Nenhum dado para processar!')
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
  let skippedCount = 0
  
  data.forEach((record, index) => {
    if (index < 3) {
      console.log(`📝 Registro ${index}:`, {
        calldate: record.calldate,
        Data: record.Data,
        data: record.data,
        date: record.date,
        'Data de entrada': record['Data de entrada'],
        dataEntrada: record.dataEntrada,
        Dia: record.Dia
      })
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
      skippedCount++
      return
    }
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) {
      skippedCount++
      return
    }
    
    processedCount++
    
    const key = getGroupKey(date, groupBy)
    
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
      
      if (tipoAvaliacao === 'Bom' || tipoAvaliacao === 'Ótimo') {
        groupedData[key].bom++
      } else if (tipoAvaliacao === 'Ruim') {
        groupedData[key].ruim++
      }
    }
    
    // Notas: chamadas ou tickets
    const nota = record.notaAtendimento || record.rating_attendance || 
                 (tipoAvaliacao === 'Bom' ? 5 : tipoAvaliacao === 'Ruim' ? 1 : 0)
    if (nota && parseFloat(nota) > 0) {
      groupedData[key].notas.push(parseFloat(nota))
    }
  })
  
  console.log('✅ Processamento concluído:', {
    total: data.length,
    processados: processedCount,
    ignorados: skippedCount,
    grupos: Object.keys(groupedData).length
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(k => formatLabel(k, groupBy))
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

export default TendenciaSemanalChart
