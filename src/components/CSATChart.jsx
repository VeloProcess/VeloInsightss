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
    
    console.log('🔍 CSAT Debug - Processando Todos os Dados:')
    console.log('Total Records:', data.length)
    console.log('Processando:', allData.length, 'registros (SEM LIMITE)')
    console.log('Campo Atendimento (AB):', firstRecord['Pergunta2 1 PERGUNTA ATENDENTE'])
    console.log('Campo Solução (AC):', firstRecord['Pergunta2 2 PERGUNTA SOLUCAO'])
    console.log('Atendimento Válido:', !isNaN(parseFloat(firstRecord['Pergunta2 1 PERGUNTA ATENDENTE'])) && parseFloat(firstRecord['Pergunta2 1 PERGUNTA ATENDENTE']) >= 1 && parseFloat(firstRecord['Pergunta2 1 PERGUNTA ATENDENTE']) <= 5)
    console.log('Solução Válida:', !isNaN(parseFloat(firstRecord['Pergunta2 2 PERGUNTA SOLUCAO'])) && parseFloat(firstRecord['Pergunta2 2 PERGUNTA SOLUCAO']) >= 1 && parseFloat(firstRecord['Pergunta2 2 PERGUNTA SOLUCAO']) <= 5)

    return processCSATDataForLines(allData, periodo)
  }, [data, periodo])

  // Se não há dados para exibir
  if (!processedData.datasets.length || processedData.datasets.every(dataset => dataset.data.every(val => val === 0))) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>CSAT - Satisfação do Cliente</h3>
        </div>
        <div className="no-data-message">
          <p>Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  // Verificar se há dados de tickets para usar nas opções
  const hasTicketData = processedData.datasets.some(dataset => 
    dataset.label === 'Satisfação (%)'
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
          text: hasTicketData ? 'Satisfação (%)' : 'Nota (3.5-5)',
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
        <h3>CSAT - Satisfação do Cliente</h3>
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

  // Agrupar dados por período
  const groupedData = {}
  let processedCount = 0
  let validDataCount = 0
  
  data.forEach((record, index) => {
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
    
    // Criar chave de agrupamento (por mês)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`
    
    if (!groupedData[key]) {
      groupedData[key] = {
        label: formatMonthLabel(key),
        notasAtendimento: [],
        notasSolucao: [],
        avaliacoes: { bom: 0, ruim: 0, total: 0 },
        date: date
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

  console.log('🔍 CSAT Processamento Completo:', {
    totalProcessed: processedCount,
    validDataFound: validDataCount,
    groupedKeys: Object.keys(groupedData).length,
    sampleGroup: Object.keys(groupedData)[0] ? groupedData[Object.keys(groupedData)[0]] : null,
    totalRecords: data.length,
    processedPercentage: ((processedCount / data.length) * 100).toFixed(1) + '%'
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
  
  console.log('🔍 CSAT Detecção de Dados:', {
    hasPhoneData,
    hasTicketData,
    totalKeys: sortedKeys.length,
    sampleData: sortedKeys.length > 0 ? groupedData[sortedKeys[0]] : null
  })

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

// Função para parsear data brasileira
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  
  if (dateStr instanceof Date) return dateStr
  
  // Tentar diferentes formatos
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
  ]
  
  for (const format of formats) {
    const match = dateStr.toString().match(format)
    if (match) {
      if (format === formats[0]) { // DD/MM/YYYY
        const [, day, month, year] = match
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else if (format === formats[1]) { // YYYY-MM-DD
        const [, year, month, day] = match
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else if (format === formats[2]) { // DD-MM-YYYY
        const [, day, month, year] = match
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
    }
  }
  
  // Tentar parse direto
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

// Função para formatar label do mês
const formatMonthLabel = (key) => {
  const [year, month] = key.split('-')
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${monthNames[parseInt(month) - 1]}/${year}`
}

export default CSATChart
