// 🎯 TESTE SIMPLES DA API 55PBX
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

console.log('🔍 TESTANDO API 55PBX...')
console.log('📋 Variáveis de ambiente carregadas:')

// Verificar se a variável existe
const apiToken = process.env.API_55
console.log(`🔑 API_55: ${apiToken ? 'ENCONTRADA' : 'NÃO ENCONTRADA'}`)

if (apiToken) {
  console.log(`🔑 Token: ${apiToken.substring(0, 10)}...`)
} else {
  console.log('❌ Variável API_55 não encontrada!')
  console.log('💡 Adicione no .env: API_55=seu_token_aqui')
}

// Testar algumas URLs comuns
const testUrls = [
  'https://api.55pbx.com/v1/calls',
  'https://api.55pbx.com/calls',
  'https://55pbx.com/api/v1/calls'
]

console.log('')
console.log('🌐 URLs que serão testadas:')
testUrls.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`)
})

console.log('')
console.log('🚀 Para testar com seu token real:')
console.log('   1. Edite o arquivo .env')
console.log('   2. Substitua "seu_token_aqui" pelo token real')
console.log('   3. Execute: node scripts/test-api-55pbx.js')
