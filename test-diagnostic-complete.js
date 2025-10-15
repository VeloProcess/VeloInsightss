// Script de diagnóstico completo para a nova planilha
// Execute este script no console do navegador após fazer login

console.log('🔍 Diagnóstico completo da nova planilha...')

// Verificar se o usuário está logado
const userData = localStorage.getItem('veloinsights_user')
if (!userData) {
  console.error('❌ Usuário não está logado. Faça login primeiro.')
} else {
  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  const MAIN_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO'
  
  // Função para testar acesso básico à planilha
  const testBasicAccess = async () => {
    try {
      console.log('🔍 Testando acesso básico à planilha...')
      
      // Teste 1: Metadados da planilha
      const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}?fields=sheets.properties&access_token=${user.accessToken}`
      console.log('📋 Testando metadados...')
      
      const metadataResponse = await fetch(metadataUrl)
      console.log('Status dos metadados:', metadataResponse.status)
      
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json()
        console.log('✅ Metadados obtidos:', metadata)
        console.log('📋 Abas encontradas:', metadata.sheets?.map(s => s.properties.title))
      } else {
        const errorText = await metadataResponse.text()
        console.error('❌ Erro nos metadados:', errorText)
      }
      
      // Teste 2: Tentar ranges muito pequenos
      console.log('🧪 Testando ranges pequenos...')
      const smallRanges = [
        'A1:A1',
        'A1:B1', 
        'A1:Z1',
        'A1:AC1',
        'A1:A10',
        'A1:B10'
      ]
      
      for (const range of smallRanges) {
        try {
          const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/${range}?access_token=${user.accessToken}`
          console.log(`🧪 Testando range: ${range}`)
          
          const testResponse = await fetch(testUrl)
          console.log(`Status para ${range}:`, testResponse.status)
          
          if (testResponse.ok) {
            const testResult = await testResponse.json()
            console.log(`✅ Sucesso com ${range}:`, testResult)
            return range
          } else {
            const errorText = await testResponse.text()
            console.warn(`⚠️ Falha com ${range}:`, errorText)
          }
        } catch (error) {
          console.warn(`⚠️ Erro com ${range}:`, error.message)
        }
      }
      
      // Teste 3: Verificar se a planilha existe
      console.log('🔍 Verificando se a planilha existe...')
      const infoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}?access_token=${user.accessToken}`
      
      const infoResponse = await fetch(infoUrl)
      console.log('Status da planilha:', infoResponse.status)
      
      if (infoResponse.ok) {
        const info = await infoResponse.json()
        console.log('✅ Informações da planilha:', info)
      } else {
        const errorText = await infoResponse.text()
        console.error('❌ Erro ao acessar planilha:', errorText)
      }
      
    } catch (error) {
      console.error('❌ Erro no teste básico:', error)
    }
  }
  
  testBasicAccess()
}
