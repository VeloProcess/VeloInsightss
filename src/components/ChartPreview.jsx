import React from 'react'

const ChartPreview = ({ data, type = 'line' }) => {
  // Criar um preview simples baseado nos dados
  const getPreviewData = () => {
    if (!data || data.length === 0) {
      return {
        labels: ['1', '2', '3', '4'],
        values: [20, 30, 35, 48]
      }
    }

    // Para dados de telefonia, criar preview baseado nos dados reais
    if (data.length > 0) {
      // Pegar os últimos 4 pontos de dados para o preview
      const recentData = data.slice(-4)
      return {
        labels: recentData.map((_, index) => `${index + 1}`),
        values: recentData.map(item => {
          // Tentar extrair um valor numérico do item
          if (typeof item === 'object' && item !== null) {
            // Para dados de telefonia, usar total de chamadas
            if (item.total !== undefined) return Math.min(item.total, 50)
            if (item.atendidas !== undefined) return Math.min(item.atendidas, 50)
            if (item.abandonadas !== undefined) return Math.min(item.abandonadas, 50)
            // Se não encontrar dados específicos, usar valores simulados
            return Math.floor(Math.random() * 30) + 20
          }
          return Math.floor(Math.random() * 30) + 20 // Fallback
        })
      }
    }

    // Fallback com dados simulados
    return {
      labels: ['1', '2', '3', '4'],
      values: [20, 30, 35, 48]
    }
  }

  const { labels, values } = getPreviewData()
  const maxValue = Math.max(...values)

  return (
    <div className="chart-preview">
      <div className="chart-preview-title">Preview</div>
      <div className="chart-preview-bars">
        {values.map((value, index) => (
          <div key={index} className="chart-preview-bar-container">
            <div 
              className="chart-preview-bar"
              style={{ 
                height: `${(value / maxValue) * 35}px`,
                backgroundColor: `hsl(${200 + (index * 20)}, 70%, 60%)`
              }}
            />
            <div className="chart-preview-label">{labels[index]}</div>
          </div>
        ))}
      </div>
      <div className="chart-preview-info">
        {data?.length || 0} pontos
      </div>
    </div>
  )
}

export default ChartPreview
