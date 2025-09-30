/**
 * Componente para buscar dados do Google Sheets
 * Substitui o UploadArea no novo sistema
 */

import React from 'react'
import './DataFetcher.css'

const DataFetcher = ({ 
  isLoading, 
  isAuthenticated, 
  userData,
  onFetchData, 
  onSignIn, 
  onSignOut, 
  errors = [] 
}) => {
  return (
    <div className="data-fetcher">
      <div className="fetcher-container">
        <div className="fetcher-header">
          <div className="fetcher-icon">📊</div>
          <h2 className="fetcher-title">VeloInsights</h2>
          <p className="fetcher-subtitle">
            Dashboard de Análise de Atendimentos
          </p>
        </div>

        <div className="fetcher-content">
          {!isAuthenticated ? (
            <div className="auth-section">
              <div className="auth-info">
                <h3>🔐 Autenticação Necessária</h3>
                <p>
                  Para acessar os dados da planilha, você precisa fazer login com sua conta Google corporativa (@velotax.com.br).
                </p>
                <div className="auth-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">✅</span>
                    <span>Acesso seguro aos dados</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🔄</span>
                    <span>Dados sempre atualizados</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">📈</span>
                    <span>Análises em tempo real</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="auth-button"
                onClick={onSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Conectando...
                  </>
                ) : (
                  <>
                    <span className="google-icon">🔍</span>
                    Conectar com Google
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="data-section">
              <div className="data-info">
                <h3>📋 Dados Conectados</h3>
                <p>
                  Conectado com sucesso! Clique no botão abaixo para buscar os dados mais recentes da planilha.
                </p>
                
                {/* Informações do usuário */}
                {userData && (
                  <div className="user-info">
                    <div className="user-avatar">
                      {userData.foto ? (
                        <img src={userData.foto} alt={userData.nome} />
                      ) : (
                        <span className="user-initial">{userData.nome?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{userData.nome}</div>
                      <div className="user-email">{userData.email}</div>
                    </div>
                  </div>
                )}
                
                <div className="data-status">
                  <div className="status-item">
                    <span className="status-icon">✅</span>
                    <span>Autenticação ativa</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">📊</span>
                    <span>Planilha: VeloInsights</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">🔄</span>
                    <span>Atualização semanal</span>
                  </div>
                </div>
              </div>

              <div className="data-actions">
                <button 
                  className="fetch-button primary"
                  onClick={onFetchData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Buscando dados...
                    </>
                  ) : (
                    <>
                      <span className="fetch-icon">📥</span>
                      Buscar Dados Atualizados
                    </>
                  )}
                </button>

                <button 
                  className="fetch-button secondary"
                  onClick={onSignOut}
                  disabled={isLoading}
                >
                  <span className="signout-icon">🚪</span>
                  Desconectar
                </button>
              </div>
            </div>
          )}

          {/* Exibir erros */}
          {errors.length > 0 && (
            <div className="error-section">
              <h4>⚠️ Erros encontrados:</h4>
              <ul className="error-list">
                {errors.map((error, index) => (
                  <li key={index} className="error-item">
                    {error}
                  </li>
                ))}
              </ul>
              
              {/* Instruções de configuração */}
              {errors.some(error => error.includes('Client ID') || error.includes('configurado')) && (
                <div className="config-help">
                  <h5>🔧 Como configurar o Google SSO:</h5>
                  <ol className="config-steps">
                    <li>Crie um arquivo <code>.env</code> na raiz do projeto</li>
                    <li>Adicione suas credenciais do Google Cloud Console:</li>
                    <li className="config-code">
                      <code>
                        VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui<br/>
                        VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
                      </code>
                    </li>
                    <li>Consulte o arquivo <code>GOOGLE_SSO_SETUP.md</code> para instruções detalhadas</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Informações adicionais */}
          <div className="info-section">
            <h4>ℹ️ Informações importantes:</h4>
            <ul className="info-list">
              <li>Os dados são atualizados semanalmente na planilha</li>
              <li>O sistema mantém cache local para melhor performance</li>
              <li>Você pode desconectar a qualquer momento</li>
              <li>Seus dados são mantidos seguros com OAuth2</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataFetcher
