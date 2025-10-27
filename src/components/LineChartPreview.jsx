import React from 'react'

const LineChartPreview = () => {
  // Dados baseados na imagem: 5 pontos com 3 linhas
  const data = [
    { item: 'Item 1', serie1: 10, serie2: 15, serie3: 25 },
    { item: 'Item 2', serie1: 15, serie2: 20, serie3: 30 },
    { item: 'Item 3', serie1: 12, serie2: 18, serie3: 28 },
    { item: 'Item 4', serie1: 18, serie2: 22, serie3: 32 },
    { item: 'Item 5', serie1: 20, serie2: 25, serie3: 35 }
  ]

  const maxValue = 50
  const chartWidth = 60
  const chartHeight = 30

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-line-container" style={{ width: chartWidth, height: chartHeight }}>
        <svg width={chartWidth} height={chartHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Série 1 - Light Blue */}
          <polyline
            points={data.map((item, index) => 
              `${(index * chartWidth) / (data.length - 1)},${chartHeight - (item.serie1 / maxValue) * chartHeight}`
            ).join(' ')}
            fill="none"
            stroke="#87CEEB"
            strokeWidth="1.5"
          />
          {/* Série 2 - Medium Blue */}
          <polyline
            points={data.map((item, index) => 
              `${(index * chartWidth) / (data.length - 1)},${chartHeight - (item.serie2 / maxValue) * chartHeight}`
            ).join(' ')}
            fill="none"
            stroke="#4682B4"
            strokeWidth="1.5"
          />
          {/* Série 3 - Dark Blue */}
          <polyline
            points={data.map((item, index) => 
              `${(index * chartWidth) / (data.length - 1)},${chartHeight - (item.serie3 / maxValue) * chartHeight}`
            ).join(' ')}
            fill="none"
            stroke="#191970"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="chart-preview-info">3 linhas • 5 pontos</div>
    </div>
  )
}

export default LineChartPreview
