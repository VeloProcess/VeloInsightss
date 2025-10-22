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
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const VolumeHoraChart = ({ data = [], periodo = null }) => {
  
  const chartData = useMemo(() => {
    const processedData = processVolumeHora(data, periodo)
    
    // Criar gradiente para as barras
    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    return {
      labels: processedData.labels,
      datasets: [
        {
          label: '📊 Histograma de Chamadas por Hora',
          data: processedData.volumes,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const value = context.parsed.y
            const max = Math.max(...processedData.volumes)
            
            // Cores de histograma baseadas na intensidade
            const intensity = value / max
            if (intensity > 0.8) {
              return createGradient(ctx, 'rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)') // Azul intenso
            } else if (intensity > 0.5) {
              return createGradient(ctx, 'rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.8)') // Índigo
            } else if (intensity > 0.2) {
              return createGradient(ctx, 'rgba(139, 92, 246, 0.7)', 'rgba(124, 58, 237, 0.7)') // Roxo
            } else {
              return createGradient(ctx, 'rgba(168, 85, 247, 0.6)', 'rgba(147, 51, 234, 0.6)') // Violeta claro
            }
          },
          borderWidth: 0,
          borderRadius: 0, // Histograma sem bordas arredondadas
          maxBarThickness: 80, // Barras mais largas para histograma
          hoverBorderWidth: 3,
          hoverBorderColor: 'rgba(255, 255, 255, 1)',
          hoverBackgroundColor: (context) => {
            const ctx = context.chart.ctx
            const value = context.parsed.y
            const max = Math.max(...processedData.volumes)
            
            // Cores de hover mais intensas para histograma
            const intensity = value / max
            if (intensity > 0.8) {
              return createGradient(ctx, 'rgba(59, 130, 246, 1)', 'rgba(37, 99, 235, 1)')
            } else if (intensity > 0.5) {
              return createGradient(ctx, 'rgba(99, 102, 241, 1)', 'rgba(79, 70, 229, 1)')
            } else if (intensity > 0.2) {
              return createGradient(ctx, 'rgba(139, 92, 246, 1)', 'rgba(124, 58, 237, 1)')
            } else {
              return createGradient(ctx, 'rgba(168, 85, 247, 1)', 'rgba(147, 51, 234, 1)')
            }
          }
        }
      ],
      peakInfo: processedData.peakInfo // Adicionar informações de pico
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 16,
          boxHeight: 16,
          color: '#1f2937'
        }
      },
      datalabels: {
        display: false, // Desabilitar labels nas barras
        color: '#ffffff',
        font: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: '700'
        },
        anchor: 'end',
        align: 'top',
        offset: 4,
        formatter: function(value, context) {
          // Mostrar apenas valores maiores que 0
          if (value > 0) {
            return value.toLocaleString('pt-BR')
          }
          return ''
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 6,
        padding: {
          top: 4,
          bottom: 4,
          left: 8,
          right: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 20,
        cornerRadius: 16,
        titleFont: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: '700'
        },
        bodyFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        displayColors: true,
        boxWidth: 16,
        boxHeight: 16,
        boxPadding: 8,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        callbacks: {
          title: function(context) {
            return `🕐 ${context[0].label}`
          },
          label: function(context) {
            const value = context.parsed.y
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percent = ((value / total) * 100).toFixed(1)
            return `Chamadas: ${value} (${percent}%)`
          },
          afterLabel: function(context) {
            const value = context.parsed.y
            const max = Math.max(...context.dataset.data)
            const peakInfo = chartData.peakInfo
            
            if (value > max * 0.8) {
              return [
                '🔥 Horário de PICO',
                `📊 Pico principal: ${peakInfo.primaryPeak}`,
                `📈 Volume médio: ${peakInfo.averageVolume.toFixed(1)}`
              ]
            } else if (value > max * 0.5) {
              return [
                '⚠️ Volume ALTO',
                `📊 Pico principal: ${peakInfo.primaryPeak}`,
                `📈 Volume médio: ${peakInfo.averageVolume.toFixed(1)}`
              ]
            } else if (value > max * 0.3) {
              return [
                '📊 Volume MÉDIO',
                `📊 Pico principal: ${peakInfo.primaryPeak}`,
                `📈 Volume médio: ${peakInfo.averageVolume.toFixed(1)}`
              ]
            } else {
              return [
                '✅ Volume BAIXO',
                `📊 Pico principal: ${peakInfo.primaryPeak}`,
                `📈 Volume médio: ${peakInfo.averageVolume.toFixed(1)}`
              ]
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Sem grid vertical para histograma
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 8,
          maxRotation: 0, // Sem rotação para histograma
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        max: 150000,
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 15,
          stepSize: 15000
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 1
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

// Processar volume por hora com análise de pico
const processVolumeHora = (data, periodo = null) => {
  if (!data || data.length === 0) {
    return {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      volumes: Array(24).fill(0),
      peakInfo: {
        primaryPeak: 'N/A',
        secondaryPeaks: [],
        averageVolume: 0,
        peakHours: [],
        lowHours: []
      }
    }
  }

  const volumePorHora = Array(24).fill(0)
  
  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (record) => {
    if (!periodo) return true
    
    try {
      // Tentar diferentes campos de data
      const dateField = record.data || record.date || record['Data de entrada'] || record.dataEntrada
      if (!dateField) return true
      
      const recordDate = parseBrazilianDate(dateField)
      if (!recordDate) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return recordDate >= startDate && recordDate <= endDate
    } catch (error) {
      return true
    }
  }
  
  let processedRecords = 0
  
  data.forEach(record => {
    // Verificar se está no período selecionado
    if (!isDateInPeriod(record)) return
    
    // Pegar o campo de hora da coluna E (índice 4)
    let horaField = ''
    
    // Se os dados são arrays (formato de planilha), usar índice 4 (coluna E)
    if (Array.isArray(record)) {
      horaField = record[4] || ''
    } else {
      // Se são objetos, tentar diferentes campos
      horaField = record.hora || record.time || record.calltime || 
                  record['Data de entrada'] || record.dataEntrada || record.Hora || ''
    }
    
    if (horaField) {
      // Se for timestamp completo (ex: "2025-01-01 18:10:21.272000"), extrair apenas a hora
      if (horaField.includes(' ')) {
        horaField = horaField.split(' ')[1] // Pegar a parte da hora
      }
      
      // Extrair a hora (formato HH:MM:SS ou HH:MM)
      const horaParts = horaField.split(':')
      if (horaParts.length >= 1) {
        const hora = parseInt(horaParts[0])
        if (hora >= 0 && hora < 24) {
          // Verificar se é chamada retida na URA - se for, não contar
          let tipoChamada = ''
          if (Array.isArray(record)) {
            // Assumindo que o tipo de chamada está na coluna K (índice 10) ou próxima
            tipoChamada = record[10] || record[11] || record[12] || ''
          } else {
            tipoChamada = record.tipoChamada || record.tipo || record.status || ''
          }
          
          const isRetidaURA = tipoChamada && (
            tipoChamada.toLowerCase().includes('retida') ||
            tipoChamada.toLowerCase().includes('ura') ||
            tipoChamada.toLowerCase().includes('abandonada')
          )
          
          // Só contar chamadas atendidas (não retidas)
          if (!isRetidaURA) {
            volumePorHora[hora]++
            processedRecords++
          }
        }
      }
    }
  })
  
  

  // Calcular informações de pico
  const maxVolume = Math.max(...volumePorHora)
  const averageVolume = volumePorHora.reduce((sum, vol) => sum + vol, 0) / 24
  
  // Encontrar horários de pico (acima de 80% do máximo)
  const peakThreshold = maxVolume * 0.8
  const peakHours = volumePorHora
    .map((vol, index) => ({ hour: index, volume: vol }))
    .filter(item => item.volume >= peakThreshold)
    .sort((a, b) => b.volume - a.volume)
  
  // Encontrar horários de baixo volume (abaixo de 30% do máximo)
  const lowThreshold = maxVolume * 0.3
  const lowHours = volumePorHora
    .map((vol, index) => ({ hour: index, volume: vol }))
    .filter(item => item.volume <= lowThreshold)
    .sort((a, b) => a.volume - b.volume)
  
  // Pico principal (maior volume)
  const primaryPeak = peakHours.length > 0 ? 
    `${String(peakHours[0].hour).padStart(2, '0')}:00` : 'N/A'
  
  // Picos secundários (outros horários de alto volume)
  const secondaryPeaks = peakHours.slice(1, 4).map(item => 
    `${String(item.hour).padStart(2, '0')}:00`
  )

  const labels = Array.from({ length: 24 }, (_, i) => {
    const hora = String(i).padStart(2, '0')
    return `${hora}:00`
  })

  return {
    labels,
    volumes: volumePorHora,
    peakInfo: {
      primaryPeak,
      secondaryPeaks,
      averageVolume,
      peakHours: peakHours.map(item => `${String(item.hour).padStart(2, '0')}:00`),
      lowHours: lowHours.map(item => `${String(item.hour).padStart(2, '0')}:00`)
    }
  }
}

// Função auxiliar para parse de data brasileira
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

export default VolumeHoraChart
