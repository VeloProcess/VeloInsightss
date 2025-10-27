import React from 'react'

const PausasPreview = () => {
  const data = {
    labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
    series: [
      { name: 'Série 1', values: [25, 30, 35, 40], color: '#87CEEB' }, // Light blue
      { name: 'Série 2', values: [15, 20, 25, 30], color: '#4682B4' },   // Medium blue
      { name: 'Série 3', values: [10, 15, 20, 25], color: '#191970' }      // Dark blue
    ]
  }
  const maxValue = 50 // Y-axis goes up to 50

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Pausas</div>
      <div className="chart-preview-bars">
        {data.labels.map((label, index) => (
          <div key={index} className="chart-preview-bar-container">
            <div className="chart-preview-stacked-bar" style={{ height: '40px', width: '10px' }}>
              {data.series.map((serie, serieIndex) => (
                <div
                  key={serieIndex}
                  className="chart-preview-bar-segment"
                  style={{
                    height: `${(serie.values[index] / maxValue) * 40}px`, // Scale to 40px height
                    backgroundColor: serie.color
                  }}
                />
              ))}
            </div>
            <div className="chart-preview-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="chart-preview-info">
        3 séries • 4 itens
      </div>
    </div>
  )
}

export default PausasPreview
