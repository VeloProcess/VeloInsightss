import React, { useEffect, useRef, memo } from 'react'
import './ChartsSection.css'
import LazyWrapper, { LazyChart } from './LazyWrapper'

const ChartsSection = memo(({ data, operatorMetrics }) => {
  const chartRefs = {
    callsChart: useRef(null),
    ratingsChart: useRef(null),
    durationChart: useRef(null),
    operatorsChart: useRef(null),
    trendChart: useRef(null),
    hourlyChart: useRef(null),
    performanceChart: useRef(null),
    abandonmentChart: useRef(null)
  }

  // Instâncias dos gráficos para controle
  const chartInstances = useRef({})

  useEffect(() => {
    if (!data || data.length === 0) return

    // Importar Chart.js dinamicamente
    import('chart.js/auto').then(({ Chart }) => {
      createCharts(Chart)
    })

    return () => {
      // Limpar charts ao desmontar
      Object.values(chartInstances.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy()
        }
      })
    }
  }, [data, operatorMetrics])

  const createCharts = (Chart) => {
    // Destruir gráficos existentes antes de criar novos
    Object.values(chartInstances.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    
    // Limpar instâncias
    chartInstances.current = {}
    
    createCallsChart(Chart)
    createRatingsChart(Chart)
    createDurationChart(Chart)
    createOperatorsChart(Chart)
    createTrendChart(Chart)
    createHourlyChart(Chart)
    createPerformanceChart(Chart)
    createAbandonmentChart(Chart)
  }

  // 📊 GRÁFICO DE CHAMADAS POR DIA
  const createCallsChart = (Chart) => {
    if (!chartRefs.callsChart.current || !data) return

    // Agrupar dados por dia
    const dailyData = {}
    data.forEach(record => {
      if (record.date) {
        const date = new Date(record.date).toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = 0
        }
        dailyData[date] += (record.call_count || 0)
      }
    })

    const dates = Object.keys(dailyData).sort()
    const calls = dates.map(date => dailyData[date])

    chartInstances.current.callsChart = new Chart(chartRefs.callsChart.current, {
      type: 'line',
      data: {
        labels: dates.map(date => new Date(date).toLocaleDateString('pt-BR')),
        datasets: [{
          label: 'Chamadas por Dia',
          data: calls,
          borderColor: '#1634FF',
          backgroundColor: 'rgba(22, 52, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📞 Chamadas por Dia',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // ⭐ GRÁFICO DE AVALIAÇÕES
  const createRatingsChart = (Chart) => {
    if (!chartRefs.ratingsChart.current || !data) return

    // Contar distribuição de notas
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    data.forEach(record => {
      if (record.rating_attendance && record.rating_attendance >= 1 && record.rating_attendance <= 5) {
        ratingDistribution[record.rating_attendance]++
      }
    })

    chartInstances.current.ratingsChart = new Chart(chartRefs.ratingsChart.current, {
      type: 'bar',
      data: {
        labels: ['⭐ 1', '⭐⭐ 2', '⭐⭐⭐ 3', '⭐⭐⭐⭐ 4', '⭐⭐⭐⭐⭐ 5'],
        datasets: [{
          label: 'Distribuição de Notas',
          data: Object.values(ratingDistribution),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '⭐ Distribuição de Avaliações',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // ⏱️ GRÁFICO DE DURAÇÃO
  const createDurationChart = (Chart) => {
    if (!chartRefs.durationChart.current || !data) return

    // Agrupar por faixas de duração
    const durationRanges = {
      '0-5 min': 0,
      '5-10 min': 0,
      '10-15 min': 0,
      '15-30 min': 0,
      '30+ min': 0
    }

    data.forEach(record => {
      const duration = record.duration_minutes || 0
      if (duration <= 5) durationRanges['0-5 min']++
      else if (duration <= 10) durationRanges['5-10 min']++
      else if (duration <= 15) durationRanges['10-15 min']++
      else if (duration <= 30) durationRanges['15-30 min']++
      else durationRanges['30+ min']++
    })

    chartInstances.current.durationChart = new Chart(chartRefs.durationChart.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(durationRanges),
        datasets: [{
          data: Object.values(durationRanges),
          backgroundColor: [
            '#1634FF',
            '#1694FF',
            '#15A237',
            '#FCC200',
            '#FF6B6B'
          ],
          borderColor: '#272A30',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '⏱️ Distribuição por Duração',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        }
      }
    })
  }

  // 👥 GRÁFICO DE OPERADORES
  const createOperatorsChart = (Chart) => {
    if (!chartRefs.operatorsChart.current || !operatorMetrics) return

    // Pegar top 10 operadores
    const operatorsArray = Object.entries(operatorMetrics).map(([name, metrics]) => ({
      name,
      ...metrics
    }))
    const topOperators = operatorsArray
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 10)

    chartInstances.current.operatorsChart = new Chart(chartRefs.operatorsChart.current, {
      type: 'bar',
      data: {
        labels: topOperators.map(op => op.name.length > 15 ? op.name.substring(0, 15) + '...' : op.name),
        datasets: [{
          label: 'Chamadas por Operador',
          data: topOperators.map(op => op.totalCalls),
          backgroundColor: 'rgba(22, 52, 255, 0.8)',
          borderColor: '#1634FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '👥 Top 10 Operadores por Chamadas',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // 📈 GRÁFICO DE TENDÊNCIA TEMPORAL
  const createTrendChart = (Chart) => {
    if (!chartRefs.trendChart.current || !data) return

    // Agrupar por semana
    const weeklyData = {}
    data.forEach(record => {
      if (record.date) {
        const date = new Date(record.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { calls: 0, avgRating: 0, ratingCount: 0 }
        }
        weeklyData[weekKey].calls += (record.call_count || 0)
        if (record.rating_attendance) {
          weeklyData[weekKey].avgRating += record.rating_attendance
          weeklyData[weekKey].ratingCount += 1
        }
      }
    })

    const weeks = Object.keys(weeklyData).sort()
    const calls = weeks.map(week => weeklyData[week].calls)
    const avgRatings = weeks.map(week => 
      weeklyData[week].ratingCount > 0 
        ? weeklyData[week].avgRating / weeklyData[week].ratingCount 
        : 0
    )

    chartInstances.current.trendChart = new Chart(chartRefs.trendChart.current, {
      type: 'line',
      data: {
        labels: weeks.map(week => new Date(week).toLocaleDateString('pt-BR')),
        datasets: [
          {
            label: 'Chamadas por Semana',
            data: calls,
            borderColor: '#1634FF',
            backgroundColor: 'rgba(22, 52, 255, 0.1)',
            yAxisID: 'y'
          },
          {
            label: 'Nota Média',
            data: avgRatings,
            borderColor: '#1694FF',
            backgroundColor: 'rgba(22, 148, 255, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📈 Tendência Semanal',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#B0B0B0' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    })
  }

  // 🕐 GRÁFICO DE DISTRIBUIÇÃO POR HORÁRIO
  const createHourlyChart = (Chart) => {
    if (!chartRefs.hourlyChart.current || !data) return

    const hourlyData = Array(24).fill(0)
    data.forEach(record => {
      if (record.date) {
        const date = new Date(record.date)
        const hour = date.getHours()
        hourlyData[hour] += (record.call_count || 0)
      }
    })

    chartInstances.current.hourlyChart = new Chart(chartRefs.hourlyChart.current, {
      type: 'bar',
      data: {
        labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        datasets: [{
          label: 'Chamadas por Hora',
          data: hourlyData,
          backgroundColor: '#1634FF',
          borderColor: '#1694FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '🕐 Distribuição de Chamadas por Horário',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // 🎯 GRÁFICO DE PERFORMANCE MULTIDIMENSIONAL
  const createPerformanceChart = (Chart) => {
    if (!chartRefs.performanceChart.current || !operatorMetrics) return

    const operatorsArray = Object.entries(operatorMetrics).map(([name, metrics]) => ({
      name,
      ...metrics
    }))
    const topOperators = operatorsArray
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 8)

    chartInstances.current.performanceChart = new Chart(chartRefs.performanceChart.current, {
      type: 'radar',
      data: {
        labels: ['Chamadas', 'Nota Atendimento', 'Nota Solução', 'Eficiência'],
        datasets: topOperators.map((op, index) => ({
          label: op.name,
          data: [
            Math.min(op.totalCalls / 50, 100), // Normalizado
            (op.avgRatingAttendance || 0) * 20, // 0-5 para 0-100
            (op.avgRatingSolution || 0) * 20,
            Math.max(0, 100 - (op.avgDuration || 0) * 2) // Menos tempo = mais eficiência
          ],
          borderColor: `hsl(${index * 45}, 70%, 50%)`,
          backgroundColor: `hsla(${index * 45}, 70%, 50%, 0.2)`,
          borderWidth: 2
        }))
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '🎯 Performance Multidimensional',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          r: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' },
            pointLabels: { color: '#F3F7FC' }
          }
        }
      }
    })
  }

  // 📉 GRÁFICO DE TAXA DE ABANDONO
  const createAbandonmentChart = (Chart) => {
    if (!chartRefs.abandonmentChart.current || !data) return

    // Analisar campo "Chamada" para identificar abandonos
    const callStatus = {}
    data.forEach(record => {
      const status = record.original_data?.Chamada || 'Atendida'
      callStatus[status] = (callStatus[status] || 0) + 1
    })

    const labels = Object.keys(callStatus)
    const values = Object.values(callStatus)
    const colors = labels.map(status => {
      if (status.toLowerCase().includes('abandon')) return '#FF6B6B'
      if (status.toLowerCase().includes('atend')) return '#4ECDC4'
      return '#45B7D1'
    })

    chartInstances.current.abandonmentChart = new Chart(chartRefs.abandonmentChart.current, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#272A30',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📉 Status das Chamadas',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        }
      }
    })
  }

  if (!data || data.length === 0) {
    return (
      <div className="charts-section">
        <div className="card">
          <h3>📊 Gráficos</h3>
          <p>Nenhum dado disponível para exibir gráficos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-section">
      <h2>📊 Análise Visual dos Dados</h2>
      
      <div className="charts-grid">
        <div className="card">
          <canvas ref={chartRefs.callsChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.ratingsChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.durationChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.operatorsChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.trendChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.hourlyChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.performanceChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.abandonmentChart}></canvas>
        </div>
      </div>
    </div>
  )
})

ChartsSection.displayName = 'ChartsSection'

export default ChartsSection