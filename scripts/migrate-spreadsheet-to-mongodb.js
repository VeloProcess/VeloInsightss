/**
 * Script de Migração - Google Sheets para MongoDB
 * Migra dados da planilha atual para MongoDB
 */

import { connectToMongoDB, MONGODB_CONFIG } from '../config/mongodb.js'
import { processarDados } from '../src/utils/dataProcessor.js'

// Configuração da planilha atual (que funciona)
const CURRENT_SPREADSHEET_CONFIG = {
  id: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
  range: 'Base!A1:AC150000',
  pauseRange: 'Pausas!A1:AB150000'
}

class MigrationManager {
  constructor() {
    this.db = null
    this.client = null
  }

  async initialize() {
    try {
      const { client, db } = await connectToMongoDB()
      this.client = client
      this.db = db
      console.log('✅ MigrationManager inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar MigrationManager:', error)
      throw error
    }
  }

  // Obter token do usuário logado
  getAccessToken() {
    try {
      const userData = localStorage.getItem('veloinsights_user')
      if (!userData) {
        throw new Error('Usuário não está logado')
      }
      
      const user = JSON.parse(userData)
      return user.accessToken
    } catch (error) {
      console.error('❌ Erro ao obter token:', error)
      throw error
    }
  }

  // Buscar dados da planilha atual
  async fetchSpreadsheetData() {
    try {
      const accessToken = this.getAccessToken()
      console.log('🔄 Buscando dados da planilha atual...')
      
      // Buscar dados principais
      const mainUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SPREADSHEET_CONFIG.id}/values/${CURRENT_SPREADSHEET_CONFIG.range}?access_token=${accessToken}`
      
      const mainResponse = await fetch(mainUrl)
      if (!mainResponse.ok) {
        throw new Error(`Erro ao buscar dados principais: ${mainResponse.status}`)
      }
      
      const mainData = await mainResponse.json()
      console.log(`✅ ${mainData.values?.length || 0} linhas obtidas da planilha principal`)
      
      // Buscar dados de pausas
      const pauseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SPREADSHEET_CONFIG.id}/values/${CURRENT_SPREADSHEET_CONFIG.pauseRange}?access_token=${accessToken}`
      
      const pauseResponse = await fetch(pauseUrl)
      if (!pauseResponse.ok) {
        console.warn('⚠️ Não foi possível buscar dados de pausas')
      }
      
      const pauseData = pauseResponse.ok ? await pauseResponse.json() : { values: [] }
      console.log(`✅ ${pauseData.values?.length || 0} linhas obtidas da planilha de pausas`)
      
      return {
        mainData: mainData.values || [],
        pauseData: pauseData.values || []
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados da planilha:', error)
      throw error
    }
  }

  // Converter dados da planilha para formato MongoDB
  convertToMongoFormat(spreadsheetData) {
    try {
      const { mainData, pauseData } = spreadsheetData
      
      // Processar dados principais (calls)
      const calls = []
      if (mainData.length > 1) { // Pular cabeçalho
        for (let i = 1; i < mainData.length; i++) {
          const row = mainData[i]
          if (row.length < 6) continue // Pular linhas incompletas
          
          const call = {
            call_id: `CALL_${i}_${row[0]?.replace(/\//g, '-') || 'unknown'}`,
            operator_name: row[1] || 'Unknown',
            call_date: new Date(row[0]) || new Date(),
            start_time: this.extractTime(row[2]) || '00:00:00',
            end_time: this.calculateEndTime(row[2], row[3]) || '00:00:00',
            total_time: parseInt(row[3]) || 0,
            wait_time: parseInt(row[4]) || 0,
            time_in_ura: parseInt(row[5]) || 0,
            question_attendant: row[6] || '0',
            question_solution: row[7] || '0',
            queue_name: row[8] || 'Unknown',
            recording_url: row[9] || '',
            created_at: new Date(),
            updated_at: new Date()
          }
          
          calls.push(call)
        }
      }
      
      // Processar dados de pausas
      const pauses = []
      if (pauseData.length > 1) { // Pular cabeçalho
        for (let i = 1; i < pauseData.length; i++) {
          const row = pauseData[i]
          if (row.length < 4) continue // Pular linhas incompletas
          
          const pause = {
            operator_name: row[1] || 'Unknown',
            activity_name: row[2] || 'Unknown',
            start_date: new Date(row[0]) || new Date(),
            start_time: this.extractTime(row[3]) || '00:00:00',
            end_date: new Date(row[0]) || new Date(),
            end_time: this.calculateEndTime(row[3], row[4]) || '00:00:00',
            duration: parseInt(row[4]) || 0,
            pause_reason: row[5] || 'Unknown',
            created_at: new Date(),
            updated_at: new Date()
          }
          
          pauses.push(pause)
        }
      }
      
      console.log(`📊 Convertidos: ${calls.length} calls, ${pauses.length} pauses`)
      
      return { calls, pauses }
    } catch (error) {
      console.error('❌ Erro ao converter dados:', error)
      throw error
    }
  }

