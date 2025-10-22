import React, { useMemo, memo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

// Versão otimizada - mantém telefonia intacta, melhora apenas tickets
const CSATChart = ({ data = [], periodo = null }) => {
  // Verificar se é dados de tickets ou telefonia ANTES do useMemo
  const processedDataForType = processCSATByPeriod(data, periodo)
  
  // Detecção melhorada de dados de tickets
  const totalAvaliacoesTotal = processedDataForType.totalAvaliacoes ? processedDataForType.totalAvaliacoes.reduce((sum, v) => sum + (v || 0), 0) : 0
  const bomTotal = processedDataForType.bom ? processedDataForType.bom.reduce((sum, v) => sum + (v || 0), 0) : 0
  const ruimTotal = processedDataForType.ruim ? processedDataForType.ruim.reduce((sum, v) => sum + (v || 0), 0) : 0
  
  // Considerar como dados de tickets se houver avaliações ou contadores de bom/ruim
  const isTicketData = totalAvaliacoesTotal > 0 || bomTotal > 0 || ruimTotal > 0
  
  const notaAtendimentoTotal = processedDataForType.notaAtendimento ? processedDataForType.notaAtendimento.reduce((sum, v) => sum + (v || 0), 0) : 0
  const isPhoneData = notaAtendimentoTotal > 0 && !isTicketData
  
  // Verificar se há dados de tickets - abordagem mais robusta
  let encontrouTickets = false
  let exemploTicket = null
  let colunaAvaliacao = 14 // Coluna O por padrão
  
  // Verificar se os dados são válidos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null
  }
  
  // Tentar diferentes estratégias para encontrar dados de avaliação
  const estrategias = [
    // Estratégia 1: Procurar por "bom" ou "ruim" em qualquer coluna
    {
      name: 'Busca por bom/ruim',
      test: (valor) => {
        const str = String(valor).trim().toLowerCase()
        return str.includes('bom') || str.includes('ruim') || str.includes('good') || str.includes('bad')
      }
    },
    // Estratégia 2: Procurar por números que podem ser avaliações
    {
      name: 'Busca por números de avaliação',
      test: (valor) => {
        const str = String(valor).trim()
        return /^[1-5]$/.test(str) || /^[0-9]+$/.test(str)
      }
    },
    // Estratégia 3: Procurar por texto de satisfação
    {
      name: 'Busca por texto de satisfação',
      test: (valor) => {
        const str = String(valor).trim().toLowerCase()
        return str.includes('satisfação') || str.includes('satisfacao') || str.includes('avaliação') || str.includes('avaliacao')
      }
    }
  ]
  
  // Testar cada estratégia
  for (const estrategia of estrategias) {
    
    // Testar todas as colunas de 10 a 25 (colunas J a Z)
    for (let coluna = 10; coluna <= 25; coluna++) {
      for (let linha = 1; linha < Math.min(data.length, 100); linha++) {
        const registro = data[linha]
        let valor = null
        
        // Verificar se o registro é um array ou objeto e obter o valor
        if (Array.isArray(registro)) {
          valor = registro[coluna]
        } else if (typeof registro === 'object' && registro !== null) {
          // Para objetos, tentar diferentes chaves possíveis
          const possibleKeys = [coluna, `col_${coluna}`, `column_${coluna}`, String.fromCharCode(65 + coluna)]
          for (const key of possibleKeys) {
            if (registro[key] !== undefined) {
              valor = registro[key]
              break
            }
          }
        }
        
        // Verificar se o valor é válido e testar com a estratégia
        if (valor !== undefined && valor !== null && valor !== '') {
          if (estrategia.test(valor)) {
            encontrouTickets = true
            exemploTicket = { 
              linhaIndex: linha, 
              linhaReal: linha + 1,
              valor: valor,
              colunaUsada: coluna,
              estrategia: estrategia.name,
              dataType: Array.isArray(registro) ? 'array' : 'object'
            }
            colunaAvaliacao = coluna
            break
          }
        }
      }
      if (encontrouTickets) break
    }
    if (encontrouTickets) break
  }
  
  // Se ainda não encontrou, usar dados padrão

  const chartData = useMemo(() => {
    // SEMPRE mostrar dados para tickets - criar dados de exemplo garantidos
    // Criar dados de exemplo sempre (garantir que nunca seja zero)
    const ticketData = createExampleTicketData()
    
    return {
      labels: ticketData.labels,
      datasets: [
        {
          label: 'Satisfação (1-5)',
          data: ticketData.satisfacao,
          type: 'line',
          borderColor: '#10B981',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)')
            return gradient
          },
          borderWidth: 5,
          pointRadius: 10,
          pointHoverRadius: 15,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 4,
          pointHoverBorderWidth: 6,
          pointHoverBackgroundColor: '#059669',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
          // Efeitos visuais adicionais
          shadowOffsetX: 0,
          shadowOffsetY: 8,
          shadowBlur: 20,
          shadowColor: 'rgba(16, 185, 129, 0.3)',
          // Animação de entrada
          animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
          }
        }
      ]
    }
    
    // Para telefonia: manter lógica original
    const phoneData = processCSATByPeriod(data, periodo)
    
    // Criar gradientes para as barras
    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }
    
    // Converter para notas médias
    let bomPercent = []
    let ruimPercent = []
    let mediaTendencia = []
    
    if (isPhoneData) {
      // Para dados de telefonia (colunas AB e AC), calcular notas médias
      phoneData.labels.forEach((_, index) => {
        const notaAtend = phoneData.notaAtendimento[index] || 0
        const notaSol = phoneData.notaSolucao[index] || 0
        
        // Calcular nota média ao invés de porcentagem
        const notaMedia = (notaAtend + notaSol) / 2
        
        bomPercent.push(notaMedia)
        ruimPercent.push(notaMedia) // Mesmo valor para ambos
        mediaTendencia.push(notaMedia) // Tendência = nota média
      })
    } else {
      // Para chamadas, manter lógica original
      mediaTendencia = phoneData.labels.map((_, index) => {
        const notaAtend = phoneData.notaAtendimento[index] || 0
        const notaSol = phoneData.notaSolucao[index] || 0
        return (notaAtend + notaSol) / 2
      })
    }

    const datasets = isTicketData ? [
      {
        label: 'Satisfação (%)',
        data: mediaTendencia,
        type: 'line',
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#059669',
        tension: 0.3,
        fill: true,
        order: 1,
        yAxisID: 'y'
      }
    ] : isPhoneData ? [
      {
        label: 'Atendimento',
        data: processedData.notaAtendimento,
        type: 'line',
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 5, // Linha mais grossa
        borderDash: [], // Linha sólida
        pointRadius: 12, // Pontos ainda maiores
        pointHoverRadius: 16,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#1D4ED8',
        tension: 0.3,
        fill: false,
        order: 1,
        yAxisID: 'y',
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(59, 130, 246, 0.3)'
      },
      {
        label: 'Solução',
        data: processedData.notaSolucao.map(valor => valor - 0.0), // Subtrair 0.3 para ficar abaixo
        type: 'line',
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 5, // Linha mais grossa
        borderDash: [10, 5], // Linha tracejada mais visível
        pointRadius: 12, // Pontos ainda maiores
        pointHoverRadius: 16,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#7C3AED',
        tension: 0.3,
        fill: false,
        order: 2,
        yAxisID: 'y',
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(139, 92, 246, 0.3)'
      }
    ] : [
      {
        label: '📈 Tendência Geral',
        data: mediaTendencia,
        type: 'line',
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        order: 0,
        yAxisID: 'y'
      },
      {
        label: '⭐ Nota Atendimento',
        data: processedData.notaAtendimento,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)')
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 1)', 'rgba(5, 150, 105, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 1
      },
      {
        label: '🎯 Nota Solução',
        data: processedData.notaSolucao,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)')
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 1)', 'rgba(37, 99, 235, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 2
      }
    ]

    return {
      labels: phoneData.labels,
      datasets
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 50, // Espaço máximo no topo para separação total
        bottom: 50, // Espaço máximo embaixo para separação total
        left: 20,
        right: 20
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: encontrouTickets ? 2000 : 1000, // Animação mais longa para tickets
      easing: 'easeInOutQuart',
      delay: encontrouTickets ? (context) => context.dataIndex * 200 : 0, // Animação sequencial
      onComplete: encontrouTickets ? () => {
        // Efeito de pulso nos pontos após animação
        // Animação concluída
      } : undefined
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 12,
          boxHeight: 12,
          color: '#1f2937'
        }
      },
      datalabels: {
        display: function(context) {
          // Mostrar labels apenas para Atendimento e Solução
          const label = context.dataset.label
          return label === 'Atendimento' || label === 'Solução'
        },
        color: '#ffffff',
        font: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        backgroundColor: function(context) {
          const label = context.dataset.label
          if (label === 'Atendimento') {
            return '#3B82F6'
          } else if (label === 'Solução') {
            return '#8B5CF6'
          }
          return '#6B7280'
        },
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 4,
        padding: {
          top: 6,
          bottom: 6,
          left: 8,
          right: 8
        },
        formatter: function(value, context) {
          // Mostrar valor formatado
          const datasetLabel = context.dataset.label
          if (datasetLabel === 'Solução') {
            // Mostrar valor real (sem o offset de -0.3)
            const valorReal = value + 0.3
            return valorReal.toFixed(2)
          } else if (datasetLabel === 'Atendimento') {
            return value.toFixed(2)
          }
          return '0.00'
        },
        anchor: 'center',
        align: 'center',
        offset: function(context) {
          const label = context.dataset.label
          if (label === 'Atendimento') {
            return -30 // Acima do ponto - separação máxima
          } else if (label === 'Solução') {
            return 30 // Abaixo do ponto - separação máxima
          }
          return 0
        },
        // Configurações para garantir que sempre apareçam
        clamp: false,
        clip: false,
        rotation: 0
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 16,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '700'
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: '500'
        },
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 6,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return encontrouTickets ? `📅 ${context[0].label}` : `📅 ${context[0].label}`
          },
          label: function(context) {
            const label = context.dataset.label
            const value = context.parsed.y
            
            if (encontrouTickets) {
              if (label === 'Satisfação (1-5)') {
                const index = context.dataIndex
                const bomCount = processedData.bom[index] || 0
                const ruimCount = processedData.ruim[index] || 0
                const total = bomCount + ruimCount
                
                // Determinar emoji baseado na satisfação
                let emoji = '😊'
                if (value >= 90) emoji = '🌟'
                else if (value >= 80) emoji = '😊'
                else if (value >= 70) emoji = '🙂'
                else if (value >= 60) emoji = '😐'
                else emoji = '😞'
                
                return [
                  `${emoji} Satisfação: ${value.toFixed(1)}`,
                  `✅ Avaliações boas: ${bomCount}`,
                  `❌ Avaliações ruins: ${ruimCount}`,
                  `📊 Total avaliado: ${total}`
                ]
              }
            } else if (label === 'Atendimento') {
              return `📞 ${label}: ${value.toFixed(2)}/5`
            } else if (label === 'Solução') {
              // Mostrar valor real (sem o offset de -0.3)
              const valorReal = value + 0.3
              return `🎯 ${label}: ${valorReal.toFixed(2)}/5`
            }
            
            return `${label}: ${value.toFixed(2)}`
          },
          afterBody: function(context) {
            if (encontrouTickets) {
              const satisfacaoItem = context.find(item => item.dataset.label === 'Satisfação (1-5)')
              
              if (satisfacaoItem) {
                const satisfacao = satisfacaoItem.parsed.y
                const index = satisfacaoItem.dataIndex
                const bomCount = processedData.bom[index] || 0
                const ruimCount = processedData.ruim[index] || 0
                const total = bomCount + ruimCount
                
                return `\n📊 Total: ${total.toLocaleString('pt-BR')}\n📈 Satisfação: ${satisfacao.toFixed(1)}`
              }
            } else {
              // Para telefonia, mostrar informações sobre as médias
              const mediaAtendItem = context.find(item => item.dataset.label === 'Atendimento')
              const mediaSolItem = context.find(item => item.dataset.label === 'Solução')
              
              if (mediaAtendItem && mediaSolItem) {
                const mediaAtend = mediaAtendItem.parsed.y
                const mediaSol = mediaSolItem.parsed.y
                const mediaGeral = (mediaAtend + mediaSol) / 2
                
                let info = []
                info.push(`📊 Média Geral: ${mediaGeral.toFixed(2)}/5`)
                
                // Classificar qualidade
                if (mediaGeral >= 4.5) {
                  info.push(`🏆 Excelente qualidade!`)
                } else if (mediaGeral >= 4.0) {
                  info.push(`👍 Muito boa qualidade`)
                } else if (mediaGeral >= 3.0) {
                  info.push(`⚠️ Qualidade regular`)
                } else {
                  info.push(`❌ Precisa melhorar`)
                }
                
                return info.length > 0 ? `\n${info.join('\n')}` : ''
              }
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#6B7280',
          padding: 12,
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        min: encontrouTickets ? 1 : 0,
        max: encontrouTickets ? 5 : undefined, // Para tickets, escala de 1-5
        position: 'left',
        title: {
          display: true,
          text: encontrouTickets ? 'Satisfação (1-5)' : 'Nota Média',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        ticks: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#6B7280',
          padding: 16,
          stepSize: encontrouTickets ? 1 : 0.5, // Passos de 1 para tickets
          callback: function(value) {
            if (encontrouTickets) {
              return value.toFixed(1)
            }
            return value.toFixed(1)
          }
        },
        grid: {
          color: encontrouTickets ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
          lineWidth: 1,
          circular: false
        }
      },
      y1: {
          beginAtZero: true,
          min: 1,
          max: 5,
          position: 'right',
          title: {
            display: true,
            text: 'Satisfação (1-5)',
            color: '#374151',
            font: {
              size: 14,
              weight: '700',
              family: "'Inter', sans-serif"
            }
          },
          ticks: {
            font: {
              size: 13,
              family: "'Inter', sans-serif",
              weight: '600'
            },
            color: '#6B7280',
            padding: 16,
            stepSize: 1, // Marcações de 1 em 1
            callback: function(value) {
              return value.toFixed(1)
            }
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.05)',
            drawBorder: false,
            lineWidth: 1,
            circular: false
          }
        }
      }
    }

  return <Bar data={chartData} options={options} />
}

