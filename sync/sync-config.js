// 🎯 CONFIGURAÇÕES DO SISTEMA DE SINCRONIZAÇÃO
export const SYNC_CONFIG = {
  // Cron schedule - execução diária às 03:00 AM
  CRON_SCHEDULE: '0 3 * * *',
  
  // API 55PBX (placeholder - será configurado quando tivermos acesso)
  API_55PBX_URL: process.env.API_55PBX_URL || 'https://api.55pbx.com/v1',
  API_55PBX_TOKEN: process.env.API_55PBX_TOKEN || 'your_token_here',
  
  // MongoDB (usando configuração existente)
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://veloinsights:veloinsights123@cluster0.8qjqx.mongodb.net/console_analises',
  DATABASE_NAME: 'console_analises',
  
  // Collections (usando existentes + novas)
  COLLECTIONS: {
    CHAMADAS: 'IGP_chamadas',        // EXISTENTE - dados de D-1
    PAUSES: 'pauses',                // EXISTENTE - manter
    LOGS: 'sync_logs',               // NOVA - logs de sincronização
    CONFIG: 'sync_config'            // NOVA - configurações de sync
  },
  
  // Configurações de API
  API_TIMEOUT: 30000,        // 30 segundos
  MAX_RETRIES: 3,            // Máximo de tentativas
  RETRY_DELAY: 5000,         // 5 segundos entre tentativas
  
  // Configurações de dados
  BATCH_SIZE: 5000,          // Tamanho do lote para processamento
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas em cache
  
  // Timezone
  TIMEZONE: 'America/Sao_Paulo'
}

// 🎯 SCHEMA DAS NOVAS COLEÇÕES
export const SYNC_SCHEMAS = {
  // Schema para logs de sincronização
  SYNC_LOGS: {
    date: String,           // Data da sincronização (YYYY-MM-DD)
    status: String,         // success, error, warning
    calls_count: Number,    // Quantidade de chamadas processadas
    error: String,          // Mensagem de erro (se houver)
    duration: Number,       // Duração em milissegundos
    timestamp: Date,        // Timestamp da execução
    api_response_time: Number, // Tempo de resposta da API
    retry_count: Number     // Quantidade de tentativas
  },
  
  // Schema para configurações de sync
  SYNC_CONFIG: {
    type: String,           // Tipo de configuração (last_sync, api_config, etc)
    last_sync_date: String, // Última data sincronizada
    last_sync_count: Number, // Quantidade de registros da última sync
    last_sync_timestamp: Date, // Timestamp da última sincronização
    api_config: Object,     // Configurações da API
    schedule_config: Object, // Configurações do cron
    created_at: Date,       // Data de criação
    updated_at: Date        // Data de atualização
  }
}

// 🎯 MAPEAMENTO DE STATUS DA API 55PBX
export const STATUS_MAPPING = {
  'answered': 'Atendida',
  'abandoned': 'Abandonada', 
  'busy': 'Retida na URA',
  'no-answer': 'Abandonada',
  'failed': 'Não classificada'
}

// 🎯 CONFIGURAÇÕES DE ALERTAS
export const ALERT_CONFIG = {
  ENABLED: true,
  EMAIL_RECIPIENTS: ['admin@velotax.com.br'],
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK || null,
  ERROR_THRESHOLD: 3,       // Máximo de erros consecutivos antes do alerta
  HEALTH_CHECK_INTERVAL: 6 * 60 * 60 * 1000 // 6 horas
}
