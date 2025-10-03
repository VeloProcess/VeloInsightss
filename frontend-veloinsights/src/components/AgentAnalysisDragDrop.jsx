import React, { useState } from 'react'
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
import './AgentAnalysisDragDrop.css'

// Componente para cada operador sortable
const SortableOperator = ({ operator, index, onViewAgent }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: operator.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`agent-card sortable ${isDragging ? 'dragging' : ''}`}
    >
      <div className="agent-info">
        <div className="agent-rank">#{index + 1}</div>
        <div className="agent-details">
          <h3>{operator.operator}</h3>
          <div className="agent-stats">
            <div className="stat">
              <span className="stat-label">Chamadas:</span>
              <span className="stat-value">{operator.totalCalls}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{operator.score}</span>
            </div>
          </div>
        </div>
        <div className="drag-handle">⋮⋮</div>
      </div>
      <button 
        className="view-button"
        onClick={() => onViewAgent(operator)}
      >
        Visualizar Dados
      </button>
    </div>
  )
}

// Componente principal com drag & drop integrado
const AgentAnalysisDragDrop = ({ data, operatorMetrics, rankings, onViewAgent }) => {
  const [sortedOperators, setSortedOperators] = useState(rankings || [])
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedOperators((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Salvar nova ordem no localStorage
        localStorage.setItem('operatorsOrder', JSON.stringify(newOrder.map(op => op.id)))
        
        return newOrder
      })
    }
  }

  // Carregar ordem salva do localStorage
  React.useEffect(() => {
    const savedOrder = localStorage.getItem('operatorsOrder')
    if (savedOrder && rankings) {
      try {
        const orderIds = JSON.parse(savedOrder)
        const orderedOperators = orderIds.map(id => 
          rankings.find(op => op.id === id)
        ).filter(Boolean)
        
        // Adicionar operadores que não estavam na ordem salva
        const remainingOperators = rankings.filter(op => 
          !orderIds.includes(op.id)
        )
        
        setSortedOperators([...orderedOperators, ...remainingOperators])
      } catch (error) {
        console.error('Erro ao carregar ordem dos operadores:', error)
        setSortedOperators(rankings)
      }
    } else {
      setSortedOperators(rankings)
    }
  }, [rankings])

  return (
    <div className="agent-analysis-drag-drop">
      <div className="drag-drop-header">
        <h2>👥 Análise de Operadores</h2>
        <p>Arraste os operadores para reorganizar o ranking manualmente</p>
        <div className="drag-hint">
          💡 Dica: A ordem será salva automaticamente
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sortedOperators} 
          strategy={verticalListSortingStrategy}
        >
          <div className="agents-grid">
            {sortedOperators.map((operator, index) => (
              <SortableOperator
                key={operator.id}
                operator={operator}
                index={index}
                onViewAgent={onViewAgent}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="drag-drop-actions">
        <button 
          className="reset-order-button"
          onClick={() => {
            setSortedOperators(rankings)
            localStorage.removeItem('operatorsOrder')
          }}
        >
          🔄 Restaurar Ordem Original
        </button>
        <button 
          className="save-order-button"
          onClick={() => {
            // Aqui você pode implementar salvamento no backend
            console.log('Ordem salva:', sortedOperators)
            alert('Ordem salva com sucesso!')
          }}
        >
          💾 Salvar Ordem no Servidor
        </button>
      </div>
    </div>
  )
}

export default AgentAnalysisDragDrop
