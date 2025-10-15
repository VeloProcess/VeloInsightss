/**
 * Sistema de Monitoramento MongoDB - VeloInsights
 * Interface para monitorar sincronização e debug
 */

import { connectToMongoDB, MONGODB_CONFIG } from '../config/mongodb.js'

class MonitoringSystem {
  constructor() {
    this.db = null
    this.client = null
  }

  async initialize() {
    try {
      const { client, db } = await connectToMongoDB()
      this.client = client
      this.db = db
      console.log('✅ MonitoringSystem inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar MonitoringSystem:', error)
      throw error
    }
  }

  // Obter status geral do sistema
  async getSystemStatus() {
    try {
      const status = await this.db.collection(MONGODB_CONFIG.collections.system_status)
        .findOne({ _id: 'main' })

      if (!status) {
        return {
          status: 'unknown',
          message: 'Sistema não inicializado',
          lastSync: null,
          totalRecords: 0
        }
      }

      // Contar registros totais
      const totalCalls = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .countDocuments()
      
      const totalPauses = await this.db.collection(MONGODB_CONFIG.collections.pauses)
        .countDocuments()
      
      const totalRecords = totalCalls + totalPauses

      return {
        ...status,
        totalRecords,
        uptime: status.lastSync ? Date.now() - status.lastSync.getTime() : 0
      }
    } catch (error) {
      console.error('❌ Erro ao obter status do sistema:', error)
      throw error
    }
  }

  // Obter logs recentes
  async getRecentLogs(limit = 50) {
    try {
      const logs = await this.db.collection(MONGODB_CONFIG.collections.sync_logs)
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()

      return logs
    } catch (error) {
      console.error('❌ Erro ao obter logs:', error)
      throw error
    }
  }

  // Obter logs por status
  async getLogsByStatus(status, limit = 20) {
    try {
      const logs = await this.db.collection(MONGODB_CONFIG.collections.sync_logs)
        .find({ status })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()

      return logs
    } catch (error) {
      console.error('❌ Erro ao obter logs por status:', error)
      throw error
    }
  }

