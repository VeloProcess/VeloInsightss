import React, { useMemo, memo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const DoughnutMiniPreview = memo(({ data, groupBy = 'fila' }) => {
  // Processar dados para o preview
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['Item 1', 'Item 2', 'Item 3'],
        datasets: [
          {
            data: [62.5, 25, 12.5],
            backgroundColor: ['#87CEEB', '#4682B4', '#191970']
          }
        ]
      }
    }

    // Agrupar por grupo especificado
    const grouped = {}
    
    data.forEach((item, index) => {
      let key = null
      
      if (groupBy === 'produto') {
        key = Array.isArray(item) ? item[8] : (item.produto || item.product || `Prod${index + 1}`)
      } else if (groupBy === 'assunto') {
        key = Array.isArray(item) ? item[9] : (item.assunto || item.subject || `Assunto${index + 1}`)
      } else if (groupBy === 'fila') {
        key = Array.isArray(item) ? item[7] : (item.fila || item.queue || `Fila${index + 1}`)
      }
      
      if (!key || key === '' || key === null || key === undefined) {
        key = `Item${index + 1}`
      }
      
      if (!grouped[key]) {
        grouped[key] = 0
      }
      
      // Contar volume
      if (Array.isArray(item)) {
        grouped[key] += item[1] || item[2] || 1
      } else {
        grouped[key] += item.total || item.atendidas || item.volume || 1
      }
    })
    
    // Pegar top 4
    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    
    if (sorted.length === 0) {
      return {
        labels: ['Item 1'],
        datasets: [
          {
            data: [100],
            backgroundColor: ['#87CEEB']
          }
        ]
      }
    }
    
    const labels = sorted.map(([key]) => key.substring(0, 8))
    const values = sorted.map(([, value]) => value)
    const total = values.reduce((sum, val) => sum + val, 0)
    const percentages = values.map(val => ((val / total) * 100).toFixed(1))
    
    return {
      labels,
      datasets: [
        {
          data: percentages,
          backgroundColor: ['#87CEEB', '#4682B4', '#191970', '#4169E1']
        }
      ]
    }
  }, [data, groupBy])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false }
    }
  }

  return (
    <div className="mini-chart-preview-container">
      <Doughnut data={chartData} options={options} />
    </div>
  )
})

DoughnutMiniPreview.displayName = 'DoughnutMiniPreview'

export default DoughnutMiniPreview