  // Extrair horário de string
  extractTime(timeString) {
    if (!timeString) return '00:00:00'
    
    // Tentar diferentes formatos de horário
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2].padStart(2, '0')
      const seconds = timeMatch[3] ? timeMatch[3].padStart(2, '0') : '00'
      return `${hours}:${minutes}:${seconds}`
    }
    
    return '00:00:00'
  }

  // Calcular horário de fim
  calculateEndTime(startTime, duration) {
    try {
      const start = this.extractTime(startTime)
      const [hours, minutes, seconds] = start.split(':').map(Number)
      
      const startSeconds = hours * 3600 + minutes * 60 + seconds
      const endSeconds = startSeconds + (parseInt(duration) || 0)
      
      const endHours = Math.floor(endSeconds / 3600)
      const endMinutes = Math.floor((endSeconds % 3600) / 60)
      const endSecs = endSeconds % 60
      
      return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${endSecs.toString().padStart(2, '0')}`
    } catch (error) {
      return '00:00:00'
    }
  }

  // Salvar dados no MongoDB
  async saveToMongoDB(calls, pauses) {
    try {
      let callsSaved = 0
      let pausesSaved = 0
      
      // Limpar dados existentes (opcional)
      const clearExisting = process.argv.includes('--clear')
      if (clearExisting) {
        console.log('🗑️ Limpando dados existentes...')
        await this.db.collection(MONGODB_CONFIG.collections.calls).deleteMany({})
        await this.db.collection(MONGODB_CONFIG.collections.pauses).deleteMany({})
      }
      
      // Salvar calls
      if (calls.length > 0) {
        const callsResult = await this.db.collection(MONGODB_CONFIG.collections.calls)
          .insertMany(calls)
        callsSaved = callsResult.insertedCount
        console.log(`✅ ${callsSaved} calls salvos no MongoDB`)
      }
      
      // Salvar pauses
      if (pauses.length > 0) {
        const pausesResult = await this.db.collection(MONGODB_CONFIG.collections.pauses)
          .insertMany(pauses)
        pausesSaved = pausesResult.insertedCount
        console.log(`✅ ${pausesSaved} pauses salvos no MongoDB`)
      }
      
      return { callsSaved, pausesSaved }
    } catch (error) {
      console.error('❌ Erro ao salvar no MongoDB:', error)
      throw error
    }
  }

  // Executar migração completa
  async migrate() {
    const startTime = performance.now()
    
    try {
      console.log('🚀 Iniciando migração da planilha para MongoDB...')
      
      // 1. Buscar dados da planilha
      const spreadsheetData = await this.fetchSpreadsheetData()
      
      // 2. Converter para formato MongoDB
      const mongoData = this.convertToMongoFormat(spreadsheetData)
      
      // 3. Salvar no MongoDB
      const saveResult = await this.saveToMongoDB(mongoData.calls, mongoData.pauses)
      
      const executionTime = performance.now() - startTime
      
      console.log('🎉 Migração concluída com sucesso!')
      console.log(`📊 Resultado: ${saveResult.callsSaved} calls, ${saveResult.pausesSaved} pauses`)
      console.log(`⏱️ Tempo de execução: ${(executionTime / 1000).toFixed(2)}s`)
      
      return {
        success: true,
        callsSaved: saveResult.callsSaved,
        pausesSaved: saveResult.pausesSaved,
        executionTime
      }
      
    } catch (error) {
      const executionTime = performance.now() - startTime
      console.error('❌ Erro na migração:', error)
      
      return {
        success: false,
        error: error.message,
        executionTime
      }
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

// Função principal para executar migração
export const runMigration = async () => {
  const migrationManager = new MigrationManager()
  
  try {
    await migrationManager.initialize()
    const result = await migrationManager.migrate()
    
    return result
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
    
  } finally {
    await migrationManager.close()
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(result => {
      if (result.success) {
        console.log('🎉 Migração finalizada com sucesso!')
        process.exit(0)
      } else {
        console.error('💥 Migração falhou:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

export default MigrationManager
