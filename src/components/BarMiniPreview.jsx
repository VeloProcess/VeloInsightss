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
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0
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
    animation: {
      duration: 1000,
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
        borderRadius: 6,
        borderSkipped: false
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

  // Paleta vibrante profissional - gradiente azul
  const colors1 = dataset1.map((_, i) => {
    const colors = [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)', 
      'rgba(37, 99, 235, 0.85)',
      'rgba(29, 78, 216, 0.9)',
      'rgba(67, 56, 202, 0.85)'
    ]
    return colors[i % colors.length]
  })
  
  const colors2 = dataset2.map((_, i) => {
    const colors = [
      'rgba(16, 185, 129, 0.9)',
      'rgba(5, 150, 105, 0.85)',
      'rgba(34, 197, 94, 0.9)',
      'rgba(21, 128, 61, 0.85)',
      'rgba(74, 222, 128, 0.9)'
    ]
    return colors[i % colors.length]
  })
  
  return {
    labels,
    datasets: [
      {
        label: 'Série 1',
        data: dataset1,
        backgroundColor: colors1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderSkipped: false
      },
      {
        label: 'Série 2',
        data: dataset2,
        backgroundColor: colors2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderSkipped: false
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

  // Cores vibrantes para gráficos agrupados
  const color1 = dataset1.map((_, i) => {
    const colors = [
      'rgba(16, 185, 129, 0.9)',
      'rgba(34, 197, 94, 0.9)',
      'rgba(74, 222, 128, 0.85)',
      'rgba(5, 150, 105, 0.9)',
      'rgba(21, 128, 61, 0.85)'
    ]
    return colors[i % colors.length]
  })
  
  const color2 = dataset2.map((_, i) => {
    const colors = [
      'rgba(59, 130, 246, 0.9)',
      'rgba(37, 99, 235, 0.85)',
      'rgba(99, 102, 241, 0.9)',
      'rgba(67, 56, 202, 0.85)',
      'rgba(29, 78, 216, 0.9)'
    ]
    return colors[i % colors.length]
  })
  
  return {
    labels,
    datasets: [
      {
        label: 'Atendidas',
        data: dataset1,
        backgroundColor: color1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        maxBarThickness: 10,
        borderWidth: 1.5,
        borderSkipped: false
      },
      {
        label: 'Total',
        data: dataset2,
        backgroundColor: color2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        maxBarThickness: 10,
        borderWidth: 1.5,
        borderSkipped: false
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

  // Paleta roxa vibrante para gráficos horizontais
  const barColors = dataset1.map((_, i) => {
    const colors = [
      'rgba(139, 92, 246, 0.9)',
      'rgba(124, 58, 237, 0.85)',
      'rgba(168, 85, 247, 0.9)',
      'rgba(147, 51, 234, 0.85)',
      'rgba(192, 132, 252, 0.9)'
    ]
    return colors[i % colors.length]
  })
  
  return {
    labels,
    datasets: [
      {
        label: 'Volume',
        data: dataset1,
        backgroundColor: barColors,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1.5,
        borderSkipped: false
      }
    ]
  }
}

BarMiniPreview.displayName = 'BarMiniPreview'

export default BarMiniPreview

