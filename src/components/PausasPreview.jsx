import React from 'react'

const PausasPreview = () => {
  const data = {
    labels: ['P1', 'P2', 'P3', 'P4'],
    series: [
      { name: 'TML', values: [25, 30, 35, 40], color: 'rgba(34, 197, 94, 0.9)' }, // Green
      { name: 'TMP', values: [15, 20, 25, 30], color: 'rgba(239, 68, 68, 0.9)' },   // Red
      { name: 'Série 3', values: [10, 15, 20, 25], color: 'rgba(251, 146, 60, 0.9)' }  // Orange
    ]
  }
  const maxValue = 50 // Y-axis goes up to 50

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Pausas</div>
      <div className="chart-preview-bars">
        {data.labels.map((label, index) => (
          <div key={index} className="chart-preview-bar-container">
            <div className="chart-preview-stacked-bar" style={{ height: '40px', width: '12px' }}>
              {data.series.map((serie, serieIndex) => (
                <div
                  key={serieIndex}
                  className="chart-preview-bar-segment"
                  style={{
                    height: `${(serie.values[index] / maxValue) * 40}px`,
                    backgroundColor: serie.color,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: serieIndex === 0 ? '3px 3px 0 0' : 
                                  serieIndex === data.series.length - 1 ? '0 0 3px 3px' : '0',
                    transition: 'all 0.3s ease'
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
