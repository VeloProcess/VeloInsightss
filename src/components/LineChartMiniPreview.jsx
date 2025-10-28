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
            borderColor: 'rgba(22, 148, 255, 1)',
            backgroundColor: 'rgba(22, 148, 255, 0.15)',
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
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    },
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
      point: { 
        radius: 4, 
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(59, 130, 246, 1)'
      },
      line: { 
        borderWidth: 3, 
        tension: 0.5,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      }
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
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
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
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        fill: true
      },
      {
        label: 'Positivo',
        data: dataset2,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true
      },
      {
        label: 'Negativo',
        data: dataset3,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        fill: true
      }
    ]
  }
}

LineChartMiniPreview.displayName = 'LineChartMiniPreview'

export default LineChartMiniPreview

