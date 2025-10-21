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
  // Processar dados de pausas
  const processedData = useMemo(() => {
    return processPausasData(data, periodo)
  }, [data, periodo])

  // Renderizar apenas o gráfico solicitado
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart(processedData)
      case 'pie':
        return renderPieChart(processedData)
      case 'operators':
        return renderOperatorsChart(processedData)
      default:
        return renderBarChart(processedData)
    }
  }

  return (
    <div className="pausas-chart-container">
      {renderChart()}
    </div>
  )
}

// Renderizar gráfico de barras
const renderBarChart = (processedData) => {
  const barChartData = {
    labels: processedData.periodos,
    datasets: [
      {
        label: 'Total de Pausas',
        data: processedData.periodos.map(periodo => processedData.pausasPorPeriodo[periodo] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const barOptions = {
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
            return `📅 ${context[0].label}`
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

  return <Bar data={barChartData} options={barOptions} />
}

// Renderizar gráfico de pizza
const renderPieChart = (processedData) => {
  const pieChartData = {
    labels: processedData.motivos,
    datasets: [
      {
        data: processedData.motivos.map(motivo => processedData.pausasPorMotivo[motivo] || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(20, 184, 166, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(20, 184, 166, 1)'
        ],
        borderWidth: 2
      }
    ]
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return `⏸️ ${context[0].label}`
          },
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
            const percentual = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0
            return `Pausas: ${context.parsed} (${percentual}%)`
          }
        }
      }
    }
  }

  return <Pie data={pieChartData} options={pieOptions} />
}

// Renderizar gráfico de operadores
const renderOperatorsChart = (processedData) => {
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
const processPausasData = (data, periodo) => {

  if (!data || data.length === 0) {
    return {
      totalPausas: 0,
      tempoTotalPausa: 0,
      duracaoMedia: 0,
      pausasPorPeriodo: {},
      pausasPorMotivo: {},
      pausasPorOperador: {},
      periodos: [],
      motivos: [],
      operadores: []
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

  // Função para obter chave do período (dia/mês)
  const getPeriodoKey = (dataInicial) => {
    try {
      const date = parseBrazilianDate(dataInicial)
      if (!date) return 'Data inválida'
      
      const dia = date.getDate()
      const mes = date.getMonth() + 1
      return `${dia}/${mes}`
    } catch (error) {
      return 'Data inválida'
    }
  }

  let totalPausas = 0
  let tempoTotalPausa = 0
  const pausasPorPeriodo = {}
  const pausasPorMotivo = {}
  const pausasPorOperador = {}

  // Encontrar onde começam os dados reais (não cabeçalhos)
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
      const horarioInicio = String(row[11] || '').trim() // Coluna L (índice 11)
      const dataFinal = String(row[12] || '').trim() // Coluna M (índice 12)
      const horarioFim = String(row[13] || '').trim() // Coluna N (índice 13)
      const duracao = String(row[14] || '').trim() // Coluna O (índice 14)
      const motivoPausa = String(row[15] || '').trim() // Coluna P (índice 15)
      

      // Verificar se é uma linha de pausa válida (atividade = "em pausa")
      if (operador && atividade.toLowerCase() === 'em pausa' && motivoPausa && duracao) {
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(dataInicial)) {
          return
        }

        totalPausas++
        
        const duracaoMinutos = duracaoParaMinutos(duracao)
        tempoTotalPausa += duracaoMinutos

        // Contar por período
        const periodoKey = getPeriodoKey(dataInicial)
        pausasPorPeriodo[periodoKey] = (pausasPorPeriodo[periodoKey] || 0) + 1

        // Contar por motivo
        pausasPorMotivo[motivoPausa] = (pausasPorMotivo[motivoPausa] || 0) + 1

        // Contar por operador
        pausasPorOperador[operador] = (pausasPorOperador[operador] || 0) + 1

      }
    }
  })

  const duracaoMedia = totalPausas > 0 ? (tempoTotalPausa / totalPausas) : 0

  const result = {
    totalPausas,
    tempoTotalPausa,
    duracaoMedia,
    pausasPorPeriodo,
    pausasPorMotivo,
    pausasPorOperador,
    periodos: Object.keys(pausasPorPeriodo).sort(),
    motivos: Object.keys(pausasPorMotivo).sort(),
    operadores: Object.keys(pausasPorOperador).sort()
  }

  return result
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
