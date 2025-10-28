import React, { useMemo } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const PausasChart = ({ data = [], periodo = null, chartType = 'bar' }) => {
  // Processar dados de TML e TMP
  const processedData = useMemo(() => {
    return processTMLTMPData(data, periodo)
  }, [data, periodo])

  // Renderizar apenas o gráfico solicitado
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderTMLTMPChart(processedData)
      case 'pie':
        return renderPieChart(processedData)
      case 'operators':
        return renderOperatorsChart(processedData)
      default:
        return renderTMLTMPChart(processedData)
    }
  }

  return (
    <div className="pausas-chart-container">
      {renderChart()}
    </div>
  )
}

// Renderizar gráfico de barras
const renderTMLTMPChart = (processedData) => {
  // Verificar se há dados para exibir
  if (!processedData.dias || processedData.dias.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Nenhum dado disponível para exibir o gráfico TML & TMP</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Verifique se há dados de pausas agrupados por mês
        </p>
      </div>
    )
  }

  // Função para converter minutos para formato HH:MM:SS
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00'
    
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const barChartData = {
    labels: processedData.dias,
    datasets: [
      {
        label: 'Tempo Logado (TML)',
        data: processedData.dias.map(dia => processedData.tempoLogadoPorDia[dia] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Tempo Pausado (TMP)',
        data: processedData.dias.map(dia => processedData.tempoPausadoPorDia[dia] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
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
            size: 20,
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
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return `📅 ${context[0].label}`
          },
          label: function(context) {
            const time = formatMinutesToTime(context.parsed.y)
            const label = context.dataset.label
            return `${label}: ${time}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 18,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 18,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 15,
          callback: function(value) {
            return formatMinutesToTime(value)
          }
        }
      }
    }
  }

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Bar data={barChartData} options={barOptions} />
    </div>
  )
}

// Renderizar gráfico de barras verticais para motivos de pausa
const renderPieChart = (processedData) => {
  // Verificar se os dados necessários existem
  if (!processedData.motivos || !Array.isArray(processedData.motivos) || !processedData.pausasPorMotivo) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Nenhum dado de motivos de pausa disponível</p>
      </div>
    )
  }

  // Calcular total para porcentagem
  const totalPausas = processedData.motivos.reduce((total, motivo) => 
    total + (processedData.pausasPorMotivo[motivo] || 0), 0
  )

  const barChartData = {
    labels: processedData.motivos,
    datasets: [
      {
        label: 'Quantidade',
        data: processedData.motivos.map(motivo => processedData.pausasPorMotivo[motivo] || 0),
        backgroundColor: [
          'rgba(99, 102, 241, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(236, 72, 153, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(249, 115, 22, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(20, 184, 166, 0.9)'
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)'
        ],
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Barras verticais
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const motivo = context.label
            const quantidade = context.parsed.y
            const percentage = ((quantidade / totalPausas) * 100).toFixed(1)
            return `${motivo}: ${quantidade} pausas (${percentage}%)`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 20,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 20,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          callback: function(value) {
            return value + ' pausas'
          }
        }
      }
    }
  }

  return <Bar data={barChartData} options={barOptions} />
}

// Renderizar gráfico de operadores
const renderOperatorsChart = (processedData) => {
  // Verificar se os dados necessários existem
  if (!processedData.operadores || !Array.isArray(processedData.operadores)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Nenhum dado de operadores disponível</p>
      </div>
    )
  }

  const operatorsData = {
    labels: processedData.operadores.slice(0, 10), // Top 10 operadores
    datasets: [
      {
        label: 'Pausas por Operador',
        data: processedData.operadores.slice(0, 10).map(operador => processedData.pausasPorOperador[operador] || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const operatorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return `👤 ${context[0].label}`
          },
          label: function(context) {
            return `⏸️ Pausas: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return <Bar data={operatorsData} options={operatorsOptions} />
}

// Processar dados de pausas
const processTMLTMPData = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      dias: [],
      tempoLogadoPorDia: {},
      tempoPausadoPorDia: {},
      tempoMedioLogado: 0,
      tempoMedioPausado: 0,
      totalDias: 0
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (dataInicial) => {
    if (!periodo) return true
    
    try {
      const rowDate = parseBrazilianDate(dataInicial)
      if (!rowDate) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return rowDate >= startDate && rowDate <= endDate
    } catch (error) {
      return true
    }
  }

  // Função para converter duração (formato HH:MM:SS) para minutos
  const duracaoParaMinutos = (duracao) => {
    if (!duracao) return 0
    
    const partes = duracao.split(':')
    if (partes.length === 3) {
      const horas = parseInt(partes[0]) || 0
      const minutos = parseInt(partes[1]) || 0
      const segundos = parseInt(partes[2]) || 0
      return horas * 60 + minutos + (segundos / 60)
    }
    
    return parseFloat(duracao) || 0
  }

  // Função para obter chave do mês
  const getMesKey = (dataInicial) => {
    try {
      const date = parseBrazilianDate(dataInicial)
      if (!date) return 'Data inválida'
      
      const mes = date.getMonth() + 1
      const ano = date.getFullYear()
      return `${mes}/${ano}`
    } catch (error) {
      return 'Data inválida'
    }
  }

  const tempoLogadoPorMes = {}
  const tempoPausadoPorMes = {}
  const mesesSet = new Set()

  // Se os dados são objetos (estrutura de pausas processadas)
  if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
    data.forEach((pausa) => {
      if (pausa.dataInicial && pausa.duracao) {
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(pausa.dataInicial)) {
          return
        }

        const mesKey = getMesKey(pausa.dataInicial)
        mesesSet.add(mesKey)
        
        const duracaoMinutos = duracaoParaMinutos(pausa.duracao)

        // Se é uma pausa, adiciona ao tempo pausado
        tempoPausadoPorMes[mesKey] = (tempoPausadoPorMes[mesKey] || 0) + duracaoMinutos
        
        // Para tempo logado, vamos assumir que há tempo logado baseado na jornada
        // Vamos calcular um tempo logado estimado (8 horas por dia menos pausas)
        const jornadaMinutos = 8 * 60 // 8 horas em minutos
        const tempoLogadoEstimado = jornadaMinutos - (tempoPausadoPorMes[mesKey] || 0)
        tempoLogadoPorMes[mesKey] = Math.max(0, tempoLogadoEstimado)
      }
    })
  } else {
    // Estrutura original (array de arrays)
    let dataStartIndex = 14 // Padrão: linha 15 (índice 14)
    
    // Procurar por uma linha que tenha dados válidos
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i]
      if (Array.isArray(row) && row.length > 15) {
        const operador = String(row[0] || '').trim()
        const atividade = String(row[9] || '').trim()
        
        // Se encontrou uma linha com operador e atividade válidos, usar como início
        if (operador && atividade && operador !== 'Operador' && atividade !== 'Atividade') {
          dataStartIndex = i
          break
        }
      }
    }

    // Processar dados a partir do índice encontrado
    data.slice(dataStartIndex).forEach((row, index) => {
      if (Array.isArray(row) && row.length > 15) {
        const operador = String(row[0] || '').trim() // Coluna A (índice 0)
        const atividade = String(row[9] || '').trim() // Coluna J (índice 9)
        const dataInicial = String(row[10] || '').trim() // Coluna K (índice 10)
        const duracao = String(row[15] || '').trim() // Coluna P - DuracaoCalculo
        
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(dataInicial)) {
          return
        }

        const mesKey = getMesKey(dataInicial)
        mesesSet.add(mesKey)
        
        const duracaoMinutos = duracaoParaMinutos(duracao)

        // Processar por tipo de atividade
        if (atividade.toLowerCase() === 'online') {
          // Tempo logado
          tempoLogadoPorMes[mesKey] = (tempoLogadoPorMes[mesKey] || 0) + duracaoMinutos
        } else if (atividade.toLowerCase() === 'em pausa') {
          // Tempo pausado
          tempoPausadoPorMes[mesKey] = (tempoPausadoPorMes[mesKey] || 0) + duracaoMinutos
        }
      }
    })
  }

  const meses = Array.from(mesesSet).sort()
  const totalMeses = meses.length

  // Calcular médias
  const tempoTotalLogado = Object.values(tempoLogadoPorMes).reduce((sum, time) => sum + time, 0)
  const tempoTotalPausado = Object.values(tempoPausadoPorMes).reduce((sum, time) => sum + time, 0)
  
  const tempoMedioLogado = totalMeses > 0 ? tempoTotalLogado / totalMeses : 0
  const tempoMedioPausado = totalMeses > 0 ? tempoTotalPausado / totalMeses : 0

  return {
    dias: meses, // Mantendo o nome 'dias' para compatibilidade com o componente
    tempoLogadoPorDia: tempoLogadoPorMes, // Mantendo o nome para compatibilidade
    tempoPausadoPorDia: tempoPausadoPorMes, // Mantendo o nome para compatibilidade
    tempoMedioLogado,
    tempoMedioPausado,
    totalDias: totalMeses // Mantendo o nome para compatibilidade
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

export default PausasChart
