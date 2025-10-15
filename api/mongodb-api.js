/**
 * API para Salvar Dados no MongoDB
 * Endpoint para receber dados convertidos e salvar no MongoDB
 */

import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Configuração MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gabrielaraujo:sGoeqQgbxlsIwnjc@velohubcentral.od7vwts.mongodb.net/console_analises?retryWrites=true&w=majority&appName=VelohubCentral'

let client = null
let db = null

// Conectar ao MongoDB
async function connectToMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI)
      await client.connect()
      db = client.db('console_analises')
      console.log('✅ Conectado ao MongoDB Atlas')
    }
    return { client, db }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error)
    throw error
  }
}

// Endpoint para autenticação Google
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('🔄 Processando login Google...')
    
    // Simular processo de autenticação
    // Em um sistema real, aqui você faria a autenticação OAuth2
    const mockToken = 'mock_google_token_' + Date.now()
    
    res.json({
      success: true,
      token: mockToken,
      message: 'Login realizado com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro na autenticação:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// Endpoint para buscar dados da planilha Google Sheets - DESABILITADO PARA PERFORMANCE
/*
app.get('/api/google-sheets/data', async (req, res) => {
  try {
    console.log('🔄 Buscando dados da planilha Google Sheets...')

    // Verificar se há token de acesso
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      })
    }

    // Configurações da planilha ANTIGA
    const spreadsheetId = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA' // Planilha antiga
    const range = 'Base!A1:AC150000'

    // Tentar diferentes métodos para acessar a planilha
    const methods = [
      // Método 1: Google Sheets API com token
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}
      
      
      /values/${range}?access_token=${token}`,
      
      // Método 2: API pública CSV
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`,
      
      // Método 3: API pública CSV com gid=1
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=1`,
      
      // Método 4: API pública CSV com gid=2
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=2`
    ]

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`🌐 Tentando método ${i + 1}...`)
        const response = await fetch(methods[i])

        if (response.ok) {
          let data
          
          if (methods[i].includes('sheets.googleapis.com')) {
            // Resposta JSON da API do Google Sheets
            data = await response.json()
            if (data.values && data.values.length > 1) {
              console.log('✅ Dados obtidos via Google Sheets API!')
              console.log('📊 Total de linhas:', data.values.length)
              
              return res.json({
                success: true,
                data: data.values,
                totalRows: data.values.length,
                message: 'Dados obtidos com sucesso da planilha'
              })
            }
          } else {
            // Resposta CSV
            const csvData = await response.text()
            if (csvData && csvData.length > 100) {
              console.log('✅ Dados obtidos via CSV público!')
              
              // Converter CSV para array
              const lines = csvData.split('\n').filter(line => line.trim())
              const values = lines.map(line => line.split(','))
              
              console.log('📊 Total de linhas:', values.length)
              
              if (values.length > 1) {
                return res.json({
                  success: true,
                  data: values,
                  totalRows: values.length,
                  message: 'Dados obtidos com sucesso da planilha via CSV'
                })
              }
            }
          }
        } else {
          console.log(`❌ Método ${i + 1} falhou: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Método ${i + 1} erro: ${error.message}`)
      }
    }

    // Se nenhum método funcionou
    console.log('❌ Nenhum método funcionou para acessar a planilha')
    return res.status(403).json({
      success: false,
      error: 'Não foi possível acessar a planilha. Verifique se ela está pública ou se o token é válido.'
    })

  } catch (error) {
    console.error('❌ Erro ao buscar dados da planilha:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})
*/

// Endpoint de debug para verificar dados brutos no MongoDB
app.get('/api/debug-raw-data', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    const limit = parseInt(req.query.limit) || 2

    const calls = await db.collection('IGP_chamadas')
      .find({})
      .limit(limit)
      .toArray()

    console.log('🔍 DEBUG - Dados brutos do MongoDB:')
    calls.forEach((call, index) => {
      console.log(`  ${index + 1}. ID: ${call.call_id}`)
      console.log(`     Status: ${call.status}`)
      console.log(`     Todos os campos:`, Object.keys(call))
      console.log('     ---')
    })

    res.json({
      success: true,
      calls: calls, // Retornar dados brutos sem filtro
      message: 'Dados brutos do MongoDB'
    })
  } catch (error) {
    console.error('❌ Erro ao buscar dados brutos:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para salvar calls
app.post('/api/save-calls', async (req, res) => {
  try {
    const { calls } = req.body
    
    if (!calls || !Array.isArray(calls)) {
      return res.status(400).json({ error: 'Calls array é obrigatório' })
    }
    
    const { db } = await connectToMongoDB()
    
    // Limpar dados existentes (opcional)
    if (req.body.clearExisting) {
      await db.collection('IGP_chamadas').deleteMany({})
      console.log('🗑️ Calls existentes removidos')
    }
    
    // Salvar calls (apenas se houver dados)
    let result = { insertedCount: 0 }
    if (calls.length > 0) {
      result = await db.collection('IGP_chamadas').insertMany(calls)
    }
    
    console.log(`✅ ${result.insertedCount} calls salvos`)
    
    res.json({
      success: true,
      callsSaved: result.insertedCount,
      message: `${result.insertedCount} calls salvos com sucesso`
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar calls:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para salvar pauses
app.post('/api/save-pauses', async (req, res) => {
  try {
    const { pauses } = req.body
    
    if (!pauses || !Array.isArray(pauses)) {
      return res.status(400).json({ error: 'Pauses array é obrigatório' })
    }
    
    const { db } = await connectToMongoDB()
    
    // Limpar dados existentes (opcional)
    if (req.body.clearExisting) {
      await db.collection('pauses').deleteMany({})
      console.log('🗑️ Pauses existentes removidos')
    }
    
    // Salvar pauses
    const result = await db.collection('pauses').insertMany(pauses)
    
    console.log(`✅ ${result.insertedCount} pauses salvos`)
    
    res.json({
      success: true,
      pausesSaved: result.insertedCount,
      message: `${result.insertedCount} pauses salvos com sucesso`
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar pauses:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para salvar ambos
app.post('/api/save-data', async (req, res) => {
  try {
    const { calls, pauses, clearExisting } = req.body
    
    const { db } = await connectToMongoDB()
    
    let callsSaved = 0
    let pausesSaved = 0
    
    // Limpar dados existentes se solicitado
    if (clearExisting) {
      await db.collection('IGP_chamadas').deleteMany({})
      await db.collection('pauses').deleteMany({})
      console.log('🗑️ Dados existentes removidos')
    }
    
    // Salvar calls
    if (calls && calls.length > 0) {
      const callsResult = await db.collection('IGP_chamadas').insertMany(calls)
      callsSaved = callsResult.insertedCount
      console.log(`✅ ${callsSaved} calls salvos`)
    }
    
    // Salvar pauses
    if (pauses && pauses.length > 0) {
      const pausesResult = await db.collection('pauses').insertMany(pauses)
      pausesSaved = pausesResult.insertedCount
      console.log(`✅ ${pausesSaved} pauses salvos`)
    }
    
    res.json({
      success: true,
      callsSaved,
      pausesSaved,
      totalSaved: callsSaved + pausesSaved,
      message: `${callsSaved} calls e ${pausesSaved} pauses salvos com sucesso`
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para obter dados (apenas contagem, não os dados completos)
app.get('/api/get-data', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    // Apenas contar registros, não buscar todos os dados
    const callsCount = await db.collection('IGP_chamadas').countDocuments()
    const pausesCount = await db.collection('pauses').countDocuments()
    
    console.log(`📊 Contagem: ${callsCount} calls, ${pausesCount} pauses`)
    
    res.json({
      success: true,
      calls: callsCount,
      pauses: pausesCount,
      totalRecords: callsCount + pausesCount,
      data: { calls: [], pauses: [] } // Dados vazios para não travar
    })
    
  } catch (error) {
    console.error('❌ Erro ao obter dados:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para atualizar dados existentes
app.post('/api/update-calls', async (req, res) => {
  try {
    const { corrections } = req.body
    
    if (!corrections || !Array.isArray(corrections)) {
      return res.status(400).json({ error: 'Corrections array é obrigatório' })
    }
    
    const { db } = await connectToMongoDB()
    
    let updatedCount = 0
    
    for (const correction of corrections) {
      const result = await db.collection('IGP_chamadas').updateOne(
        { call_id: correction.call_id },
        { 
          $set: {
            colaboradorNome: correction.colaboradorNome, // Corrigido!
            call_date: correction.call_date,
            start_time: correction.start_time,
            end_time: correction.end_time,
            total_time: correction.total_time,
            wait_time: correction.wait_time,
            time_in_ura: correction.time_in_ura,
            question_attendant: correction.question_attendant,
            question_solution: correction.question_solution,
            queue_name: correction.queue_name,
            recording_url: correction.recording_url,
            updated_at: new Date()
          }
        }
      )
      
      if (result.modifiedCount > 0) {
        updatedCount++
      }
    }
    
    console.log(`✅ ${updatedCount} chamadas atualizadas`)
    
    res.json({
      success: true,
      updatedCount,
      message: `${updatedCount} chamadas atualizadas com sucesso`
    })
    
  } catch (error) {
    console.error('❌ Erro ao atualizar chamadas:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Endpoint para buscar amostras de registros
app.get('/api/sample-calls', async (req, res) => {
  try {
    console.log(`📊 Recebida requisição sample-calls com limit: ${req.query.limit}`)
    const { db } = await connectToMongoDB()
    const limit = parseInt(req.query.limit) || 10
    
    console.log(`🔍 Buscando ${limit} registros...`)
    const calls = await db.collection('IGP_chamadas')
      .find({})
      .limit(limit)
      .toArray()

    console.log(`✅ Encontrados ${calls.length} registros`)
    
    // Contar total de registros
    const totalCount = await db.collection('IGP_chamadas').countDocuments()
    console.log(`📊 Total na coleção: ${totalCount}`)

    res.json({
      success: true,
      totalCount: totalCount,
        calls: calls.map(call => ({
          call_id: call.call_id,
          colaboradorNome: call.colaboradorNome, // Corrigido!
          call_date: call.call_date,
          total_time: call.total_time,
          wait_time: call.wait_time,
          time_in_ura: call.time_in_ura,
          status: call.status, // CORRIGIDO: adicionado campo status!
          question_attendant: call.question_attendant,
          question_solution: call.question_solution,
          queue_name: call.queue_name,
          recording_url: call.recording_url
        }))
    })
  } catch (error) {
    console.error('❌ Erro ao buscar amostras:', error)
    res.status(500).json({ error: error.message })
  }
})

// 🚀 NOVO: Endpoint paginado para carregamento progressivo
app.get('/api/calls-paginated', async (req, res) => {
  try {
    console.log(`📄 Recebida requisição paginada - page: ${req.query.page}`)
    const { db } = await connectToMongoDB()
    
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5000 // 5k registros por página
    const skip = (page - 1) * limit
    
    console.log(`🔍 Buscando página ${page}: skip=${skip}, limit=${limit}`)
    
    // Buscar dados paginados
    const calls = await db.collection('IGP_chamadas')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray()

    console.log(`✅ Página ${page}: encontrados ${calls.length} registros`)
    
    // Contar total de registros para calcular se há mais páginas
    const totalCount = await db.collection('IGP_chamadas').countDocuments()
    const hasMore = (skip + calls.length) < totalCount
    const totalPages = Math.ceil(totalCount / limit)
    
    console.log(`📊 Total: ${totalCount}, Páginas: ${totalPages}, Tem mais: ${hasMore}`)

    res.json({
      success: true,
      calls: calls.map(call => ({
        call_id: call.call_id,
        colaboradorNome: call.colaboradorNome,
        call_date: call.call_date,
        total_time: call.total_time,
        wait_time: call.wait_time,
        time_in_ura: call.time_in_ura,
        status: call.status,
        question_attendant: call.question_attendant,
        question_solution: call.question_solution,
        queue_name: call.queue_name,
        recording_url: call.recording_url
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
        currentPageCount: calls.length,
        totalProcessed: skip + calls.length
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na paginação:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint de status
app.get('/api/status', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    const callsCount = await db.collection('IGP_chamadas').countDocuments()
    const pausesCount = await db.collection('pauses').countDocuments()
    
    res.json({
      success: true,
      status: 'connected',
      calls: callsCount,
      pauses: pausesCount,
      totalRecords: callsCount + pausesCount
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para limpar todos os dados
app.delete('/api/clear-all', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    // Contar antes
    const callsCountBefore = await db.collection('IGP_chamadas').countDocuments()
    const pausesCountBefore = await db.collection('pauses').countDocuments()
    
    console.log(`🗑️ Limpando ${callsCountBefore} calls e ${pausesCountBefore} pauses...`)
    
    // Limpar dados
    const callsResult = await db.collection('IGP_chamadas').deleteMany({})
    const pausesResult = await db.collection('pauses').deleteMany({})
    
    console.log(`✅ ${callsResult.deletedCount} calls removidos`)
    console.log(`✅ ${pausesResult.deletedCount} pauses removidos`)
    
    res.json({
      success: true,
      message: 'MongoDB resetado com sucesso',
      deletedCalls: callsResult.deletedCount,
      deletedPauses: pausesResult.deletedCount,
      totalDeleted: callsResult.deletedCount + pausesResult.deletedCount
    })
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error)
    res.status(500).json({ error: error.message })
  }
})

// 🎯 NOVOS ENDPOINTS PARA SINCRONIZAÇÃO

// Status da sincronização
app.get('/api/sync-status', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    // Buscar última sincronização
    const lastSync = await db.collection('sync_config').findOne({ type: 'last_sync' })
    
    // Buscar logs recentes
    const recentLogs = await db.collection('sync_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray()
    
    // Contar registros
    const callsCount = await db.collection('IGP_chamadas').countDocuments()
    
    res.json({
      success: true,
      last_sync: lastSync,
      recent_logs: recentLogs,
      calls_count: callsCount,
      next_sync: calculateNextSync()
    })
  } catch (error) {
    console.error('❌ Erro ao obter status de sync:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Forçar sincronização manual
app.post('/api/force-sync', async (req, res) => {
  try {
    console.log('🔄 Forçando sincronização manual...')
    
    // Importar função de sincronização
    const { runManualSync } = await import('../sync/sync-daily.js')
    
    // Executar sincronização
    await runManualSync()
    
    res.json({
      success: true,
      message: 'Sincronização manual executada com sucesso',
      timestamp: new Date()
    })
  } catch (error) {
    console.error('❌ Erro na sincronização manual:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Logs de sincronização
app.get('/api/sync-logs', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    const limit = parseInt(req.query.limit) || 20
    
    const logs = await db.collection('sync_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()
    
    res.json({
      success: true,
      logs: logs,
      count: logs.length
    })
  } catch (error) {
    console.error('❌ Erro ao obter logs:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Configurações de sincronização
app.get('/api/sync-config', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    const configs = await db.collection('sync_config')
      .find({})
      .toArray()
    
    res.json({
      success: true,
      configs: configs
    })
  } catch (error) {
    console.error('❌ Erro ao obter configurações:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Health check do sistema de sync
app.get('/api/sync-health', async (req, res) => {
  try {
    const { checkSyncHealth } = await import('../sync/sync-monitor.js')
    const health = await checkSyncHealth()
    
    res.json({
      success: true,
      health: health
    })
  } catch (error) {
    console.error('❌ Erro no health check:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Função auxiliar para calcular próxima execução
function calculateNextSync() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(3, 0, 0, 0)
  
  return tomorrow.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  })
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API MongoDB rodando na porta ${PORT}`)
  console.log(`📊 Endpoints disponíveis:`)
  console.log(`   POST /api/save-data - Salvar calls e pauses`)
  console.log(`   POST /api/update-calls - Atualizar dados existentes`)
  console.log(`   GET  /api/sample-calls - Buscar amostras de registros`)
  console.log(`   GET  /api/get-data - Obter dados`)
  console.log(`   GET  /api/status - Status do MongoDB`)
  console.log(`   DELETE /api/clear-all - Limpar todos os dados`)
  console.log(`   GET  /api/calls-paginated - Buscar registros paginados`)
  console.log(`   🆕 GET  /api/sync-status - Status da sincronização`)
  console.log(`   🆕 POST /api/force-sync - Forçar sincronização manual`)
  console.log(`   🆕 GET  /api/sync-logs - Logs de sincronização`)
  console.log(`   🆕 GET  /api/sync-config - Configurações de sync`)
  console.log(`   🆕 GET  /api/sync-health - Health check do sistema`)
})

export default app
