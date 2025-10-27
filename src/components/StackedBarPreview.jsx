import React from 'react'

const StackedBarPreview = () => {
  // Dados baseados na imagem: Item 1-4 com 3 séries empilhadas
  const data = [
    { item: 'Item 1', serie1: 15, serie2: 5, serie3: 0 },
    { item: 'Item 2', serie1: 15, serie2: 10, serie3: 5 },
    { item: 'Item 3', serie1: 17, serie2: 12, serie3: 9 },
    { item: 'Item 4', serie1: 20, serie2: 15, serie3: 13 }
  ]

  const maxValue = 50
  const barWidth = 12
  const maxHeight = 30

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-preview-bar-container">
            <div className="chart-preview-stacked-bar" style={{ width: barWidth, height: maxHeight }}>
              {/* Série 1 - Light Blue */}
              <div
                className="chart-preview-bar-segment"
                style={{
                  height: `${(item.serie1 / maxValue) * maxHeight}px`,
                  backgroundColor: '#87CEEB',
                  width: '100%'
                }}
              />
              {/* Série 2 - Medium Blue */}
              <div
                className="chart-preview-bar-segment"
                style={{
                  height: `${(item.serie2 / maxValue) * maxHeight}px`,
                  backgroundColor: '#4682B4',
                  width: '100%'
                }}
              />
              {/* Série 3 - Dark Blue */}
              <div
                className="chart-preview-bar-segment"
                style={{
                  height: `${(item.serie3 / maxValue) * maxHeight}px`,
                  backgroundColor: '#191970',
                  width: '100%'
                }}
              />
            </div>
            <div className="chart-preview-label">{item.item}</div>
          </div>
        ))}
      </div>
      <div className="chart-preview-info">3 séries • 4 itens</div>
    </div>
  )
}

export default StackedBarPreview
