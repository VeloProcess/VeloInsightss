import React, { useMemo, memo } from 'react'
import { Line } from 'react-chartjs-2'
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
import { useTicketsData } from '../hooks/useTicketsData'
import './VolumeProdutoURAChart.css'

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

const VolumeProdutoURAChart = memo(({ data = [], periodo = null, isTicketsTab = false }) => {
  const shouldUseTicketsData = isTicketsTab
  
  const chartData = useMemo(() => {
    let processedData
    
    if (shouldUseTicketsData) {
      processedData = processTicketsDataForQueues(data, periodo)
    } else {
      processedData = processVolumeProdutoRadar(data, periodo)
    }
    
    if (!processedData || !processedData.labels) {
      processedData = {
        labels: ['Sem dados'],
        datasets: [{ label: 'Sem dados', data: [0] }]
      }
    }
    
    if (processedData.datasets) {
      return processedData
    }
    
    return processedData
  }, [data, periodo, isTicketsTab])

  // Processar dados para tabela (ordenado do maior para o menor)
  const tableData = useMemo(() => {
    if (!chartData.datasets || !chartData.labels) return []
    
    const rows = chartData.datasets.map((dataset, idx) => {
      const total = dataset.data.reduce((sum, val) => sum + (Number(val) || 0), 0)
      
      return {
        product: dataset.label,
        values: dataset.data,
        total: total,
        color: dataset.backgroundColor,
        sparklineData: dataset.data
      }
    })
    
    // Ordenar do maior para o menor (por total)
    return rows.sort((a, b) => b.total - a.total)
  }, [chartData])
  
  // Calcular valor máximo para heatmap
  const maxValue = useMemo(() => {
    if (tableData.length === 0) return 1
    return Math.max(...tableData.map(row => Math.max(...row.values)))
  }, [tableData])
  
  // Função para calcular cor do heatmap
  const getHeatColor = (value) => {
    if (value === 0) return '#f9fafb'
    const intensity = value / maxValue
    if (intensity < 0.2) return '#dbeafe'
    if (intensity < 0.4) return '#93c5fd'
    if (intensity < 0.7) return '#60a5fa'
    return '#3b82f6'
  }
  
  // Opções para sparklines (mini gráficos de linha)
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { display: false, grid: { display: false } }
    },
    elements: {
      point: { radius: 0 },
      line: { borderWidth: 2, tension: 0.3 }
    },
    layout: { padding: 0 }
  }
  
  if (!chartData || !chartData.labels || chartData.labels.length === 0 || tableData.length === 0) {
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
      {!shouldUseTicketsData && (
        <div className="volume-chart-header">
          <h3 className="volume-chart-title">Volume por Produto URA</h3>
          <svg className="volume-chart-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="volume-table-container">
        <table className="volume-table">
          <thead>
            <tr>
              <th>Produto/Fila</th>
              {chartData.labels.map(month => <th key={month}>{month}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIdx) => (
              <tr key={row.product}>
                <td className="product-cell">
                  <div className="product-indicator" style={{ background: row.color }} />
                  {row.product}
                </td>
                {row.values.map((value, idx) => (
                  <td key={idx} style={{ background: getHeatColor(value) }}>
                    {value.toLocaleString('pt-BR')}
                  </td>
                ))}
                <td className="total-cell">
                  {row.total.toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

VolumeProdutoURAChart.displayName = 'VolumeProdutoURAChart'

// Processar dados para gráfico de radar
const processVolumeProdutoRadar = (data, periodo) => {
  if (!data || data.length === 0) return { labels: ['Sem dados'], datasets: [{ label: 'Sem dados', data: [0] }] }
  
  const filas = [
    { nome: 'IRPF', palavras: ['IRPF', 'IMPOSTO'] },
    { nome: 'CALCULADORA', palavras: ['CALCULADORA', 'CALCULO'] },
    { nome: 'ANTECIPAÇÃO DA RESTITUIÇÃO', palavras: ['ANTECIPAÇÃO', 'RESTITUICAO'] },
    { nome: 'OFF', palavras: ['OFF', 'FORA'] },
    { nome: 'EMPRÉSTIMO PESSOAL', palavras: ['EMPRESTIMO', 'EMPRÉSTIMO', 'LOAN'] },
    { nome: 'TABULAÇÃO PENDENTE', palavras: ['TABULAÇÃO', 'TABULACAO'] },
    { nome: 'PIX', palavras: ['PIX'] }
  ]
  
  const counts = {}
  
  data.forEach(row => {
    const assunto = String(row.K || '').toUpperCase()
    const filaEncontrada = filas.find(fila => 
      fila.palavras.some(palavra => assunto.includes(palavra))
    )
    
    if (filaEncontrada) {
      counts[filaEncontrada.nome] = (counts[filaEncontrada.nome] || 0) + 1
    }
  })
  
  return {
    labels: filas.map(f => f.nome),
    datasets: [{
      label: 'Volume',
      data: filas.map(f => counts[f.nome] || 0),
      backgroundColor: filas.map((_, idx) => [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ][idx]),
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1
    }]
  }
}

// Função para processar dados de tickets da aba Tickets
const processTicketsDataForQueues = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      datasets: [{ label: 'Sem dados', data: [0] }]
    }
  }

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

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month) - 1]}/${year}`
  }

  const filasEspecificas = [
    { nome: 'IRPF', palavras: ['IRPF', 'IMPOSTO', 'RENDA', 'DECLARAÇÃO', 'RESTITUIÇÃO', 'RECEITA', 'FEDERAL', 'APURAÇÃO', 'IMPOSTO DE RENDA', 'INSS', 'FGTS', 'CONTRIBUINTE', 'FISCAL', 'FINANCEIRO', 'DARF', 'DARFS', 'RECOLHIMENTO', 'RECOLLHIMENTO', 'RECOLHIMENTOS', 'RECOLLHIMENTOS'] },
    { nome: 'CALCULADORA', palavras: ['CALCULADORA', 'CALCULO'] },
    { nome: 'ANTECIPAÇÃO DA RESTITUIÇÃO', palavras: ['ANTECIPAÇÃO', 'RESTITUICAO'] },
    { nome: 'OFF', palavras: ['OFF'] },
    { nome: 'EMPRÉSTIMO PESSOAL', palavras: ['EMPRESTIMO', 'EMPRÉSTIMO', 'LOAN', 'EMPRE'] },
    { nome: 'TABULAÇÃO PENDENTE', palavras: ['TABULAÇÃO', 'TABULACAO', 'TABUL'] },
    { nome: 'PIX', palavras: ['PIX'] }
  ]

  const groupedByMonth = {}
  const months = new Set()
  
  data.forEach((row, idx) => {
    if (!row || !Array.isArray(row)) {
      return
    }
    
    if (row.length < 29) {
      return
    }
    
    const assunto = String(row[1] || '').toUpperCase().trim() // Coluna B = Assunto do ticket
    const dataEntrada = row[28] // Date at index 28 = "01/01/2025 00:00:00"
    
    if (!assunto || !dataEntrada) return
    
    const dateObj = parseBrazilianDate(dataEntrada)
    if (!dateObj) return
    
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
    months.add(monthKey)
    
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = {}
      filasEspecificas.forEach(fila => {
        groupedByMonth[monthKey][fila.nome] = 0
      })
    }
    
    const filaEncontrada = filasEspecificas.find(filaEspecifica => 
      filaEspecifica.palavras.some(palavra => 
        assunto.includes(palavra.toUpperCase())
      )
    )
    
    if (filaEncontrada) {
      groupedByMonth[monthKey][filaEncontrada.nome] = (groupedByMonth[monthKey][filaEncontrada.nome] || 0) + 1
    }
  })

  if (Object.keys(groupedByMonth).length === 0) {
    return {
      labels: ['Sem dados'],
      datasets: [{ label: 'Sem dados', data: [0] }]
    }
  }
  
  const sortedMonths = Array.from(months).sort()
  const labels = sortedMonths.map(monthKey => formatMonthLabel(monthKey))
  
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 101, 101, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(34, 197, 94, 0.8)',
  ]
  
  const datasets = filasEspecificas.map((fila, index) => ({
    label: fila.nome,
    data: sortedMonths.map(monthKey => groupedByMonth[monthKey]?.[fila.nome] || 0),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length].replace('0.8', '1'),
    borderWidth: 1,
    borderRadius: 4,
    maxBarThickness: 40,
    barThickness: 'flex'
  }))
  
    return {
    labels,
    datasets
  }
}

export default VolumeProdutoURAChart