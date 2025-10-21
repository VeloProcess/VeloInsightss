import React, { useState } from 'react'
import './LoginTest.css'

const LoginTest = ({ onContinue, onSignIn, isLoading }) => {
  const [email, setEmail] = useState('')

  return (
    <div className="modern-login-container">
      {/* Container principal com duas seções */}
      <div className="main-container">
        
        {/* Seção Esquerda (Branding) */}
        <div className="branding-section">
          <div className="branding-content">
            <h1 className="logo">
              VeloInsight<span className="logo-arrow">&gt;</span>
            </h1>
            <p className="tagline">
              A fonte de insights profundos e acionáveis para impulsionar a performance empresarial.
            </p>
          </div>
          
          {/* Círculos decorativos */}
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
        </div>

        {/* Seção Direita (Login) */}
        <div className="login-section">
          <div className="login-form-container">
            <h2>Seja bem vindo!</h2>
            <p className="login-subtitle">
              Coloque seu e-mail<br />
              faça login com google
            </p>
            
            <div className="input-wrapper">
              <i className="bx bx-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder=" " 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <p className="form-note">Login apenas com e-mail corporativo!</p>

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
              className="login-button"
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