// get-manual-token.js
// Script para obter token manual do Google OAuth Playground

const SPREADSHEET_ID = '1TXfLHMUSy-HTNUSmn3GR2lLEe_8dOVdI'

async function testManualToken() {
  try {
    console.log('🔑 Testando token manual...')
    
    // Cole aqui o token obtido do OAuth Playground
    const MANUAL_TOKEN = 'COLE_SEU_TOKEN_AQUI'
    
    if (MANUAL_TOKEN === 'COLE_SEU_TOKEN_AQUI') {
      console.log('❌ ERRO: Cole seu token do OAuth Playground primeiro!')
      console.log('📋 PASSO A PASSO:')
      console.log('1. Acesse: https://developers.google.com/oauthplayground/')
      console.log('2. Selecione: Google Sheets API v4')
      console.log('3. Scope: https://www.googleapis.com/auth/spreadsheets.readonly')
      console.log('4. Autorize e obtenha o token')
      console.log('5. Cole o token na variável MANUAL_TOKEN')
      return false
    }
    
    // Testar acesso à planilha
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Base!A1:AC10`,
      {
        headers: {
          'Authorization': `Bearer ${MANUAL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Token funcionando!')
    console.log('📊 Dados obtidos:', data.values?.length || 0, 'linhas')
    console.log('📋 Primeira linha:', data.values?.[0])
    
    return MANUAL_TOKEN
    
  } catch (error) {
    console.error('❌ Erro ao testar token:', error.message)
    return false
  }
}

// Executar teste
testManualToken()
