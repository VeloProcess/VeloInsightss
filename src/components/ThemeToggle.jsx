import React from 'react'

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button 
      className="theme-toggle"
      onClick={onToggle}
      title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle
