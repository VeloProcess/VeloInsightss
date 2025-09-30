import React from 'react'

const DataFetcherSimple = () => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      backgroundColor: '#272A30', 
      color: '#F3F7FC',
      borderRadius: '10px',
      margin: '20px'
    }}>
      <h2>🚀 VeloInsights - Versão Demo</h2>
      <p>✅ Deploy funcionando perfeitamente!</p>
      <p>🔧 Configuração OAuth em andamento...</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>📋 Para configurar o Google OAuth:</h3>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Acesse <a href="https://console.cloud.google.com/" target="_blank" style={{color: '#1694FF'}}>Google Cloud Console</a></li>
          <li>Vá em APIs & Services → Credentials</li>
          <li>Clique no seu OAuth 2.0 Client ID</li>
          <li>Adicione nas "Authorized redirect URIs":</li>
          <ul>
            <li><code>https://SEU-PROJETO.vercel.app/callback.html</code></li>
            <li><code>https://localhost:3000/callback.html</code></li>
          </ul>
          <li>Salve as alterações</li>
        </ol>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#000058', borderRadius: '8px' }}>
        <h4>🎯 Status do Deploy:</h4>
        <p>✅ Build: Funcionando</p>
        <p>✅ Deploy: Concluído</p>
        <p>✅ URL: Ativa</p>
        <p>⏳ OAuth: Aguardando configuração</p>
      </div>
    </div>
  )
}

export default DataFetcherSimple
