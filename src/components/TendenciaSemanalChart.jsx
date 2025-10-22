import React, { useMemo, useState } from 'react'
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
import { Line } from 'react-chartjs-2'

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

const TendenciaSemanalChart = ({ data = [] }) => {
  // Estado para controlar quais séries estão visíveis
  const [visibleSeries, setVisibleSeries] = useState(new Set([
    'Total de Chamadas',
    'Chamadas Atendidas',
    'Chamadas Retidas na URA',
    'Nota Média'
  ]))

  // Processar dados reais para o gráfico
  const processedData = useMemo(() => processWeeklyData(data), [data])

  // Função para alternar visibilidade de uma série
  const toggleSeries = (seriesName) => {
    setVisibleSeries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName)
      } else {
        newSet.add(seriesName)
      }
      return newSet
    })
  }

  // Paleta de cores
  const azul = 'rgba(58, 91, 255, 1)'
  const azulFill = 'rgba(58, 91, 255, 0.12)'
  const verde = 'rgba(58, 179, 115, 1)'
  const verdeFill = 'rgba(58, 179, 115, 0.10)'
  const vermelho = 'rgba(231, 88, 88, 1)'
  const amarelo = 'rgba(249, 191, 63, 1)'

  const chartData = useMemo(() => {
    const datasets = [
      {
        label: 'Total de Chamadas',
        data: processedData.total,
        borderColor: azul,
        backgroundColor: azulFill,
        borderWidth: 3,
        tension: 0.35,
        fill: 'start',
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: azul,
        yAxisID: 'y',
        hidden: !visibleSeries.has('Total de Chamadas')
      },
      {
        label: 'Chamadas Atendidas',
        data: processedData.atendidas,
        borderColor: verde,
        backgroundColor: verdeFill,
        borderWidth: 3,
        tension: 0.35,
        fill: 'origin',
        pointRadius: 0,
        yAxisID: 'y',
        hidden: !visibleSeries.has('Chamadas Atendidas')
      },
      {
        label: 'Chamadas Retidas na URA',
        data: processedData.abandonadas,
        borderColor: vermelho,
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 3,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
        yAxisID: 'y',
        hidden: !visibleSeries.has('Chamadas Retidas na URA')
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
        hidden: !visibleSeries.has('Nota Média')
      }
    ]

    return {
      labels: processedData.labels,
      datasets: datasets.filter(dataset => !dataset.hidden)
    }
  }, [processedData, visibleSeries])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    onClick: (event, elements) => {
      // Verificar se o clique foi na legenda
      if (event.native && event.native.target) {
        const target = event.native.target
        if (target.tagName === 'CANVAS') {
          const chart = event.chart
          const legend = chart.legend
          const legendItems = legend.legendItems
          
          // Verificar se o clique foi em um item da legenda
          legendItems.forEach((item, index) => {
            const legendItem = legend.legendItems[index]
            if (legendItem && legendItem.x <= event.native.offsetX && 
                event.native.offsetX <= legendItem.x + legendItem.width &&
                legendItem.y <= event.native.offsetY && 
                event.native.offsetY <= legendItem.y + legendItem.height) {
              
              // Alternar visibilidade da série
              toggleSeries(item.text)
            }
          })
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: false,
          boxWidth: 28,
          boxHeight: 12,
          borderRadius: 2,
          padding: 14,
          color: '#344054',
          font: { weight: 600, size: 12 },
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels
            const labels = original.call(this, chart)
            
            // Adicionar estilo visual para séries ocultas
            labels.forEach((label, index) => {
              const dataset = chart.data.datasets[index]
              if (dataset && dataset.hidden) {
                label.fillStyle = 'rgba(200, 200, 200, 0.3)'
                label.strokeStyle = 'rgba(200, 200, 200, 0.3)'
              }
            })
            
            return labels
          }
        },
        onClick: (event, legendItem, legend) => {
          // Alternar visibilidade da série clicada
          toggleSeries(legendItem.text)
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
      },
      title: { display: false },
      subtitle: { display: false }
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
        title: { display: true, text: 'Nota Média (1-5)' },
        min: 0,
        max: 5,
        grid: { drawOnChartArea: false },
        ticks: { color: '#6576aa' }
      }
    },
    elements: {
      point: { hitRadius: 8, hoverRadius: 6 }
    }
  }

  return <Line data={chartData} options={options} />
}

// Função para processar dados reais em semanas
const processWeeklyData = (data) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      total: [0, 0, 0, 0],
      atendidas: [0, 0, 0, 0],
      abandonadas: [0, 0, 0, 0],
      notaMedia: [0, 0, 0, 0]
    }
  }

  // Agrupar dados por semana
  const weeklyData = {}
  
  data.forEach(record => {
    if (!record.calldate) return
    
    const date = new Date(record.calldate)
    const weekKey = getWeekKey(date)
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        total: 0,
        atendidas: 0,
        abandonadas: 0,
        notas: []
      }
    }
    
    weeklyData[weekKey].total++
    
    // Verificar se é chamada retida na URA
    let tipoChamada = ''
    if (Array.isArray(record)) {
      // Assumindo que o tipo de chamada está na coluna K (índice 10) ou próxima
      tipoChamada = record[10] || record[11] || record[12] || ''
    } else {
      tipoChamada = record.tipoChamada || record.tipo || record.status || record.disposition || ''
    }
    
    const isRetidaURA = tipoChamada && (
      tipoChamada.toLowerCase().includes('retida') ||
      tipoChamada.toLowerCase().includes('ura') ||
      tipoChamada.toLowerCase().includes('abandonada')
    )
    
    if (isRetidaURA) {
      weeklyData[weekKey].abandonadas++
    } else if (record.disposition === 'ANSWERED') {
      weeklyData[weekKey].atendidas++
    } else if (record.disposition === 'NO ANSWER') {
      weeklyData[weekKey].abandonadas++
    } else {
      // Se não tem disposition definido, assumir como atendida se não for retida
      weeklyData[weekKey].atendidas++
    }
    
    if (record.rating_attendance && record.rating_attendance > 0) {
      weeklyData[weekKey].notas.push(parseFloat(record.rating_attendance))
    }
  })

  // Converter para arrays ordenados
  const weeks = Object.keys(weeklyData).sort()
  const labels = weeks.map(w => `Sem ${w}`)
  const total = weeks.map(w => weeklyData[w].total)
  const atendidas = weeks.map(w => weeklyData[w].atendidas)
  const abandonadas = weeks.map(w => weeklyData[w].abandonadas)
  const notaMedia = weeks.map(w => {
    const notas = weeklyData[w].notas
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })

  return { labels, total, atendidas, abandonadas, notaMedia }
}

// Obter chave da semana (formato: "DD/MM")
const getWeekKey = (date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${day}/${month}`
}

export default TendenciaSemanalChart