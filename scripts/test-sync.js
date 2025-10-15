// 🎯 SCRIPT DE TESTE DO SISTEMA DE SINCRONIZAÇÃO
import { MongoClient } from 'mongodb'
import { SYNC_CONFIG } from '../sync/sync-config.js'
import { checkSyncHealth, generateStatusReport } from '../sync/sync-monitor.js'
import { runManualSync } from '../sync/sync-daily.js'

// 🧪 Executar testes básicos
async function runBasicTests() {
  let client = null
  
  try {
    console.log('🧪 Executando testes básicos do sistema de sincronização...')
    
    // 1. Teste de conexão MongoDB
    console.log('🔌 Testando conexão MongoDB...')
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    console.log('✅ Conexão MongoDB: OK')
    
    // 2. Teste de coleções
    console.log('📁 Testando coleções...')
    const collections = await db.listCollections().toArray()
    const requiredCollections = [
      SYNC_CONFIG.COLLECTIONS.CHAMADAS,
      SYNC_CONFIG.COLLECTIONS.PAUSES,
      SYNC_CONFIG.COLLECTIONS.LOGS,
      SYNC_CONFIG.COLLECTIONS.CONFIG,
      'metrics_cache',
      'alerts'
    ]
    
    const existingCollections = collections.map(c => c.name)
    const missingCollections = requiredCollections.filter(name => !existingCollections.includes(name))
    
    if (missingCollections.length > 0) {
      console.log(`⚠️ Coleções faltando: ${missingCollections.join(', ')}`)
      console.log('💡 Execute: node scripts/setup-sync.js')
    } else {
      console.log('✅ Todas as coleções necessárias existem')
    }
    
    // 3. Teste de dados existentes
    console.log('📊 Testando dados existentes...')
    const callsCount = await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).countDocuments()
    const pausesCount = await db.collection(SYNC_CONFIG.COLLECTIONS.PAUSES).countDocuments()
    
    console.log(`   - IGP_chamadas: ${callsCount} registros`)
    console.log(`   - pauses: ${pausesCount} registros`)
    
    if (callsCount > 0) {
      console.log('✅ Dados existentes encontrados')
      
      // Teste de amostra de dados
      const sampleCall = await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).findOne()
      console.log('📋 Amostra de dados:')
      console.log(`   - call_id: ${sampleCall.call_id}`)
      console.log(`   - colaboradorNome: ${sampleCall.colaboradorNome}`)
      console.log(`   - status: ${sampleCall.status}`)
      console.log(`   - call_date: ${sampleCall.call_date}`)
    } else {
      console.log('⚠️ Nenhum dado encontrado na coleção principal')
    }
    
    // 4. Teste de configurações
    console.log('⚙️ Testando configurações...')
    const config = await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG).findOne({ type: 'system_config' })
    
    if (config) {
      console.log('✅ Configuração do sistema encontrada')
      console.log(`   - API URL: ${config.api_config.url}`)
      console.log(`   - Cron Schedule: ${config.schedule_config.cron_schedule}`)
      console.log(`   - Timezone: ${config.schedule_config.timezone}`)
    } else {
      console.log('⚠️ Configuração do sistema não encontrada')
    }
    
    // 5. Teste de logs
    console.log('📝 Testando logs...')
    const logsCount = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS).countDocuments()
    console.log(`   - Logs de sincronização: ${logsCount} registros`)
    
    if (logsCount > 0) {
      const lastLog = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS)
        .findOne({}, { sort: { timestamp: -1 } })
      console.log(`   - Último log: ${lastLog.timestamp} (${lastLog.status})`)
    }
    
    // 6. Teste de saúde do sistema
    console.log('🔍 Testando saúde do sistema...')
    const health = await checkSyncHealth()
    
    if (health.healthy) {
      console.log('✅ Sistema saudável')
      if (health.last_sync) {
        console.log(`   - Última sincronização: ${health.last_sync.last_sync_date}`)
        console.log(`   - Registros sincronizados: ${health.last_sync.last_sync_count}`)
      }
    } else {
      console.log(`⚠️ Sistema com problemas: ${health.reason}`)
    }
    
    console.log('🎉 Testes básicos concluídos!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// 🧪 Executar teste de sincronização manual
async function testManualSync() {
  try {
    console.log('🔄 Testando sincronização manual...')
    console.log('⚠️ ATENÇÃO: Este teste tentará buscar dados da API 55PBX')
    console.log('⚠️ Se a API não estiver configurada, o teste falhará')
    
    await runManualSync()
    console.log('✅ Teste de sincronização manual concluído')
    
  } catch (error) {
    console.error('❌ Erro no teste de sincronização:', error)
    console.log('💡 Isso é esperado se a API 55PBX não estiver configurada')
  }
}

// 📊 Gerar relatório completo
async function generateFullReport() {
  try {
    console.log('📊 Gerando relatório completo...')
    
    const report = await generateStatusReport()
    
    console.log('📋 RELATÓRIO COMPLETO:')
    console.log('')
    console.log('🗄️ DATABASE:')
    console.log(`   - Chamadas: ${report.database.calls_count}`)
    console.log(`   - Pausas: ${report.database.pauses_count}`)
    console.log(`   - Próxima sincronização: ${report.database.next_sync}`)
    
    if (report.database.last_sync) {
      console.log(`   - Última sincronização: ${report.database.last_sync.last_sync_date}`)
    }
    
    console.log('')
    console.log('🔍 SAÚDE:')
    console.log(`   - Status: ${report.health.healthy ? '✅ Saudável' : '⚠️ Com problemas'}`)
    console.log(`   - Motivo: ${report.health.reason}`)
    
    console.log('')
    console.log('📝 LOGS RECENTES:')
    report.logs.recent.slice(0, 5).forEach(log => {
      console.log(`   - ${log.timestamp}: ${log.status} (${log.calls_count} chamadas)`)
    })
    
    console.log('')
    console.log('📊 ESTATÍSTICAS DE ERRO:')
    report.logs.error_stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error)
  }
}

// 🚀 Executar todos os testes
async function runAllTests() {
  try {
    await runBasicTests()
    console.log('')
    await generateFullReport()
    
    console.log('')
    console.log('❓ Deseja testar sincronização manual? (y/N)')
    console.log('💡 Responda "y" se a API 55PBX estiver configurada')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

// 🚀 Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2] || 'all'
  
  switch (testType) {
    case 'basic':
      runBasicTests()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
      
    case 'sync':
      testManualSync()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
      
    case 'report':
      generateFullReport()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
      
    case 'all':
    default:
      runAllTests()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
  }
}

export { runBasicTests, testManualSync, generateFullReport }
