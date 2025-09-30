import React from 'react'

const LoginTest = ({ isAuthenticated, onSignIn, isLoading, errors }) => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      backgroundColor: '#272A30', 
      color: '#F3F7FC',
      borderRadius: '10px',
      margin: '20px'
    }}>
      <h2>🔐 Teste de Login</h2>
      
      <div style={{ margin: '20px 0' }}>
        <p><strong>Status:</strong> {isAuthenticated ? '✅ Logado' : '❌ Não logado'}</p>
        <p><strong>Loading:</strong> {isLoading ? '⏳ Carregando...' : '✅ Pronto'}</p>
        <p><strong>Erros:</strong> {errors.length} erro(s)</p>
      </div>

      {!isAuthenticated && (
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={onSignIn}
            disabled={isLoading}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#1634FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? '⏳ Conectando...' : '🔍 Fazer Login com Google'}
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ margin: '20px 0', textAlign: 'left' }}>
          <h4>⚠️ Erros:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index} style={{ color: '#ff6b6b' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default LoginTest
