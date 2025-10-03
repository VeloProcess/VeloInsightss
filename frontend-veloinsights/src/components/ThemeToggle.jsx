import React from 'react'
import './ThemeToggle.css'

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button 
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <div className="theme-icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </div>
      <span className="theme-text">
        {theme === 'light' ? 'Escuro' : 'Claro'}
      </span>
    </button>
  )
}

export default ThemeToggle
