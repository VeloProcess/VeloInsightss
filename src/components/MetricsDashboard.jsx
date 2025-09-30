import React, { memo } from 'react'
import './MetricsDashboard.css'

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings, darkList, addToDarkList, removeFromDarkList }) => {
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
            {/* Total de Chamadas */}
            <div className="metric-card">
              <div className="metric-value">{metrics.totalCalls || 0}</div>
              <div className="metric-label">Total de Chamadas</div>
            </div>
            
            {/* Status das Chamadas */}
            <div className="metric-card">
              <div className="metric-value">{metrics.retidaURA || 0}</div>
              <div className="metric-label">Retida na URA</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.atendida || 0}</div>
              <div className="metric-label">Atendida</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{metrics.abandonada || 0}</div>
              <div className="metric-label">Abandonada</div>
            </div>
            
                   {/* Notas */}
                   <div className="metric-card">
                     <div className="metric-value">{metrics.avgRatingAttendance || '0.0'}/5</div>
                     <div className="metric-label">Nota Média de Atendimento</div>
                   </div>
                   
                   <div className="metric-card">
                     <div className="metric-value">{metrics.avgRatingSolution || '0.0'}/5</div>
                     <div className="metric-label">Nota Média de Solução</div>
                   </div>
                   
                   {/* Tempos */}
                   <div className="metric-card">
                     <div className="metric-value">{metrics.duracaoMediaAtendimento || '0.0'} min</div>
                     <div className="metric-label">Duração Média de Atendimento</div>
                   </div>
                   
                   <div className="metric-card">
                     <div className="metric-value">{metrics.tempoMedioEspera || '0.0'} min</div>
                     <div className="metric-label">Tempo Médio de Espera</div>
                   </div>
                   
                   <div className="metric-card">
                     <div className="metric-value">{metrics.tempoMedioURA || '0.0'} min</div>
                     <div className="metric-label">Tempo Médio na URA</div>
                   </div>
                   
                   {/* Taxas */}
                   <div className="metric-card">
                     <div className="metric-value">{metrics.taxaAtendimento || '0.0'}%</div>
                     <div className="metric-label">Taxa de Atendimento</div>
                   </div>
                   
                   <div className="metric-card">
                     <div className="metric-value">{metrics.taxaAbandono || '0.0'}%</div>
                     <div className="metric-label">Taxa de Abandono</div>
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
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 10).map((operator, index) => (
                    <tr key={operator.operator} className={`${index < 3 ? 'top-3' : ''} ${operator.isExcluded ? 'excluded-row' : ''} ${operator.isDesligado ? 'desligado-row' : ''}`}>
                      <td className="position">
                        {operator.isExcluded ? '🚫' : operator.isDesligado ? '👤' : (
                          <>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `${index + 1}º`}
                          </>
                        )}
                      </td>
                      <td className="operator-name">
                        {operator.operator}
                        {operator.isExcluded && <span className="excluded-badge"> (Excluído)</span>}
                        {operator.isDesligado && <span className="desligado-badge"> (Desligado)</span>}
                      </td>
                      <td className="score">{operator.score}</td>
                      <td>{operator.totalAtendimentos}</td>
                      <td>{operator.avgDuration} min</td>
                      <td>{operator.avgRatingAttendance}/5</td>
                      <td>{operator.avgRatingSolution}/5</td>
                      <td>
                        {operator.isExcluded ? (
                          <button 
                            className="action-button restore"
                            onClick={() => removeFromDarkList(operator.operator)}
                            title="Restaurar operador"
                          >
                            ✅ Restaurar
                          </button>
                        ) : operator.isDesligado ? (
                          <span className="desligado-info">Desligado</span>
                        ) : (
                          <button 
                            className="action-button exclude"
                            onClick={() => addToDarkList(operator.operator)}
                            title="Excluir da análise"
                          >
                            🚫 Excluir
                          </button>
                        )}
                      </td>
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