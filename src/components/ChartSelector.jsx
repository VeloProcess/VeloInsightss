import React, { useState } from 'react'
import './ChartSelector.css'
import { 
  BsGraphUp, 
  BsStarFill, 
  BsClock, 
  BsHourglassSplit,
  BsFileText,
  BsBullseye,
  BsBarChart
} from 'react-icons/bs'

const chartOptions = [
  // Telefonia
  { id: 'telefonia-analise', name: 'Análise Geral', category: 'Telefonia', icon: <BsGraphUp />, component: 'TendenciaSemanalChart' },
  { id: 'telefonia-csat', name: 'CSAT - Satisfação do Cliente', category: 'Telefonia', icon: <BsStarFill />, component: 'CSATChart' },
  { id: 'telefonia-volume-hora', name: 'Volume por Hora', category: 'Telefonia', icon: <BsClock />, component: 'VolumeHoraChart' },
  { id: 'telefonia-tma', name: 'TMA - Tempo Médio de Atendimento', category: 'Telefonia', icon: <BsHourglassSplit />, component: 'TMAChart' },
  
  // Tickets
  { id: 'tickets-analise', name: 'Análise Geral de Tickets', category: 'Tickets', icon: <BsFileText />, component: 'TendenciaSemanalChart' },
  { id: 'tickets-fcr', name: 'FCR', category: 'Tickets', icon: <BsHourglassSplit />, component: 'CSATChart' },
  { id: 'tickets-volume-produto', name: 'Volume por Produto', category: 'Tickets', icon: <BsBarChart />, component: 'VolumeProdutoURAChart' },
  { id: 'tickets-volume-hora', name: 'Volume por Hora (Tickets)', category: 'Tickets', icon: <BsClock />, component: 'VolumeHoraChart' },
  { id: 'tickets-tma-resolucao', name: 'TMA - Tempo Médio de Resolução por Assunto', category: 'Tickets', icon: <BsBullseye />, component: 'TMAChart' },
]

const ChartSelector = ({ isOpen, onClose, onSelectCharts }) => {
  const [selectedCharts, setSelectedCharts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')

  if (!isOpen) return null

  const handleToggleChart = (chartId) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartId)) {
        return prev.filter(id => id !== chartId)
      } else if (prev.length < 2) {
        return [...prev, chartId]
      }
      return prev
    })
  }

  const handleCompare = () => {
    const charts = selectedCharts.map(id => 
      chartOptions.find(opt => opt.id === id)
    )
    onSelectCharts(charts)
    setSelectedCharts([])
    setSearchTerm('')
    setFilterCategory('Todos')
  }

  const handleClose = () => {
    setSelectedCharts([])
    setSearchTerm('')
    setFilterCategory('Todos')
    onClose()
  }

  const filteredCharts = chartOptions.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Todos' || chart.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['Todos', 'Telefonia', 'Tickets']

  return (
    <div className="chart-selector-overlay" onClick={handleClose}>
      <div className="chart-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chart-selector-header">
          <div className="chart-selector-title">
            <span className="selector-icon">🔍</span>
            <h3>Selecionar Gráficos para Comparar</h3>
          </div>
          <button className="chart-selector-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="chart-selector-content">
          <div className="chart-selector-filters">
            <input
              type="text"
              placeholder="Pesquisar gráficos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="chart-selector-search"
            />
            <div className="chart-selector-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-selector-grid">
            {filteredCharts.map(chart => {
              const isSelected = selectedCharts.includes(chart.id)
              return (
                <div
                  key={chart.id}
                  className={`chart-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleChart(chart.id)}
                >
                  <div className="chart-option-checkbox">
                    {isSelected ? '✓' : ''}
                  </div>
                  <div className="chart-option-icon">
                    {chart.icon}
                  </div>
                  <div className="chart-option-info">
                    <div className="chart-option-category">{chart.category}</div>
                    <div className="chart-option-name">{chart.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-selector-footer">
          <div className="selection-info">
            {selectedCharts.length === 0 && 'Selecione até 2 gráficos'}
            {selectedCharts.length === 1 && `1 gráfico selecionado (selecione mais 1)`}
            {selectedCharts.length === 2 && '2 gráficos selecionados'}
          </div>
          <button
            className="compare-button"
            onClick={handleCompare}
            disabled={selectedCharts.length !== 2}
          >
            Comparar {selectedCharts.length > 0 && `(${selectedCharts.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChartSelector
export { chartOptions }

