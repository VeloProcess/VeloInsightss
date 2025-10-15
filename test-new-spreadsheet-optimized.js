// Test script para verificar a integração otimizada com a nova planilha
// Execute este script no console do navegador após fazer login

console.log('🧪 Testando integração otimizada com nova planilha...')

// Verificar se o usuário está logado
const userData = localStorage.getItem('veloinsights_user')
if (!userData) {
  console.error('❌ Usuário não está logado. Faça login primeiro.')
} else {
  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  // Testar acesso direto à planilha
  const testSpreadsheetAccess = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO/values/Base!A1:AC1000?access_token=${user.accessToken}`
      
      console.log('🔗 Testando acesso direto à planilha...')
      const response = await fetch(url)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Sucesso! Dados obtidos:', result.values?.length || 0, 'linhas')
        console.log('📊 Primeiras 3 linhas:', result.values?.slice(0, 3))
      } else {
        const errorText = await response.text()
        console.error('❌ Erro:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
    }
  }
  
  testSpreadsheetAccess()
}
