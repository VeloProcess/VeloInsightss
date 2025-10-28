import React, { useMemo, memo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
)

const TMAChart = memo(({ data = [], periodo = null, groupBy = 'fila' }) => {
  // Função para converter tempo HH:MM:SS para minutos
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 0
    
    try {
      // Formato HH:MM:SS
      const parts = timeString.split(':')
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseInt(parts[2]) || 0
        return hours * 60 + minutes + seconds / 60
      }
      
      // Formato "X min(s)" - para tickets
      if (timeString.includes('min(s)')) {
        const match = timeString.match(/(\d+)\s*min\(s\)/)
        if (match) {
          return parseInt(match[1]) || 0
        }
      }
      
      // Formato "X hora(s) Y min(s)" - para tickets
      if (timeString.includes('hora(s)') && timeString.includes('min(s)')) {
        const horaMatch = timeString.match(/(\d+)\s*hora\(s\)/)
        const minMatch = timeString.match(/(\d+)\s*min\(s\)/)
        const horas = horaMatch ? parseInt(horaMatch[1]) || 0 : 0
        const mins = minMatch ? parseInt(minMatch[1]) || 0 : 0
        return horas * 60 + mins
      }
      
      // Formato "X hora(s)" - para tickets
      if (timeString.includes('hora(s)')) {
        const match = timeString.match(/(\d+)\s*hora\(s\)/)
        if (match) {
          return parseInt(match[1]) * 60 || 0
        }
      }
      
    } catch (error) {
      // Silenciar erros de parsing para evitar spam no console
    }
    return 0
  }

  // Função para formatar minutos para HH:MM:SS ou DD dias, HH:MM:SS
  const formatMinutesToDisplay = (minutes) => {
    if (minutes === 0) return '00:00:00'
    
    const totalMinutes = Math.floor(minutes)
    const seconds = Math.floor((minutes % 1) * 60)
    
    // Se passar de 24 horas (1440 minutos), usar formato DD dias, HH:MM:SS
    if (totalMinutes >= 1440) {
      const days = Math.floor(totalMinutes / 1440)
      const remainingMinutes = totalMinutes % 1440
      const hours = Math.floor(remainingMinutes / 60)
      const mins = remainingMinutes % 60
      
      return `${days} dias, ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    } else {
      // Formato normal HH:MM:SS
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }

  // Função para parsear data brasileira
  const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null
    
    // Se tiver espaço, pega apenas a parte da data (ignora horário)
    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      dateStr = dateStr.split(' ')[0]
    }
    
    // Tenta formato YYYY-MM-DD (ex: "2025-01-28")
    const ymdPattern = /^(\d{4})-(\d{2})-(\d{2})$/
    const ymdMatch = dateStr.match(ymdPattern)
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10)
      const month = parseInt(ymdMatch[2], 10)
      const day = parseInt(ymdMatch[3], 10)
      return new Date(year, month - 1, day)
    }
    
    // Tenta formato DD/MM/YYYY (ex: "28/01/2025")
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      return new Date(year, month - 1, day)
    }
    
    return null
  }

  // Função para verificar se uma data está dentro do período
  const isDateInPeriod = (dateStr) => {
    if (!periodo || !periodo.startDate || !periodo.endDate) return true
    
    try {
      const date = parseBrazilianDate(dateStr)
      if (!date || isNaN(date.getTime())) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      // Normalizar para comparar apenas a data (sem hora)
      const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      return recordDate >= startDateNorm && recordDate <= endDateNorm
    } catch (error) {
      // Silenciar erros de parsing para evitar spam no console
      return true
    }
  }

  // Processar dados de TMA
  const processTMAData = (data, periodo, groupBy) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        values: [],
        totalCalls: 0,
        averageTMA: 0
      }
    }

    // Detectar se são dados de tickets (array) ou dados de telefonia (objeto)
    // Detecção mais simples e robusta
    const isTicketData = Array.isArray(data[0]) && data.length > 0 && 
      data.slice(14, 20).some(record => 
        Array.isArray(record) && record.length > 28 && 
        record[28] && // Coluna AC deve ter data
        record[1] && // Coluna B deve ter assunto
        record[10] && // Coluna K deve ter tempo
        !record[3] // Coluna D não deve ter data (diferencia de telefonia)
      )
    
    // Se não conseguiu detectar, tentar detecção alternativa
    const isTicketDataAlt = Array.isArray(data[0]) && data.length > 0 && 
      data.slice(14, 20).some(record => 
        Array.isArray(record) && record.length > 10 && 
        record[1] && // Coluna B deve ter assunto
        record[10] && // Coluna K deve ter tempo
        !record[3] // Coluna D não deve ter data
      )
    
    const finalIsTicketData = isTicketData || isTicketDataAlt
    
    // Filas específicas que queremos mostrar (mesmas do Volume por Fila)
    const filasEspecificas = [
      { nome: 'IRPF', palavras: ['IRPF', 'IMPOSTO DE RENDA'] },
      { nome: 'CALCULADORA', palavras: ['CALCULADORA', 'CALCULO', 'CÁLCULO', 'DARF', 'CALCULADORA DE DARF'] },
      { nome: 'ANTECIPAÇÃO DA RESTITUIÇÃO', palavras: ['ANTECIPAÇÃO', 'RESTITUIÇÃO', 'ANTECIPACAO', 'REPASSE', 'LOTES'] },
      { nome: 'OFF', palavras: ['OFF', 'OFFLINE'] },
      { nome: 'EMPRÉSTIMO PESSOAL', palavras: ['EMPRÉSTIMO', 'EMPRESTIMO', 'PESSOAL', 'CRÉDITO'] },
      { nome: 'TABULAÇÃO PENDENTE', palavras: ['TABULAÇÃO', 'TABULACAO', 'PENDENTE'] },
      { nome: 'PIX', palavras: ['PIX', 'TRANSFERÊNCIA', 'TRANSFERENCIA', 'RECEBIMENTO'] },
      { nome: 'FINANCEIRO', palavras: ['FINANCEIRO', 'FINANÇAS', 'FINANCAS'] }
    ]

    // Otimização: limitar processamento para evitar travamentos
    const maxRecords = 50000 // Reduzido de 150k para 50k
    const dataToProcess = data.length > maxRecords ? data.slice(0, maxRecords) : data

    const groupedData = {}
    let processedRecords = 0
    let totalTimeMinutes = 0
    let totalCalls = 0
    let filasEncontradas = new Set()

    // Processar dados linha por linha com otimizações
    dataToProcess.forEach((record, index) => {
      // Pular cabeçalho e linhas iniciais
      if (index < 14) return
      
      // Validação antecipada para evitar processamento desnecessário
      if (!Array.isArray(record) || record.length <= 14) return

      let dateField, filaField, tempoField
      
      if (finalIsTicketData) {
        // Validar se tem dados suficientes antes de processar
        if (record.length <= 28) return
        
        // Para dados de tickets - usar estrutura diferente
        dateField = record[28] // Coluna AC - Dia
        filaField = record[1] // Coluna B - Assunto
        tempoField = record[10] // Coluna K - Tempo de resolução
      } else {
        // Para dados de telefonia - estrutura original
        dateField = record[3] // Coluna D - Data
        filaField = record[10] // Coluna K - Fila/Produto
        tempoField = record[14] // Coluna O - Tempo Total
      }

      // Verificar se está no período (otimização: só se tem dateField)
      if (dateField && !isDateInPeriod(dateField)) {
        return
      }

      // Validar dados necessários
      if (!filaField) return
      
      // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
      let tempoValido = tempoField
      if (!tempoValido && finalIsTicketData) {
        tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
      }
      
      if (!tempoValido) return

      const fila = String(filaField).trim()
      
      // Filtrar apenas filas específicas
      const filaNormalizada = fila.toUpperCase()
      const filaEncontrada = filasEspecificas.find(filaEspecifica => 
        filaEspecifica.palavras.some(palavra => 
          filaNormalizada.includes(palavra.toUpperCase()) ||
          palavra.toUpperCase().includes(filaNormalizada)
        )
      )
      
      if (!filaEncontrada) {
        return // Pular se não for uma fila específica
      }
      
      filasEncontradas.add(filaEncontrada.nome)
      
      const tempoMinutos = parseTimeToMinutes(tempoValido)

      // Ignorar tempos zerados
      if (tempoMinutos <= 0) {
        return
      }

      // Usar o nome padronizado da fila
      const filaPadronizada = filaEncontrada.nome

      // Inicializar grupo se não existir
      if (!groupedData[filaPadronizada]) {
        groupedData[filaPadronizada] = {
          totalTime: 0,
          callCount: 0
        }
      }

      // Acumular dados
      groupedData[filaPadronizada].totalTime += tempoMinutos
      groupedData[filaPadronizada].callCount += 1
      totalTimeMinutes += tempoMinutos
      totalCalls += 1
      processedRecords++
    })

    // Se não encontrou dados com filtros específicos, tentar sem filtros
    if (totalCalls === 0) {
      
      // Tentar processar sem filtros específicos
      dataToProcess.forEach((record, index) => {
        if (index < 14) return

        if (Array.isArray(record) && record.length > 14) {
          let dateField, filaField, tempoField
          
          if (finalIsTicketData) {
            // Para dados de tickets - usar estrutura diferente
            dateField = record[28] // Coluna AC - Dia
            filaField = record[1] // Coluna B - Assunto (tentar coluna B)
            tempoField = record[10] // Coluna K - Tempo de resolução (tentar coluna K)
          } else {
            // Para dados de telefonia - estrutura original
            dateField = record[3] // Coluna D - Data
            filaField = record[10] // Coluna K - Fila/Produto
            tempoField = record[14] // Coluna O - Tempo Total
          }

          if (dateField && !isDateInPeriod(dateField)) return
          if (!filaField) return
          
          // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
          let tempoValido = tempoField
          if (!tempoValido && finalIsTicketData) {
            tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
          }
          
          if (!tempoValido) return

          const fila = String(filaField).trim()
          const tempoMinutos = parseTimeToMinutes(tempoValido)

          if (tempoMinutos <= 0) return

          // Filtrar apenas filas de cobrança (excluir)
          if (fila.toLowerCase().includes('cobrança') || 
              fila.toLowerCase().includes('cobranca') ||
              fila.toLowerCase().includes('cobran')) {
            return
          }

          if (!groupedData[fila]) {
            groupedData[fila] = {
              totalTime: 0,
              callCount: 0
            }
          }

          groupedData[fila].totalTime += tempoMinutos
          groupedData[fila].callCount += 1
          totalTimeMinutes += tempoMinutos
          totalCalls += 1
          processedRecords++
        }
      })
    }
    
    // Se ainda não encontrou dados, tentar processamento mais agressivo
    if (totalCalls === 0) {
      
      dataToProcess.forEach((record, index) => {
        if (index < 14) return

        if (Array.isArray(record) && record.length > 10) {
          // Tentar diferentes combinações de colunas
          const possibleCombinations = [
            { date: record[28], fila: record[1], tempo: record[10] }, // Tickets
            { date: record[3], fila: record[10], tempo: record[14] }, // Telefonia
            { date: record[28], fila: record[2], tempo: record[11] }, // Alternativa 1
            { date: record[3], fila: record[11], tempo: record[15] }, // Alternativa 2
          ]
          
          for (const combo of possibleCombinations) {
            if (combo.date && combo.fila) { // Removido combo.tempo da condição obrigatória
              if (combo.date && !isDateInPeriod(combo.date)) continue
              
              const fila = String(combo.fila).trim()
              
              // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
              let tempoValido = combo.tempo
              if (!tempoValido && finalIsTicketData) {
                tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
              }
              
              if (!tempoValido) continue
              
              const tempoMinutos = parseTimeToMinutes(tempoValido)
              
              if (tempoMinutos <= 0) continue
              
              // Filtrar apenas filas de cobrança (excluir)
              if (fila.toLowerCase().includes('cobrança') || 
                  fila.toLowerCase().includes('cobranca') ||
                  fila.toLowerCase().includes('cobran')) {
                continue
              }
              
              if (!groupedData[fila]) {
                groupedData[fila] = {
                  totalTime: 0,
                  callCount: 0
                }
              }
              
              groupedData[fila].totalTime += tempoMinutos
              groupedData[fila].callCount += 1
              totalTimeMinutes += tempoMinutos
              totalCalls += 1
              processedRecords++
              break // Usar apenas a primeira combinação válida
            }
          }
        }
      })
    }

    // Calcular TMA por grupo e ordenar
    const tmaData = Object.entries(groupedData)
      .map(([fila, data]) => ({
        fila,
        tma: data.totalTime / data.callCount,
        callCount: data.callCount
      }))
      .sort((a, b) => b.tma - a.tma) // Ordenar por TMA decrescente

    const labels = tmaData.map(item => item.fila)
    const values = tmaData.map(item => item.tma)
    const averageTMA = totalCalls > 0 ? totalTimeMinutes / totalCalls : 0

    return {
      labels,
      values,
      totalCalls,
      averageTMA,
      callCounts: tmaData.map(item => item.callCount)
    }
  }

  // Processar dados com useMemo e cores vibrantes
  const chartData = useMemo(() => {
    const processedData = processTMAData(data, periodo, groupBy)

    const maxTMA = Math.max(...processedData.values, 1)

    // Cores vibrantes para cada produto com gradientes 3D
    const colors = [
      '#3B82F6', // Azul vibrante
      '#10B981', // Verde esmeralda
      '#F59E0B', // Âmbar
      '#EF4444', // Vermelho
      '#8B5CF6', // Roxo
      '#06B6D4', // Ciano
      '#84CC16', // Lima
      '#F97316'  // Laranja
    ]

    // Criar gradientes 3D mais pronunciados para cada cor
    const create3DGradient = (color) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const gradient = ctx.createRadialGradient(30, 30, 0, 30, 30, 60) // Gradiente radial para efeito 3D
      
      // Converter hex para RGB
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      // Criar gradiente radial do claro para o escuro (efeito 3D)
      gradient.addColorStop(0, `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, 1)`)
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 1)`)
      gradient.addColorStop(1, `rgba(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)}, 1)`)
      
      return gradient
    }

    return {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Tempo Médio de Atendimento',
          data: processedData.values,
          backgroundColor: colors.slice(0, processedData.labels.length).map(color => create3DGradient(color)),
          borderColor: '#FFFFFF',
          borderWidth: 4,
          hoverBorderWidth: 6,
          hoverBorderColor: '#FFFFFF',
          hoverBackgroundColor: colors.slice(0, processedData.labels.length).map(color => {
            const hex = color.replace('#', '')
            const r = parseInt(hex.substr(0, 2), 16)
            const g = parseInt(hex.substr(2, 2), 16)
            const b = parseInt(hex.substr(4, 2), 16)
            return `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 1)`
          }),
          hoverShadowOffsetX: 8,
          hoverShadowOffsetY: 8,
          hoverShadowBlur: 16,
          hoverShadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      ],
      totalCalls: processedData.totalCalls,
      averageTMA: processedData.averageTMA,
      callCounts: processedData.callCounts
    }
  }, [data, periodo, groupBy])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%', // MUITO REDUZIDO para gráfico GIGANTE
    plugins: {
      title: {
        display: false // Remove qualquer título do gráfico
      },
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          font: {
            size: 20, // Aumentado de 16 para 20
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          color: '#1F2937',
          padding: 20, // Aumentado de 15 para 20
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 25, // Aumentado de 20 para 25
          boxHeight: 25 // Aumentado de 20 para 25
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '700'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            const index = context.dataIndex
            const tma = context.parsed.x
            const callCount = chartData.callCounts[index]
            return [
              `TMA: ${formatMinutesToDisplay(tma)}`,
              `Chamadas: ${callCount.toLocaleString('pt-BR')}`
            ]
          }
        }
      },
      datalabels: {
        display: true, // Ativado para mostrar números dentro do gráfico
        color: '#FFFFFF',
        font: {
          size: 22, // Aumentado para 22px para melhor visibilidade
          weight: 'bold',
          family: 'Arial, sans-serif'
        },
        formatter: function(value) {
          return formatMinutesToDisplay(value) // Formato HH:MM:SS
        },
        anchor: 'center', // Centralizado no segmento
        align: 'center', // Alinhado ao centro
        offset: 0, // Sem offset
        textShadowColor: 'rgba(0, 0, 0, 0.9)', // Sombra mais forte para contraste
        textShadowBlur: 6,
        textShadowOffsetX: 3,
        textShadowOffsetY: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo semi-transparente
        borderRadius: 8,
        padding: 6
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      animateRotate: true,
      animateScale: true
    },
    elements: {
      arc: {
        borderWidth: 4, // Aumentado para 4px
        borderColor: '#FFFFFF',
        shadowOffsetX: 6, // Aumentado para 6px
        shadowOffsetY: 6, // Aumentado para 6px
        shadowBlur: 12, // Aumentado para 12px
        shadowColor: 'rgba(0, 0, 0, 0.4)' // Sombra mais forte
      }
    },
    scales: {
      x: {
        display: false // Remove eixos X
      },
      y: {
        display: false // Remove eixos Y
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index
        const queueName = chartData.labels[elementIndex]
        handleTitleClick(queueName)
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
    }
  }

  // Estado de loading/erro
  if (!data || data.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados de TMA...</p>
        </div>
      </div>
    )
  }

  if (chartData.labels.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-error">
          <i className='bx bx-error-circle'></i>
          <p>Nenhum dado de TMA encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {chartData && chartData.labels && chartData.labels.length > 0 ? 
        <Doughnut data={chartData} options={options} /> : 
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Sem dados para exibir
        </div>
      }
    </div>
  )
})

export default TMAChart
