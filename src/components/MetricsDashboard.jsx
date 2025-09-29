import React, { memo } from 'react'
import './MetricsDashboard.css'

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings }) => {
  if (!metrics) {
    return (
      <div className="metrics-dashboard">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
          </div>
          <div className="card-content">
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="metrics-dashboard">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Métricas Gerais</h2>
        </div>
        
        <div className="card-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{metrics.totalCalls || 0}</div>
              <div className="metric-label">Total de Chamadas</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.avgDuration?.toFixed(1) || '0.0'} min</div>
              <div className="metric-label">Duração Média</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.avgRatingAttendance?.toFixed(1) || '0.0'}/5</div>
              <div className="metric-label">Nota Média de Atendimento</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.avgRatingSolution?.toFixed(1) || '0.0'}/5</div>
              <div className="metric-label">Nota Média de Solução</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.avgPauseTime?.toFixed(1) || '0.0'} min</div>
              <div className="metric-label">Tempo Médio Pausado</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.totalOperators || 0}</div>
              <div className="metric-label">Total de Operadores</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.totalRecords || 0}</div>
              <div className="metric-label">Total de Registros</div>
            </div>

            {/* Métricas Avançadas */}
            <div className="metric-card advanced">
              <div className="metric-value">{metrics.abandonmentRate}%</div>
              <div className="metric-label">Taxa de Abandono</div>
            </div>

            <div className="metric-card advanced">
              <div className="metric-value">{metrics.serviceLevel}%</div>
              <div className="metric-label">Nível de Serviço</div>
            </div>

            <div className="metric-card advanced">
              <div className="metric-value">{metrics.efficiencyScore}%</div>
              <div className="metric-label">Score de Eficiência</div>
            </div>

            <div className="metric-card advanced">
              <div className="metric-value">{metrics.firstCallResolution}%</div>
              <div className="metric-label">Resolução 1ª Chamada</div>
            </div>

            <div className="metric-card advanced">
              <div className="metric-value">{metrics.customerSatisfaction}%</div>
              <div className="metric-label">Satisfação do Cliente</div>
            </div>

            <div className="metric-card advanced">
              <div className="metric-value">{metrics.avgCallsPerOperator?.toFixed(1) || '0.0'}</div>
              <div className="metric-label">Chamadas por Operador</div>
            </div>

            {/* Estatísticas de Chamadas */}
            {metrics.callStatuses && Object.keys(metrics.callStatuses).length > 0 && (
              <>
                {Object.entries(metrics.callStatuses).map(([status, count], index) => (
                  <div key={status} className="metric-card advanced">
                    <div className="metric-value">{count}</div>
                    <div className="metric-label">
                      {status.toLowerCase().includes('atendida') ? 'Chamadas Atendidas' : 
                       status.toLowerCase().includes('retida') ? 'Retidas na URA' : 
                       status}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ranking de Operadores */}
      {rankings && rankings.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Ranking de Operadores</h2>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Operador</th>
                    <th>Score</th>
                    <th>Chamadas</th>
                    <th>Duração Média</th>
                    <th>Nota Atendimento</th>
                    <th>Nota Solução</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 10).map((operator, index) => (
                    <tr key={operator.operator} className={index < 3 ? 'top-3' : ''}>
                      <td className="position">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}º`}
                      </td>
                      <td className="operator-name">{operator.operator}</td>
                      <td className="score">{operator.score.toFixed(1)}</td>
                      <td>{operator.totalCalls}</td>
                      <td>{operator.avgDuration.toFixed(1)} min</td>
                      <td>{operator.avgRatingAttendance.toFixed(1)}/5</td>
                      <td>{operator.avgRatingSolution.toFixed(1)}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

MetricsDashboard.displayName = 'MetricsDashboard'

export default MetricsDashboard