import React, { memo } from 'react'
import { useCargo } from '../contexts/CargoContext'
import { getOperatorDisplayName, prioritizeCurrentUserInMiddle } from '../utils/operatorUtils'
import './MetricsDashboard.css'

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings, darkList, addToDarkList, removeFromDarkList, periodo, onToggleNotes, userData, filters = {}, onFiltersChange }) => {
  const { hasPermission, selectedCargo, userInfo } = useCargo()
  
  // Verificar se deve ocultar nomes baseado no cargo PRINCIPAL do usuário, não no cargo selecionado
  // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
  const shouldHideNames = userInfo?.cargo === 'OPERADOR'
  
  // Função para obter nome do operador (ocultar ou mostrar)
  const getOperatorName = (operator, index) => {
    return getOperatorDisplayName(operator.operator, index, userData, shouldHideNames)
  }
  
  // Ordenar rankings dando prioridade ao usuário logado no meio
  const prioritizedRankings = shouldHideNames && userData?.email 
    ? prioritizeCurrentUserInMiddle(rankings || [], userData, 'totalCalls')
    : rankings || []
  
  // Debug apenas se houver erro
  if (!metrics && operatorMetrics?.length > 0) {
    console.error('❌ MetricsDashboard: metrics ausente mas operatorMetrics presente')
  }

  // Verificar permissão para ver métricas gerais
  if (!hasPermission('canViewGeneralMetrics')) {
    return (
      <div className="metrics-dashboard">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
          </div>
          <div className="card-content">
            <p>❌ Você não tem permissão para visualizar métricas gerais.</p>
            <p>Cargo atual: {selectedCargo}</p>
            <p>Permissão necessária: canViewGeneralMetrics</p>
          </div>
        </div>
      </div>
    )
  }

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
      {/* Métricas Gerais - Só mostra se há período selecionado */}
      {periodo ? (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
            <div className="period-info">
              <div className="period-label">📅 Período:</div>
              <div className="period-value">{periodo.periodLabel}</div>
              <div className="period-details">
                {periodo.totalDays} dias • {periodo.totalRecords.toLocaleString()} registros
              </div>
            </div>
          </div>
          
          <div className="card-content">
            <div className="metrics-grid">
              {/* Total de Chamadas */}
              <div className="metric-card">
                <div className="metric-value">{(metrics.totalChamadas || metrics.totalCalls || 0).toLocaleString()}</div>
                <div className="metric-label">Total de Chamadas</div>
              </div>
              
              {/* Status das Chamadas */}
              <div className="metric-card">
                <div className="metric-value">{(metrics.retidaURA || 0).toLocaleString()}</div>
                <div className="metric-label">Retida na URA</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{(metrics.atendida || 0).toLocaleString()}</div>
                <div className="metric-label">Atendida</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{(metrics.abandonada || 0).toLocaleString()}</div>
                <div className="metric-label">Abandonada</div>
              </div>
              
              {/* Notas */}
              <div className="metric-card">
                <div className="metric-value">{metrics.avgRatingAttendance || metrics.notaMediaAtendimento || '0.0'}/5</div>
                <div className="metric-label">Nota Média de Atendimento</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{metrics.avgRatingSolution || metrics.notaMediaSolucao || '0.0'}/5</div>
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
              
              {/* Taxas */}
              <div className="metric-card">
                <div className="metric-value">{metrics.taxaAbandono || '0.0'}%</div>
                <div className="metric-label">Taxa de Abandono</div>
              </div>

              {/* Chamadas Avaliadas */}
              <div className="metric-card">
                <div className="metric-value">{(metrics.chamadasAvaliadas || 0).toLocaleString()}</div>
                <div className="metric-label">Chamadas Avaliadas</div>
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
      ) : (
        /* Mensagem quando não há período selecionado para métricas gerais */
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
          </div>
          <div className="card-content">
            <div className="no-data-message">
              <p>📅 Selecione um período para visualizar as métricas gerais</p>
            </div>
          </div>
        </div>
      )}

      {/* Ranking de Operadores - Só mostra se há período selecionado */}
      {prioritizedRankings && prioritizedRankings.length > 0 && periodo && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <h2 className="card-title">🏆 Ranking de Operadores</h2>
            </div>
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
                    <th>Chamadas Avaliadas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritizedRankings.slice(0, 10).map((operator, index) => (
                    <tr key={`${operator.operator}-${index}`} className={`${index < 3 ? 'top-3' : ''} ${operator.isExcluded ? 'excluded-row' : ''} ${operator.isDesligado ? 'desligado-row' : ''}`}>
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
                        {getOperatorName(operator, index)}
                        {operator.isExcluded && <span className="excluded-badge"> (Excluído)</span>}
                        {operator.isDesligado && <span className="desligado-badge"> (Desligado)</span>}
                      </td>
                      <td className="score">{operator.score || '0.0'}</td>
                      <td>{operator.totalCalls || operator.totalAtendimentos || 0}</td>
                      <td>{operator.avgDuration || 0} min</td>
                      <td>{operator.avgRatingAttendance || 0}/5</td>
                      <td>{operator.avgRatingSolution || 0}/5</td>
                      <td className="chamadas-avaliadas-cell">
                        <div className="chamadas-avaliadas-container">
                          <span className="chamadas-count">{operator.chamadasAvaliadas || 0}</span>
                          {operator.chamadasAvaliadas > 0 && periodo && periodo.type !== 'allRecords' && (
                            <button 
                              className="expand-notes-btn"
                              onClick={() => onToggleNotes(operator.operator)}
                              title="Ver notas detalhadas"
                            >
                              📋
                            </button>
                          )}
                        </div>
                      </td>
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
                          <span className="active-info">Ativo</span>
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

      {/* Mensagem quando não há período selecionado para ranking */}
      {!periodo && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Ranking de Operadores</h2>
          </div>
          <div className="card-content">
            <div className="no-data-message">
              <p>📅 Selecione um período para visualizar o ranking de operadores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

MetricsDashboard.displayName = 'MetricsDashboard'

export default MetricsDashboard