import React from 'react'
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
import './PausasSection.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const PausasSection = ({ pausasData, periodo }) => {
  // Função para parsear data brasileira (DD/MM/YYYY)
  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null
    
    try {
      // Remove espaços e caracteres extras
      const cleanDate = dateString.trim()
      
      // Tenta diferentes formatos
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ]
      
      for (const format of formats) {
        const match = cleanDate.match(format)
        if (match) {
          let day, month, year
          
          if (format === formats[2]) { // YYYY-MM-DD
            [, year, month, day] = match
          } else { // DD/MM/YYYY ou DD/MM/YY
            [, day, month, year] = match
            if (year.length === 2) {
              year = '20' + year
            }
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
      
      return null
    } catch (error) {
      console.log('❌ Erro ao parsear data:', dateString, error)
      return null
    }
  }

  // Processar dados de TML e TMP
  const processedData = React.useMemo(() => {
    if (!pausasData || pausasData.length === 0) {
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

    // Função para obter chave do dia
    const getDiaKey = (dataInicial) => {
      try {
        const date = parseBrazilianDate(dataInicial)
        if (!date) return 'Data inválida'
        
        const dia = date.getDate()
        const mes = date.getMonth() + 1
        const ano = date.getFullYear()
        return `${dia}/${mes}/${ano}`
      } catch (error) {
        return 'Data inválida'
      }
    }

    const tempoLogadoPorMes = {}
    const tempoPausadoPorMes = {}
    const mesesSet = new Set()

    // Se os dados são objetos (estrutura de pausas processadas)
    if (pausasData.length > 0 && typeof pausasData[0] === 'object' && !Array.isArray(pausasData[0])) {
      // Estrutura para armazenar dados por operador e mês
      const dadosPorOperadorMes = {}
      
      pausasData.forEach((pausa) => {
        if (pausa.dataInicial && pausa.duracao && pausa.operador) {
          if (!isDateInPeriod(pausa.dataInicial)) {
            return
          }

          const mesKey = getMesKey(pausa.dataInicial)
          const operador = pausa.operador.trim()
          
          if (!dadosPorOperadorMes[mesKey]) {
            dadosPorOperadorMes[mesKey] = {}
          }
          
          if (!dadosPorOperadorMes[mesKey][operador]) {
            dadosPorOperadorMes[mesKey][operador] = {
              tempoLogado: 0,
              tempoPausado: 0
            }
          }
          
          mesesSet.add(mesKey)
          
          const duracaoMinutos = duracaoParaMinutos(pausa.duracao)

          // Se é uma pausa, adiciona ao tempo pausado
          dadosPorOperadorMes[mesKey][operador].tempoPausado += duracaoMinutos
          
          // Para tempo logado, vamos assumir que há tempo logado baseado na jornada
          const jornadaMinutos = 8 * 60 // 8 horas em minutos
          const tempoLogadoEstimado = jornadaMinutos - dadosPorOperadorMes[mesKey][operador].tempoPausado
          dadosPorOperadorMes[mesKey][operador].tempoLogado = Math.max(0, tempoLogadoEstimado)
        }
      })
      
      // Calcular médias por mês (média dos operadores)
      Object.keys(dadosPorOperadorMes).forEach(mesKey => {
        const operadoresDoMes = Object.keys(dadosPorOperadorMes[mesKey])
        const totalOperadores = operadoresDoMes.length
        
        if (totalOperadores > 0) {
          const tempoTotalLogado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMes[mesKey][operador].tempoLogado, 0)
          const tempoTotalPausado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMes[mesKey][operador].tempoPausado, 0)
          
          // Média por operador do mês (em minutos)
          const mediaLogadoPorOperador = tempoTotalLogado / totalOperadores
          const mediaPausadoPorOperador = tempoTotalPausado / totalOperadores
          
          tempoLogadoPorMes[mesKey] = mediaLogadoPorOperador
          tempoPausadoPorMes[mesKey] = mediaPausadoPorOperador
        }
      })
    } else {
      // Fallback para estrutura antiga (array de arrays) se necessário
      let dataStartIndex = 14
      for (let i = 0; i < Math.min(20, pausasData.length); i++) {
        const row = pausasData[i]
        if (Array.isArray(row) && row.length > 15) {
          const operador = String(row[0] || '').trim()
          const atividade = String(row[9] || '').trim()
          if (operador && atividade && operador !== 'Operador' && atividade !== 'Atividade') {
            dataStartIndex = i
            break
          }
        }
      }
      
      // Estrutura para armazenar dados por operador e mês (para arrays)
      const dadosPorOperadorMesArray = {}
      
      pausasData.slice(dataStartIndex).forEach((row) => {
        if (Array.isArray(row) && row.length > 15) {
          const operador = String(row[0] || '').trim()
          const atividade = String(row[9] || '').trim()
          const dataInicial = String(row[10] || '').trim()
          const duracao = String(row[15] || '').trim() // Coluna P - DuracaoCalculo
          
          if (!isDateInPeriod(dataInicial)) {
            return
          }
          
          const mesKey = getMesKey(dataInicial)
          
          if (!dadosPorOperadorMesArray[mesKey]) {
            dadosPorOperadorMesArray[mesKey] = {}
          }
          
          if (!dadosPorOperadorMesArray[mesKey][operador]) {
            dadosPorOperadorMesArray[mesKey][operador] = {
              tempoLogado: 0,
              tempoPausado: 0
            }
          }
          
          mesesSet.add(mesKey)
          
          const duracaoMinutos = duracaoParaMinutos(duracao)
          
          if (atividade.toLowerCase() === 'online') {
            dadosPorOperadorMesArray[mesKey][operador].tempoLogado += duracaoMinutos
          } else if (atividade.toLowerCase() === 'em pausa') {
            dadosPorOperadorMesArray[mesKey][operador].tempoPausado += duracaoMinutos
          }
        }
      })
      
      // Calcular médias por mês (média dos operadores) para arrays
      Object.keys(dadosPorOperadorMesArray).forEach(mesKey => {
        const operadoresDoMes = Object.keys(dadosPorOperadorMesArray[mesKey])
        const totalOperadores = operadoresDoMes.length
        
        if (totalOperadores > 0) {
          const tempoTotalLogado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMesArray[mesKey][operador].tempoLogado, 0)
          const tempoTotalPausado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMesArray[mesKey][operador].tempoPausado, 0)
          
          // Média por operador do mês (em minutos)
          const mediaLogadoPorOperador = tempoTotalLogado / totalOperadores
          const mediaPausadoPorOperador = tempoTotalPausado / totalOperadores
          
          tempoLogadoPorMes[mesKey] = mediaLogadoPorOperador
          tempoPausadoPorMes[mesKey] = mediaPausadoPorOperador
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

    const result = {
      dias: meses, // Mantendo o nome 'dias' para compatibilidade com o componente
      tempoLogadoPorDia: tempoLogadoPorMes, // Mantendo o nome para compatibilidade
      tempoPausadoPorDia: tempoPausadoPorMes, // Mantendo o nome para compatibilidade
      tempoMedioLogado,
      tempoMedioPausado,
      totalDias: totalMeses // Mantendo o nome para compatibilidade
    }
    
    return result
  }, [pausasData, periodo])

  // Função para converter minutos para formato HH:MM:SS
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00'
    
    const totalMinutes = Math.floor(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const secs = Math.floor((minutes % 1) * 60)
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Dados do gráfico
  const chartData = {
    labels: processedData.dias,
    datasets: [
      {
        label: 'Tempo Logado (TML)',
        data: processedData.dias.map(dia => processedData.tempoLogadoPorDia[dia] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 4
      }
      },
      {
        label: 'Tempo Pausado (TMP)',
        data: processedData.dias.map(dia => processedData.tempoPausadoPorDia[dia] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 4
      }
      }
    ]
  }

  // Opções do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 0 // Remove animações que podem causar números aparecerem
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 16,
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
        display: true,
        color: '#1f2937',
        font: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 4
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
            size: 14,
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
            size: 14,
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
    <div className="pausas-section">
      {/* Card TML & TMP */}
      <div className="pausas-card">
        <div className="pausas-card-header">
          <h3 className="pausas-card-title">Tempo Médio Logado e Pausado (TML & TMP)</h3>
          <i className='bx bx-bar-chart-alt-2 pausas-card-icon'></i>
        </div>
        <div className="pausas-chart-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}

export default PausasSection
