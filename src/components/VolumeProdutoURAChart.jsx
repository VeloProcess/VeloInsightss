import React, { useMemo, useState, memo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useTicketsData } from '../hooks/useTicketsData'
import './VolumeProdutoURAChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Componente para mostrar distribuição de volume por fila da URA

const VolumeProdutoURAChart = memo(({ data = [], periodo = null, isTicketsTab = false }) => {
  // Só usar dados de tickets se explicitamente solicitado
  const shouldUseTicketsData = isTicketsTab
  
  const chartData = useMemo(() => {
    let processedData
    
    if (shouldUseTicketsData) {
      // Para dados de tickets, processar dados de filas de tickets
      processedData = processTicketsDataForQueues(data, periodo)
    } else {
      // Para dados normais de telefonia
      processedData = processVolumeProdutoRadar(data, periodo)
    }
    
    // Gerar cores dinâmicas para cada produto
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',   // Verde
      'rgba(245, 101, 101, 0.8)',  // Vermelho
      'rgba(251, 191, 36, 0.8)',   // Amarelo
      'rgba(139, 92, 246, 0.8)',   // Roxo
      'rgba(236, 72, 153, 0.8)',   // Rosa
      'rgba(34, 197, 94, 0.8)',    // Verde claro
      'rgba(249, 115, 22, 0.8)',   // Laranja
      'rgba(99, 102, 241, 0.8)',   // Índigo
      'rgba(20, 184, 166, 0.8)',   // Ciano
      'rgba(168, 85, 247, 0.8)',   // Violeta
      'rgba(244, 63, 94, 0.8)',    // Rosa escuro
      'rgba(14, 165, 233, 0.8)',   // Azul claro
      'rgba(34, 197, 94, 0.8)',    // Verde
      'rgba(251, 146, 60, 0.8)',   // Laranja claro
      'rgba(147, 51, 234, 0.8)',   // Roxo escuro
      'rgba(6, 182, 212, 0.8)',    // Ciano claro
      'rgba(251, 113, 133, 0.8)'    // Rosa claro
    ]
    
    // Garantir que processedData seja válido
    if (!processedData || !processedData.labels || !processedData.values) {
      processedData = {
        labels: ['Sem dados'],
        values: [0]
      }
    }
    
    return {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Distribuição por Fila (%)',
          data: processedData.values,
          backgroundColor: processedData.labels.map((_, index) => colors[index % colors.length]),
          borderColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          borderWidth: 2,
          hoverBackgroundColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '0.9')),
          hoverBorderColor: processedData.labels.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          hoverBorderWidth: 3
        }
      ]
    }
  }, [data, periodo, isTicketsTab])

  // Aplicar tamanho grande para aba Tickets
  const shouldUseLargeSize = isTicketsTab

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0.8, // Valor menor para renderizar corretamente
    indexAxis: 'y',
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
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
            size: shouldUseLargeSize ? 14 : 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          callback: function(value) {
            return value + '%'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: shouldUseLargeSize ? 14 : 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const queueName = chartData.labels[index]
            return queueName
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: shouldUseLargeSize ? 16 : 14,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          padding: shouldUseLargeSize ? 20 : 15,
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: shouldUseLargeSize ? 16 : 12,
          boxHeight: shouldUseLargeSize ? 16 : 12,
          color: '#1f2937',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                return {
                  text: `${label} (${value}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor[index],
                  lineWidth: data.datasets[0].borderWidth,
                  pointStyle: 'rect',
                  hidden: false,
                  index: index
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
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
            return `📊 ${context[0].label}`
          },
          label: function(context) {
            const fila = context.label
            const percentual = context.parsed
            
            return [
              `📋 ${fila} - ${percentual}%`
            ]
          },
          afterBody: function(context) {
            return `\n📊 Distribuição por filas da URA`
          },
          labelTextColor: function(context) {
            return '#ffffff'
          }
        }
      }
    }
  }), [chartData, shouldUseLargeSize])

  // Debug logs
  // Debug removido para otimização

  // Debug removido para otimização

  // Verificar se há dados válidos para renderizar
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    // Debug removido para otimização
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px dashed #d1d5db'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div>Sem dados para exibir</div>
        </div>
      </div>
    )
  }

  return (
    <div className="volume-chart-container">
      {/* Header - só mostrar se não for aba de tickets */}
      {!shouldUseTicketsData && (
        <div className="volume-chart-header">
          <h3 className="volume-chart-title">Volume por Produto URA</h3>
          <svg className="volume-chart-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Gráfico */}
      <div className="volume-chart-wrapper">
        {chartData && chartData.labels && chartData.labels.length > 0 ? 
          <Bar data={chartData} options={options} /> : 
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Sem dados para exibir
          </div>
        }
      </div>
    </div>
  )
})

// Processar dados para gráfico de radar (filas da coluna K)
// Função para processar dados de tickets da aba Tickets
const processTicketsDataForQueues = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }

  // Filas específicas que queremos mostrar (com variações)
  const filasEspecificas = [
    { nome: 'IRPF', palavras: ['IRPF', 'IMPOSTO DE RENDA'] },
    { nome: 'CALCULADORA', palavras: ['CALCULADORA', 'CALCULO', 'CÁLCULO'] },
    { nome: 'ANTECIPAÇÃO DA RESTITUIÇÃO', palavras: ['ANTECIPAÇÃO', 'RESTITUIÇÃO', 'ANTECIPACAO'] },
    { nome: 'OFF', palavras: ['OFF', 'OFFLINE'] },
    { nome: 'EMPRÉSTIMO PESSOAL', palavras: ['EMPRÉSTIMO', 'EMPRESTIMO', 'PESSOAL', 'CRÉDITO'] },
    { nome: 'TABULAÇÃO PENDENTE', palavras: ['TABULAÇÃO', 'TABULACAO', 'PENDENTE'] },
    { nome: 'PIX', palavras: ['PIX', 'TRANSFERÊNCIA', 'TRANSFERENCIA', 'RECEBIMENTO'] }
  ]

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (rowIndex) => {
    if (!periodo || !periodo.startDate || !periodo.endDate) return true
    
    try {
      const row = data[rowIndex + 14] // Ajustar para o índice real
      if (!row || !row[0]) return true
      
      const rowDate = parseBrazilianDate(row[0])
      if (!rowDate || isNaN(rowDate.getTime())) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      // Normalizar para comparar apenas a data (sem hora)
      const recordDate = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
      const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      return recordDate >= startDateNorm && recordDate <= endDateNorm
    } catch (error) {
      return true
    }
  }

  // Para tickets, processar dados da coluna de fila/assunto
  const maxRows = 150000
  const dataToProcess = data.length > maxRows ? data.slice(0, maxRows) : data
  
  const filaCounts = {}
  let processedRows = 0
  
  // Processar dados a partir da linha 15 (índice 14)
  dataToProcess.slice(14).forEach((row, index) => {
    // Para tickets, usar APENAS coluna B (Assunto do ticket)
    let assunto = null
    
    // APENAS coluna B (índice 1) - Assunto do ticket
    if (row[1] !== undefined && row[1] !== null && row[1] !== '') {
      assunto = String(row[1]).trim()
    }
    
    if (assunto && assunto !== '0' && assunto !== '' && assunto !== 'null' && assunto !== 'undefined') {
      // Verificar se está no período
      if (isDateInPeriod(index)) {
        // Normalizar o assunto para comparação
        const assuntoNormalizado = assunto.toUpperCase()
        
        // Verificar se o assunto corresponde a alguma das filas específicas
        const filaEncontrada = filasEspecificas.find(filaEspecifica => 
          filaEspecifica.palavras.some(palavra => 
            assuntoNormalizado.includes(palavra.toUpperCase())
          )
        )
        
        if (filaEncontrada) {
          // Usar o nome padronizado da fila específica
          filaCounts[filaEncontrada.nome] = (filaCounts[filaEncontrada.nome] || 0) + 1
          processedRows++
        }
      }
    }
  })

  // Garantir que todas as filas específicas apareçam, mesmo com 0
  filasEspecificas.forEach(fila => {
    if (!filaCounts[fila.nome]) {
      filaCounts[fila.nome] = 0
    }
  })

  // Converter para arrays ordenados (manter ordem das filas específicas)
  const filasOrdenadas = filasEspecificas.map(fila => fila.nome).filter(fila => filaCounts[fila] > 0)
  const total = filasOrdenadas.reduce((sum, fila) => sum + filaCounts[fila], 0)

  if (total === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }

  return {
    labels: filasOrdenadas,
    values: filasOrdenadas.map(fila => {
      const count = filaCounts[fila]
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0
    })
  }
}

const processTicketsData = (processedData) => {
  const { queueCounts, totalTickets } = processedData
  
  if (totalTickets === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }
  
  // Ordenar filas por volume (maior para menor)
  const filasOrdenadas = Object.keys(queueCounts).sort((a, b) => queueCounts[b] - queueCounts[a])
  
  // Calcular total para porcentagens
  const total = filasOrdenadas.reduce((sum, fila) => sum + queueCounts[fila], 0)
  
  const result = {
    labels: filasOrdenadas,
    values: filasOrdenadas.map(fila => {
      const count = queueCounts[fila]
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0
    })
  }
  
  return result
}

const processVolumeProdutoRadar = (data, periodo) => {
  if (!data || data.length === 0) {
    // Debug removido para otimização
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (rowIndex) => {
    if (!periodo || !periodo.startDate || !periodo.endDate) return true
    
    try {
      const row = data[rowIndex + 14]
      if (!row || !row[0]) return true
      
      const rowDate = parseBrazilianDate(row[0])
      if (!rowDate || isNaN(rowDate.getTime())) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      // Normalizar para comparar apenas a data (sem hora)
      const recordDate = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
      const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      return recordDate >= startDateNorm && recordDate <= endDateNorm
    } catch (error) {
      return true
    }
  }

  // Mapear filas da coluna K
  // Processar até 150k linhas para encontrar todas as filas
  const maxRows = 150000
  const dataToProcess = data.length > maxRows ? data.slice(0, maxRows) : data
  
  const filaCounts = {}
  let processedRows = 0
  
  
  // Processar dados a partir da linha 15 (índice 14) para evitar cabeçalhos
  dataToProcess.slice(14).forEach((row, index) => {
    if (Array.isArray(row) && row[10] !== undefined && row[10] !== null && row[10] !== '') {
      const fila = String(row[10]).trim() // Coluna K = índice 10
      
      if (fila && fila !== '0' && fila !== '' && fila !== 'null' && fila !== 'undefined') {
        // Desconsiderar apenas "Cobrança" (com ç), não "Cobranca"
        if (fila.toLowerCase().includes('cobrança')) {
          return
        }
        
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(index)) {
          return
        }
        
        processedRows++
        
        // Normalizar o nome da fila - remover números no início e hífens
        const filaNormalizada = fila.trim().replace(/^\d+\s*/, '').replace(/^-+\s*/, '').trim()
        
        filaCounts[filaNormalizada] = (filaCounts[filaNormalizada] || 0) + 1
        
        // Debug removido para otimização
      }
    }
  })
  
  // Filtrar filas que não têm dados no período selecionado
  const filasComDados = Object.keys(filaCounts).filter(fila => filaCounts[fila] > 0)
  
  // Ordenar filas por volume (maior para menor)
  const filasOrdenadas = filasComDados.sort((a, b) => filaCounts[b] - filaCounts[a])

  if (filasOrdenadas.length === 0) {
    // Debug removido para otimização
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }
  
  // Calcular total para porcentagens
  const total = filasOrdenadas.reduce((sum, fila) => sum + filaCounts[fila], 0)
  
  const result = {
    labels: filasOrdenadas,
    values: filasOrdenadas.map(fila => {
      const count = filaCounts[fila]
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0
    })
  }
  
  return result
}

// Funções auxiliares
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

const getGroupKey = (date, groupBy) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekNum = getWeekNumber(date)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  } else {
    return `${year}-${String(month).padStart(2, '0')}`
  }
}

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const formatLabel = (key, groupBy) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    const parts = key.split('-W')
    return `Sem ${parts[1]}`
  } else {
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default VolumeProdutoURAChart
