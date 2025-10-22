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
import { OPERADORES_PERMITIDOS, OPERADORES_EXCLUIDOS } from '../config/operadores'
import './TMLChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const TMLChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    const processedData = processTMLData(data, periodo)
    
    return {
      labels: ['6:20', '8:00', '10:00'],
      datasets: [
        {
          label: 'Total de Dias',
          data: [processedData.totalJornada620, processedData.totalJornada8, processedData.totalJornada10],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',   // Azul para 6:20
            'rgba(16, 185, 129, 0.8)',   // Verde para 8:00
            'rgba(245, 101, 101, 0.8)'   // Vermelho para 10:00
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 101, 101, 1)'
          ],
          borderWidth: 2
        }
      ]
    }
  }, [data, periodo])

  const tableData = useMemo(() => {
    const processedData = processTMLData(data, periodo)
    return processedData
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Gráfico horizontal
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
        display: false // Não mostrar legenda pois temos apenas um dataset
      },
      title: {
        display: false // Título será mostrado no header
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
            const jornada = context.label
            const dias = context.parsed.x
            return `${jornada}: ${dias} dias`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          callback: function(value) {
            return value + ' dias'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 16,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          color: '#1f2937',
          padding: 15
        }
      }
    }
  }

  return (
    <div className="tml-modern-container">
      {/* Header */}
      <div className="tml-header">
        <div className="tml-title-section">
          <h3 className="tml-title">TML - Tempo Médio Logado</h3>
          <p className="tml-subtitle">Análise de jornadas de trabalho</p>
        </div>
        <div className="tml-icon">
          <i className="bx bx-time-five"></i>
        </div>
      </div>

      {/* Métricas Cards */}
      <div className="tml-metrics-grid">
        <div className="tml-metric-card logado">
          <div className="tml-metric-icon">
            <i className="bx bx-time"></i>
          </div>
          <div className="tml-metric-content">
            <div className="tml-metric-value">{tableData.tempoMedioLogado}</div>
            <div className="tml-metric-label">Tempo Médio Logado/Dia</div>
            <div className="tml-metric-detail">{tableData.totalDias} dias analisados</div>
          </div>
        </div>

        <div className="tml-metric-card pausado">
          <div className="tml-metric-icon">
            <i className="bx bx-pause-circle"></i>
          </div>
          <div className="tml-metric-content">
            <div className="tml-metric-value">{tableData.tempoMedioPausado}</div>
            <div className="tml-metric-label">Tempo Médio Pausado/Dia</div>
            <div className="tml-metric-detail">{tableData.totalOperadores} operadores</div>
          </div>
        </div>

        <div className="tml-metric-card eficiencia">
          <div className="tml-metric-icon">
            <i className="bx bx-trending-up"></i>
          </div>
          <div className="tml-metric-content">
            <div className="tml-metric-value">{tableData.eficiencia}%</div>
            <div className="tml-metric-label">Eficiência</div>
            <div className="tml-metric-detail">Tempo logado vs total</div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="tml-chart-section">
        <div className="tml-chart-header">
          <h4>Distribuição de Jornadas</h4>
          <p>Total de dias trabalhados por tipo de jornada</p>
        </div>
        <div className="tml-bar-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Resumo das Jornadas */}
      <div className="tml-summary">
        <div className="tml-summary-item">
          <div className="tml-summary-color" style={{backgroundColor: '#3b82f6'}}></div>
          <div className="tml-summary-content">
            <span className="tml-summary-label">Jornada 6:20</span>
            <span className="tml-summary-value">{tableData.totalJornada620} dias</span>
          </div>
        </div>
        <div className="tml-summary-item">
          <div className="tml-summary-color" style={{backgroundColor: '#10b981'}}></div>
          <div className="tml-summary-content">
            <span className="tml-summary-label">Jornada 8:00</span>
            <span className="tml-summary-value">{tableData.totalJornada8} dias</span>
          </div>
        </div>
        <div className="tml-summary-item">
          <div className="tml-summary-color" style={{backgroundColor: '#f56565'}}></div>
          <div className="tml-summary-content">
            <span className="tml-summary-label">Jornada 10:00</span>
            <span className="tml-summary-value">{tableData.totalJornada10} dias</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Processar dados para TML
const processTMLData = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      operadores: [],
      jornada620: [],
      jornada8: [],
      jornada10: [],
      tempoMedioLogado: '00:00:00',
      tempoMedioPausado: '00:00:00',
      totalDias: 0,
      totalOperadores: 0,
      eficiencia: 0,
      totalJornada620: 0,
      totalJornada8: 0,
      totalJornada10: 0
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (dateStr) => {
    if (!periodo) return true
    
    try {
      const date = parseBrazilianDate(dateStr)
      const startDate = parseBrazilianDate(periodo.startDate)
      const endDate = parseBrazilianDate(periodo.endDate)
      
      return date >= startDate && date <= endDate
    } catch (error) {
      return true
    }
  }

  // Função para verificar se operador é válido (todos exceto desligados)
  const isOperadorValido = (operador) => {
    if (!operador) return false
    
    const operadorLower = operador.toLowerCase()
    
    // Lista de status que indicam operador desligado
    const statusDesligado = [
      'desligado',
      'demitido',
      'afastado',
      'licença',
      'férias',
      'demissão',
      'rescisão'
    ]
    
    // Verificar se não está na lista de excluídos (desligados)
    const isExcluido = OPERADORES_EXCLUIDOS.some(nome => 
      operadorLower.includes(nome.toLowerCase())
    )
    
    // Verificar se não tem status de desligado
    const temStatusDesligado = statusDesligado.some(status => 
      operadorLower.includes(status)
    )
    
    return !isExcluido && !temStatusDesligado
  }

  // Agrupar dados por operador e data
  const operadorData = {}
  
  data.forEach(record => {
    if (!Array.isArray(record) || record.length < 16) return
    
    const operador = record[0] // Coluna A - Operador
    const atividade = record[9] // Coluna J - Atividade
    const dataInicial = record[10] // Coluna K - Data Inicial
    const dataFinal = record[12] // Coluna M - Data Final
    const duracao = record[14] // Coluna O - Duração
    const motivo = record[15] // Coluna P - Motivo Da Pausa
    
    if (!operador || !dataInicial) return
    
    // Filtrar apenas operadores válidos da lista
    if (!isOperadorValido(operador)) return
    
    // Verificar se está no período
    if (!isDateInPeriod(dataInicial)) return
    
    // Extrair apenas a data (sem hora)
    const dataKey = dataInicial.split(' ')[0] // Pegar apenas a parte da data
    
    if (!operadorData[operador]) {
      operadorData[operador] = {}
    }
    
    if (!operadorData[operador][dataKey]) {
      operadorData[operador][dataKey] = {
        tempoLogado: 0,
        tempoPausa: 0,
        atividades: []
      }
    }
    
    // Converter duração para minutos
    const duracaoMinutos = parseDurationToMinutes(duracao)
    
    // Classificar por atividade
    if (atividade && atividade.toLowerCase().includes('online')) {
      operadorData[operador][dataKey].tempoLogado += duracaoMinutos
    } else if (motivo && isPausaMotivo(motivo)) {
      operadorData[operador][dataKey].tempoPausa += duracaoMinutos
    }
    
    operadorData[operador][dataKey].atividades.push({
      atividade,
      motivo,
      duracao: duracaoMinutos
    })
  })
  
  // Calcular jornadas por operador
  const operadores = Object.keys(operadorData)
  
  const jornada620 = []
  const jornada8 = []
  const jornada10 = []
  
  operadores.forEach(operador => {
    const dadosOperador = operadorData[operador]
    let contador620 = 0
    let contador8 = 0
    let contador10 = 0
    
    Object.values(dadosOperador).forEach(diaData => {
      const tempoTotal = diaData.tempoLogado + diaData.tempoPausa
      const tempoTotalHoras = tempoTotal / 60
      
      // Classificar jornada baseada na duração total
      if (tempoTotalHoras >= 6 && tempoTotalHoras <= 6.5) {
        contador620++
      } else if (tempoTotalHoras >= 7.5 && tempoTotalHoras <= 8.5) {
        contador8++
      } else if (tempoTotalHoras >= 9.5 && tempoTotalHoras <= 10.5) {
        contador10++
      }
    })
    
    jornada620.push(contador620)
    jornada8.push(contador8)
    jornada10.push(contador10)
  })
  
  // Calcular totais das jornadas
  const totalJornada620 = jornada620.reduce((sum, val) => sum + val, 0)
  const totalJornada8 = jornada8.reduce((sum, val) => sum + val, 0)
  const totalJornada10 = jornada10.reduce((sum, val) => sum + val, 0)

  // Calcular tempos médios gerais
  let totalTempoLogado = 0
  let totalTempoPausado = 0
  let totalDias = 0
  let totalOperadores = operadores.length
  
  Object.values(operadorData).forEach(dadosOperador => {
    Object.values(dadosOperador).forEach(diaData => {
      totalTempoLogado += diaData.tempoLogado
      totalTempoPausado += diaData.tempoPausa
      totalDias++
    })
  })
  
  // Calcular médias
  const tempoMedioLogadoMinutos = totalDias > 0 ? totalTempoLogado / totalDias : 0
  const tempoMedioPausadoMinutos = totalDias > 0 ? totalTempoPausado / totalDias : 0
  
  // Calcular eficiência (tempo logado / tempo total)
  const tempoTotalMedio = tempoMedioLogadoMinutos + tempoMedioPausadoMinutos
  const eficiencia = tempoTotalMedio > 0 ? Math.round((tempoMedioLogadoMinutos / tempoTotalMedio) * 100) : 0
  
  // Converter para HH:MM:SS
  const tempoMedioLogado = formatMinutesToTime(tempoMedioLogadoMinutos)
  const tempoMedioPausado = formatMinutesToTime(tempoMedioPausadoMinutos)

  return {
    operadores,
    jornada620,
    jornada8,
    jornada10,
    tempoMedioLogado,
    tempoMedioPausado,
    totalDias,
    totalOperadores,
    eficiencia,
    totalJornada620,
    totalJornada8,
    totalJornada10
  }
}

