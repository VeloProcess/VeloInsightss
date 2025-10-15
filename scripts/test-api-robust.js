// 🎯 TESTE ROBUSTO DA API 55PBX
import axios from 'axios'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const API_TOKEN = process.env.API_55

console.log('🔍 INICIANDO TESTE DA API 55PBX...')
console.log(`🔑 Token: ${API_TOKEN ? API_TOKEN.substring(0, 10) + '...' : 'NÃO ENCONTRADO'}`)

if (!API_TOKEN) {
  console.error('❌ Variável API_55 não encontrada!')
  process.exit(1)
}

// Calcular data de ontem
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const dateStr = yesterday.toISOString().split('T')[0]

console.log(`📅 Testando com data: ${dateStr}`)
console.log('')

// URLs e métodos de autenticação para testar
const configs = [
  {
    url: 'https://api.55pbx.com/v1/calls',
    auth: { 'Authorization': `Bearer ${API_TOKEN}` }
  },
  {
    url: 'https://api.55pbx.com/calls',
    auth: { 'Authorization': `Bearer ${API_TOKEN}` }
  },
  {
    url: 'https://api.55pbx.com/v1/calls',
    auth: { 'X-API-Key': API_TOKEN }
  },
  {
    url: 'https://api.55pbx.com/calls',
    auth: { 'X-API-Key': API_TOKEN }
  },
  {
    url: 'https://55pbx.com/api/v1/calls',
    auth: { 'Authorization': `Bearer ${API_TOKEN}` }
  },
  {
    url: 'https://55pbx.com/api/calls',
    auth: { 'Authorization': `Bearer ${API_TOKEN}` }
  }
]

async function testConfig(config) {
  try {
    console.log(`🔄 Testando: ${config.url}`)
    console.log(`   Auth: ${Object.keys(config.auth)[0]}`)
    
    const response = await axios.get(config.url, {
      headers: {
        ...config.auth,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        date: dateStr,
        start_date: dateStr,
        end_date: dateStr,
        limit: 5
      },
      timeout: 15000
    })
    
    console.log(`✅ SUCESSO! Status: ${response.status}`)
    console.log(`📊 Resposta:`)
    console.log(JSON.stringify(response.data, null, 2))
    
    return { success: true, data: response.data, config }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Erro ${error.response.status}: ${error.response.statusText}`)
      if (error.response.data) {
        console.log(`   Detalhes: ${JSON.stringify(error.response.data)}`)
      }
    } else {
      console.log(`❌ Erro: ${error.message}`)
    }
    return { success: false, error: error.message }
  }
  console.log('')
}

async function runTests() {
  console.log('🚀 Executando testes...')
  console.log('')
  
  let successCount = 0
  
  for (const config of configs) {
    const result = await testConfig(config)
    if (result.success) {
      successCount++
      console.log('🎉 CONFIGURAÇÃO FUNCIONAL ENCONTRADA!')
      console.log(`   URL: ${config.url}`)
      console.log(`   Auth: ${JSON.stringify(config.auth)}`)
      break // Parar no primeiro sucesso
    }
  }
  
  console.log('')
  console.log(`📊 RESULTADO: ${successCount} configuração(ões) funcionaram`)
  
  if (successCount === 0) {
    console.log('')
    console.log('💡 POSSÍVEIS SOLUÇÕES:')
    console.log('   1. Verificar se o token está correto')
    console.log('   2. Verificar se a API está online')
    console.log('   3. Verificar se a URL da API está correta')
    console.log('   4. Verificar se precisa de autenticação diferente')
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