  // Obter estatísticas de sincronização
  async getSyncStatistics(days = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const stats = await this.db.collection(MONGODB_CONFIG.collections.sync_logs)
        .aggregate([
          {
            $match: {
              timestamp: { $gte: startDate },
              operation: 'sync'
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgExecutionTime: { $avg: '$executionTime' },
              totalRecords: { $sum: '$recordsProcessed' }
            }
          }
        ])
        .toArray()

      return stats
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      throw error
    }
  }

  // Obter dados por período
  async getDataByPeriod(startDate, endDate) {
    try {
      const calls = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .find({
          call_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
        .sort({ call_date: -1 })
        .toArray()

      const pauses = await this.db.collection(MONGODB_CONFIG.collections.pauses)
        .find({
          start_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
        .sort({ start_date: -1 })
        .toArray()

      return { calls, pauses }
    } catch (error) {
      console.error('❌ Erro ao obter dados por período:', error)
      throw error
    }
  }

  // Obter métricas por operador
  async getOperatorMetrics(period = '7d') {
    try {
      const startDate = new Date()
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30)
      }

      const callMetrics = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .aggregate([
          {
            $match: {
              call_date: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$operator_name',
              totalCalls: { $sum: 1 },
              avgTotalTime: { $avg: '$total_time' },
              avgWaitTime: { $avg: '$wait_time' },
              avgTimeInUra: { $avg: '$time_in_ura' },
              avgQuestionAttendant: { $avg: { $toDouble: '$question_attendant' } },
              avgQuestionSolution: { $avg: { $toDouble: '$question_solution' } },
              lastCall: { $max: '$call_date' }
            }
          },
          {
            $sort: { totalCalls: -1 }
          }
        ])
        .toArray()

      const pauseMetrics = await this.db.collection(MONGODB_CONFIG.collections.pauses)
        .aggregate([
          {
            $match: {
              start_date: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$operator_name',
              totalPauses: { $sum: 1 },
              totalPauseDuration: { $sum: '$duration' },
              avgPauseDuration: { $avg: '$duration' },
              lastPause: { $max: '$start_date' }
            }
          }
        ])
        .toArray()

      // Combinar métricas de calls e pauses
      const combinedMetrics = callMetrics.map(callMetric => {
        const pauseMetric = pauseMetrics.find(p => p._id === callMetric._id)
        return {
          operator_name: callMetric._id,
          ...callMetric,
          ...pauseMetric,
          totalPauses: pauseMetric?.totalPauses || 0,
          totalPauseDuration: pauseMetric?.totalPauseDuration || 0,
          avgPauseDuration: pauseMetric?.avgPauseDuration || 0
        }
      })

      return combinedMetrics
    } catch (error) {
      console.error('❌ Erro ao obter métricas por operador:', error)
      throw error
    }
  }

  // Verificar integridade dos dados
  async checkDataIntegrity() {
    try {
      const issues = []

      // Verificar registros duplicados em calls
      const duplicateCalls = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .aggregate([
          {
            $group: {
              _id: '$call_id',
              count: { $sum: 1 }
            }
          },
          {
            $match: { count: { $gt: 1 } }
          }
        ])
        .toArray()

      if (duplicateCalls.length > 0) {
        issues.push({
          type: 'duplicate_calls',
          count: duplicateCalls.length,
          message: 'Calls duplicados encontrados'
        })
      }

      // Verificar registros com dados inválidos em calls
      const invalidCalls = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .find({
          $or: [
            { total_time: { $lt: 0 } },
            { wait_time: { $lt: 0 } },
            { time_in_ura: { $lt: 0 } },
            { operator_name: { $exists: false } },
            { call_date: { $exists: false } }
          ]
        })
        .count()

      if (invalidCalls > 0) {
        issues.push({
          type: 'invalid_calls',
          count: invalidCalls,
          message: 'Calls com dados inválidos encontrados'
        })
      }

      // Verificar registros com dados inválidos em pauses
      const invalidPauses = await this.db.collection(MONGODB_CONFIG.collections.pauses)
        .find({
          $or: [
            { duration: { $lt: 0 } },
            { operator_name: { $exists: false } },
            { start_date: { $exists: false } }
          ]
        })
        .count()

      if (invalidPauses > 0) {
        issues.push({
          type: 'invalid_pauses',
          count: invalidPauses,
          message: 'Pauses com dados inválidos encontrados'
        })
      }

      // Verificar registros muito antigos
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2) // 2 anos atrás

      const oldCalls = await this.db.collection(MONGODB_CONFIG.collections.calls)
        .find({ call_date: { $lt: oldDate } })
        .count()

      const oldPauses = await this.db.collection(MONGODB_CONFIG.collections.pauses)
        .find({ start_date: { $lt: oldDate } })
        .count()

      const oldRecords = oldCalls + oldPauses

      if (oldRecords > 0) {
        issues.push({
          type: 'old_records',
          count: oldRecords,
          message: 'Registros muito antigos encontrados'
        })
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'issues_found',
        issues,
        totalIssues: issues.reduce((sum, issue) => sum + issue.count, 0)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar integridade:', error)
      throw error
    }
  }

  // Limpar logs antigos
  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.db.collection(MONGODB_CONFIG.collections.sync_logs)
        .deleteMany({
          timestamp: { $lt: cutoffDate }
        })

      console.log(`🧹 Limpeza concluída: ${result.deletedCount} logs removidos`)
      return result.deletedCount
    } catch (error) {
      console.error('❌ Erro na limpeza de logs:', error)
      throw error
    }
  }

  // Fechar conexão
  async close() {
    try {
      if (this.client) {
        await this.client.close()
        console.log('✅ Conexão MongoDB fechada')
      }
    } catch (error) {
      console.error('❌ Erro ao fechar conexão:', error)
    }
  }
}

// Função para executar diagnóstico completo
export const runDiagnostic = async () => {
  const monitor = new MonitoringSystem()
  
  try {
    await monitor.initialize()
    
    console.log('🔍 Executando diagnóstico completo...')
    
    // 1. Status do sistema
    const status = await monitor.getSystemStatus()
    console.log('📊 Status do Sistema:', status)
    
    // 2. Logs recentes
    const recentLogs = await monitor.getRecentLogs(10)
    console.log('📝 Logs Recentes:', recentLogs.length)
    
    // 3. Estatísticas de sincronização
    const syncStats = await monitor.getSyncStatistics(7)
    console.log('📈 Estatísticas de Sincronização:', syncStats)
    
    // 4. Verificar integridade
    const integrity = await monitor.checkDataIntegrity()
    console.log('🔒 Integridade dos Dados:', integrity)
    
    // 5. Métricas por operador
    const operatorMetrics = await monitor.getOperatorMetrics('7d')
    console.log('👥 Métricas por Operador:', operatorMetrics.length)
    
    return {
      status,
      recentLogs: recentLogs.length,
      syncStats,
      integrity,
      operatorMetrics: operatorMetrics.length
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error)
    throw error
    
  } finally {
    await monitor.close()
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostic()
    .then(result => {
      console.log('🎉 Diagnóstico concluído:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro no diagnóstico:', error)
      process.exit(1)
    })
}

export default MonitoringSystem
