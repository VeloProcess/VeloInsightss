import React, { useMemo, memo } from 'react'
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
import 'chartjs-plugin-datalabels'

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

// Função auxiliar para calcular número da semana
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Função auxiliar para parse de data brasileira
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  if (typeof dateStr === 'string' && dateStr.includes(' ')) {
    dateStr = dateStr.split(' ')[0]
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
  }
  return new Date(dateStr)
}

const CSATChart = memo(({ data = [], periodo = null }) => {
  // Processar dados para gráfico de linhas
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: []
      }
    }

    // Processar todos os dados disponíveis (sem limite)
    const allData = data

    // Debug expandido dos campos
    const firstRecord = allData[0] || {}
    const allKeys = Object.keys(firstRecord)
    const allFields = allKeys.map(key => `${key}: "${firstRecord[key]}"`)
    
    // Detectar tipo de dados e processar adequadamente
    // Para dados de tickets, o primeiro registro deve ser um array
    const isTicketData = Array.isArray(firstRecord)
    
    
    if (isTicketData) {
      // Dados de tickets - usar processamento de FCR/TMA
      return processTMADataForLines(allData, periodo)
    } else {
      // Dados de telefonia - usar processamento de CSAT original
      return processCSATDataForLines(allData, periodo)
    }
  }, [data, periodo])

  // Detectar tipo de dados para título dinâmico
  const isTicketData = Array.isArray(data[0])
  const chartTitle = isTicketData ? 'FCR - First Call Resolution' : 'CSAT - Satisfação do Cliente'

  // Se não há dados para exibir
  if (!processedData.datasets.length || processedData.datasets.every(dataset => dataset.data.every(val => val === 0))) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{chartTitle}</h3>
        </div>
        <div className="no-data-message">
          <p>Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  // Verificar se há dados de tickets para usar nas opções
  const hasTicketData = processedData.datasets.some(dataset => 
    dataset.label === 'FCR (%)' || dataset.label === 'Satisfação (%)'
  )

  // Configuração do gráfico de linhas
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          color: '#333',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false,
        text: 'CSAT - Satisfação do Cliente',
      },
      datalabels: {
        color: '#fff',
        font: {
          size: 26,
          weight: 'bold',
          family: 'Arial, sans-serif'
        },
        backgroundColor: function(context) {
          // Cor baseada na linha (azul para atendimento, verde para solução)
          const datasetIndex = context.datasetIndex
          if (datasetIndex === 0) {
            return 'rgba(59, 130, 246, 0.9)' // Azul para Atendimento
          } else if (datasetIndex === 1) {
            return 'rgba(34, 197, 94, 0.9)' // Verde para Solução
          }
          return 'rgba(100, 100, 100, 0.9)' // Cinza padrão
        },
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: 8,
        padding: 8,
        offset: -10, // Mover para cima
        anchor: 'start', // Posicionar no início da linha
        align: 'end', // Alinhar à direita (para ficar à esquerda do ponto)
        formatter: (value, context) => {
          if (hasTicketData) {
            return value > 0 ? `${value.toFixed(1)}%` : ''
          }
          return value > 0 ? `${value.toFixed(1)}` : ''
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
          font: {
            size: 18,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          color: '#333'
        },
        ticks: {
          font: {
            size: 22,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          color: '#000',
          maxRotation: 0,
          padding: 10
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
          offset: true // Adicionar offset para mover as linhas
        }
      },
      y: {
        min: hasTicketData ? 0 : 3.5, // 0-100% para tickets, 3.5-5 para telefonia
        max: hasTicketData ? 100 : 5,
        title: {
          display: true,
          text: hasTicketData ? 'FCR (%)' : 'Nota (3.5-5)',
          font: {
            size: 18,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          color: '#333'
        },
        ticks: {
          font: {
            size: 24,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          color: '#000',
          stepSize: hasTicketData ? 20 : 0.1, // Passos de 20% para tickets, 0.1 para telefonia
          padding: 25,
          callback: function(value) {
            if (hasTicketData) {
              return value + '%'
            }
            return value.toFixed(1)
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
          offset: true
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 4
      },
      point: {
        radius: 14,
        hoverRadius: 16,
        borderWidth: 6,
        backgroundColor: '#fff',
        borderColor: '#000'
      }
    }
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{chartTitle}</h3>
      </div>
        <div className="chart-content">
          <Line data={processedData} options={options} />
        </div>
    </div>
  )
})

// Função para processar dados de CSAT para gráfico de linhas
const processCSATDataForLines = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      datasets: []
    }
  }

  // FILTRAR DADOS PELO PERÍODO ANTES DE PROCESSAR
  let filteredData = data
  
  if (periodo && periodo.startDate && periodo.endDate) {
    filteredData = data.filter(record => {
      let dateField
      if (Array.isArray(record)) {
        dateField = record[28]
      } else {
        dateField = record.Data_de_entrada || record.data || record.Data || record.date || record.calldate
      }
      
      if (!dateField) return false
      
      if (typeof dateField === 'string' && dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      
      const date = parseBrazilianDate(dateField)
      if (!date || isNaN(date.getTime())) return false
      
      // DESCARTAR DOMINGOS - não trabalhamos no domingo
      if (date.getDay() === 0) {
        return false // DOMINGO NÃO CONTA
      }
      
      const start = new Date(periodo.startDate)
      const end = new Date(periodo.endDate)
      
      const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // Agrupar dados por período
  const groupedData = {}
  let processedCount = 0
  let validDataCount = 0
  
  filteredData.forEach((record, index) => {
    // Pular cabeçalho
    if (index < 1) return

    // Detectar se é dados de tickets (array) ou dados de telefonia (objeto)
    let dateField
    let isTicketData = false
    
    if (Array.isArray(record)) {
      // Dados de tickets (array) - coluna AC (posição 28) = "Dia"
      isTicketData = true
      dateField = record[28] // Coluna AC = "Dia"
    } else {
      // Dados de telefonia (objeto)
      dateField = record.Data_de_entrada || record.data || record.Data || record.date || record.calldate
    }
    
    if (!dateField) return
    
    // Limpar timestamp
    if (typeof dateField === 'string' && dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
    }
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) return
    
    // Determinar o tipo de agrupamento baseado no período
    const totalDays = periodo?.totalDays || 0
    let key
    
    if (totalDays > 0 && totalDays <= 15) {
      // Por dia
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      key = `${year}-${month}-${day}`
    } else if (totalDays > 15 && totalDays <= 90) {
      // Por semana
      const year = date.getFullYear()
      const week = getWeekNumber(date)
      key = `${year}-W${week}`
    } else {
      // Por mês
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      key = `${year}-${month}`
    }
    
    if (!groupedData[key]) {
      // Para semanas, armazenar a data completa para calcular o range depois
      let label = formatLabel(key, date)
      groupedData[key] = {
        label: label,
        notasAtendimento: [],
        notasSolucao: [],
        avaliacoes: { bom: 0, ruim: 0, total: 0 },
        date: date,
        rawKey: key
      }
    }

    processedCount++

    if (isTicketData) {
      // Processar dados de tickets (array)
      const tipoAvaliacao = record[14] // Coluna O = "Tipo de avaliação"
      
      if (tipoAvaliacao && typeof tipoAvaliacao === 'string') {
        const tipo = tipoAvaliacao.toLowerCase().trim()
        groupedData[key].avaliacoes.total++
        
        if (tipo.includes('bom') || tipo.includes('ótimo') || tipo.includes('excelente')) {
          groupedData[key].avaliacoes.bom++
        } else if (tipo.includes('ruim') || tipo.includes('péssimo')) {
          groupedData[key].avaliacoes.ruim++
        }
        validDataCount++
      }
    } else {
      // Processar dados de telefonia (objeto)
      const satisfacao = parseFloat(record['Pergunta2 1 PERGUNTA ATENDENTE'] || record['Pergunta2 1 PERGUNTA ATENDENTE'])
      const solucao = parseFloat(record['Pergunta2 2 PERGUNTA SOLUCAO'] || record['Pergunta2 2 PERGUNTA SOLUCAO'])

      if (!isNaN(satisfacao) && satisfacao >= 1 && satisfacao <= 5) {
        groupedData[key].notasAtendimento.push(satisfacao)
        validDataCount++
      }

      if (!isNaN(solucao) && solucao >= 1 && solucao <= 5) {
        groupedData[key].notasSolucao.push(solucao)
        validDataCount++
      }
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(key => groupedData[key].label)
  
  // Preparar datasets baseado no tipo de dados disponível
  const datasets = []

  // Verificar se há dados de telefonia (notas de atendimento ou solução)
  const hasPhoneData = sortedKeys.some(key => 
    groupedData[key].notasAtendimento.length > 0 || groupedData[key].notasSolucao.length > 0
  )
  
  // Verificar se há dados de tickets (avaliações)
  const hasTicketData = sortedKeys.some(key => groupedData[key].avaliacoes.total > 0)
  
  if (hasPhoneData) {
    // Dataset para dados de telefonia - duas linhas separadas
    const atendimentoData = sortedKeys.map(key => {
      const notas = groupedData[key].notasAtendimento
      return notas.length > 0 ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length : 0
    })
    
    const solucaoData = sortedKeys.map(key => {
      const notas = groupedData[key].notasSolucao
      return notas.length > 0 ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length : 0
    })

    // Linha de Atendimento (AB)
    datasets.push({
      label: 'Atendimento (AB)',
      data: atendimentoData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 4,
      fill: false,
      tension: 0.4,
      pointRadius: 14,
      pointHoverRadius: 16,
      pointBorderWidth: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(59, 130, 246)'
    })

    // Linha de Solução (AC)
    datasets.push({
      label: 'Solução (AC)',
      data: solucaoData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 4,
      fill: false,
      tension: 0.4,
      pointRadius: 14,
      pointHoverRadius: 16,
      pointBorderWidth: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(34, 197, 94)'
    })
  }

  if (hasTicketData) {
    // Dataset para dados de tickets (percentual de satisfação)
    const satisfacaoData = sortedKeys.map(key => {
      const avaliacoes = groupedData[key].avaliacoes
      if (avaliacoes.total > 0) {
        return (avaliacoes.bom / avaliacoes.total) * 100
      }
      return 0
    })

    datasets.push({
      label: 'Satisfação (%)',
      data: satisfacaoData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 4,
      fill: false,
      tension: 0.4,
      pointRadius: 14,
      pointHoverRadius: 16,
      pointBorderWidth: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(34, 197, 94)',
      yAxisID: 'y'
    })
  }
  
  return {
    labels,
    datasets
  }
}

// Funções utilitárias para cálculo de FCR e dias úteis
const calcularTempoUtil = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  
  let tempoUtil = 0 // em horas
  
  // Se mesmo dia
  if (inicio.toDateString() === fim.toDateString()) {
    const horaInicio = Math.max(inicio.getHours(), 9) // mínimo 9h
    const horaFim = Math.min(fim.getHours(), 19)      // máximo 19h
    const minutoInicio = inicio.getMinutes()
    const minutoFim = fim.getMinutes()
    
    if (horaInicio < 19 && horaFim > 9) {
      tempoUtil = (horaFim - horaInicio) + (minutoFim - minutoInicio) / 60
    }
    return tempoUtil
  }
  
  // Calcular dias completos úteis
  let dataAtual = new Date(inicio)
  dataAtual.setHours(0, 0, 0, 0)
  
  while (dataAtual < fim) {
    const diaSemana = dataAtual.getDay()
    
    // Se é dia útil (1-5 = Segunda a Sexta)
    if (diaSemana >= 1 && diaSemana <= 5) {
      // Primeiro dia: das 9h até 19h (ou hora atual se for o dia de início)
      if (dataAtual.toDateString() === inicio.toDateString()) {
        const horaInicio = Math.max(inicio.getHours(), 9)
        tempoUtil += (19 - horaInicio) + (60 - inicio.getMinutes()) / 60
      }
      // Último dia: das 9h até hora de fim (ou 19h se for o dia de fim)
      else if (dataAtual.toDateString() === fim.toDateString()) {
        const horaFim = Math.min(fim.getHours(), 19)
        tempoUtil += (horaFim - 9) + fim.getMinutes() / 60
      }
      // Dias intermediários: dia completo (10 horas)
      else {
        tempoUtil += 10 // 9h às 19h = 10 horas
      }
    }
    
    dataAtual.setDate(dataAtual.getDate() + 1)
  }
  
  return tempoUtil
}

const calcularFCR = (tempoPrimeiraResposta, tempoTotal) => {
  // FCR = Primeira resposta resolveu o ticket completamente
  // Consideramos FCR se primeira resposta >= 95% do tempo total
  const tempoPrimeira = parseFloat(tempoPrimeiraResposta) || 0
  const tempoTotalNum = parseFloat(tempoTotal) || 0
  
  if (tempoTotalNum === 0) return false
  
  return tempoPrimeira >= (tempoTotalNum * 0.95)
}

// Função para processar dados de TMA para gráfico de linhas
const processTMADataForLines = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      datasets: []
    }
  }

  // Agrupar dados por período para FCR
  const groupedData = {}
  let processedCount = 0
  let validDataCount = 0
  
  data.forEach((record, index) => {
    // Pular cabeçalho
    if (index < 1) return

    // Processar dados de tickets (array)
    if (Array.isArray(record)) {
      const dataEntrada = record[4]    // "Data de entrada"
      const dataResolucao = record[8]  // "Data da resolução"
      const tempoPrimeiraResposta = record[6] // "Tempo total de primeira resposta (em horas)"
      const tempoTotal = record[9]     // "Tempo total do atendimento (em horas)"
      const mes = record[28]           // "Mês"
      
      // Só processar tickets fechados
      if (!dataResolucao || dataResolucao === '') return
      
      // FORÇAR agrupamento mensal - sempre extrair mês/ano da data
      let key = null
      
      // Primeiro tentar usar a coluna "Mês" se for formato correto
      if (mes && typeof mes === 'string' && mes.match(/^\d{4}-\d{2}$/)) {
        key = mes
      }
      
      // Se não, extrair da data de entrada
      if (!key && dataEntrada) {
        const date = parseBrazilianDate(dataEntrada)
        if (date && !isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          key = `${year}-${month}`
        }
      }
      
      // Se ainda não tem key, tentar extrair da string de data diretamente
      if (!key && dataEntrada) {
        const dateStr = dataEntrada.toString()
        // Tentar diferentes formatos de data
        const patterns = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/,    // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/    // DD-MM-YYYY
        ]
        
        for (const pattern of patterns) {
          const match = dateStr.match(pattern)
          if (match) {
            let year, month
            if (pattern === patterns[0]) { // DD/MM/YYYY
              [, , year] = match
              month = match[2]
            } else if (pattern === patterns[1]) { // YYYY-MM-DD
              [year, month] = match.slice(1, 3)
            } else { // DD-MM-YYYY
              [, , year] = match
              month = match[2]
            }
            key = `${year}-${month.padStart(2, '0')}`
            break
          }
        }
      }
      
      if (!key) return
      
      if (!groupedData[key]) {
        groupedData[key] = {
          label: formatMonthLabel(key),
          tickets: [],
          fcrCount: 0,
          totalTickets: 0,
          tmaTotal: 0,
          date: dataEntrada ? parseBrazilianDate(dataEntrada) : new Date()
        }
      }

      // Calcular FCR
      const isFCR = calcularFCR(tempoPrimeiraResposta, tempoTotal)
      
      // Calcular TMA em dias úteis
      let tmaUtil = 0
      if (dataEntrada && dataResolucao) {
        tmaUtil = calcularTempoUtil(dataEntrada, dataResolucao)
      } else {
        // Usar tempo total se não tiver datas
        tmaUtil = parseFloat(tempoTotal) || 0
      }
      
      groupedData[key].tickets.push({
        isFCR,
        tmaUtil,
        tempoTotal: parseFloat(tempoTotal) || 0,
        tempoPrimeiraResposta: parseFloat(tempoPrimeiraResposta) || 0
      })
      
      groupedData[key].totalTickets++
      groupedData[key].tmaTotal += tmaUtil
      if (isFCR) groupedData[key].fcrCount++
      
      processedCount++
      validDataCount++
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(key => groupedData[key].label)
  
  // Preparar datasets para FCR e TMA
  const datasets = []

  // Verificar se há dados de tickets
    const hasTicketData = sortedKeys.some(key => groupedData[key].totalTickets > 0)
    
    if (hasTicketData) {
    // Dataset para FCR (%)
    const fcrData = sortedKeys.map(key => {
      const data = groupedData[key]
      return data.totalTickets > 0 ? (data.fcrCount / data.totalTickets) * 100 : 0
    })

    // Linha de FCR (%) - apenas FCR
    datasets.push({
      label: 'FCR (%)',
      data: fcrData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 4,
      fill: false,
      tension: 0.4,
      pointRadius: 14,
      pointHoverRadius: 16,
      pointBorderWidth: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(34, 197, 94)'
    })
  }
  
  return {
    labels,
    datasets
  }
}

// Função para formatar label conforme o tipo de agrupamento
const formatLabel = (key, date = null) => {
  // Por dia: YYYY-MM-DD
  if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = key.split('-')
    return `${day}/${month}`
  }
  // Por semana: calcular início e fim da semana
  if (key.match(/^\d{4}-W\d+$/)) {
    if (date) {
      // Calcular início da semana (segunda-feira)
      const dayOfWeek = date.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - diff)
      
      // Calcular fim da semana (domingo)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
    } else {
      const [, week] = key.split('-W')
      return `Sem ${week}`
    }
  }
  // Por mês: YYYY-MM
  const [year, month] = key.split('-')
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${monthNames[parseInt(month) - 1]}/${year}`
}

export default CSATChart
