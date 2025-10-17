import React, { memo } from 'react'
import { useCargo } from '../contexts/CargoContext'
import { getOperatorDisplayName, prioritizeCurrentUserInMiddle } from '../utils/operatorUtils'
import ComparativosTemporais from './ComparativosTemporais'
import './MetricsDashboard.css'

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings, darkList, addToDarkList, removeFromDarkList, periodo, onToggleNotes, userData, filters = {}, onFiltersChange, data = [], previousPeriodData = [], fullDataset = [], octaData = null }) => {
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
      {/* Card de Período Separado */}
      {periodo && (
        <div className="period-card">
          <div className="period-label">📅 Período:</div>
          <div className="period-value">{periodo.periodLabel}</div>
          <div className="period-details">
            {periodo.totalDays} dias • {periodo.totalRecords.toLocaleString()} registros
          </div>
        </div>
      )}

      {/* Comparativos Temporais - FASE 1 */}
      <ComparativosTemporais 
        dadosAtuais={fullDataset && fullDataset.length > 0 ? fullDataset : data || []} 
        dadosAnterior={previousPeriodData || []} 
        tipoComparativo="mensal"
        periodoSelecionado={filters.period || 'allRecords'}
      />

      {/* Layout Principal - Duas Seções Lado a Lado */}
      <div className="main-dashboard-layout">
        {/* Seção 55PBX */}
        <div className="dashboard-section pbx-section">
          <div className="section-content">
            <h2 className="section-title">dados 55pbx</h2>
            
            {/* Métricas Gerais 55PBX */}
            {periodo ? (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">📊 Métricas Gerais</h2>
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
          </div>
        </div>

        {/* Separador Central */}
        <div className="dashboard-separator"></div>

        {/* Seção OCTA */}
        <div className="dashboard-section octa-section">
          <div className="section-content">
            <h2 className="section-title">dados octa</h2>
            
                   {/* Métricas OCTA - Só mostra se há período selecionado */}
                   {periodo ? (
                     <div className="card">
                       <div className="card-header">
                         <h2 className="card-title">📊 Métricas OCTA</h2>
                       </div>
                       <div className="card-content">
                         <div className="metrics-grid">
                           {/* Dados OCTA - Tickets */}
                           {octaData && octaData.octaMetrics ? (
                             <>
                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.totalTickets || 0}</div>
                                 <div className="metric-label">🎫 Total de Tickets</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.ticketsNaoDesignados || 0}</div>
                                 <div className="metric-label">❓ Tickets não designados</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.porcentagemGeral || '0%'}</div>
                                 <div className="metric-label">📈 Performance Geral</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.totalAvaliados || 0}</div>
                                 <div className="metric-label">✅ Tickets Avaliados</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.bomSemComentario || 0}</div>
                                 <div className="metric-label">👍 Bom</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.bomComComentario || 0}</div>
                                 <div className="metric-label">👍 Bom com comentário</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.ruimSemComentario || 0}</div>
                                 <div className="metric-label">👎 Ruim</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.ruimComComentario || 0}</div>
                                 <div className="metric-label">👎 Ruim com comentário</div>
                               </div>
                             </>
                           ) : octaData && octaData.error ? (
                             <div className="metric-card octa-section octa-error">
                               <div className="metric-value">❌</div>
                               <div className="metric-label">Erro OCTA</div>
                               <div className="octa-error-details">
                                 <p>{octaData.error}</p>
                                 {octaData.retryLoad && (
                                   <button 
                                     onClick={octaData.retryLoad}
                                     className="octa-retry-btn"
                                   >
                                     🔄 Tentar Novamente
                                   </button>
                                 )}
                               </div>
                             </div>
                           ) : octaData && octaData.isLoading ? (
                             <div className="metric-card octa-section octa-loading">
                               <div className="metric-value">
                                 <div className="loading-spinner-octa">
                                   <div className="spinner"></div>
                                 </div>
                               </div>
                               <div className="metric-label">Carregando dados OCTA...</div>
                             </div>
                           ) : (
                             <div className="metric-card octa-section">
                               <div className="metric-value">📊</div>
                               <div className="metric-label">Aguardando dados OCTA</div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ) : (
                     /* Mensagem quando não há período selecionado para OCTA */
                     <div className="card">
                       <div className="card-header">
                         <h2 className="card-title">📊 Métricas OCTA</h2>
                       </div>
                       <div className="card-content">
                         <div className="no-data-message">
                           <p>📅 Selecione um período para visualizar as métricas OCTA</p>
                         </div>
                       </div>
                     </div>
                   )}
          </div>
        </div>
      </div>

      {/* Ranking de Operadores - Só mostra se há período selecionado */}
      {prioritizedRankings && prioritizedRankings.length > 0 && periodo && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <h2 className="card-title">🏆 Ranking de Operadores</h2>
              <div className="ranking-filter">
                <label 
                  className="filter-checkbox-inline"
                  onClick={(e) => {
                    console.log('🔧 LABEL CLICADO!')
                    e.preventDefault()
                    const checkbox = e.currentTarget.querySelector('input[type="checkbox"]')
                    if (checkbox) {
                      checkbox.checked = !checkbox.checked
                      console.log('🔧 CHECKBOX alterado para:', checkbox.checked)
                      if (onFiltersChange) {
                        const newFilters = { ...filters, hideDesligados: checkbox.checked }
                        console.log('🔧 Enviando novos filters:', newFilters)
                        onFiltersChange(newFilters)
                      }
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters?.hideDesligados || false}
                    onChange={(e) => {
                      console.log('🔧 CHECKBOX CLICADO! Valor:', e.target.checked)
                      console.log('🔧 Filters atual:', filters)
                      if (onFiltersChange) {
                        const newFilters = { ...filters, hideDesligados: e.target.checked }
                        console.log('🔧 Enviando novos filters:', newFilters)
                        onFiltersChange(newFilters)
                      } else {
                        console.log('❌ onFiltersChange não existe!')
                      }
                    }}
                  />
                  <span className="checkbox-custom-inline"></span>
                  <span className="filter-label-inline">
                    <span className="filter-icon">👥</span>
                    Ocultar desligados
                  </span>
                </label>
              </div>
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