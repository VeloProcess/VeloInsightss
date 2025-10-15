// Script de migração simplificado para executar no console do navegador
// Execute este código completo no console do navegador

(function() {
  console.log('🚀 Iniciando migração da planilha para MongoDB...')

  // Verificar se o usuário está logado
  const userData = localStorage.getItem('veloinsights_user')
  if (!userData) {
    console.error('❌ Usuário não está logado. Faça login primeiro.')
    return
  }

  const user = JSON.parse(userData)
  console.log('✅ Usuário logado:', user.email)
  
  // Configuração da planilha atual
  const CURRENT_SPREADSHEET_CONFIG = {
    id: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
    range: 'Base!A1:AC150000',
    pauseRange: 'Pausas!A1:AB150000'
  }
  
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
  
  // Função para buscar dados da planilha
  async function fetchSpreadsheetData() {
    try {
      console.log('🔄 Buscando dados da planilha atual...')
      
      // Buscar dados principais
      const mainUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SPREADSHEET_CONFIG.id}/values/${CURRENT_SPREADSHEET_CONFIG.range}?access_token=${user.accessToken}`
      
      console.log('🔗 URL principal:', mainUrl.replace(user.accessToken, '***'))
      
      const mainResponse = await fetch(mainUrl)
      if (!mainResponse.ok) {
        const errorText = await mainResponse.text()
        throw new Error(`Erro ao buscar dados principais: ${mainResponse.status} - ${errorText}`)
      }
      
      const mainData = await mainResponse.json()
      console.log(`✅ ${mainData.values?.length || 0} linhas obtidas da planilha principal`)
      
      // Buscar dados de pausas
      const pauseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SPREADSHEET_CONFIG.id}/values/${CURRENT_SPREADSHEET_CONFIG.pauseRange}?access_token=${user.accessToken}`
      
      const pauseResponse = await fetch(pauseUrl)
      if (!pauseResponse.ok) {
        console.warn('⚠️ Não foi possível buscar dados de pausas:', pauseResponse.status)
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
  
  // Função para converter dados para formato MongoDB
  function convertToMongoFormat(spreadsheetData) {
    try {
      const { mainData, pauseData } = spreadsheetData
      
      // Processar dados principais (calls)
      const calls = []
      if (mainData.length > 1) { // Pular cabeçalho
        console.log('📊 Processando calls...')
        for (let i = 1; i < Math.min(mainData.length, 100); i++) { // Limitar a 100 para teste
          const row = mainData[i]
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
      
      // Processar dados de pausas
      const pauses = []
      if (pauseData.length > 1) { // Pular cabeçalho
        console.log('📊 Processando pauses...')
        for (let i = 1; i < Math.min(pauseData.length, 100); i++) { // Limitar a 100 para teste
          const row = pauseData[i]
          if (row.length < 4) continue // Pular linhas incompletas
          
          const pause = {
            operator_name: row[1] || 'Unknown',
            activity_name: row[2] || 'Unknown',
            start_date: new Date(row[0]) || new Date(),
            start_time: extractTime(row[3]) || '00:00:00',
            end_date: new Date(row[0]) || new Date(),
            end_time: calculateEndTime(row[3], row[4]) || '00:00:00',
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
  
  // Função para mostrar dados convertidos
  function showConvertedData(calls, pauses) {
    console.log('📊 Dados convertidos para MongoDB:')
    
    if (calls.length > 0) {
      console.log('📞 Calls (primeiros 3):')
      console.table(calls.slice(0, 3))
    }
    
    if (pauses.length > 0) {
      console.log('⏸️ Pauses (primeiros 3):')
      console.table(pauses.slice(0, 3))
    }
    
    console.log(`✅ Total: ${calls.length} calls e ${pauses.length} pauses prontos para salvar`)
    
    // Salvar dados globalmente para uso posterior
    window.migratedData = { calls, pauses }
    console.log('💾 Dados salvos em window.migratedData para uso posterior')
  }
  
  // Executar migração
  async function runMigration() {
    try {
      console.log('🚀 Iniciando migração...')
      
      // 1. Buscar dados da planilha
      const spreadsheetData = await fetchSpreadsheetData()
      
      // 2. Converter para formato MongoDB
      const mongoData = convertToMongoFormat(spreadsheetData)
      
      // 3. Mostrar dados convertidos
      showConvertedData(mongoData.calls, mongoData.pauses)
      
      console.log('🎉 Migração concluída com sucesso!')
      console.log(`📊 Resultado: ${mongoData.calls.length} calls, ${mongoData.pauses.length} pauses`)
      
      return mongoData
      
    } catch (error) {
      console.error('❌ Erro na migração:', error)
      throw error
    }
  }
  
  // Executar migração
  runMigration().catch(error => {
    console.error('💥 Erro fatal na migração:', error)
  })
})()
