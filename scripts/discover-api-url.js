// 🎯 TESTE DE DESCOBERTA DA URL CORRETA
import axios from 'axios'
import dotenv from 'dotenv'
import https from 'https'

dotenv.config()

const API_TOKEN = process.env.API_55

console.log('🔍 DESCOBRINDO URL CORRETA DA API 55PBX...')
console.log(`🔑 Token: ${API_TOKEN ? API_TOKEN.substring(0, 10) + '...' : 'NÃO ENCONTRADO'}`)

if (!API_TOKEN) {
  console.error('❌ Variável API_55 não encontrada!')
  process.exit(1)
}

// Configurar axios para ignorar SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// URLs alternativas para testar
const alternativeUrls = [
  'https://api.55pbx.com.br/v1/calls',
  'https://api.55pbx.com.br/calls',
  'https://55pbx.com.br/api/v1/calls',
  'https://55pbx.com.br/api/calls',
  'https://app.55pbx.com/api/v1/calls',
  'https://app.55pbx.com/api/calls',
  'https://dashboard.55pbx.com/api/v1/calls',
  'https://dashboard.55pbx.com/api/calls',
  'https://api.55pbx.com/v1/telephony',
  'https://api.55pbx.com/v1/data',
  'https://api.55pbx.com/v1/reports',
  'https://api.55pbx.com/v1/analytics'
]

async function testUrl(url) {
  try {
    console.log(`🔄 Testando: ${url}`)
    
    const response = await axios.get(url, {
      httpsAgent,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        date: '2025-10-09',
        limit: 5
      },
      timeout: 10000
    })
    
    console.log(`✅ SUCESSO! Status: ${response.status}`)
    console.log(`📊 Resposta:`)
    console.log(JSON.stringify(response.data, null, 2))
    
    return { success: true, data: response.data, url }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Erro ${error.response.status}: ${error.response.statusText}`)
    } else {
      console.log(`❌ Erro: ${error.message}`)
    }
    return { success: false, error: error.message }
  }
  console.log('')
}

async function runDiscovery() {
  console.log('🚀 Executando descoberta de URLs...')
  console.log('')
  
  let successCount = 0
  
  for (const url of alternativeUrls) {
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
    console.log('💡 CONCLUSÃO:')
    console.log('   - A API 55PBX pode estar offline')
    console.log('   - A URL da API pode ser diferente')
    console.log('   - O token pode estar incorreto')
    console.log('   - A API pode precisar de autenticação diferente')
    console.log('')
    console.log('🔧 PRÓXIMOS PASSOS:')
    console.log('   1. Verificar com a equipe da 55PBX a URL correta')
    console.log('   2. Verificar se o token está correto')
    console.log('   3. Verificar se a API está funcionando')
    console.log('   4. Verificar se precisa de autenticação diferente')
  }
}

// Executar descoberta
runDiscovery()
  .then(() => {
    console.log('✅ Descoberta concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na descoberta:', error)
    process.exit(1)
  })
