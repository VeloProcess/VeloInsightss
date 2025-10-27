import React, { useState, useEffect, useRef } from 'react'
import './ProgressIndicator.css'

const ProgressIndicator = ({ progress, onCancel }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [finalizing, setFinalizing] = useState(false)
  const finalizeStartRef = useRef(0)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)

  // Calcular porcentagem com tratamento especial para finalização
  let percentage
  if (finalizing && animatedProgress < 100) {
    // Durante finalização, usar animatedProgress que vai de onde estava até 100
    percentage = Math.round(animatedProgress)
  } else if (finalizing && animatedProgress >= 100) {
    // Finalizado
    percentage = 100
  } else if (progress.current > 0) {
    // Progresso real do backend
    percentage = Math.round(((progress.current / progress.total) * 100))
  } else {
    // Progresso simulado de 0 a 95
    percentage = Math.round(animatedProgress)
  }

  // Animar progresso de 0 a 95 quando não há progresso real
  useEffect(() => {
    if (progress.current === 0 && !finalizing) {
      setAnimatedProgress(0)
      setFinalizing(false)
      // Progresso simulado
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= 95) return 95
          // Incremento progressivo que desacelera conforme avança
          const speed = 2 - (prev / 100) // Diminui velocidade conforme aumenta
          const increment = Math.max(0.5, speed + (Math.random() * 0.5))
          return Math.min(prev + increment, 95)
        })
      }, 400)
      
      return () => clearInterval(interval)
    } else if (progress.current > 0 && !finalizing) {
      // Quando há progresso real mas não finalizando, resetar animação
      setAnimatedProgress(0)
    }
  }, [progress.current, finalizing])

  // Animar para 100% quando o carregamento completar
  useEffect(() => {
    // Se o carregamento real completou, animar rapidamente para 100%
    if (progress.current > 0 && progress.current === progress.total && !finalizing) {
      setFinalizing(true)
      
      // Pula direto para perto de 100% e anima rapidamente até 100%
      setAnimatedProgress(95)
      
      // Anima rapidamente de 95% até 100%
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          // Incremento rápido para chegar em 100%
          const increment = 5 + Math.random() * 3
          return Math.min(prev + increment, 100)
        })
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [progress.current, progress.total, finalizing])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      if (percentage > 0) {
        const estimated = Math.floor((elapsed / percentage) * 100) - elapsed
        setEstimatedTime(Math.max(0, estimated))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, percentage])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressStage = () => {
    if (percentage < 20) return { stage: 'Lendo arquivo', icon: '📁' }
    if (percentage < 40) return { stage: 'Processando dados', icon: '⚙️' }
    if (percentage < 60) return { stage: 'Validando registros', icon: '✅' }
    if (percentage < 80) return { stage: 'Calculando métricas', icon: '📊' }
    if (percentage < 95) return { stage: 'Gerando ranking', icon: '🏆' }
    return { stage: 'Finalizando', icon: '🎉' }
  }

  const currentStage = getProgressStage()

  return (
    <div className="loader-wrapper-login">
      <div className="loader-container-login">
        {/* Seção Esquerda - Conteúdo */}
        <div className="loader-left-section">
          <div className="loader-content-wrapper">
            {/* Logo */}
            <div className="loader-logo-login">
              <img 
                src="/logo-veloinsights.png" 
                alt="VeloInsights Logo" 
                className="loader-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const fallback = e.target.nextSibling
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="loader-logo-fallback" style={{display: 'none'}}>
                <span style={{color: '#1634FF'}}>Velo</span>
                <span style={{color: '#1694FF'}}>Insights</span>
              </div>
            </div>

            {/* Ícone Animado */}
            <div className="loader-icon-wrapper">
              <div className="loader-icon-circle">
                <span className="loader-stage-icon">{currentStage.icon}</span>
              </div>
            </div>

            {/* Título */}
            <div className="loader-title-section">
              <h2 className="loader-title-login">Processando Arquivo</h2>
              <p className="loader-subtitle-login">{currentStage.stage}</p>
            </div>

            {/* Barra de Progresso */}
            <div className="loader-progress-section">
              <div className="loader-progress-value">{percentage}%</div>
              <div className="loader-progress-bar">
                <div 
                  className="loader-progress-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="loader-message">
              <div className="loader-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <span className="loader-message-text">{progress.message || 'Processando...'}</span>
            </div>

            {/* Botão Cancelar */}
            {onCancel && (
              <button className="loader-cancel-btn-login" onClick={onCancel}>
                <i className="bx bx-x"></i>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Seção Direita - Decoração Azul */}
        <div className="loader-right-section">
          <div className="loader-abstract-design">
            <div className="abstract-element element-1"></div>
            <div className="abstract-element element-2"></div>
            <div className="abstract-element element-3"></div>
            <div className="abstract-element element-4"></div>
            <div className="abstract-grid">
              <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgba(22, 148, 255, 0.15)', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: 'rgba(22, 52, 255, 0.1)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgba(22, 148, 255, 0.15)', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <g>
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1={0} y1={i * 10} x2={200} y2={i * 10} stroke="url(#gridGradient)" strokeWidth="0.5" />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1={i * 10} y1={0} x2={i * 10} y2={200} stroke="url(#gridGradient)" strokeWidth="0.5" />
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator
