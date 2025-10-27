import React from 'react'
import './Header.css'

const Header = ({ onToggleSidebar, sidebarOpen, theme, onToggleTheme, currentView, onViewChange, hasData }) => {
  return (
    <>
      <header className="header">
        <div className="logo-section">
          <img 
            src="/logo-veloinsights.png" 
            alt="VeloInsights Logo" 
            className="header-logo-img"
            onError={(e) => {
              e.target.style.display = 'none'
              const fallback = e.target.nextSibling
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div className="logo-fallback" style={{display: 'none'}}>
            <span className="velo-text">Velo</span>
            <span className="insights-text">Insights</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Botão de tema removido */}
        </div>
      </header>

      {/* Tabs de Navegação - Abaixo do Header */}
      {hasData && (
        <nav className="header-nav">
          <button
            className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            <i className='bx bxs-dashboard'></i>
            Dashboard
          </button>
          <button
            className={`nav-tab disabled ${currentView === 'charts' ? 'active' : ''}`}
            onClick={() => onViewChange('charts')}
            disabled
            title="Funcionalidade em desenvolvimento"
          >
            <i className='bx bxs-bar-chart-alt-2'></i>
            Gráficos - FUTURO
          </button>
          <button
            className={`nav-tab disabled ${currentView === 'agents' ? 'active' : ''}`}
            onClick={() => onViewChange('agents')}
            disabled
            title="Funcionalidade em desenvolvimento"
          >
            <i className='bx bxs-user-account'></i>
            Operadores - FUTURO
          </button>
        </nav>
      )}
    </>
  )
}

export default Header
