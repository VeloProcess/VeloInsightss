// Script de teste para Service Account
// Execute este script no console do navegador

console.log('🔍 Testando acesso com Service Account...')

// Função para testar acesso com Service Account
const testServiceAccountAccess = async () => {
  try {
    console.log('🔄 Tentando acessar planilha com Service Account...')
    
    // Usar o endpoint do Service Account (se disponível)
    const serviceAccountEmail = 'veloinsights-service@veloinsights.iam.gserviceaccount.com'
    const spreadsheetId = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO'
    
    // Tentar diferentes abordagens
    const approaches = [
      // Abordagem 1: Tentar com o email do service account
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${serviceAccountEmail}`,
      
      // Abordagem 2: Tentar com parâmetros diferentes
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      
      // Abordagem 3: Tentar acessar via Drive API
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=id,name`
    ]
    
    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`🧪 Tentando abordagem ${i + 1}:`, approaches[i])
        
        const response = await fetch(approaches[i])
        console.log(`Status abordagem ${i + 1}:`, response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Sucesso abordagem ${i + 1}:`, data)
          return data
        } else {
          const errorText = await response.text()
          console.warn(`⚠️ Falha abordagem ${i + 1}:`, errorText)
        }
      } catch (error) {
        console.warn(`⚠️ Erro abordagem ${i + 1}:`, error.message)
      }
    }
    
    console.warn('⚠️ Todas as abordagens falharam')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testServiceAccountAccess()
