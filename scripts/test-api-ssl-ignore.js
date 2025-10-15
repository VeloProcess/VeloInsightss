// 🎯 TESTE IGNORANDO SSL (TEMPORÁRIO)
import axios from 'axios'
import dotenv from 'dotenv'
import https from 'https'

// Carregar variáveis de ambiente
dotenv.config()

const API_TOKEN = process.env.API_55

console.log('🔍 TESTANDO API 55PBX (IGNORANDO SSL)...')
console.log(`🔑 Token: ${API_TOKEN ? API_TOKEN.substring(0, 10) + '...' : 'NÃO ENCONTRADO'}`)

if (!API_TOKEN) {
  console.error('❌ Variável API_55 não encontrada!')
  process.exit(1)
}

// Configurar axios para ignorar SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

const axiosConfig = {
  httpsAgent,
  timeout: 15000
}

// Calcular data de ontem
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const dateStr = yesterday.toISOString().split('T')[0]

console.log(`📅 Testando com data: ${dateStr}`)
console.log('')

// URLs para testar
const testUrls = [
  'https://api.55pbx.com/v1/calls',
  'https://api.55pbx.com/calls',
  'https://api.55pbx.com/v1/data/calls',
  'https://api.55pbx.com/v1/reports/calls',
  'https://api.55pbx.com/v1/telephony/calls'
]

async function testUrl(url) {
  try {
    console.log(`🔄 Testando: ${url}`)
    
    // Testar com Bearer Token
    const response = await axios.get(url, {
      ...axiosConfig,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        date: dateStr,
        start_date: dateStr,
        end_date: dateStr,
        limit: 5
      }
    })
    
    console.log(`✅ SUCESSO! Status: ${response.status}`)
    console.log(`📊 Resposta:`)
    console.log(JSON.stringify(response.data, null, 2))
    
    return { success: true, data: response.data, url }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Erro ${error.response.status}: ${error.response.statusText}`)
      if (error.response.data) {
        console.log(`   Detalhes: ${JSON.stringify(error.response.data).substring(0, 200)}...`)
      }
    } else {
      console.log(`❌ Erro: ${error.message}`)
    }
    return { success: false, error: error.message }
  }
  console.log('')
}

async function runTests() {
  console.log('🚀 Executando testes (ignorando SSL)...')
  console.log('')
  
  let successCount = 0
  
  for (const url of testUrls) {
    const result = await testUrl(url)
    if (result.success) {
      successCount++
      console.log('🎉 URL FUNCIONAL ENCONTRADA!')
      console.log(`   URL: ${url}`)
      console.log(`   Auth: Bearer Token`)
      break
    }
  }
  
  console.log('')
  console.log(`📊 RESULTADO: ${successCount} URL(s) funcionaram`)
  
  if (successCount === 0) {
    console.log('')
    console.log('💡 PRÓXIMOS PASSOS:')
    console.log('   1. Verificar se o token está correto')
    console.log('   2. Verificar se a URL da API está correta')
    console.log('   3. Verificar se precisa de parâmetros diferentes')
    console.log('   4. Verificar se a API está funcionando')
  }
}

// Executar testes
runTests()
  .then(() => {
    console.log('✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no teste:', error)
    process.exit(1)
  })
