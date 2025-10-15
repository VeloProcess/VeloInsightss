// Script de teste para descoberta inteligente da nova planilha
// Execute este script no console do navegador após fazer login

console.log('🧪 Testando descoberta inteligente da nova planilha...')

// Verificar se o usuário está logado
const userData = localStorage.getItem('veloinsights_user')
if (!userData) {
  console.error('❌ Usuário não está logado. Faça login primeiro.')
} else {
  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  // Função para testar configurações conhecidas (colunas idênticas)
  const testKnownConfigurations = async () => {
    try {
      console.log('🔍 Testando configurações conhecidas (colunas idênticas)...')
      
      const MAIN_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO'
      
      // Configurações conhecidas que funcionavam na planilha antiga
      const configurations = [
        { sheetName: 'Base', range: 'A1:AC150000' },
        { sheetName: 'Base', range: 'A1:AC100000' },
        { sheetName: 'Base', range: 'A1:AC50000' },
        { sheetName: 'Base', range: 'A1:AC10000' },
        { sheetName: 'Sheet1', range: 'A1:AC150000' },
        { sheetName: 'Sheet1', range: 'A1:AC100000' },
        { sheetName: 'Planilha1', range: 'A1:AC150000' },
        { sheetName: 'Dados', range: 'A1:AC150000' }
      ]
      
      for (const config of configurations) {
        try {
          const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/${config.sheetName}!${config.range}?access_token=${user.accessToken}`
          console.log(`🧪 Testando: ${config.sheetName}!${config.range}`)
          
          const testResponse = await fetch(testUrl)
          
          if (testResponse.ok) {
            const testResult = await testResponse.json()
            if (testResult.values && testResult.values.length > 0) {
              console.log(`✅ SUCESSO com: ${config.sheetName}!${config.range} (${testResult.values.length} linhas)`)
              console.log('📊 Primeiras 3 linhas:', testResult.values.slice(0, 3))
              console.log('📋 Cabeçalhos:', testResult.values[0])
              return { sheetName: config.sheetName, range: config.range, data: testResult.values }
            }
          } else {
            const errorText = await testResponse.text()
            console.warn(`⚠️ Falha com ${config.sheetName}!${config.range}: ${testResponse.status} - ${errorText}`)
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao testar ${config.sheetName}!${config.range}:`, error.message)
        }
      }
      
      console.warn('⚠️ Nenhuma configuração funcionou')
      
    } catch (error) {
      console.error('❌ Erro ao testar configurações:', error)
    }
  }
  
  testKnownConfigurations()
}
