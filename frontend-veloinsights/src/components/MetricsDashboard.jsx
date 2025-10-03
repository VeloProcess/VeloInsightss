import React, { memo, useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './MetricsDashboard.css'

// Componente para cada métrica sortable
const SortableMetricCard = ({ metric, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`metric-card sortable ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...listeners} {...attributes}>
        ⋮⋮
      </div>
      {children}
    </div>
  )
}

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings, darkList, addToDarkList, removeFromDarkList }) => {
  const [useDragDrop, setUseDragDrop] = useState(false)
  const [sortedMetrics, setSortedMetrics] = useState([])

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Definir métricas padrão
  const defaultMetrics = [
    { id: '1', title: 'Total de Chamadas', value: metrics?.totalChamadas || 0, icon: '📞', color: '#EF4444' },
    { id: '2', title: 'Duração Média', value: `${metrics?.duracaoMediaAtendimento || 0} min`, icon: '⏱️', color: '#8B5CF6' },
    { id: '3', title: 'Nota Atendimento', value: metrics?.notaMediaAtendimento || 'N/A', icon: '⭐', color: '#F59E0B' },
    { id: '4', title: 'Nota Solução', value: metrics?.notaMediaSolucao || 'N/A', icon: '🎯', color: '#10B981' },
    { id: '5', title: 'Tempo Logado', value: `${metrics?.tempoMedioLogado || 0} min`, icon: '🕐', color: '#3B82F6' },
    { id: '6', title: 'Tempo Pausado', value: `${metrics?.tempoMedioPausado || 0} min`, icon: '⏸️', color: '#6B7280' },
  ]

  // Função para lidar com drag & drop
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSortedMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Salvar nova ordem no localStorage
        localStorage.setItem('metricsOrder', JSON.stringify(newOrder.map(m => m.id)))
        
        return newOrder
      })
    }
  }

  // Inicializar ordem das métricas
  useEffect(() => {
    const savedOrder = localStorage.getItem('metricsOrder')
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder)
        const orderedMetrics = orderIds.map(id => 
          defaultMetrics.find(m => m.id === id)
        ).filter(Boolean)
        
        // Adicionar métricas que não estavam na ordem salva
        const remainingMetrics = defaultMetrics.filter(m => 
          !orderIds.includes(m.id)
        )
        
        setSortedMetrics([...orderedMetrics, ...remainingMetrics])
      } catch (error) {
        console.error('Erro ao carregar ordem das métricas:', error)
        setSortedMetrics(defaultMetrics)
      }
    } else {
      setSortedMetrics(defaultMetrics)
    }
  }, [metrics])
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
          <div className="drag-drop-controls">
            <button 
              className={`mode-toggle-button ${useDragDrop ? 'active' : ''}`}
              onClick={() => setUseDragDrop(!useDragDrop)}
            >
              {useDragDrop ? '📋 Lista Normal' : '🔄 Modo Drag & Drop'}
            </button>
            {useDragDrop && (
              <div className="drag-drop-hint">
                💡 Arraste os cards para reorganizar a ordem
              </div>
            )}
          </div>
        </div>
        
        <div className="card-content">
          {useDragDrop ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedMetrics} 
                strategy={verticalListSortingStrategy}
              >
                <div className="metrics-grid">
                  {sortedMetrics.map((metric) => (
                    <SortableMetricCard key={metric.id} metric={metric}>
                      <div className="metric-icon" style={{ color: metric.color }}>
                        {metric.icon}
                      </div>
                      <div className="metric-content">
                        <div className="metric-value">{metric.value}</div>
                        <div className="metric-label">{metric.title}</div>
                      </div>
                    </SortableMetricCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
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
          )}

          {useDragDrop && (
            <div className="drag-drop-actions">
              <button 
                className="reset-order-button"
                onClick={() => {
                  setSortedMetrics(defaultMetrics)
                  localStorage.removeItem('metricsOrder')
                }}
              >
                🔄 Restaurar Ordem Original
              </button>
              <button 
                className="save-order-button"
                onClick={() => {
                  // console.log('Ordem das métricas salva:', sortedMetrics)
                  alert('Ordem das métricas salva com sucesso!')
                }}
              >
                💾 Salvar Ordem
              </button>
            </div>
          )}
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
                      <td className="score">{operator.score || '0.0'}</td>
                      <td>{operator.totalCalls || operator.totalAtendimentos || 0}</td>
                      <td>{operator.avgDuration || 0} min</td>
                      <td>{operator.avgRatingAttendance || 0}/5</td>
                      <td>{operator.avgRatingSolution || 0}/5</td>
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