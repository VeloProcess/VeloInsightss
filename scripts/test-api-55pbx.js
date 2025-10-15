// 🎯 SCRIPT DE TESTE INTELIGENTE DA API 55PBX
import axios from 'axios'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const API_TOKEN = process.env.API_55
const BASE_URLS = [
  'https://api.55pbx.com/v1',
  'https://api.55pbx.com',
  'https://55pbx.com/api/v1',
  'https://55pbx.com/api',
  'https://api.55.com/v1',
  'https://api.55.com'
]

const ENDPOINTS = [
  '/calls',
  '/call',
  '/telephony/calls',
  '/data/calls',
  '/reports/calls',
  '/analytics/calls'
]

const AUTH_METHODS = [
  { header: 'Authorization', value: `Bearer ${API_TOKEN}` },
  { header: 'Authorization', value: `Token ${API_TOKEN}` },
  { header: 'X-API-Key', value: API_TOKEN },
  { header: 'X-Auth-Token', value: API_TOKEN },
  { header: 'api-key', value: API_TOKEN }
]

// 🧪 Testar diferentes combinações
async function testAPICombinations() {
  console.log('🔍 TESTANDO API 55PBX AUTOMATICAMENTE...')
  console.log(`🔑 Token encontrado: ${API_TOKEN ? 'SIM' : 'NÃO'}`)
  
  if (!API_TOKEN) {
    console.error('❌ Variável API_55 não encontrada no .env')
    return
  }
  
  // Calcular data de ontem
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD
  
  console.log(`📅 Testando com data: ${dateStr}`)
  console.log('')
  
  let successCount = 0
  
  for (const baseUrl of BASE_URLS) {
    for (const endpoint of ENDPOINTS) {
      for (const authMethod of AUTH_METHODS) {
        try {
          console.log(`🔄 Testando: ${baseUrl}${endpoint}`)
          console.log(`   Auth: ${authMethod.header}`)
          
          const response = await axios.get(`${baseUrl}${endpoint}`, {
            headers: {
              [authMethod.header]: authMethod.value,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            params: {
              date: dateStr,
              start_date: dateStr,
              end_date: dateStr,
              limit: 10
            },
            timeout: 10000
          })
          
          console.log(`✅ SUCESSO! Status: ${response.status}`)
          console.log(`📊 Dados recebidos:`)
          console.log(JSON.stringify(response.data, null, 2))
          
          // Analisar estrutura dos dados
          analyzeDataStructure(response.data, baseUrl, endpoint, authMethod)
          
          successCount++
          console.log('')
          
        } catch (error) {
          if (error.response) {
            console.log(`❌ Erro ${error.response.status}: ${error.response.statusText}`)
          } else {
            console.log(`❌ Erro: ${error.message}`)
          }
        }
      }
    }
  }
  
  console.log(`🎉 TESTE CONCLUÍDO! ${successCount} combinações funcionaram`)
}

// 🔍 Analisar estrutura dos dados
function analyzeDataStructure(data, baseUrl, endpoint, authMethod) {
  console.log('🔍 ANÁLISE DA ESTRUTURA:')
  
  if (Array.isArray(data)) {
    console.log(`   - Tipo: Array com ${data.length} itens`)
    if (data.length > 0) {
      console.log(`   - Primeiro item:`, Object.keys(data[0]))
    }
  } else if (typeof data === 'object') {
    console.log(`   - Tipo: Objeto`)
    console.log(`   - Chaves:`, Object.keys(data))
    
    // Procurar por arrays dentro do objeto
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        console.log(`   - ${key}: Array com ${value.length} itens`)
        if (value.length > 0) {
          console.log(`   - Campos do ${key}:`, Object.keys(value[0]))
        }
      }
    }
  }
  
  console.log('')
  console.log('🎯 CONFIGURAÇÃO FUNCIONAL:')
  console.log(`   URL: ${baseUrl}${endpoint}`)
  console.log(`   Auth: ${authMethod.header}: ${authMethod.value}`)
  console.log('')
}

// 🚀 Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPICombinations()
    .then(() => {
      console.log('✅ Teste da API concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error)
      process.exit(1)
    })
}

export { testAPICombinations }
