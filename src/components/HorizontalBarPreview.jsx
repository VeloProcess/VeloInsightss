import React from 'react'

const HorizontalBarPreview = () => {
  // Dados baseados na imagem: 4 itens com barras horizontais empilhadas
  const data = [
    { item: 'Item 1', serie1: 15, serie2: 5, serie3: 0 },
    { item: 'Item 2', serie1: 15, serie2: 10, serie3: 5 },
    { item: 'Item 3', serie1: 17, serie2: 12, serie3: 9 },
    { item: 'Item 4', serie1: 20, serie2: 15, serie3: 13 }
  ]

  const maxValue = 50
  const barHeight = 4
  const maxWidth = 40

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-horizontal-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-preview-horizontal-bar-container">
            <div className="chart-preview-horizontal-bar" style={{ height: barHeight, width: maxWidth }}>
              {/* Série 1 - Light Blue */}
              <div
                className="chart-preview-bar-segment-horizontal"
                style={{
                  width: `${(item.serie1 / maxValue) * maxWidth}px`,
                  backgroundColor: '#87CEEB',
                  height: '100%'
                }}
              />
              {/* Série 2 - Medium Blue */}
              <div
                className="chart-preview-bar-segment-horizontal"
                style={{
                  width: `${(item.serie2 / maxValue) * maxWidth}px`,
                  backgroundColor: '#4682B4',
                  height: '100%'
                }}
              />
              {/* Série 3 - Dark Blue */}
              <div
                className="chart-preview-bar-segment-horizontal"
                style={{
                  width: `${(item.serie3 / maxValue) * maxWidth}px`,
                  backgroundColor: '#191970',
                  height: '100%'
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

export default HorizontalBarPreview
