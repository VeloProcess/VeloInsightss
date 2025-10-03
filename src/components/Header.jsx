import React from 'react'
import ThemeToggle from './ThemeToggle'
import './Header.css'

const Header = ({ onToggleSidebar, sidebarOpen, theme, onToggleTheme }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        <div className="header-title">
          <div className="header-logo-container">
            <img 
              src="/logo-veloinsights.png" 
              alt="VeloInsights Logo" 
              className="header-logo-image"
              onError={(e) => {
                // Fallback caso a imagem não carregue
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <h1 className="logo-text title-h2 text-gradient" style={{display: 'none'}}>VeloInsights</h1>
          </div>
          <span className="logo-subtitle font-body-medium">Dashboard de Análise</span>
        </div>
      </div>
      
      <div className="header-actions">
        <ThemeToggle 
          theme={theme}
          onToggle={onToggleTheme}
        />
      </div>
    </header>
  )
}

export default Header