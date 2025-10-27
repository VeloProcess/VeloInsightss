import React, { useState, useEffect } from 'react'
import './LoginTest.css'

const LoginTest = ({ onContinue, onSignIn, isLoading, isLoggedIn }) => {
  // Estado para controlar se o usuário está logado ou não
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Monitorar mudança no estado de autenticação
  useEffect(() => {
    if (isLoggedIn) {
      setShowSuccessMessage(true)
    }
  }, [isLoggedIn])
  
  // Debug reduzido
  if (isLoggedIn !== showSuccessMessage) {
  }


  return (
    <div className="executive-login-wrapper">
      {/* Container principal com bordas arredondadas */}
      <div className="executive-login-container">
        
        {/* Seção Esquerda (Branding Executivo - Branco) */}
        <div className="executive-left-section">
          <div className="executive-content">
            {/* Logo */}
            <div className="executive-logo">
              <img 
                src="/logo-veloinsights.png" 
                alt="VeloInsights Logo" 
                className="executive-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="executive-logo-fallback" style={{display: 'none'}}>
                <span className="executive-velo-text">Velo</span>
                <span className="executive-insights-text">Insights</span>
              </div>
            </div>
            
            {/* Ícone de Dados */}
            <div className="executive-icon-wrapper">
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#1694FF', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1634FF', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                
                {/* Barras simples e elegantes */}
                <rect x="20" y="70" width="25" height="40" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.2"/>
                <rect x="55" y="60" width="25" height="50" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.4"/>
                <rect x="90" y="45" width="25" height="65" rx="4" fill="url(#gradientBlue)"/>
                
                {/* Linha de tendência simples */}
                <path d="M 27 95 L 67 85 L 102 70" stroke="url(#gradientBlue)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                
                {/* Dot final */}
                <circle cx="102" cy="70" r="5" fill="url(#gradientBlue)"/>
              </svg>
            </div>
            
            {/* Features de Dados */}
            <div className="executive-features">
              <div className="executive-feature-item">
                <i className="bx bx-trending-up"></i>
                <span>Métricas em Tempo Real</span>
              </div>
              <div className="executive-feature-item">
                <i className="bx bx-bar-chart"></i>
                <span>Insights Inteligentes</span>
              </div>
              <div className="executive-feature-item">
                <i className="bx bx-data"></i>
                <span>Analytics Avançado</span>
              </div>
            </div>
            
            {/* Botão de Login */}
            <div className="executive-button-wrapper">
              {!showSuccessMessage ? (
                <button 
                  onClick={() => {
                    if (onSignIn) {
                      onSignIn()
                    } else {
                      console.error('❌ onSignIn não está definido!')
                    }
                  }}
                  disabled={isLoading}
                  className="executive-login-btn"
                >
                  {isLoading ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin"></i>
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google Logo" 
                        className="google-logo-icon"
                        onError={(e) => {
                          // Fallback para ícone Boxicons se o logo do Google não carregar
                          e.target.style.display = 'none';
                        }}
                      />
                      <span>Login com Google</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="executive-success">
                  <i className="bx bx-check-circle"></i>
                  <span>Conectado com sucesso!</span>
                  <button 
                    onClick={onContinue}
                    className="executive-continue-btn"
                  >
                    <i className="bx bx-right-arrow-alt"></i>
                    <span>Continuar para Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção Direita (Design Abstrato e Moderno - Azul) */}
        <div className="executive-right-section">
          <div className="executive-abstract-design">
            {/* Elementos abstratos flutuantes */}
            <div className="abstract-element element-1"></div>
            <div className="abstract-element element-2"></div>
            <div className="abstract-element element-3"></div>
            <div className="abstract-element element-4"></div>
            <div className="abstract-element element-5"></div>
            <div className="abstract-element element-6"></div>
            <div className="abstract-element element-7"></div>
            
            {/* Grid pattern moderno */}
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
            
            {/* Círculo focal central */}
            <div className="focal-circle"></div>
            
            {/* Linhas conectadas modernas */}
            <div className="modern-lines">
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
              <div className="line line-4"></div>
            </div>
            
            {/* Partículas flutuantes */}
            <div className="particles">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`particle particle-${i + 1}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginTest