// Script para verificar se o problema é com o token ou com a planilha
// Execute este script no console do navegador

console.log('🔍 Verificando se o problema é com token ou planilha...')

// Verificar se o usuário está logado
const userData = localStorage.getItem('veloinsights_user')
if (!userData) {
  console.error('❌ Usuário não está logado. Faça login primeiro.')
} else {
  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  // Testar com planilha antiga (que sabemos que funciona)
  const OLD_SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const NEW_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO'
  
  const testSpreadsheetAccess = async (spreadsheetId, name) => {
    try {
      console.log(`🔍 Testando ${name} (${spreadsheetId})...`)
      
      // Teste básico de metadados
      const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties&access_token=${user.accessToken}`
      const metadataResponse = await fetch(metadataUrl)
      
      console.log(`${name} - Status metadados:`, metadataResponse.status)
      
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json()
        console.log(`✅ ${name} - Metadados OK:`, metadata.sheets?.map(s => s.properties.title))
        
        // Teste de dados
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:A1?access_token=${user.accessToken}`
        const dataResponse = await fetch(dataUrl)
        
        console.log(`${name} - Status dados:`, dataResponse.status)
        
        if (dataResponse.ok) {
          const data = await dataResponse.json()
          console.log(`✅ ${name} - Dados OK:`, data)
        } else {
          const errorText = await dataResponse.text()
          console.error(`❌ ${name} - Erro dados:`, errorText)
        }
      } else {
        const errorText = await metadataResponse.text()
        console.error(`❌ ${name} - Erro metadados:`, errorText)
      }
      
    } catch (error) {
      console.error(`❌ ${name} - Erro geral:`, error)
    }
  }
  
  // Testar ambas as planilhas
  const runTests = async () => {
    await testSpreadsheetAccess(OLD_SPREADSHEET_ID, 'PLANILHA ANTIGA')
    console.log('---')
    await testSpreadsheetAccess(NEW_SPREADSHEET_ID, 'PLANILHA NOVA')
  }
  
  runTests()
}
