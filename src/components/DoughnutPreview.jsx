import React from 'react'

const DoughnutPreview = () => {
  // Dados baseados na imagem: 3 segmentos com porcentagens
  const data = [
    { label: 'Item 1', value: 62.5, color: '#87CEEB' },
    { label: 'Item 2', value: 25, color: '#4682B4' },
    { label: 'Item 3', value: 12.5, color: '#191970' }
  ]

  const size = 30
  const radius = size / 2 - 2
  const centerX = size / 2
  const centerY = size / 2

  let cumulativePercentage = 0

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-doughnut-container">
        <svg width={size} height={size}>
          {data.map((segment, index) => {
            const startAngle = (cumulativePercentage * 360) / 100
            const endAngle = ((cumulativePercentage + segment.value) * 360) / 100
            
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180
            
            const x1 = centerX + radius * Math.cos(startAngleRad)
            const y1 = centerY + radius * Math.sin(startAngleRad)
            const x2 = centerX + radius * Math.cos(endAngleRad)
            const y2 = centerY + radius * Math.sin(endAngleRad)
            
            const largeArcFlag = segment.value > 50 ? 1 : 0
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')
            
            cumulativePercentage += segment.value
            
            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="0.5"
              />
            )
          })}
        </svg>
      </div>
      <div className="chart-preview-info">3 segmentos</div>
    </div>
  )
}

export default DoughnutPreview
