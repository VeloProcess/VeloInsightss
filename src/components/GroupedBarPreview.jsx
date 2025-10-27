import React from 'react'

const GroupedBarPreview = () => {
  // Dados baseados na imagem: 3 itens com 2 barras agrupadas cada
  const data = [
    { item: 'Item 1', serie1: 5, serie2: 8 },
    { item: 'Item 2', serie1: 10, serie2: 12 },
    { item: 'Item 3', serie1: 15, serie2: 18 }
  ]

  const maxValue = 20
  const barWidth = 6
  const maxHeight = 25

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-preview-grouped-bar-container">
            <div className="chart-preview-grouped-bars">
              {/* Série 1 - Light Blue */}
              <div
                className="chart-preview-bar"
                style={{
                  height: `${(item.serie1 / maxValue) * maxHeight}px`,
                  width: barWidth,
                  backgroundColor: '#87CEEB',
                  marginRight: '2px'
                }}
              />
              {/* Série 2 - Medium Blue */}
              <div
                className="chart-preview-bar"
                style={{
                  height: `${(item.serie2 / maxValue) * maxHeight}px`,
                  width: barWidth,
                  backgroundColor: '#4682B4'
                }}
              />
            </div>
            <div className="chart-preview-label">{item.item}</div>
          </div>
        ))}
      </div>
      <div className="chart-preview-info">2 séries • 3 itens</div>
    </div>
  )
}

export default GroupedBarPreview
