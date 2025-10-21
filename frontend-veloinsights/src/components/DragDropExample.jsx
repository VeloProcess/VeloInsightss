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
import './DragDropExample.css'

// Componente para cada item sortable
const SortableItem = ({ id, children, className = '' }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

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
      className={`sortable-item ${className} ${isDragging ? 'dragging' : ''}`}
    >
      {children}
    </div>
  )
}

// Exemplo 1: Reordenação de Cards de Métricas
const MetricsDragDrop = () => {
  const [metrics, setMetrics] = useState([
    { id: '1', title: 'Total de Chamadas', value: '1,234', icon: '📞', color: '#EF4444' },
    { id: '2', title: 'Duração Média', value: '5.2 min', icon: '⏱️', color: '#8B5CF6' },
    { id: '3', title: 'Nota Atendimento', value: '4.8', icon: '⭐', color: '#F59E0B' },
    { id: '4', title: 'Nota Solução', value: '4.4', icon: '🎯', color: '#10B981' },
    { id: '5', title: 'Tempo Logado', value: '1,133 min', icon: '🕐', color: '#3B82F6' },
    { id: '6', title: 'Tempo Pausado', value: '0 min', icon: '⏸️', color: '#6B7280' },
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="drag-drop-example">
      <h3>📊 Reordenação de Cards de Métricas</h3>
      <p>Arraste os cards para reorganizar a ordem:</p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={metrics} strategy={verticalListSortingStrategy}>
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <SortableItem key={metric.id} id={metric.id}>
                <div className="metric-card" style={{ borderLeftColor: metric.color }}>
                  <div className="metric-icon">{metric.icon}</div>
                  <div className="metric-content">
                    <h4>{metric.title}</h4>
                    <span className="metric-value">{metric.value}</span>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Exemplo 2: Reordenação de Operadores no Ranking
const OperatorsDragDrop = () => {
  const [operators, setOperators] = useState([
    { id: '1', name: 'Monike Samara', score: 85.2, calls: 245 },
    { id: '2', name: 'Gabriel Araujo', score: 82.1, calls: 198 },
    { id: '3', name: 'Laura Porto', score: 79.8, calls: 156 },
    { id: '4', name: 'Marcelo Silva', score: 76.4, calls: 134 },
    { id: '5', name: 'Stephanie Oliveira', score: 73.9, calls: 112 },
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setOperators((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="drag-drop-example">
      <h3>👥 Reordenação de Operadores</h3>
      <p>Arraste os operadores para ajustar o ranking manualmente:</p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={operators} strategy={verticalListSortingStrategy}>
          <div className="operators-list">
            {operators.map((operator, index) => (
              <SortableItem key={operator.id} id={operator.id}>
                <div className="operator-card">
                  <div className="operator-rank">#{index + 1}</div>
                  <div className="operator-info">
                    <h4>{operator.name}</h4>
                    <div className="operator-stats">
                      <span>Score: {operator.score}</span>
                      <span>Chamadas: {operator.calls}</span>
                    </div>
                  </div>
                  <div className="drag-handle">⋮⋮</div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Exemplo 3: Upload de Arquivos por Drag & Drop
const FileUploadDragDrop = () => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="drag-drop-example">
      <h3>📁 Upload de Arquivos por Drag & Drop</h3>
      <p>Arraste arquivos CSV ou XLSX para fazer upload:</p>
      
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h4>Arraste arquivos aqui</h4>
          <p>ou clique para selecionar</p>
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const files = Array.from(e.target.files)
              const newFiles = files.map(file => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
              }))
              setUploadedFiles(prev => [...prev, ...newFiles])
            }}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-button">
            Selecionar Arquivos
          </label>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Arquivos Carregados:</h4>
          {uploadedFiles.map(file => (
            <div key={file.id} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => removeFile(file.id)} className="remove-file">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente principal que mostra todos os exemplos
const DragDropExample = () => {
  return (
    <div className="drag-drop-container">
      <h2>🎯 Exemplos de Drag & Drop para VeloInsights</h2>
      
      <MetricsDragDrop />
      <OperatorsDragDrop />
      <FileUploadDragDrop />
      
      <div className="implementation-notes">
        <h3>💡 Como Implementar no Projeto:</h3>
        <ul>
          <li><strong>Reordenação de Cards:</strong> Integrar com o estado dos componentes principais</li>
          <li><strong>Ranking de Operadores:</strong> Salvar nova ordem no localStorage ou backend</li>
          <li><strong>Upload de Arquivos:</strong> Integrar com o sistema de processamento existente</li>
          <li><strong>Gráficos:</strong> Permitir reordenação dos gráficos na seção detalhada</li>
        </ul>
      </div>
    </div>
  )
}

export default DragDropExample
