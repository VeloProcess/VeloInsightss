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
          <h1 className="logo-text">VeloInsights</h1>
          <span className="logo-subtitle">Dashboard de Análise</span>
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