import React, { useState, useEffect, useRef } from 'react'
import './LoginTest.css'

const LoginTest = ({ onContinue, onSignIn, isLoading }) => {
  const [email, setEmail] = useState('')
  const canvasRef = useRef(null)


  useEffect(() => {
    // Canvas para animações de partículas
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    
    // Criar partículas
    for (let i = 0; i < 48; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(22, 148, 255, ${particle.opacity})`
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="modern-login-container">
      {/* Canvas para partículas animadas */}
      <canvas ref={canvasRef} className="particles-canvas"></canvas>
      
      {/* Container principal com duas seções */}
      <div className="main-container">
        
        {/* Seção Esquerda (Branding + Gráficos Animados) */}
        <div className="branding-section">
          <div className="branding-content">
            {/* Logo principal da referência */}
            <div className="logo-container">
              <div className="logo-backdrop"></div>
              <div className="logo-image-container">
                <img 
                  src="/logo-veloinsights.png" 
                  alt="VeloInsights Logo" 
                  className="logo-image"
                  onError={(e) => {
                    // Fallback caso a imagem não carregue
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback text logo caso a imagem não carregue */}
                <div className="logo-fallback" style={{display: 'none'}}>
                  <span className="velo-part">Velo</span>
                  <span className="insights-part">Insights</span>
                </div>
              </div>
              <div className="logo-subtitle-modern">
                Analytics Platform
              </div>
            </div>
            
            {/* Descrição aprimorada */}
            <div className="description-modern">
              <p className="tagline subtitle">
                A <strong>fonte</strong> de insights profundos e <strong>acionáveis</strong> para impulsionar a performance empresarial.
              </p>
              
              {/* Features destacadas */}
              <div className="feature-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">📊</div>
                  <span>Dashboards Inteligentes</span>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">⚡</div>
                  <span>Tempo Real</span>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🎯</div>
                  <span>Análises Precisas</span>
                </div>
              </div>
            </div>
          </div>
          
          
          {/* Círculos decorativos animados */}
          <div className="circle circle-1 floating"></div>
          <div className="circle circle-2 floating"></div>
          <div className="circle circle-3 floating-delayed"></div>
        </div>

        {/* Seção Direita (Login) */}
        <div className="login-section">
          <div className="login-form-container">
            {/* Header animado */}
            <div className="login-header">
              <h2 className="title-h2 text-gradient">Seja bem vindo!</h2>
              <div className="login-indicator">
                <div className="indicator-dot active"></div>
                <div className="indicator-dot"></div>
                <div className="indicator-dot"></div>
              </div>
            </div>
            
            <p className="login-subtitle font-body-medium">
              Coloque seu e-mail corporativo<br />
              e faça login seguro com Google
            </p>
            
            {/* Input inteligente com animação */}
            <div className="input-wrapper animated">
              <i className="bx bx-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="seu@email.corporativo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                required 
              />
              {email && (
                <div className="input-success">
                  <i className="bx bx-check"></i>
                </div>
              )}
            </div>
            
            <div className="form-validation">
              <div className="validation-check">
                <i className="bx bx-check-circle"></i>
                <span>Sistema 100% seguro</span>
              </div>
              <div className="validation-check">
                <i className="bx bx-shield"></i>
                <span>Dados protegidos</span>
              </div>
            </div>

            {/* Botão de Login */}
            <button 
              onClick={() => {
                console.log('🔑 Botão de login clicado!')
                if (onSignIn) {
                  onSignIn()
                } else {
                  console.error('❌ onSignIn não está definido!')
                }
              }}
              disabled={isLoading}
              className="login-button btn-modern-primary pulse-on-hover"
            >
              {isLoading ? (
                <>
                  <i className="bx bx-loader-alt bx-spin"></i>
                  Conectando...
                </>
              ) : (
                <>
                  <i className="bx bx-google"></i>
                  Entrar com Google
                </>
              )}
            </button>
            
            {/* Cards de recursos destacados */}
            <div className="feature-cards">
              <div className="feature-card">
                <i className="bx bx-bar-chart-alt-2"></i>
                <span>Dashboards Real-time</span>
              </div>
              <div className="feature-card">
                <i className="bx bx-shield-alt-2"></i>
                <span>Analytics Avançado</span>
              </div>
              <div className="feature-card">
                <i className="bx bx-trending-up"></i>
                <span>Insights Inteligentes</span>
              </div>
            </div>

            {/* Status de autenticação */}
            <div className="success-message">
              <i className="bx bx-check-circle"></i>
              <span>Conectado com sucesso!</span>
              <button 
                onClick={onContinue}
                className="continue-button"
              >
                <i className="bx bx-right-arrow-alt"></i>
                Continuar para Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginTest