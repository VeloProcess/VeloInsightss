/**
 * Script de Sincronização MongoDB - VeloInsights
 * Sincroniza dados da API do %%pbx com MongoDB
 * Implementa retry, fallback e logs detalhados
 */

import { connectToMongoDB, MONGODB_CONFIG } from '../config/mongodb.js'
import { processarDados } from '../utils/dataProcessor.js'

// Configurações da API do %%pbx (será preenchida quando disponível)
const PBX_API_CONFIG = {
  baseUrl: process.env.PBX_API_URL || 'https://api.pbx.com', // URL da API
  apiKey: process.env.PBX_API_KEY || '', // API Key
  timeout: 30000, // 30 segundos
  retryAttempts: 5, // 5 tentativas
  retryDelay: 5000 // 5 segundos entre tentativas
}

// Classe para gerenciar sincronização
class SyncManager {
  constructor() {
    this.db = null
    this.client = null
    this.isRunning = false
  }

  // Inicializar conexão
  async initialize() {
    try {
      const { client, db } = await connectToMongoDB()
      this.client = client
      this.db = db
      console.log('✅ SyncManager inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar SyncManager:', error)
      throw error
    }
  }

  // Log estruturado
  async log(operation, status, message, details = {}) {
    try {
      const logEntry = {
        timestamp: new Date(),
        operation,
        status,
        message,
        details,
        executionTime: details.executionTime || 0,
        recordsProcessed: details.recordsProcessed || 0
      }

      await this.db.collection(MONGODB_CONFIG.collections.sync_logs).insertOne(logEntry)
      
      // Log no console com cores
      const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️'
      console.log(`${emoji} [${operation}] ${message}`, details)
      
      return logEntry
    } catch (error) {
      console.error('❌ Erro ao salvar log:', error)
    }
  }

  // Atualizar status do sistema
  async updateSystemStatus(status, details = {}) {
    try {
      const systemStatus = {
        lastSync: new Date(),
        syncStatus: status,
        ...details
      }

      await this.db.collection(MONGODB_CONFIG.collections.system_status).updateOne(
        { _id: 'main' },
        { $set: systemStatus },
        { upsert: true }
      )
    } catch (error) {
      console.error('❌ Erro ao atualizar status do sistema:', error)
    }
  }

  // Simular chamada à API (será substituída pela API real)
  async callPBXAPI(date) {
    try {
      console.log(`🔄 Simulando chamada à API do %%pbx para data: ${date}`)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simular dados de resposta para calls (será substituído pela API real)
      const mockCallsData = {
        success: true,
        calls: [
          {
            call_id: 'CALL_001_20240115',
            operator_name: 'João Silva',
            call_date: new Date('2024-01-15'),
            start_time: '09:00:00',
            end_time: '09:05:00',
            total_time: 300,
            wait_time: 30,
            time_in_ura: 15,
            question_attendant: '5',
            question_solution: '4',
            queue_name: 'Suporte',
            recording_url: 'https://recordings.com/call_001.mp3'
          },
          {
            call_id: 'CALL_002_20240115',
            operator_name: 'Maria Santos',
            call_date: new Date('2024-01-15'),
            start_time: '10:30:00',
            end_time: '10:35:00',
            total_time: 300,
            wait_time: 45,
            time_in_ura: 20,
            question_attendant: '4',
            question_solution: '5',
            queue_name: 'Vendas',
            recording_url: 'https://recordings.com/call_002.mp3'
          }
        ],
        pauses: [
          {
            operator_name: 'João Silva',
            activity_name: 'Pausa para Almoço',
            start_date: new Date('2024-01-15'),
            start_time: '12:00:00',
            end_date: new Date('2024-01-15'),
            end_time: '13:00:00',
            duration: 3600,
            pause_reason: 'Almoço'
          },
          {
            operator_name: 'Maria Santos',
            activity_name: 'Pausa Técnica',
            start_date: new Date('2024-01-15'),
            start_time: '14:30:00',
            end_date: new Date('2024-01-15'),
            end_time: '14:45:00',
            duration: 900,
            pause_reason: 'Problema técnico'
          }
        ],
        totalRecords: 4,
        lastUpdate: new Date().toISOString()
      }

      return mockCallsData
    } catch (error) {
      console.error('❌ Erro na chamada à API:', error)
      throw error
    }
  }

