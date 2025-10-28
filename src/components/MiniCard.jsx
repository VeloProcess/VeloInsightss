import React from 'react'
import './MiniCard.css'
import '../styles/animations.css'
import { 
  BsGraphUp, 
  BsStarFill, 
  BsClock, 
  BsHourglassSplit,
  BsTelephoneForward,
  BsFileText,
  BsBullseye,
  BsPauseCircle
} from 'react-icons/bs'

const MiniCard = ({ 
  title, 
  icon, 
  onClick, 
  previewData,
  description = "Clique para ver detalhes",
  disabled = false,
  delay = 0
}) => {
  // Ícone padrão SVG
  const IconComponent = icon || BsGraphUp
  
  return (
    <div 
      className={`mini-card ${disabled ? 'mini-card-disabled' : ''} stagger-item`} 
      onClick={disabled ? undefined : onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mini-card-header">
        <div className="mini-card-icon">
          {typeof icon === 'string' ? icon : (icon || <IconComponent />)}
        </div>
        <div className="mini-card-info">
          <h3 className="mini-card-title">{title}</h3>
          <p className="mini-card-description">{description}</p>
        </div>
      </div>
      
      {previewData && (
        <div className="mini-card-preview">
          {previewData}
        </div>
      )}
      
      <div className="mini-card-footer">
        <div className="mini-card-click-hint">
          <span className="click-icon">📊</span>
          <span className="click-text">Ver gráfico completo</span>
        </div>
      </div>
    </div>
  )
}

export default MiniCard