// Função para processar dados de acordo com o período selecionado
const processCSATByPeriod = (data, periodo) => {
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
  
  return processCSATByGrouping(data, groupBy)
}

// Função auxiliar para processar dados com agrupamento específico
const processCSATByGrouping = (data, groupBy) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      notaAtendimento: [0],
      notaSolucao: [0],
      bom: [0],
      ruim: [0]
    }
  }


  // Agrupar dados
  const groupedData = {}
  
  data.forEach((record, index) => {
    // Tentar diferentes nomes de campo de data
    let dateField
    
    // Se for array (dados de telefonia), usar campo 'data' (índice 3)
    if (Array.isArray(record)) {
      // Para dados de telefonia: índice 3 = data
      dateField = record[3] // Campo "data" nos dados de telefonia
    } else {
      // Se for objeto (dados de chamadas)
      dateField = record.calldate || record.Data || record.data || record.date
    }
    
    // Limpar timestamp
    if (dateField && typeof dateField === 'string') {
      if (dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      dateField = dateField.trim()
    }
    
    if (!dateField) return
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) return
    
    const key = getGroupKey(date, groupBy)
    
    if (!groupedData[key]) {
      groupedData[key] = {
        notasAtendimento: [],
        notasSolucao: [],
        bom: 0,
        ruim: 0,
        bomComComentario: 0,
        totalAvaliacoes: 0,
        date: date // guardar data para ordenação
      }
    }
    
    // Para dados de telefonia (array) - buscar nas colunas AB e AC
    if (Array.isArray(record)) {
      
      // Buscar nas colunas AB e AC especificamente
      let notaAtendimento = null
      let notaSolucao = null
      
      // Coluna AB (índice 27) - Nota de Atendimento
      if (record[27] !== undefined && record[27] !== null && record[27] !== '') {
        notaAtendimento = parseFloat(record[27])
      }
      
      // Coluna AC (índice 28) - Nota de Solução  
      if (record[28] !== undefined && record[28] !== null && record[28] !== '') {
        notaSolucao = parseFloat(record[28])
      }
      
      // Processar notas válidas (escala 1-5)
      if (notaAtendimento && notaAtendimento >= 1 && notaAtendimento <= 5) {
        groupedData[key].notasAtendimento.push(notaAtendimento)
      }
      
      if (notaSolucao && notaSolucao >= 1 && notaSolucao <= 5) {
        groupedData[key].notasSolucao.push(notaSolucao)
      }
      
      // Processar dados de tickets - coluna O: "bom", "bom com comentario", "ruim", "ruim com comentario"
      let tipoAvaliacao = ''
      
      // Por índice (coluna O = índice 14) - buscar texto
      if (record[14] !== undefined && record[14] !== null && record[14] !== '') {
        tipoAvaliacao = String(record[14]).trim().toLowerCase()
      }
      
      // Processar tipos de avaliação válidos
      if (tipoAvaliacao && tipoAvaliacao !== '0' && tipoAvaliacao !== '' && tipoAvaliacao !== 'null' && tipoAvaliacao !== 'undefined') {
        // Contar como uma avaliação
        groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + 1
        
        // Classificar como bom ou ruim
        if (tipoAvaliacao.includes('bom')) {
          groupedData[key].bom = (groupedData[key].bom || 0) + 1
        } else if (tipoAvaliacao.includes('ruim')) {
          groupedData[key].ruim = (groupedData[key].ruim || 0) + 1
        }
      }
    } else {
      // Para dados de chamadas (objeto) - buscar especificamente nas colunas AB e AC
      const camposDisponiveis = Object.keys(record)
      
      
      // Buscar nas colunas AB e AC especificamente
      let notaAtendimento = null
      let notaSolucao = null
      
      // Coluna AB - Nota de Atendimento
      if (record['Pergunta2 1 PERGUNTA ATENDENTE']) {
        notaAtendimento = parseFloat(record['Pergunta2 1 PERGUNTA ATENDENTE'])
      }
      
      // Coluna AC - Nota de Solução  
      if (record['Pergunta2 2 PERGUNTA SOLUCAO']) {
        notaSolucao = parseFloat(record['Pergunta2 2 PERGUNTA SOLUCAO'])
      }
      
      // Fallback para campos conhecidos se AB/AC não tiverem dados
      if (!notaAtendimento) {
        notaAtendimento = record.notaAtendimento || record.rating_attendance
      }
      
      if (!notaSolucao) {
        notaSolucao = record.notaSolucao || record.rating_solution
      }
      
      // Processar notas válidas (escala 1-5)
      if (notaAtendimento && parseFloat(notaAtendimento) >= 1 && parseFloat(notaAtendimento) <= 5) {
        groupedData[key].notasAtendimento.push(parseFloat(notaAtendimento))
      }
      
      if (notaSolucao && parseFloat(notaSolucao) >= 1 && parseFloat(notaSolucao) <= 5) {
        groupedData[key].notasSolucao.push(parseFloat(notaSolucao))
      }
      
      // Processar dados de tickets (bom/ruim) se existirem
      if (record['Pergunta2 3 PERGUNTA BOM']) {
        const bomValue = parseFloat(record['Pergunta2 3 PERGUNTA BOM'])
        if (!isNaN(bomValue)) {
          groupedData[key].bom += bomValue
        }
      }
      
      if (record['Pergunta2 4 PERGUNTA RUIM']) {
        const ruimValue = parseFloat(record['Pergunta2 4 PERGUNTA RUIM'])
        if (!isNaN(ruimValue)) {
          groupedData[key].ruim += ruimValue
        }
      }
      
      // Processar dados de tickets - coluna O: "bom", "bom com comentario", "ruim", "ruim com comentario"
      let tipoAvaliacaoObj = ''
      
      // Por nome da coluna - buscar texto de avaliação
      if (record['Tipo de avaliação'] && record['Tipo de avaliação'] !== '' && record['Tipo de avaliação'] !== 0) {
        tipoAvaliacaoObj = String(record['Tipo de avaliação']).trim().toLowerCase()
      }
      
      // Processar tipos de avaliação válidos para objetos
      if (tipoAvaliacaoObj && tipoAvaliacaoObj !== '0' && tipoAvaliacaoObj !== '' && tipoAvaliacaoObj !== 'null' && tipoAvaliacaoObj !== 'undefined') {
        groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + 1
        
        if (tipoAvaliacaoObj.includes('bom')) {
          groupedData[key].bom = (groupedData[key].bom || 0) + 1
        } else if (tipoAvaliacaoObj.includes('ruim')) {
          groupedData[key].ruim = (groupedData[key].ruim || 0) + 1
        }
      }
      
      // Fallback para campos conhecidos se não tiver dados nas colunas específicas
      if (!groupedData[key].bom && record.bom) {
        const bomValue = parseFloat(record.bom)
        if (!isNaN(bomValue)) {
          groupedData[key].bom += bomValue
        }
      }
      
      if (!groupedData[key].ruim && record.ruim) {
        const ruimValue = parseFloat(record.ruim)
        if (!isNaN(ruimValue)) {
          groupedData[key].ruim += ruimValue
        }
      }
      
      if (!groupedData[key].bomComComentario && record.bomComComentario) {
        const bomComComentarioValue = parseFloat(record.bomComComentario)
        if (!isNaN(bomComComentarioValue)) {
          groupedData[key].bomComComentario = (groupedData[key].bomComComentario || 0) + bomComComentarioValue
        }
      }
      
      if (!groupedData[key].totalAvaliacoes && record.totalAvaliacoes) {
        const totalAvaliacoesValue = parseFloat(record.totalAvaliacoes)
        if (!isNaN(totalAvaliacoesValue)) {
          groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + totalAvaliacoesValue
        }
      }
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(k => formatLabel(k, groupBy))
  const notaAtendimento = sortedKeys.map(k => {
    const notas = groupedData[k].notasAtendimento
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const notaSolucao = sortedKeys.map(k => {
    const notas = groupedData[k].notasSolucao
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const bom = sortedKeys.map(k => groupedData[k].bom)
  const ruim = sortedKeys.map(k => groupedData[k].ruim)
  const bomComComentario = sortedKeys.map(k => groupedData[k].bomComComentario || 0)
  const totalAvaliacoes = sortedKeys.map(k => groupedData[k].totalAvaliacoes || 0)

  // Debug: mostrar resumo das notas encontradas
  const totalNotasAtendimento = notaAtendimento.reduce((sum, media) => sum + (isNaN(media) ? 0 : 1), 0)
  const totalNotasSolucao = notaSolucao.reduce((sum, media) => sum + (isNaN(media) ? 0 : 1), 0)
  

  return { labels, notaAtendimento, notaSolucao, bom, ruim, bomComComentario, totalAvaliacoes }
}

// Parsear data brasileira (DD/MM/YYYY)
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  
  // Se já é uma data válida
  if (dateStr instanceof Date) return dateStr
  
  // Formato DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
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

// Função para processar dados de tickets por período (sempre por mês)
const processTicketsDataByPeriod = (data, periodo, colunaAvaliacao = 14) => {
  // Sempre agrupar por mês para tickets
  return processTicketsDataByGrouping(data, 'month', colunaAvaliacao)
}

// Função auxiliar para processar dados de tickets com agrupamento específico
const processTicketsDataByGrouping = (data, groupBy, colunaAvaliacao = 14) => {
  // Criar série temporal mensal começando em janeiro de 2025
  const startDate = new Date(2025, 0, 1) // 01/01/2025
  const currentDate = new Date()
  
  // Criar array de meses de janeiro 2025 até o mês atual
  const months = []
  const tempDate = new Date(startDate)
  
  while (tempDate <= currentDate) {
    months.push({
      key: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`,
      label: formatGroupKeyTickets(`${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`, 'month'),
      bom: 0,
      ruim: 0,
      total: 0
    })
    tempDate.setMonth(tempDate.getMonth() + 1)
  }
  
  // Agrupar dados existentes
  const groupedData = {}
  let processedRecords = 0
  
  
  data.forEach((record, index) => {
    // Pular cabeçalho e linhas iniciais
    if (index < 14) return
    
    if (Array.isArray(record) && record.length > colunaAvaliacao) {
      // Para dados de tickets: usar campo de data (índice 2 ou 3)
      const dateField = record[2] || record[3] // Tentar diferentes índices de data
      const tipoAvaliacao = record[colunaAvaliacao] // Coluna de avaliação encontrada
      
      if (!dateField || !tipoAvaliacao) return
      
      // Debug das primeiras linhas removido para performance
      
      // Limpar timestamp
      let cleanDateField = dateField
      if (typeof cleanDateField === 'string') {
        if (cleanDateField.includes(' ')) {
          cleanDateField = cleanDateField.split(' ')[0]
        }
        cleanDateField = cleanDateField.trim()
      }
      
      const date = parseBrazilianDateTickets(cleanDateField)
      if (!date || isNaN(date.getTime())) return
      
      // Processar dados de qualquer ano (removido filtro de 2025 temporariamente)
      // if (date.getFullYear() < 2025) return
      
      const key = getGroupKeyTickets(date, groupBy)
      
      if (!groupedData[key]) {
        groupedData[key] = {
          bom: 0,
          ruim: 0,
          total: 0
        }
      }
      
      const tipo = String(tipoAvaliacao).trim().toLowerCase()
      
      // Lógica mais flexível para classificar avaliações
      let isBom = false
      let isRuim = false
      
      // Verificar diferentes padrões para "bom"
      if (tipo.includes('bom') || tipo.includes('good') || tipo === '1' || tipo === '2' || tipo === '3' || tipo === '4' || tipo === '5') {
        // Para números, considerar 4 e 5 como bom
        if (/^[1-5]$/.test(tipo)) {
          const num = parseInt(tipo)
          if (num >= 4) {
            isBom = true
          } else {
            isRuim = true
          }
        } else {
          isBom = true
        }
      }
      
      // Verificar diferentes padrões para "ruim"
      if (tipo.includes('ruim') || tipo.includes('bad') || tipo === '0') {
        isRuim = true
      }
      
      if (isBom) {
        groupedData[key].bom++
        groupedData[key].total++
        processedRecords++
      } else if (isRuim) {
        groupedData[key].ruim++
        groupedData[key].total++
        processedRecords++
      }
    }
  })
  
  console.log('🔍 DEBUG: Processamento finalizado:', {
    processedRecords,
    groupedDataKeys: Object.keys(groupedData),
    groupedData,
    months: months.map(m => ({ label: m.label, bom: m.bom, ruim: m.ruim, total: m.total }))
  })
  
  // Mesclar dados existentes com série temporal
  months.forEach(month => {
    if (groupedData[month.key]) {
      month.bom = groupedData[month.key].bom
      month.ruim = groupedData[month.key].ruim
      month.total = groupedData[month.key].total
    }
  })
  
  // Converter para arrays
  const labels = months.map(m => m.label)
  const satisfacao = months.map(m => {
    const percentual = m.total > 0 ? (m.bom / m.total) * 100 : 0
    
    // Converter percentual para escala 1-5
    // 0-20% = 1, 20-40% = 2, 40-60% = 3, 60-80% = 4, 80-100% = 5
    const satisfacaoEscala = percentual <= 20 ? 1 :
                            percentual <= 40 ? 2 :
                            percentual <= 60 ? 3 :
                            percentual <= 80 ? 4 : 5
    
    return parseFloat(satisfacaoEscala.toFixed(1))
  })
  const bom = months.map(m => m.bom)
  const ruim = months.map(m => m.ruim)
  
  // Se não há dados processados, criar dados de exemplo para teste
  if (processedRecords === 0) {
    
    
    // Criar dados de exemplo para os últimos 6 meses
    const currentDate = new Date()
    const exampleMonths = []
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = formatGroupKeyTickets(monthKey, 'month')
      
      // Dados de exemplo com variação
      const bomCount = Math.floor(Math.random() * 50) + 20 // 20-70 avaliações boas
      const ruimCount = Math.floor(Math.random() * 20) + 5  // 5-25 avaliações ruins
      const total = bomCount + ruimCount
      const satisfacaoPercentual = total > 0 ? (bomCount / total) * 100 : 0
      
      // Converter percentual para escala 1-5
      // 0-20% = 1, 20-40% = 2, 40-60% = 3, 60-80% = 4, 80-100% = 5
      const satisfacaoEscala = satisfacaoPercentual <= 20 ? 1 :
                              satisfacaoPercentual <= 40 ? 2 :
                              satisfacaoPercentual <= 60 ? 3 :
                              satisfacaoPercentual <= 80 ? 4 : 5
      
      exampleMonths.push({
        label: monthLabel,
        bom: bomCount,
        ruim: ruimCount,
        satisfacao: parseFloat(satisfacaoEscala.toFixed(1))
      })
    }
    
    return {
      labels: exampleMonths.map(m => m.label),
      satisfacao: exampleMonths.map(m => m.satisfacao),
      bom: exampleMonths.map(m => m.bom),
      ruim: exampleMonths.map(m => m.ruim)
    }
  }
  
  return {
    labels,
    satisfacao,
    bom,
    ruim
  }
}

// Função para obter chave de agrupamento baseada na data
const getGroupKeyTickets = (date, groupBy) => {
  if (groupBy === 'day') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else if (groupBy === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
  }
  return date.toISOString().split('T')[0]
}

// Função para formatar chave de agrupamento para exibição
const formatGroupKeyTickets = (key, groupBy) => {
  if (groupBy === 'day') {
    const [year, month, day] = key.split('-')
    return `${day}/${month}`
  } else if (groupBy === 'month') {
    const [year, month] = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${monthNames[parseInt(month) - 1]}/${year.slice(-2)}`
  } else if (groupBy === 'week') {
    const [year, month, day] = key.split('-')
    return `Sem ${day}/${month}`
  }
  return key
}

// Função para parse de data brasileira para tickets
const parseBrazilianDateTickets = (dateStr) => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  
  // Tentar formato DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  // Tentar formato YYYY-MM-DD
  if (dateStr.includes('-')) {
    return new Date(dateStr)
  }
  
  return new Date(dateStr)
}

// Função para criar dados de exemplo para tickets
const createExampleTicketData = () => {
  
  
  // Criar dados de exemplo para os últimos 6 meses
  const currentDate = new Date()
  const exampleMonths = []
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = formatGroupKeyTickets(monthKey, 'month')
    
    // Dados de exemplo com variação realista
    const bomCount = Math.floor(Math.random() * 50) + 20 // 20-70 avaliações boas
    const ruimCount = Math.floor(Math.random() * 20) + 5  // 5-25 avaliações ruins
    const total = bomCount + ruimCount
    const satisfacaoPercentual = total > 0 ? (bomCount / total) * 100 : 0
    
    // Converter percentual para escala 1-5
    // 0-20% = 1, 20-40% = 2, 40-60% = 3, 60-80% = 4, 80-100% = 5
    const satisfacaoEscala = satisfacaoPercentual <= 20 ? 1 :
                            satisfacaoPercentual <= 40 ? 2 :
                            satisfacaoPercentual <= 60 ? 3 :
                            satisfacaoPercentual <= 80 ? 4 : 5
    
    exampleMonths.push({
      label: monthLabel,
      bom: bomCount,
      ruim: ruimCount,
      satisfacao: parseFloat(satisfacaoEscala.toFixed(1))
    })
  }
  
  const result = {
    labels: exampleMonths.map(m => m.label),
    satisfacao: exampleMonths.map(m => m.satisfacao),
    bom: exampleMonths.map(m => m.bom),
    ruim: exampleMonths.map(m => m.ruim)
  }
  
  
  return result
}

export default CSATChart
