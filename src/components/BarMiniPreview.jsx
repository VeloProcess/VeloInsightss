import React, { useMemo, memo } from 'react'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const BarMiniPreview = memo(({ data, type = 'stacked' }) => {
  // Processar dados para o preview
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [
          {
            label: 'Série 1',
            data: [20, 30, 35, 40, 45],
            backgroundColor: '#87CEEB'
          }
        ]
      }
    }

    // Limitar a 5 pontos
    const last5 = data.slice(-5)
    
    // Processar conforme tipo
    if (type === 'line' || type === 'stacked') {
      // Para Análise Geral (stacked ou line)
      return processStackedData(last5)
    } else if (type === 'grouped') {
      // Para Volume por Hora
      return processGroupedData(last5)
    } else if (type === 'horizontal') {
      // Para Volume por Fila
      return processHorizontalData(last5)
    }
    
    // Default: stacked
    return processStackedData(last5)
  }, [data, type])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
        stacked: type === 'stacked' || type === 'line'
      },
      y: {
        display: false,
        grid: { display: false },
        stacked: type === 'stacked' || type === 'line'
      }
    },
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 4
      }
    }
  }

  return (
    <div className="mini-chart-preview-container">
      <Bar data={chartData} options={options} />
    </div>
  )
})

// Funções auxiliares para processar dados
function processStackedData(data) {
  const labels = data.map((_, i) => `P${i + 1}`)
  
  const dataset1 = data.map((item, i) => {
    if (Array.isArray(item)) {
      // Dados de tickets (array)
      return Math.min(item[1] || item[2] || Math.random() * 30 + 20, 100) || 20
    }
    // Dados de telefonia (objeto)
    const value = item.total || item.atendidas || Math.floor(Math.random() * 30 + 20)
    return Math.min(value, 100)
  })
  
  const dataset2 = data.map((item, i) => {
    if (Array.isArray(item)) {
      return Math.min(item[2] || item[3] || Math.random() * 20 + 10, 70) || 10
    }
    const value = item.abandonadas || item.avaliados || Math.floor(Math.random() * 20 + 10)
    return Math.min(value, 70)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Série 1',
        data: dataset1,
        backgroundColor: '#87CEEB'
      },
      {
        label: 'Série 2',
        data: dataset2,
        backgroundColor: '#4682B4'
      }
    ]
  }
}

function processGroupedData(data) {
  const labels = data.map((_, i) => `${i + 1}`)
  
  const dataset1 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[1] || Math.random() * 25 + 15, 50) || 15
    }
    const value = item.atendidas || item.total || Math.floor(Math.random() * 25 + 15)
    return Math.min(value, 50)
  })
  
  const dataset2 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[2] || Math.random() * 30 + 20, 60) || 20
    }
    const value = item.abandonadas || Math.floor(Math.random() * 30 + 20)
    return Math.min(value, 60)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Atendidas',
        data: dataset1,
        backgroundColor: '#87CEEB',
        maxBarThickness: 8
      },
      {
        label: 'Total',
        data: dataset2,
        backgroundColor: '#4682B4',
        maxBarThickness: 8
      }
    ]
  }
}

function processHorizontalData(data) {
  const labels = data.map((_, i) => `F${i + 1}`)
  
  const dataset1 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[1] || Math.random() * 40 + 30, 100) || 30
    }
    const value = item.total || item.atendidas || Math.floor(Math.random() * 40 + 30)
    return Math.min(value, 100)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Volume',
        data: dataset1,
        backgroundColor: '#87CEEB'
      }
    ]
  }
}

BarMiniPreview.displayName = 'BarMiniPreview'

export default BarMiniPreview

