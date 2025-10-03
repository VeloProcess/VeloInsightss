import React from 'react'
import ChartsDetailedPage from './ChartsDetailedPage'
import './ChartsDetailedTab.css'

const ChartsDetailedTab = ({ 
  data, 
  operatorMetrics, 
  rankings, 
  selectedPeriod,
  isLoading,
  pauseData
}) => {
  return (
    <div className="charts-detailed-tab">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Carregando gráficos...</p>
        </div>
      ) : data && data.length > 0 ? (
        <ChartsDetailedPage 
          data={data}
          operatorMetrics={operatorMetrics}
          rankings={rankings}
          selectedPeriod={selectedPeriod}
          pauseData={pauseData}
        />
      ) : (
        <div className="no-data-container">
          <h3>📊 Nenhum dado disponível</h3>
          <p>Carregue dados da planilha para visualizar os gráficos detalhados.</p>
        </div>
      )}
    </div>
  )
}

export default ChartsDetailedTab
