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

const LineChartMiniPreview = memo(({ data, type = 'default' }) => {
  // Processar dados para o preview
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [
          {
            label: 'Série 1',
            data: [20, 30, 25, 40, 35],
            borderColor: '#87CEEB',
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            fill: true
          }
        ]
      }
    }

    // Limitar a 5 pontos
    const last5 = data.slice(-5)
    
    // Processar conforme tipo
    if (type === 'csat') {
      return processCSATData(last5)
    } else if (type === 'tma') {
      return processTMAData(last5)
    }
    
    // Default: linha simples
    return processDefaultLineData(last5)
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
        grid: { display: false }
      },
      y: {
        display: false,
        grid: { display: false }
      }
    },
    elements: {
      point: { radius: 2, hoverRadius: 3 },
      line: { borderWidth: 2, tension: 0.4 }
    }
  }

  return (
    <div className="mini-chart-preview-container">
      <Line data={chartData} options={options} />
    </div>
  )
})

// Funções auxiliares para processar dados
function processDefaultLineData(data) {
  const labels = data.map((_, i) => `${i + 1}`)
  
  const dataset = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[1] || item[2] || Math.floor(Math.random() * 30 + 20), 50) || 20
    }
    const value = item.total || item.atendidas || item.notaMedia || Math.floor(Math.random() * 30 + 20)
    return Math.min(value, 50)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Data',
        data: dataset,
        borderColor: '#87CEEB',
        backgroundColor: 'rgba(135, 206, 235, 0.1)',
        fill: true
      }
    ]
  }
}

function processCSATData(data) {
  const labels = data.map((_, i) => `${i + 1}`)
  
  // CSAT geralmente tem 1-3 séries (Total, Atendidas, Abandonadas)
  const dataset1 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[4] || item[5] || Math.floor(Math.random() * 40 + 30), 80) || 30
    }
    const value = item.notaMedia || item.avaliados || Math.floor(Math.random() * 40 + 30)
    return Math.min(value, 80)
  })
  
  const dataset2 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[6] || item[7] || Math.floor(Math.random() * 35 + 25), 70) || 25
    }
    const value = item.bom || Math.floor(Math.random() * 35 + 25)
    return Math.min(value, 70)
  })

  const dataset3 = data.map((item) => {
    if (Array.isArray(item)) {
      return Math.min(item[8] || item[9] || Math.floor(Math.random() * 15 + 5), 30) || 5
    }
    const value = item.ruim || Math.floor(Math.random() * 15 + 5)
    return Math.min(value, 30)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Total',
        data: dataset1,
        borderColor: '#87CEEB',
        backgroundColor: 'rgba(135, 206, 235, 0.1)',
        fill: true
      },
      {
        label: 'Positivo',
        data: dataset2,
        borderColor: '#4682B4',
        backgroundColor: 'rgba(70, 130, 180, 0.1)',
        fill: true
      },
      {
        label: 'Negativo',
        data: dataset3,
        borderColor: '#191970',
        backgroundColor: 'rgba(25, 25, 112, 0.1)',
        fill: true
      }
    ]
  }
}

function processTMAData(data) {
  const labels = data.map((_, i) => `${i + 1}`)
  
  // TMA geralmente mostra tempo médio
  const dataset = data.map((item) => {
    if (Array.isArray(item)) {
      // Para tickets, pode ter TMA em minutos
      return Math.min(item[1] || item[2] || Math.floor(Math.random() * 20 + 10), 40) || 10
    }
    // Para telefonia
    const value = item.tma || item.tempoMedio || Math.floor(Math.random() * 20 + 10)
    return Math.min(value, 40)
  })

  return {
    labels,
    datasets: [
      {
        label: 'TMA',
        data: dataset,
        borderColor: '#87CEEB',
        backgroundColor: 'rgba(135, 206, 235, 0.15)',
        fill: true
      }
    ]
  }
}

LineChartMiniPreview.displayName = 'LineChartMiniPreview'

export default LineChartMiniPreview