// Função para verificar se é motivo de pausa
const isPausaMotivo = (motivo) => {
  if (!motivo) return false
  
  const motivoLower = motivo.toLowerCase()
  const motivosPausa = [
    'banheiro',
    'almoço',
    'pausa',
    'pausa 10',
    'feedback',
    'treinamento'
  ]
  
  return motivosPausa.some(motivoPausa => motivoLower.includes(motivoPausa))
}

// Função para converter duração para minutos
const parseDurationToMinutes = (duration) => {
  if (!duration) return 0
  
  // Formato esperado: "HH:MM:SS" ou "MM:SS"
  const parts = duration.toString().split(':')
  
  if (parts.length === 3) {
    // HH:MM:SS
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    const seconds = parseInt(parts[2]) || 0
    return hours * 60 + minutes + seconds / 60
  } else if (parts.length === 2) {
    // MM:SS
    const minutes = parseInt(parts[0]) || 0
    const seconds = parseInt(parts[1]) || 0
    return minutes + seconds / 60
  }
  
  return 0
}

// Função para parsear data brasileira
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return new Date()
  
  // Formato esperado: "DD/MM/YYYY" ou "DD/MM/YYYY HH:MM:SS"
  const datePart = dateStr.split(' ')[0]
  const [day, month, year] = datePart.split('/')
  
  return new Date(year, month - 1, day)
}

// Função para converter minutos para HH:MM:SS
const formatMinutesToTime = (minutes) => {
  if (!minutes || minutes === 0) return '00:00:00'
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)
  const seconds = Math.round((minutes % 1) * 60)
  
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default TMLChart
