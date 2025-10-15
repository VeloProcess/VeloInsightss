// 🎯 SCRIPT PRINCIPAL DE SINCRONIZAÇÃO DIÁRIA
import cron from 'node-cron'
import { MongoClient } from 'mongodb'
import { SYNC_CONFIG } from './sync-config.js'
import { fetchCallsFromAPI, processCallsData, calculateMetrics, validateCallsData } from './sync-utils.js'
import { logSyncResult, sendAlert } from './sync-monitor.js'

// 🔄 Função principal de sincronização
async function syncDailyData() {
  const startTime = Date.now()
  let client = null
  
  try {
    console.log('🔄 Iniciando sincronização diária...')
    
    // 1. Conectar ao MongoDB
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    // 2. Calcular data de ontem
    const dataOntem = new Date()
    dataOntem.setDate(dataOntem.getDate() - 1)
    const dataFormatada = dataOntem.toISOString().split('T')[0]
    
    console.log(`📅 Sincronizando dados de: ${dataFormatada}`)
    
    // 3. Buscar dados da API 55PBX
    const calls = await fetchCallsFromAPI(dataFormatada)
    console.log(`📊 Encontradas ${calls.length} chamadas`)
    
    if (calls.length > 0) {
      // 4. Processar e validar dados
      const processedCalls = await processCallsData(calls, dataFormatada)
      validateCallsData(processedCalls)
      
      // 5. Salvar dados na coleção principal (substituir dados atuais)
      console.log('💾 Salvando dados na coleção IGP_chamadas...')
      await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).deleteMany({})
      await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).insertMany(processedCalls)
      
      // 6. Calcular e salvar métricas em cache (coleção separada)
      console.log('📊 Calculando métricas...')
      const metrics = await calculateMetrics(processedCalls, dataFormatada)
      
      // Salvar métricas em uma coleção separada para cache rápido
      await db.collection('metrics_cache').replaceOne(
        { date: dataFormatada },
        metrics,
        { upsert: true }
      )
      
      // 7. Atualizar configuração de última sincronização
      await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG).replaceOne(
        { type: 'last_sync' },
        { 
          type: 'last_sync',
          last_sync_date: dataFormatada,
          last_sync_count: calls.length,
          last_sync_timestamp: new Date(),
          updated_at: new Date()
        },
        { upsert: true }
      )
      
      // 8. Log de sucesso
      const duration = Date.now() - startTime
      await logSyncResult(db, {
        date: dataFormatada,
        status: 'success',
        calls_count: calls.length,
        duration: duration,
        api_response_time: duration,
        retry_count: 0
      })
      
      console.log(`✅ Sincronização concluída: ${calls.length} chamadas em ${duration}ms`)
      
      // 9. Enviar notificação de sucesso (opcional)
      if (calls.length > 0) {
        console.log(`📧 Notificação: ${calls.length} chamadas sincronizadas com sucesso`)
      }
      
    } else {
      console.log('⚠️ Nenhuma chamada encontrada para a data')
      
      // Log de aviso
      const duration = Date.now() - startTime
      await logSyncResult(db, {
        date: dataFormatada,
        status: 'warning',
        calls_count: 0,
        duration: duration,
        error: 'Nenhuma chamada encontrada'
      })
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    
    // Log de erro
    if (client) {
      const db = client.db(SYNC_CONFIG.DATABASE_NAME)
      await logSyncResult(db, {
        date: dataFormatada || 'unknown',
        status: 'error',
        calls_count: 0,
        duration: Date.now() - startTime,
        error: error.message,
        retry_count: 0
      })
      
      // Enviar alerta
      await sendAlert(`Erro na sincronização: ${error.message}`)
    }
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// 🕐 Configurar cron job
console.log('🕐 Configurando cron job para execução diária às 03:00 AM...')

cron.schedule(SYNC_CONFIG.CRON_SCHEDULE, async () => {
  console.log('⏰ Executando sincronização agendada...')
  await syncDailyData()
}, {
  scheduled: true,
  timezone: SYNC_CONFIG.TIMEZONE
})

console.log('✅ Cron job configurado com sucesso!')
console.log(`📅 Próxima execução: ${getNextExecutionTime()}`)

// 🔄 Função para execução manual
export async function runManualSync() {
  console.log('🔄 Executando sincronização manual...')
  await syncDailyData()
}

// 📅 Calcular próxima execução
function getNextExecutionTime() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(3, 0, 0, 0)
  
  return tomorrow.toLocaleString('pt-BR', {
    timeZone: SYNC_CONFIG.TIMEZONE
  })
}

// 🚀 Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Executando sincronização...')
  syncDailyData()
    .then(() => {
      console.log('✅ Sincronização concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro na sincronização:', error)
      process.exit(1)
    })
}