  // Verificar se há dados novos
  async checkForNewData(apiData) {
    try {
      if (!apiData.success || (!apiData.calls && !apiData.pauses)) {
        return { hasNewData: false, newCalls: [], newPauses: [] }
      }

      let newCalls = []
      let newPauses = []

      // Verificar calls novos
      if (apiData.calls && apiData.calls.length > 0) {
        const existingCallIds = await this.db.collection(MONGODB_CONFIG.collections.calls)
          .find({ call_id: { $in: apiData.calls.map(call => call.call_id) } })
          .toArray()

        const existingCallIdsSet = new Set(existingCallIds.map(call => call.call_id))
        newCalls = apiData.calls.filter(call => !existingCallIdsSet.has(call.call_id))
      }

      // Verificar pauses novos (baseado em operator_name + start_date + start_time)
      if (apiData.pauses && apiData.pauses.length > 0) {
        const pauseKeys = apiData.pauses.map(pause => 
          `${pause.operator_name}_${pause.start_date.toISOString().split('T')[0]}_${pause.start_time}`
        )

        const existingPauses = await this.db.collection(MONGODB_CONFIG.collections.pauses)
          .find({ 
            $or: pauseKeys.map(key => {
              const [operator, date, time] = key.split('_')
              return {
                operator_name: operator,
                start_date: new Date(date),
                start_time: time
              }
            })
          })
          .toArray()

        const existingPauseKeysSet = new Set(
          existingPauses.map(pause => 
            `${pause.operator_name}_${pause.start_date.toISOString().split('T')[0]}_${pause.start_time}`
          )
        )

        newPauses = apiData.pauses.filter(pause => {
          const key = `${pause.operator_name}_${pause.start_date.toISOString().split('T')[0]}_${pause.start_time}`
          return !existingPauseKeysSet.has(key)
        })
      }

      const hasNewData = newCalls.length > 0 || newPauses.length > 0

      return {
        hasNewData,
        newCalls,
        newPauses,
        totalCallsChecked: apiData.calls?.length || 0,
        totalPausesChecked: apiData.pauses?.length || 0,
        alreadyExistsCalls: (apiData.calls?.length || 0) - newCalls.length,
        alreadyExistsPauses: (apiData.pauses?.length || 0) - newPauses.length
      }
    } catch (error) {
      console.error('❌ Erro ao verificar dados novos:', error)
      throw error
    }
  }

  // Processar e salvar dados novos
  async processAndSaveData(newCalls, newPauses) {
    try {
      let callsSaved = 0
      let pausesSaved = 0

      // Processar e salvar calls
      if (newCalls && newCalls.length > 0) {
        const processedCalls = newCalls.map(call => ({
          ...call,
          created_at: new Date(),
          updated_at: new Date()
        }))

        const callsResult = await this.db.collection(MONGODB_CONFIG.collections.calls)
          .insertMany(processedCalls)
        
        callsSaved = callsResult.insertedCount
        console.log(`✅ ${callsSaved} calls salvos`)
      }

      // Processar e salvar pauses
      if (newPauses && newPauses.length > 0) {
        const processedPauses = newPauses.map(pause => ({
          ...pause,
          created_at: new Date(),
          updated_at: new Date()
        }))

        const pausesResult = await this.db.collection(MONGODB_CONFIG.collections.pauses)
          .insertMany(processedPauses)
        
        pausesSaved = pausesResult.insertedCount
        console.log(`✅ ${pausesSaved} pauses salvos`)
      }

      return {
        callsProcessed: newCalls?.length || 0,
        pausesProcessed: newPauses?.length || 0,
        callsSaved,
        pausesSaved,
        totalSaved: callsSaved + pausesSaved
      }
    } catch (error) {
      console.error('❌ Erro ao processar e salvar dados:', error)
      throw error
    }
  }

