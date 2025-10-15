// 🎯 SISTEMA DE MONITORAMENTO E ALERTAS
import { MongoClient } from 'mongodb'
import { SYNC_CONFIG, ALERT_CONFIG } from './sync-config.js'

// 📝 Log de resultados da sincronização
export async function logSyncResult(db, logData) {
  try {
    const logEntry = {
      ...logData,
      timestamp: new Date(),
      created_at: new Date()
    }
    
    await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS).insertOne(logEntry)
    console.log('📝 Log de sincronização salvo')
    
    return logEntry
  } catch (error) {
    console.error('❌ Erro ao salvar log:', error)
    throw error
  }
}

// 🚨 Enviar alertas
export async function sendAlert(message, type = 'error') {
  try {
    console.log(`🚨 ALERTA [${type.toUpperCase()}]: ${message}`)
    
    // Salvar alerta no banco
    const client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    await db.collection('alerts').insertOne({
      message: message,
      type: type,
      timestamp: new Date(),
      resolved: false
    })
    
    await client.close()
    
    // TODO: Implementar envio por email/Slack quando necessário
    if (ALERT_CONFIG.ENABLED) {
      // await sendEmailAlert(message, type)
      // await sendSlackAlert(message, type)
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar alerta:', error)
  }
}

// 🔍 Verificar saúde da sincronização
export async function checkSyncHealth() {
  let client = null
  
  try {
    console.log('🔍 Verificando saúde da sincronização...')
    
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    // Verificar última sincronização
    const lastSync = await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG)
      .findOne({ type: 'last_sync' })
    
    if (!lastSync) {
      await sendAlert('Nenhuma sincronização encontrada no histórico')
      return { healthy: false, reason: 'no_sync_history' }
    }
    
    // Verificar se a última sincronização foi há mais de 25 horas
    const lastSyncTime = new Date(lastSync.last_sync_timestamp)
    const now = new Date()
    const hoursDiff = (now - lastSyncTime) / (1000 * 60 * 60)
    
    if (hoursDiff > 25) {
      await sendAlert(`Sincronização atrasada: ${hoursDiff.toFixed(1)} horas desde a última execução`)
      return { healthy: false, reason: 'sync_delayed', hours_diff: hoursDiff }
    }
    
    // Verificar logs de erro recentes
    const recentErrors = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS)
      .find({ 
        status: 'error',
        timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      })
      .count()
    
    if (recentErrors > ALERT_CONFIG.ERROR_THRESHOLD) {
      await sendAlert(`${recentErrors} erros de sincronização nas últimas 24h`)
      return { healthy: false, reason: 'too_many_errors', error_count: recentErrors }
    }
    
    // Verificar se há dados na coleção principal
    const callsCount = await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).countDocuments()
    if (callsCount === 0) {
      await sendAlert('Coleção IGP_chamadas está vazia')
      return { healthy: false, reason: 'empty_collection' }
    }
    
    console.log('✅ Saúde da sincronização: OK')
    return { 
      healthy: true, 
      last_sync: lastSync,
      calls_count: callsCount,
      hours_since_last_sync: hoursDiff
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar saúde:', error)
    await sendAlert(`Erro na verificação de saúde: ${error.message}`)
    return { healthy: false, reason: 'health_check_error', error: error.message }
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// 📊 Gerar relatório de status
export async function generateStatusReport() {
  let client = null
  
  try {
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    // Dados básicos
    const callsCount = await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).countDocuments()
    const pausesCount = await db.collection(SYNC_CONFIG.COLLECTIONS.PAUSES).countDocuments()
    
    // Última sincronização
    const lastSync = await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG)
      .findOne({ type: 'last_sync' })
    
    // Logs recentes
    const recentLogs = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS)
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()
    
    // Estatísticas de erro
    const errorStats = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS)
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()
    
    return {
      database: {
        calls_count: callsCount,
        pauses_count: pausesCount,
        last_sync: lastSync,
        next_sync: calculateNextSync()
      },
      logs: {
        recent: recentLogs,
        error_stats: errorStats
      },
      health: await checkSyncHealth()
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// 🕐 Calcular próxima execução
function calculateNextSync() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(3, 0, 0, 0)
  
  return tomorrow.toLocaleString('pt-BR', {
    timeZone: SYNC_CONFIG.TIMEZONE
  })
}

// 🔄 Limpar logs antigos
export async function cleanupOldLogs(daysToKeep = 30) {
  let client = null
  
  try {
    console.log(`🧹 Limpando logs mais antigos que ${daysToKeep} dias...`)
    
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const result = await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS)
      .deleteMany({ timestamp: { $lt: cutoffDate } })
    
    console.log(`✅ ${result.deletedCount} logs antigos removidos`)
    return result.deletedCount
    
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }
}
