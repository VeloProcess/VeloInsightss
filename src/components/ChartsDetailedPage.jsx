import React, { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { useTheme } from '../hooks/useTheme'
import PersonalCharts from './PersonalCharts'
import ModernChartsDashboard from './ModernChartsDashboard'
import { 
  calcEvolucaoAtendimentos, 
  calcTopOperadores, 
  calcPerformanceMelhores, 
  calcRankingQualidade 
} from '../utils/dataProcessor'
import './ChartsDetailedPage.css'

const ChartsDetailedPage = ({ data, operatorMetrics, rankings, selectedPeriod, pauseData }) => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('modern')
  
  const chartRefs = {
    callsChart: useRef(null),
    ratingsChart: useRef(null),
    durationChart: useRef(null),
    hourlyChart: useRef(null),
    rankingChart: useRef(null),
    trendChart: useRef(null),
    // Gráficos avançados
    evolucaoAtendimentos: useRef(null),
    topOperadores: useRef(null),
    performanceMelhores: useRef(null),
    rankingQualidade: useRef(null)
  }

  const chartInstances = useRef({})

  // Cores dinâmicas baseadas no tema
  const getChartColors = () => {
    // Forçar detecção do tema do DOM
    const isDarkTheme = document.body.classList.contains('theme-dark')
    
    if (!isDarkTheme) {
      return {
        text: '#000000',
        textSecondary: '#333333',
        grid: '#E5E7EB',
        ticks: '#666666'
      }
    } else {
      return {
        text: '#FFFFFF',
        textSecondary: '#FFFFFF',
        grid: '#404040',
        ticks: '#FFFFFF'
      }
    }
  }

  // Função para parsear datas brasileiras
  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null
    
    try {
      if (dateString.includes('T') || dateString.includes('-')) {
        return new Date(dateString)
      }
      
      const [day, month, year] = dateString.split('/')
      return new Date(year, month - 1, day)
    } catch (error) {
      console.warn('Erro ao parsear data:', dateString, error)
      return null
    }
  }

  // Função para converter tempo para minutos
  const tempoParaMinutos = (tempo) => {
    if (!tempo || tempo === '00:00:00') return 0
    if (typeof tempo === 'number') return tempo
    
    try {
      const [horas, minutos, segundos] = tempo.split(':').map(Number)
      return horas * 60 + minutos + segundos / 60
    } catch (error) {
      console.warn('Erro ao converter tempo:', tempo, error)
      return 0
    }
  }

  // Gráfico de Chamadas por Dia
  const createCallsChart = () => {
    if (!chartRefs.callsChart.current || !data) return

    const colors = getChartColors()
    const dailyData = {}
    data.forEach(record => {
      if (record.data) {
        const date = parseBrazilianDate(record.data)
        if (date && !isNaN(date.getTime())) {
          const dateKey = date.toISOString().split('T')[0]
          dailyData[dateKey] = (dailyData[dateKey] || 0) + 1
        }
      }
    })

    const dates = Object.keys(dailyData).sort()
    const calls = dates.map(date => dailyData[date])

    chartInstances.current.callsChart = new Chart(chartRefs.callsChart.current, {
      type: 'line',
      data: {
        labels: dates.map(date => new Date(date).toLocaleDateString('pt-BR')),
        datasets: [{
          label: '📞 Total de Chamadas',
          data: calls,
          borderColor: '#1634FF',
          backgroundColor: 'rgba(22, 52, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '📞 Chamadas por Dia',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          }
        }
      }
    })
  }

  // Gráfico de Notas por Operador
  const createRatingsChart = () => {
    if (!chartRefs.ratingsChart.current || !operatorMetrics) return

    const colors = getChartColors()
    const operatorMetricsArray = Object.values(operatorMetrics)
    const topOperators = operatorMetricsArray
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
      .sort((a, b) => (b.avgRatingAttendance || 0) - (a.avgRatingAttendance || 0))
      .slice(0, 10)

    const labels = topOperators.map(op => 
      op.operator.length > 12 ? op.operator.substring(0, 12) + '...' : op.operator
    )
    const attendanceRatings = topOperators.map(op => op.avgRatingAttendance || 0)
    const solutionRatings = topOperators.map(op => op.avgRatingSolution || 0)

    chartInstances.current.ratingsChart = new Chart(chartRefs.ratingsChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '⭐ Nota Atendimento',
            data: attendanceRatings,
            backgroundColor: 'rgba(252, 194, 0, 0.8)',
            borderColor: '#FCC200',
            borderWidth: 1
          },
          {
            label: '🎯 Nota Solução',
            data: solutionRatings,
            backgroundColor: 'rgba(21, 162, 55, 0.8)',
            borderColor: '#15A237',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '⭐ Notas por Operador (Top 10)',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid },
            min: 0,
            max: 5
          }
        }
      }
    })
  }

  // Gráfico de Duração Média
  const createDurationChart = () => {
    if (!chartRefs.durationChart.current || !operatorMetrics) return

    const colors = getChartColors()
    const operatorMetricsArray = Object.values(operatorMetrics)
    const topOperators = operatorMetricsArray
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
      .sort((a, b) => (a.avgDuration || 0) - (b.avgDuration || 0))
      .slice(0, 10)

    const labels = topOperators.map(op => 
      op.operator.length > 12 ? op.operator.substring(0, 12) + '...' : op.operator
    )
    const durations = topOperators.map(op => op.avgDuration || 0)

    chartInstances.current.durationChart = new Chart(chartRefs.durationChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '⏱️ Duração Média (min)',
          data: durations,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: '#FF6B6B',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '⏱️ Duração Média por Operador (Top 10)',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          }
        }
      }
    })
  }

  // Gráfico de Chamadas por Hora
  const createHourlyChart = () => {
    if (!chartRefs.hourlyChart.current || !data) return

    const colors = getChartColors()
    const hourlyData = Array(24).fill(0)
    data.forEach(record => {
      if (record.hora) {
        try {
          const [hour] = record.hora.split(':')
          const hourIndex = parseInt(hour)
          if (hourIndex >= 0 && hourIndex <= 23) {
            hourlyData[hourIndex] += 1
          }
        } catch (error) {
          console.warn('Hora inválida encontrada:', record.hora, error)
        }
      }
    })

    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

    chartInstances.current.hourlyChart = new Chart(chartRefs.hourlyChart.current, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          label: '📞 Chamadas por Hora',
          data: hourlyData,
          backgroundColor: 'rgba(22, 148, 255, 0.8)',
          borderColor: '#1694FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '🕐 Chamadas por Hora do Dia',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          }
        }
      }
    })
  }

  // Gráfico de Ranking
  const createRankingChart = () => {
    if (!chartRefs.rankingChart.current || !rankings) return

    const colors = getChartColors()
    const topRankings = rankings
      .filter(r => r.operator && !r.operator.toLowerCase().includes('sem operador'))
      .slice(0, 10)

    const labels = topRankings.map(r => 
      r.operator.length > 12 ? r.operator.substring(0, 12) + '...' : r.operator
    )
    const scores = topRankings.map(r => r.score || 0)

    chartInstances.current.rankingChart = new Chart(chartRefs.rankingChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '🏆 Score de Performance',
          data: scores,
          backgroundColor: scores.map((_, index) => {
            const colors = [
              'rgba(255, 215, 0, 0.8)',   // Ouro
              'rgba(192, 192, 192, 0.8)', // Prata
              'rgba(205, 127, 50, 0.8)',  // Bronze
              'rgba(22, 52, 255, 0.8)',   // Azul
              'rgba(22, 148, 255, 0.8)',  // Azul claro
              'rgba(21, 162, 55, 0.8)',   // Verde
              'rgba(252, 194, 0, 0.8)',   // Amarelo
              'rgba(255, 107, 107, 0.8)', // Vermelho
              'rgba(138, 43, 226, 0.8)',   // Roxo
              'rgba(255, 165, 0, 0.8)'    // Laranja
            ]
            return colors[index] || 'rgba(22, 52, 255, 0.8)'
          }),
          borderColor: scores.map((_, index) => {
            const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#1634FF', '#1694FF', '#15A237', '#FCC200', '#FF6B6B', '#8A2BE2', '#FFA500']
            return colors[index] || '#1634FF'
          }),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '🏆 Ranking de Performance (Top 10)',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          }
        }
      }
    })
  }

  // Gráfico de Tendência Semanal
  const createTrendChart = () => {
    if (!chartRefs.trendChart.current || !data) return

    const colors = getChartColors()
    const getWeekStart = (date) => {
      const weekStart = new Date(date)
      const day = weekStart.getDay()
      const diff = day === 0 ? -6 : 1 - day
      weekStart.setDate(weekStart.getDate() + diff)
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    }

    const weeklyData = {}
    data.forEach(record => {
      if (record.data) {
        const date = parseBrazilianDate(record.data)
        if (date && !isNaN(date.getTime())) {
          const weekStart = getWeekStart(date)
          const weekKey = weekStart.toISOString().split('T')[0]
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              calls: 0,
              atendidas: 0,
              abandonadas: 0,
              totalRating: 0,
              ratingCount: 0
            }
          }
          
          weeklyData[weekKey].calls += 1
          
          if (record.chamada) {
            const chamada = record.chamada.toLowerCase()
            if (chamada.includes('abandonada')) {
              weeklyData[weekKey].abandonadas += 1
            } else {
              weeklyData[weekKey].atendidas += 1
            }
          }
          
          if (record.notaAtendimento) {
            weeklyData[weekKey].totalRating += record.notaAtendimento
            weeklyData[weekKey].ratingCount += 1
          }
        }
      }
    })

    const weeks = Object.keys(weeklyData).sort()
    const calls = weeks.map(week => weeklyData[week].calls)
    const atendidas = weeks.map(week => weeklyData[week].atendidas)
    const abandonadas = weeks.map(week => weeklyData[week].abandonadas)
    const avgRatings = weeks.map(week => 
      weeklyData[week].ratingCount > 0 
        ? (weeklyData[week].totalRating / weeklyData[week].ratingCount).toFixed(1)
        : 0
    )

    chartInstances.current.trendChart = new Chart(chartRefs.trendChart.current, {
      type: 'line',
      data: {
        labels: weeks.map(week => `Sem ${new Date(week).getDate()}/${new Date(week).getMonth() + 1}`),
        datasets: [
          {
            label: '📞 Total de Chamadas',
            data: calls,
            borderColor: '#1634FF',
            backgroundColor: 'rgba(22, 52, 255, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: '✅ Chamadas Atendidas',
            data: atendidas,
            borderColor: '#15A237',
            backgroundColor: 'rgba(21, 162, 55, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '❌ Chamadas Abandonadas',
            data: abandonadas,
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '⭐ Nota Média',
            data: avgRatings,
            borderColor: '#FCC200',
            backgroundColor: 'rgba(252, 194, 0, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '📈 Tendência Semanal - Análise Completa',
            color: colors.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: colors.ticks },
            grid: { drawOnChartArea: false }
          }
        }
      }
    })
  }

  // Criar todos os gráficos
  useEffect(() => {
    if (data && operatorMetrics && rankings) {
      // Destruir gráficos existentes
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy()
      })

      // Criar novos gráficos
      createCallsChart()
      createRatingsChart()
      createDurationChart()
      createHourlyChart()
      createRankingChart()
      createTrendChart()
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy()
      })
    }
  }, [data, operatorMetrics, rankings, selectedPeriod, theme])

  // Listener para mudanças de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (data && operatorMetrics && rankings) {
        // Destruir gráficos existentes
        Object.values(chartInstances.current).forEach(chart => {
          if (chart) chart.destroy()
        })

        // Criar novos gráficos
        createCallsChart()
        createRatingsChart()
        createDurationChart()
        createHourlyChart()
        createRankingChart()
        createTrendChart()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [data, operatorMetrics, rankings])

  // useEffect para gráficos avançados
  useEffect(() => {
    if (activeTab === 'advanced' && data && operatorMetrics) {
      // Destruir gráficos avançados existentes
      const advancedChartRefs = [
        chartRefs.evolucaoAtendimentos,
        chartRefs.topOperadores,
        chartRefs.performanceMelhores,
        chartRefs.rankingQualidade
      ]
      advancedChartRefs.forEach(ref => {
        if (ref.current) {
          const chart = Chart.getChart(ref.current)
          if (chart) chart.destroy()
        }
      })

      // Criar gráficos avançados
      setTimeout(() => {
        createAdvancedCharts()
      }, 100)
    }
  }, [activeTab, data, operatorMetrics, theme])

  const createAdvancedCharts = () => {
    if (!data || !operatorMetrics) {
      console.log('❌ Dados não disponíveis para gráficos avançados:', { data: !!data, operatorMetrics: !!operatorMetrics })
      return
    }

    console.log('🎨 Criando gráficos avançados...', { 
      dataLength: data.length, 
      operatorMetricsCount: Object.keys(operatorMetrics).length,
      firstDataItem: data[0],
      operatorMetricsKeys: Object.keys(operatorMetrics).slice(0, 3)
    })

    // Cores baseadas no tema
    const colors = theme === 'dark' ? {
      text: '#E5E7EB',
      ticks: '#9CA3AF',
      grid: 'rgba(156, 163, 175, 0.1)',
      primary: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6'
    } : {
      text: '#374151',
      ticks: '#6B7280',
      grid: 'rgba(107, 114, 128, 0.1)',
      primary: '#1634FF',
      light: '#1694FF',
      dark: '#000058'
    }

    // 1. Gráfico de Evolução dos Atendimentos
    console.log('📈 Criando gráfico de evolução...')
    const evolucaoData = calcEvolucaoAtendimentos(data)
    console.log('📈 Dados de evolução:', evolucaoData)
    if (chartRefs.evolucaoAtendimentos.current) {
      console.log('📈 Canvas encontrado, criando gráfico...')
      new Chart(chartRefs.evolucaoAtendimentos.current, {
        type: 'line',
        data: evolucaoData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: true,
              labels: { color: colors.text }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            x: { 
              display: true,
              ticks: { color: colors.ticks },
              grid: { color: colors.grid }
            },
            y: { 
              display: true,
              beginAtZero: true,
              ticks: { color: colors.ticks },
              grid: { color: colors.grid }
            }
          }
        }
      })
      console.log('✅ Gráfico de evolução criado!')
    } else {
      console.log('❌ Canvas não encontrado para evolução')
    }

    // 2. Gráfico de Top Operadores
    console.log('🏆 Criando gráfico de top operadores...')
    const topData = calcTopOperadores(operatorMetrics, 5)
    console.log('🏆 Dados de top operadores:', topData)
    if (chartRefs.topOperadores.current) {
      console.log('🏆 Canvas encontrado, criando gráfico...')
      new Chart(chartRefs.topOperadores.current, {
        type: 'bar',
        data: topData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { 
              display: true,
              labels: { color: colors.text }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            x: { 
              display: true,
              beginAtZero: true,
              ticks: { color: colors.ticks },
              grid: { color: colors.grid }
            },
            y: { 
              display: true,
              ticks: { color: colors.ticks },
              grid: { color: colors.grid }
            }
          }
        }
      })
      console.log('✅ Gráfico de top operadores criado!')
    } else {
      console.log('❌ Canvas não encontrado para top operadores')
    }

    // 3. Gráfico de Performance dos Melhores
    const perfData = calcPerformanceMelhores(operatorMetrics, 5)
    if (chartRefs.performanceMelhores.current) {
      new Chart(chartRefs.performanceMelhores.current, {
        type: 'bar',
        data: perfData,
        options: {
          ...perfData.options,
          plugins: {
            ...perfData.options.plugins,
            legend: { 
              ...perfData.options.plugins.legend,
              labels: { 
                ...perfData.options.plugins.legend.labels,
                color: colors.text 
              } 
            },
            tooltip: {
              ...perfData.options.plugins.tooltip,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            x: { 
              ...perfData.options.scales.x,
              ticks: { 
                ...perfData.options.scales.x.ticks,
                color: colors.ticks 
              }, 
              grid: { 
                ...perfData.options.scales.x.grid,
                color: colors.grid 
              } 
            },
            y: { 
              ...perfData.options.scales.y,
              ticks: { 
                ...perfData.options.scales.y.ticks,
                color: colors.ticks 
              }, 
              grid: { 
                ...perfData.options.scales.y.grid,
                color: colors.grid 
              } 
            }
          }
        }
      })
    }

    // 4. Gráfico de Ranking de Qualidade
    const rankingData = calcRankingQualidade(operatorMetrics)
    if (chartRefs.rankingQualidade.current) {
      new Chart(chartRefs.rankingQualidade.current, {
        type: 'bar',
        data: rankingData,
        options: {
          ...rankingData.options,
          plugins: {
            ...rankingData.options.plugins,
            legend: { 
              ...rankingData.options.plugins.legend,
              labels: { 
                ...rankingData.options.plugins.legend.labels,
                color: colors.text 
              } 
            },
            tooltip: {
              ...rankingData.options.plugins.tooltip,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            x: { 
              ...rankingData.options.scales.x,
              ticks: { 
                ...rankingData.options.scales.x.ticks,
                color: colors.ticks 
              }, 
              grid: { 
                ...rankingData.options.scales.x.grid,
                color: colors.grid 
              } 
            },
            y: { 
              ...rankingData.options.scales.y,
              ticks: { 
                ...rankingData.options.scales.y.ticks,
                color: colors.ticks 
              }, 
              grid: { 
                ...rankingData.options.scales.y.grid,
                color: colors.grid 
              } 
            }
          }
        }
      })
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="charts-page">
        <div className="charts-header">
          <h2>📈 Gráficos Detalhados</h2>
          <p>Carregando dados para análise visual...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-page">
      <div className="charts-header">
        <h2>📈 Gráficos Detalhados</h2>
        <p>Análise visual completa dos dados de atendimento</p>
        {selectedPeriod && (
          <div className="period-info">
            <span>📅 Período: {selectedPeriod.startDate} a {selectedPeriod.endDate}</span>
          </div>
        )}
      </div>

      {/* Abas de Navegação */}
      <div className="charts-tabs">
        <button 
          className={`tab-button ${activeTab === 'modern' ? 'active' : ''}`}
          onClick={() => setActiveTab('modern')}
        >
          🚀 Dashboard Moderno
        </button>
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          📊 Gráficos Gerais
        </button>
        <button 
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          🎯 Análise Personalizada
        </button>
        <button 
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          📈 Gráficos Avançados
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'modern' && (
        <ModernChartsDashboard 
          data={data}
          operatorMetrics={operatorMetrics}
          rankings={rankings}
          selectedPeriod={selectedPeriod}
        />
      )}
      
      {activeTab === 'general' && (
        <div className="general-charts">
          <div className="charts-grid">
        {/* Gráfico de Chamadas por Dia */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📞 Chamadas por Dia</h3>
            <p>Evolução diária do volume de chamadas</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.callsChart}></canvas>
          </div>
        </div>

        {/* Gráfico de Notas por Operador */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>⭐ Notas por Operador</h3>
            <p>Top 10 operadores com melhores avaliações</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.ratingsChart}></canvas>
          </div>
        </div>

        {/* Gráfico de Duração Média */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>⏱️ Duração Média</h3>
            <p>Top 10 operadores com menor tempo de atendimento</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.durationChart}></canvas>
          </div>
        </div>

        {/* Gráfico de Chamadas por Hora */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📞 Chamadas por Hora</h3>
            <p>Distribuição de chamadas ao longo do dia</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.hourlyChart}></canvas>
          </div>
        </div>

        {/* Gráfico de Ranking */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🏆 Ranking de Performance</h3>
            <p>Top 10 operadores por score de performance</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.rankingChart}></canvas>
          </div>
        </div>

        {/* Gráfico de Tendência Semanal */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>✔️ Tendência Semanal</h3>
            <p>Análise completa da evolução semanal</p>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.trendChart}></canvas>
          </div>
        </div>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <PersonalCharts data={data} pauseData={pauseData} />
      )}

      {activeTab === 'advanced' && (
        <div className="advanced-charts">
          <div className="charts-grid">
            {/* Gráfico de Evolução dos Atendimentos */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>📈 Evolução dos Atendimentos</h3>
                <p>Linha temporal diária com zoom e drill-down</p>
              </div>
              <div className="chart-container">
                <canvas ref={chartRefs.evolucaoAtendimentos} id="evolucaoAtendimentos"></canvas>
              </div>
            </div>

            {/* Gráfico de Top Operadores */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>🏆 Top Operadores</h3>
                <p>Top 5 operadores por total de atendimentos</p>
              </div>
              <div className="chart-container">
                <canvas ref={chartRefs.topOperadores} id="topOperadores"></canvas>
              </div>
            </div>

            {/* Gráfico de Performance dos Melhores */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>📊 Performance dos Melhores</h3>
                <p>Multi-barra com TMA, Nota Atendimento e Nota Solução</p>
              </div>
              <div className="chart-container">
                <canvas ref={chartRefs.performanceMelhores} id="performanceMelhores"></canvas>
              </div>
            </div>

            {/* Gráfico de Ranking de Qualidade */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>🎯 Ranking de Qualidade</h3>
                <p>Score de qualidade baseado na fórmula oficial</p>
              </div>
              <div className="chart-container">
                <canvas ref={chartRefs.rankingQualidade} id="rankingQualidade"></canvas>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartsDetailedPage
