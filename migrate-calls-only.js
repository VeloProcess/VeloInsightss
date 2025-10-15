// Cole este código COMPLETO no console do navegador
// Este script vai migrar APENAS as CHAMADAS para o MongoDB

console.log('🚀 Iniciando migração das CHAMADAS para MongoDB...')

// Verificar se o usuário está logado
const userData = localStorage.getItem('veloinsights_user')
if (!userData) {
  console.error('❌ Usuário não está logado. Faça login primeiro.')
} else {
  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  // Configuração da planilha atual
  const CURRENT_SPREADSHEET_CONFIG = {
    id: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
    range: 'Base!A1:AC150000'
  }
  
  // URL da API MongoDB
  const MONGODB_API_URL = 'http://localhost:3000'
  
  // Função auxiliar para extrair horário
  function extractTime(timeString) {
    if (!timeString) return '00:00:00'
    
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2].padStart(2, '0')
      const seconds = timeMatch[3] ? timeMatch[3].padStart(2, '0') : '00'
      return `${hours}:${minutes}:${seconds}`
    }
    
    return '00:00:00'
  }
  
  // Função auxiliar para calcular horário de fim
  function calculateEndTime(startTime, duration) {
    try {
      const start = extractTime(startTime)
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
  
  // Função para buscar dados das chamadas
  async function fetchCallsData() {
    try {
      console.log('🔄 Buscando dados das CHAMADAS...')
      
      const mainUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SPREADSHEET_CONFIG.id}/values/${CURRENT_SPREADSHEET_CONFIG.range}?access_token=${user.accessToken}`
      
      console.log('🔗 URL:', mainUrl.replace(user.accessToken, '***'))
      
      const mainResponse = await fetch(mainUrl)
      if (!mainResponse.ok) {
        const errorText = await mainResponse.text()
        throw new Error(`Erro ao buscar dados: ${mainResponse.status} - ${errorText}`)
      }
      
      const mainData = await mainResponse.json()
      console.log(`✅ ${mainData.values?.length || 0} linhas obtidas da planilha`)
      
      return mainData.values || []
    } catch (error) {
      console.error('❌ Erro ao buscar dados das chamadas:', error)
      throw error
    }
  }
  
  // Função para converter chamadas para formato MongoDB
  function convertCallsToMongoFormat(spreadsheetData) {
    try {
      const calls = []
      
      if (spreadsheetData.length > 1) { // Pular cabeçalho
        console.log('📊 Processando CHAMADAS...')
        
        for (let i = 1; i < spreadsheetData.length; i++) {
          const row = spreadsheetData[i]
          if (row.length < 6) continue // Pular linhas incompletas
          
          const call = {
            call_id: `CALL_${i}_${row[0]?.replace(/\//g, '-') || 'unknown'}`,
            operator_name: row[1] || 'Unknown',
            call_date: new Date(row[0]) || new Date(),
            start_time: extractTime(row[2]) || '00:00:00',
            end_time: calculateEndTime(row[2], row[3]) || '00:00:00',
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
      
      console.log(`📊 Convertidas: ${calls.length} CHAMADAS`)
      
      return calls
    } catch (error) {
      console.error('❌ Erro ao converter chamadas:', error)
      throw error
    }
  }
  
  // Função para salvar chamadas no MongoDB
  async function saveCallsToMongoDB(calls) {
    try {
      console.log('💾 Salvando CHAMADAS no MongoDB...')
      
      const response = await fetch(`${MONGODB_API_URL}/api/save-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calls,
          clearExisting: true // Limpar chamadas existentes
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao salvar chamadas: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ CHAMADAS salvas no MongoDB:', result)
      
      return result
    } catch (error) {
      console.error('❌ Erro ao salvar chamadas:', error)
      throw error
    }
  }
  
  // Função para verificar status do MongoDB
  async function checkMongoDBStatus() {
    try {
      console.log('🔍 Verificando status do MongoDB...')
      
      const response = await fetch(`${MONGODB_API_URL}/api/status`)
      
      if (!response.ok) {
        throw new Error(`API MongoDB não está rodando: ${response.status}`)
      }
      
      const status = await response.json()
      console.log('✅ MongoDB conectado:', status)
      
      return status
    } catch (error) {
      console.error('❌ Erro ao verificar MongoDB:', error)
      throw error
    }
  }
  
  // Executar migração das chamadas
  async function migrateCalls() {
    try {
      console.log('🚀 Iniciando migração das CHAMADAS...')
      
      // 1. Verificar status do MongoDB
      await checkMongoDBStatus()
      
      // 2. Buscar dados das chamadas
      const spreadsheetData = await fetchCallsData()
      
      // 3. Converter para formato MongoDB
      const calls = convertCallsToMongoFormat(spreadsheetData)
      
      // 4. Salvar no MongoDB
      const saveResult = await saveCallsToMongoDB(calls)
      
      console.log('🎉 Migração das CHAMADAS concluída!')
      console.log(`📊 Resultado: ${saveResult.callsSaved} chamadas salvas no MongoDB`)
      
      // Mostrar algumas chamadas como exemplo
      if (calls.length > 0) {
        console.log('📞 Exemplo de chamada salva:')
        console.table(calls.slice(0, 3))
      }
      
      return saveResult
      
    } catch (error) {
      console.error('❌ Erro na migração das chamadas:', error)
      throw error
    }
  }
  
  // Executar migração das chamadas
  migrateCalls().catch(error => {
    console.error('💥 Erro fatal na migração das chamadas:', error)
  })
}
