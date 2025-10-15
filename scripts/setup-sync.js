// 🎯 SCRIPT DE SETUP DO SISTEMA DE SINCRONIZAÇÃO
import { MongoClient } from 'mongodb'
import { SYNC_CONFIG, SYNC_SCHEMAS } from '../sync/sync-config.js'

// 🔧 Configurar sistema de sincronização
async function setupSyncSystem() {
  let client = null
  
  try {
    console.log('🔧 Configurando sistema de sincronização...')
    
    // 1. Conectar ao MongoDB
    client = new MongoClient(SYNC_CONFIG.MONGO_URI)
    await client.connect()
    const db = client.db(SYNC_CONFIG.DATABASE_NAME)
    
    console.log('✅ Conectado ao MongoDB')
    
    // 2. Criar coleções necessárias (se não existirem)
    console.log('📁 Criando coleções...')
    
    // Coleção de logs de sincronização
    await db.createCollection(SYNC_CONFIG.COLLECTIONS.LOGS, {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['date', 'status', 'timestamp'],
          properties: {
            date: { bsonType: 'string' },
            status: { bsonType: 'string' },
            calls_count: { bsonType: 'number' },
            error: { bsonType: 'string' },
            duration: { bsonType: 'number' },
            timestamp: { bsonType: 'date' },
            api_response_time: { bsonType: 'number' },
            retry_count: { bsonType: 'number' }
          }
        }
      }
    })
    
    // Coleção de configurações
    await db.createCollection(SYNC_CONFIG.COLLECTIONS.CONFIG, {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['type', 'created_at'],
          properties: {
            type: { bsonType: 'string' },
            last_sync_date: { bsonType: 'string' },
            last_sync_count: { bsonType: 'number' },
            last_sync_timestamp: { bsonType: 'date' },
            api_config: { bsonType: 'object' },
            schedule_config: { bsonType: 'object' },
            created_at: { bsonType: 'date' },
            updated_at: { bsonType: 'date' }
          }
        }
      }
    })
    
    // Coleção de cache de métricas
    await db.createCollection('metrics_cache', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['date', 'calculated_at'],
          properties: {
            date: { bsonType: 'string' },
            total_calls: { bsonType: 'number' },
            atendida: { bsonType: 'number' },
            abandonada: { bsonType: 'number' },
            retida_ura: { bsonType: 'number' },
            top_operators: { bsonType: 'array' },
            calculated_at: { bsonType: 'date' }
          }
        }
      }
    })
    
    // Coleção de alertas
    await db.createCollection('alerts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['message', 'type', 'timestamp'],
          properties: {
            message: { bsonType: 'string' },
            type: { bsonType: 'string' },
            timestamp: { bsonType: 'date' },
            resolved: { bsonType: 'bool' }
          }
        }
      }
    })
    
    console.log('✅ Coleções criadas com sucesso')
    
    // 3. Criar índices para performance
    console.log('📊 Criando índices...')
    
    // Índices para logs
    await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS).createIndex({ timestamp: -1 })
    await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS).createIndex({ date: 1 })
    await db.collection(SYNC_CONFIG.COLLECTIONS.LOGS).createIndex({ status: 1 })
    
    // Índices para configurações
    await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG).createIndex({ type: 1 }, { unique: true })
    
    // Índices para cache de métricas
    await db.collection('metrics_cache').createIndex({ date: 1 }, { unique: true })
    await db.collection('metrics_cache').createIndex({ calculated_at: -1 })
    
    // Índices para alertas
    await db.collection('alerts').createIndex({ timestamp: -1 })
    await db.collection('alerts').createIndex({ resolved: 1 })
    
    console.log('✅ Índices criados com sucesso')
    
    // 4. Inserir configuração inicial
    console.log('⚙️ Inserindo configuração inicial...')
    
    await db.collection(SYNC_CONFIG.COLLECTIONS.CONFIG).replaceOne(
      { type: 'system_config' },
      {
        type: 'system_config',
        api_config: {
          url: SYNC_CONFIG.API_55PBX_URL,
          timeout: SYNC_CONFIG.API_TIMEOUT,
          max_retries: SYNC_CONFIG.MAX_RETRIES
        },
        schedule_config: {
          cron_schedule: SYNC_CONFIG.CRON_SCHEDULE,
          timezone: SYNC_CONFIG.TIMEZONE
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      { upsert: true }
    )
    
    // 5. Verificar coleções existentes
    console.log('🔍 Verificando coleções existentes...')
    
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log('📁 Coleções disponíveis:')
    collectionNames.forEach(name => {
      console.log(`   - ${name}`)
    })
    
    // 6. Verificar dados existentes
    const callsCount = await db.collection(SYNC_CONFIG.COLLECTIONS.CHAMADAS).countDocuments()
    const pausesCount = await db.collection(SYNC_CONFIG.COLLECTIONS.PAUSES).countDocuments()
    
    console.log(`📊 Dados existentes:`)
    console.log(`   - IGP_chamadas: ${callsCount} registros`)
    console.log(`   - pauses: ${pausesCount} registros`)
    
    console.log('🎉 Setup concluído com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Configurar variáveis de ambiente (API_55PBX_URL, API_55PBX_TOKEN)')
    console.log('   2. Testar conexão com API 55PBX')
    console.log('   3. Executar teste de sincronização')
    console.log('   4. Configurar cron job em produção')
    
  } catch (error) {
    console.error('❌ Erro no setup:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// 🚀 Executar setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSyncSystem()
    .then(() => {
      console.log('✅ Setup concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro no setup:', error)
      process.exit(1)
    })
}

export { setupSyncSystem }