  // Executar sincronização com retry
  async syncWithRetry() {
    let attempts = 0
    const maxAttempts = PBX_API_CONFIG.retryAttempts

    while (attempts < maxAttempts) {
      try {
        attempts++
        console.log(`🔄 Tentativa ${attempts}/${maxAttempts}`)
        
        const result = await this.sync()
        
        if (result.success) {
          await this.log('sync', 'success', `Sincronização bem-sucedida na tentativa ${attempts}`, {
            attempts,
            recordsProcessed: result.recordsProcessed,
            executionTime: result.executionTime
          })
          
          await this.updateSystemStatus('success', {
            lastSuccessSync: new Date(),
            errorCount: 0,
            retryCount: 0
          })
          
          return result
        }
      } catch (error) {
        console.error(`❌ Tentativa ${attempts} falhou:`, error.message)
        
        await this.log('sync', 'error', `Tentativa ${attempts} falhou: ${error.message}`, {
          attempts,
          error: error.message,
          stack: error.stack
        })

        if (attempts < maxAttempts) {
          const delay = PBX_API_CONFIG.retryDelay * attempts
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // Todas as tentativas falharam
    await this.log('sync', 'error', `Todas as ${maxAttempts} tentativas falharam`, {
      attempts: maxAttempts,
      finalError: 'Max retry attempts reached'
    })

    await this.updateSystemStatus('error', {
      lastErrorSync: new Date(),
      errorCount: maxAttempts,
      retryCount: maxAttempts
    })

    throw new Error(`Sincronização falhou após ${maxAttempts} tentativas`)
  }

  // Sincronização principal
  async sync() {
    const startTime = performance.now()
    
    try {
      await this.updateSystemStatus('running')
      
      // 1. Chamar API do %%pbx
      const apiData = await this.callPBXAPI(new Date().toISOString().split('T')[0])
      
      // 2. Verificar se há dados novos
      const dataCheck = await this.checkForNewData(apiData)
      
      if (!dataCheck.hasNewData) {
        await this.log('sync', 'success', 'Nenhum dado novo encontrado', {
          totalCallsChecked: dataCheck.totalCallsChecked,
          totalPausesChecked: dataCheck.totalPausesChecked,
          alreadyExistsCalls: dataCheck.alreadyExistsCalls,
          alreadyExistsPauses: dataCheck.alreadyExistsPauses
        })
        
        return {
          success: true,
          recordsProcessed: 0,
          executionTime: performance.now() - startTime
        }
      }

      // 3. Processar e salvar dados novos
      const saveResult = await this.processAndSaveData(dataCheck.newCalls, dataCheck.newPauses)
      
      // 4. Calcular métricas
      await this.calculateMetrics()
      
      const executionTime = performance.now() - startTime
      
      await this.log('sync', 'success', `Sincronização concluída com sucesso`, {
        callsProcessed: saveResult.callsProcessed,
        pausesProcessed: saveResult.pausesProcessed,
        callsSaved: saveResult.callsSaved,
        pausesSaved: saveResult.pausesSaved,
        totalSaved: saveResult.totalSaved,
        executionTime
      })

      return {
        success: true,
        callsProcessed: saveResult.callsProcessed,
        pausesProcessed: saveResult.pausesProcessed,
        callsSaved: saveResult.callsSaved,
        pausesSaved: saveResult.pausesSaved,
        totalSaved: saveResult.totalSaved,
        executionTime
      }
      
    } catch (error) {
      const executionTime = performance.now() - startTime
      
      await this.log('sync', 'error', `Erro na sincronização: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        executionTime
      })

      throw error
    }
  }

  // Calcular métricas
  async calculateMetrics() {
    try {
      // Implementar cálculo de métricas
      console.log('📊 Calculando métricas...')
      
      // Por enquanto, apenas log
      await this.log('metrics', 'success', 'Métricas calculadas', {
        operation: 'calculate_metrics'
      })
    } catch (error) {
      console.error('❌ Erro ao calcular métricas:', error)
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

// Função principal para executar sincronização
export const runSync = async () => {
  const syncManager = new SyncManager()
  
  try {
    await syncManager.initialize()
    const result = await syncManager.syncWithRetry()
    
    console.log('✅ Sincronização concluída:', result)
    return result
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    throw error
    
  } finally {
    await syncManager.close()
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSync()
    .then(result => {
      console.log('🎉 Sincronização finalizada:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

export default SyncManager
