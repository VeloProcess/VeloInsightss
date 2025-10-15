// 🎯 FUNÇÕES UTILITÁRIAS PARA SINCRONIZAÇÃO
import axios from 'axios'
import { SYNC_CONFIG, STATUS_MAPPING } from './sync-config.js'

// 📡 Buscar chamadas da API 55PBX
export async function fetchCallsFromAPI(date) {
  const maxRetries = SYNC_CONFIG.MAX_RETRIES
  let lastError = null
  
  console.log(`📡 Buscando dados da API 55PBX para ${date}...`)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}`)
      
      const response = await axios.get(`${SYNC_CONFIG.API_55PBX_URL}/calls`, {
        params: { 
          date: date,
          limit: 10000 // Ajustar conforme necessário
        },
        headers: { 
          Authorization: `Bearer ${SYNC_CONFIG.API_55PBX_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: SYNC_CONFIG.API_TIMEOUT
      })
      
      const calls = response.data.calls || []
      console.log(`✅ API 55PBX: ${calls.length} chamadas encontradas`)
      return calls
      
    } catch (error) {
      lastError = error
      console.error(`❌ Tentativa ${attempt} falhou:`, error.message)
      
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${SYNC_CONFIG.RETRY_DELAY}ms...`)
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.RETRY_DELAY))
      }
    }
  }
  
  throw new Error(`Falha após ${maxRetries} tentativas: ${lastError.message}`)
}

// 🔄 Processar dados das chamadas para o formato do MongoDB
export async function processCallsData(calls, date) {
  console.log(`🔄 Processando ${calls.length} chamadas...`)
  
  return calls.map((call, index) => ({
    call_id: call.id || `CALL_${Date.now()}_${index}`,
    colaboradorNome: call.operator_name || 'Operador Desconhecido',
    call_date: new Date(call.date || date),
    total_time: formatTime(call.total_duration || 0),
    wait_time: formatTime(call.wait_time || 0),
    time_in_ura: formatTime(call.ura_time || 0),
    status: mapStatus(call.status),
    question_attendant: call.question_attendant || '0',
    question_solution: call.question_solution || '0',
    queue_name: call.queue_name || 'Fila Desconhecida',
    recording_url: call.recording_url || '',
    created_at: new Date(),
    updated_at: new Date(),
    sync_date: date // Data da sincronização
  }))
}

// 📊 Calcular métricas das chamadas
export async function calculateMetrics(calls, date) {
  console.log(`📊 Calculando métricas para ${calls.length} chamadas...`)
  
  const totalCalls = calls.length
  const atendida = calls.filter(c => c.status === 'Atendida').length
  const abandonada = calls.filter(c => c.status === 'Abandonada').length
  const retidaUra = calls.filter(c => c.status === 'Retida na URA').length
  
  // Calcular estatísticas por operador
  const operatorStats = calls.reduce((acc, call) => {
    const op = call.colaboradorNome
    if (!acc[op]) {
      acc[op] = { 
        total: 0, 
        atendida: 0, 
        abandonada: 0, 
        retida_ura: 0,
        efficiency: 0
      }
    }
    acc[op].total++
    
    if (call.status === 'Atendida') acc[op].atendida++
    else if (call.status === 'Abandonada') acc[op].abandonada++
    else if (call.status === 'Retida na URA') acc[op].retida_ura++
    
    return acc
  }, {})
  
  // Calcular eficiência e ordenar operadores
  const topOperators = Object.entries(operatorStats)
    .map(([name, stats]) => ({
      name,
      ...stats,
      efficiency: stats.total > 0 ? (stats.atendida / stats.total) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
  
  const metrics = {
    date: date,
    total_calls: totalCalls,
    atendida: atendida,
    abandonada: abandonada,
    retida_ura: retidaUra,
    top_operators: topOperators,
    calculated_at: new Date()
  }
  
  console.log(`✅ Métricas calculadas: ${totalCalls} total, ${atendida} atendidas`)
  return metrics
}

// 🕐 Formatar tempo em segundos para HH:MM:SS
function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 🏷️ Mapear status da API para formato interno
function mapStatus(apiStatus) {
  return STATUS_MAPPING[apiStatus] || 'Não classificada'
}

// 📅 Calcular próxima execução do cron
export function calculateNextSync() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(3, 0, 0, 0) // 03:00 AM
  
  return tomorrow.toLocaleString('pt-BR', {
    timeZone: SYNC_CONFIG.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 🔍 Validar dados antes de salvar
export function validateCallsData(calls) {
  const errors = []
  
  calls.forEach((call, index) => {
    if (!call.call_id) errors.push(`Call ${index}: call_id obrigatório`)
    if (!call.colaboradorNome) errors.push(`Call ${index}: colaboradorNome obrigatório`)
    if (!call.call_date) errors.push(`Call ${index}: call_date obrigatório`)
    if (!call.status) errors.push(`Call ${index}: status obrigatório`)
  })
  
  if (errors.length > 0) {
    throw new Error(`Dados inválidos: ${errors.join(', ')}`)
  }
  
  return true
}

// 📊 Gerar relatório de sincronização
export function generateSyncReport(syncData) {
  const { calls, duration, errors } = syncData
  
  return {
    summary: {
      total_calls: calls.length,
      duration_ms: duration,
      success_rate: errors.length === 0 ? 100 : ((calls.length - errors.length) / calls.length) * 100,
      errors_count: errors.length
    },
    details: {
      calls_processed: calls.length,
      sync_duration: `${duration}ms`,
      errors: errors,
      timestamp: new Date()
    }
  }
}
