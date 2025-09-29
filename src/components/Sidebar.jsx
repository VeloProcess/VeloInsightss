import React from 'react'
import './Sidebar.css'

const Sidebar = ({ open, currentView, onViewChange, hasData, onClearData, viewMode, onViewModeChange, selectedOperator, onOperatorSelect, operatorMetrics }) => {
  const menuItems = [
    {
      id: 'upload',
      label: 'Upload de Dados',
      icon: '📁',
      description: 'Carregar arquivos CSV/Excel'
    },
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      icon: '🏢',
      description: 'Visão geral da empresa',
      disabled: !hasData
    },
    {
      id: 'operators',
      label: 'Análise por Operador',
      icon: '👥',
      description: 'Métricas individuais',
      disabled: !hasData
    }
  ]

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => onViewChange(currentView)} />}
      
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && onViewChange(item.id)}
              disabled={item.disabled}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>
        
        {/* Seletor de Operador */}
        {currentView === 'operators' && operatorMetrics && operatorMetrics.length > 0 && (
          <div className="operator-selector">
            <h4>👤 Selecionar Operador</h4>
            <select 
              value={selectedOperator || ''} 
              onChange={(e) => onOperatorSelect(e.target.value)}
              className="operator-select"
            >
              <option value="">Todos os Operadores</option>
              {operatorMetrics.map(op => (
                <option key={op.operator} value={op.operator}>
                  {op.operator} ({op.totalCalls} chamadas)
                </option>
              ))}
            </select>
          </div>
        )}
        
        {hasData && (
          <div className="sidebar-footer">
            <button 
              className="btn btn-danger btn-sm"
              onClick={onClearData}
            >
              🗑️ Limpar Dados
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
