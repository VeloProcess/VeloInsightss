import { useState, useEffect, useCallback } from 'react'
import { processarDados } from '../utils/dataProcessor'

// Função para processamento assíncrono otimizado
const processarDadosAssincrono = async (dados, processAllRecords = false) => {
  // Processamento direto sem setTimeout para máxima performance
  const startTime = performance.now()
  const resultado = processarDados(dados, processAllRecords)
  const endTime = performance.now()
  
  return resultado
}

// Função para filtrar dados por período baseado na coluna de data
const filterDataByPeriod = (data, selectedPeriod) => {
  if (!data || data.length === 0) return data
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Encontrar índice da coluna de data (coluna D = índice 3)
  const headerRow = data[0]
  let dateColumnIndex = headerRow.findIndex(col => 
    col && col.toLowerCase().includes('data')
  )
  
  // Se não encontrar por nome, usar índice 3 (coluna D)
  if (dateColumnIndex === -1) {
    dateColumnIndex = 3
    console.log('📅 Usando coluna D (índice 3) para filtragem por data')
  } else {
    console.log(`📅 Coluna de data encontrada no índice: ${dateColumnIndex}`)
  }
  
  // Detectar o ano dos dados automaticamente
  let dataYear = now.getFullYear()
  if (data.length > 1) {
    console.log(`🔍 Verificando primeiras 10 datas para detectar ano...`)
    // Verificar algumas datas para detectar o ano
    for (let i = 1; i <= Math.min(10, data.length - 1); i++) {
      const dateStr = data[i][dateColumnIndex]
      console.log(`🔍 Linha ${i}, Data: "${dateStr}"`)
      if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const year = parseInt(parts[2])
          console.log(`🔍 Ano encontrado: ${year}`)
          if (year > 2000) {
            dataYear = year
            console.log(`✅ Ano detectado: ${dataYear}`)
            break
          }
        }
      }
    }
  }
  
  console.log(`📅 Ano detectado nos dados: ${dataYear}`)
  
  // Se não conseguiu detectar o ano, assumir 2025 (baseado nos logs anteriores)
  if (dataYear === now.getFullYear()) {
    console.log('⚠️ Não foi possível detectar o ano automaticamente, assumindo 2025')
    dataYear = 2025
  }
  
  console.log(`📅 Filtrando dados por período: ${selectedPeriod}`)
  console.log(`📅 Data de hoje: ${today.toLocaleDateString()}`)
  console.log(`📅 Total de registros para filtrar: ${data.length - 1}`)
  console.log(`📅 Coluna de data (índice ${dateColumnIndex}): ${headerRow[dateColumnIndex]}`)
  
  let validRecords = 0
  let invalidRecords = 0
  
  const filteredData = data.filter((row, index) => {
    // Manter cabeçalho
    if (index === 0) return true
    
    const dateStr = row[dateColumnIndex]
    if (!dateStr) {
      invalidRecords++
      return false
    }
    
    try {
      // Tentar diferentes formatos de data
      let rowDate
      if (dateStr.includes('/')) {
        // Formato DD/MM/YYYY ou DD/MM/YY
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1 // Mês é 0-indexado
          const year = parseInt(parts[2])
          // Se ano tem 2 dígitos, assumir 20xx
          const fullYear = year < 100 ? 2000 + year : year
          rowDate = new Date(fullYear, month, day)
        }
      } else {
        // Formato ISO ou outros
        rowDate = new Date(dateStr)
      }
      
      if (isNaN(rowDate.getTime())) {
        invalidRecords++
        return false
      }
      
      const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
      
      let shouldInclude = false
      
      switch (selectedPeriod) {
        case 'last7Days':
          // Usar o ano detectado nos dados
          const sevenDaysAgo = new Date(dataYear, today.getMonth(), today.getDate() - 7)
          shouldInclude = rowDateOnly >= sevenDaysAgo && rowDateOnly.getFullYear() === dataYear
          break
          
        case 'last15Days':
          // Usar o ano detectado nos dados
          const fifteenDaysAgo = new Date(dataYear, today.getMonth(), today.getDate() - 15)
          shouldInclude = rowDateOnly >= fifteenDaysAgo && rowDateOnly.getFullYear() === dataYear
          break
          
        case 'lastMonth':
          // Usar o ano detectado nos dados
          const lastMonth = new Date(dataYear, today.getMonth() - 1, today.getDate())
          shouldInclude = rowDateOnly.getMonth() === lastMonth.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        case 'penultimateMonth':
          // Usar o ano detectado nos dados
          const penultimateMonth = new Date(dataYear, today.getMonth() - 2, today.getDate())
          shouldInclude = rowDateOnly.getMonth() === penultimateMonth.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        case 'currentMonth':
          // Usar o ano detectado nos dados
          shouldInclude = rowDateOnly.getMonth() === today.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        case 'all':
        default:
          shouldInclude = true
          break
      }
      
      if (shouldInclude) {
        validRecords++
      } else {
        invalidRecords++
      }
      
      return shouldInclude
      
    } catch (error) {
      console.warn(`⚠️ Erro ao processar data: ${dateStr}`, error)
      invalidRecords++
      return false
    }
  })
  
  console.log(`✅ Filtrados ${filteredData.length - 1} registros de ${data.length - 1} total`)
  console.log(`📊 Registros válidos: ${validRecords}, Registros inválidos: ${invalidRecords}`)
  
  // Debug: mostrar algumas datas filtradas
  if (filteredData.length > 1) {
    console.log(`🔍 Primeiras 3 datas filtradas:`)
    for (let i = 1; i <= Math.min(3, filteredData.length - 1); i++) {
      console.log(`  ${i}: ${filteredData[i][dateColumnIndex]}`)
    }
  } else {
    console.log(`⚠️ Nenhum registro foi filtrado!`)
  }
  
  return filteredData
}

// Função para processamento completo com progresso
const processarTodosOsDadosComProgresso = async (dados, onProgress) => {
  return new Promise((resolve) => {
    
    const totalRecords = dados.length - 1 // Excluir cabeçalho
    let processedRecords = 0
    
    // Simular progresso em chunks
    const processChunk = () => {
      const chunkSize = Math.max(1000, Math.floor(totalRecords / 100)) // Processar em chunks de pelo menos 1000 registros
      const endIndex = Math.min(processedRecords + chunkSize, totalRecords)
      
      // Simular processamento do chunk
      setTimeout(() => {
        processedRecords = endIndex
        const progress = (processedRecords / totalRecords) * 100
        
        // Atualizar progresso
        if (onProgress) {
          onProgress(progress, processedRecords, totalRecords)
        }
        
        if (processedRecords < totalRecords) {
          // Continuar processamento
          processChunk()
        } else {
          // Processamento completo - agora processar os dados reais
          const startTime = performance.now()
          const resultado = processarDados(dados, true) // processAllRecords = true
          const endTime = performance.now()
          
          resolve(resultado)
        }
      }, 50) // Delay pequeno para mostrar progresso
    }
    
    // Iniciar processamento
    processChunk()
  })
}

export const useGoogleSheetsDirectSimple = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [fullDataset, setFullDataset] = useState([]) // Dataset completo da planilha
  const [selectedPeriod, setSelectedPeriod] = useState(null) // Período selecionado pelo usuário
  const [isProcessingAllRecords, setIsProcessingAllRecords] = useState(false) // Estado para processamento completo
  const [processingProgress, setProcessingProgress] = useState(0) // Progresso do processamento (0-100)
  const [totalRecordsToProcess, setTotalRecordsToProcess] = useState(0) // Total de registros para processar

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE_INITIAL = 'Base!A1:AC15000' // Aumentado para buscar mais dados dos últimos 60 dias
  const SHEET_RANGE_FULL = 'Base!A1:AC150000'
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const DOMINIO_PERMITIDO = '@velotax.com.br'
  
  // Estado para controle de período
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  
  // Dark List removida - todos os operadores são contabilizados normalmente

  // Verificar configuração
  useEffect(() => {
    if (!CLIENT_ID || CLIENT_ID === 'seu_client_id_aqui') {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env! Consulte GOOGLE_SSO_SETUP.md para instruções detalhadas.'])
    } else {
    }
  }, [CLIENT_ID])

  // Função para trocar código por tokens (sem useCallback para evitar dependências)
  const exchangeCodeForTokens = async (authCode) => {
    try {
      setIsLoading(true)
      
      const redirectUri = `${window.location.origin}/callback.html`
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
      
      
      if (!clientSecret || clientSecret === 'seu_client_secret_aqui') {
        throw new Error('Client Secret não configurado no arquivo .env')
      }
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Erro ao trocar código por token: ${errorData.error_description || errorData.error}`)
      }

      const tokenData = await response.json()

      // Obter informações do usuário do Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`)
      
      if (!userResponse.ok) {
        throw new Error('Erro ao obter informações do usuário')
      }
      
      const googleUserInfo = await userResponse.json()
      
      
      // Validar domínio do usuário
      if (!googleUserInfo.email || !googleUserInfo.email.endsWith(DOMINIO_PERMITIDO)) {
        throw new Error(`Acesso restrito ao domínio ${DOMINIO_PERMITIDO}. Seu email: ${googleUserInfo.email}`)
      }

      // Salvar dados do usuário
      const userInfo = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture
      }

      setUserData(userInfo)
      setIsAuthenticated(true)
      
      // Salvar no localStorage
      localStorage.setItem('veloinsights_user', JSON.stringify(userInfo))
      
      console.log('🎉 Login realizado com sucesso!')
      
      // Buscar dados automaticamente após login
      try {
        console.log('📊 Buscando dados automaticamente após login...')
        await fetchSheetData(tokenData.access_token)
        console.log('✅ Dados carregados com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao carregar dados após login:', error)
      }
      
    } catch (error) {
      console.error('❌ Erro ao trocar código por token:', error)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar código de autorização na URL e localStorage
  useEffect(() => {
    if (!CLIENT_ID || CLIENT_ID === 'seu_client_id_aqui') return

    // Verificar no query string
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error}`])
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authCode) {
      exchangeCodeForTokens(authCode)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Verificar localStorage
    const storedAuthCode = localStorage.getItem('google_auth_code')
    const storedAuthError = localStorage.getItem('google_auth_error')
    
    if (storedAuthCode) {
      console.log('🔄 Código de autorização encontrado no localStorage')
      exchangeCodeForTokens(storedAuthCode)
      localStorage.removeItem('google_auth_code')
    }
    
    if (storedAuthError) {
      console.error('❌ Erro de autorização:', storedAuthError)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${storedAuthError}`])
      localStorage.removeItem('google_auth_error')
    }
  }, [CLIENT_ID])

  // Verificar se já está logado
  useEffect(() => {
    const savedUser = localStorage.getItem('veloinsights_user')
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        if (userInfo.expiresAt > Date.now()) {
          setUserData(userInfo)
          setIsAuthenticated(true)
          console.log('✅ Usuário já logado')
          
          // NÃO carregar dados automaticamente - aguardar seleção de período
          console.log('📊 Aguardando seleção de período para carregar dados...')
        } else {
          localStorage.removeItem('veloinsights_user')
          console.log('⏰ Token expirado, removido do localStorage')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('veloinsights_user')
      }
    }
  }, [])

  // Função de login simplificada
  const signIn = async () => {
    try {
      if (!CLIENT_ID || CLIENT_ID === 'seu_client_id_aqui') {
        throw new Error('Client ID não configurado. Consulte GOOGLE_SSO_SETUP.md para instruções.')
      }

      const redirectUri = `${window.location.origin}/callback.html`
      const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly profile email'
      const responseType = 'code'
      
      // URL simplificada para evitar 2FA
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=online&` +
        `prompt=select_account`

      console.log('🔗 Redirecionando para Google OAuth...')
      console.log('📋 URL de autorização:', authUrl)
      window.location.href = authUrl
      
    } catch (error) {
      console.error('❌ Erro ao iniciar login:', error)
      setErrors(prev => [...prev, `❌ Erro de login: ${error.message}`])
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      setUserData(null)
      setIsAuthenticated(false)
      setData([])
      setMetrics({})
      setOperatorMetrics({})
      setRankings([])
      setOperators([])
      
      localStorage.removeItem('veloinsights_user')
      localStorage.removeItem('google_auth_code')
      localStorage.removeItem('google_auth_error')
      
      console.log('👋 Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
    }
  }

  // Função para carregar dados sob demanda (quando período é selecionado)
  const loadDataOnDemand = async (selectedPeriod = 'all') => {
    if (!userData?.accessToken) {
      console.error('❌ Usuário não autenticado')
      return
    }
    
    console.log(`📊 Carregando dados para período: ${selectedPeriod}`)
    setIsLoading(true)
    
    try {
      // Para operadores, carregar TODOS os registros históricos
      const loadDataFunction = userData.email?.includes('@velotax.com.br') 
        ? fetchFullDataset(userData.accessToken, selectedPeriod)
        : fetchSheetData(userData.accessToken, selectedPeriod)
      
      await loadDataFunction
      console.log('✅ Dados carregados com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para buscar todos os dados da planilha
  const fetchFullDataset = async (accessToken, selectedPeriod = 'all') => {
    try {
      setIsLoading(true)
      console.log('🔄 Buscando dataset completo da planilha...')
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        console.log(`✅ ${result.values.length} linhas obtidas do dataset completo`)
        
        // Armazenar dataset completo
        setFullDataset(result.values)
        
        // FILTRAGEM POR PERÍODO: aplicar filtro baseado no período selecionado
        console.log(`🔍 Chamando filterDataByPeriod com ${result.values.length} registros para período: ${selectedPeriod}`)
        const filteredData = filterDataByPeriod(result.values, selectedPeriod)
        
        console.log(`⚡ Processando ${filteredData.length - 1} registros filtrados por período: ${selectedPeriod}...`)
        
        // Processamento assíncrono com progresso
        const dadosProcessados = await processarDadosAssincrono(filteredData, true) // processAllRecords = true
        
        // Atualizar estados com dados processados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        
        // Validar metricasOperadores antes de usar Object.values()
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
            operator: op.operador,
            totalCalls: op.totalAtendimentos,
            avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
            avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
            avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
            avgPauseTime: 0,
            totalRecords: op.totalAtendimentos
          })))
        } else {
          console.warn('⚠️ metricasOperadores não está disponível, definindo como objeto vazio')
          setOperatorMetrics({})
        }
        setRankings(dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        })))
        setOperators(dadosProcessados.operadores)
        
        return dadosProcessados
      } else {
        throw new Error('Nenhum dado encontrado na planilha')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dataset completo:', error)
      setErrors(prev => [...prev, error.message])
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar TODOS OS REGISTROS com progresso
  const loadAllRecordsWithProgress = useCallback(async (accessToken) => {
    try {
      setIsProcessingAllRecords(true)
      setProcessingProgress(0)
      console.log('🚀 Iniciando carregamento de TODOS OS REGISTROS...')
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        console.log(`✅ ${result.values.length} linhas obtidas - TODOS OS REGISTROS (${result.values.length - 1} registros históricos)`)
        
        // Definir total de registros para processar (excluindo cabeçalho)
        setTotalRecordsToProcess(result.values.length - 1)
        
        // Processar TODOS os dados com progresso
        const dadosProcessados = await processarTodosOsDadosComProgresso(
          result.values,
          (progress, processed, total) => {
            setProcessingProgress(progress)
            console.log(`📊 Progresso: ${progress.toFixed(1)}% - ${processed.toLocaleString()} de ${total.toLocaleString()} registros`)
          }
        )
        
        // Atualizar estados com TODOS os dados processados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        
        // Validar metricasOperadores antes de usar Object.values()
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
            operator: op.operador,
            totalCalls: op.totalAtendimentos,
            avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
            avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
            avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
            avgPauseTime: 0,
            totalRecords: op.totalAtendimentos
          })))
        } else {
          console.warn('⚠️ metricasOperadores não está disponível, definindo como objeto vazio')
          setOperatorMetrics({})
        }
        setRankings(dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        })))
        setOperators(dadosProcessados.operadores)
        
        console.log(`🎉 TODOS OS REGISTROS carregados com sucesso!`)
        // console.log(`📊 Debug - Dados processados (TODOS): {dadosFiltrados: ${dadosProcessados.dadosFiltrados.length}, metricas: {...}, metricasOperadores: ${Object.keys(dadosProcessados.metricasOperadores).length}, rankings: ${dadosProcessados.rankings.length}, operadores: ${dadosProcessados.operadores.length}}`)
        
        return dadosProcessados
      } else {
        throw new Error('Nenhum dado encontrado na planilha')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar TODOS OS REGISTROS:', error)
      setErrors(prev => [...prev, `❌ Erro ao carregar todos os registros: ${error.message}`])
      throw error
    } finally {
      setIsProcessingAllRecords(false)
      setProcessingProgress(0)
    }
  }, [])

  // Função para filtrar dados por período (renomeada para evitar conflito)
  const filterDataByDateRange = (startDate, endDate) => {
    if (!fullDataset || fullDataset.length === 0) {
      console.warn('⚠️ Dataset completo não carregado')
      return []
    }

    // Converter datas para comparação - INCLUIR DIAS COMPLETOS
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0) // Início do dia (00:00:00)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Final do dia (23:59:59)

    let contadorValidos = 0
    let contadorInvalidos = 0
    let contadorForaPeriodo = 0
    let datasEncontradas = new Set()

    // Filtrar dados (assumindo que a coluna de data é a coluna 3 - índice 3)
    const dadosFiltrados = fullDataset.filter((row, index) => {
      if (index === 0) return false // Pular cabeçalho
      
      const dataStr = row[3] // Coluna de data
      if (!dataStr) {
        contadorInvalidos++
        return false
      }

      try {
        // Converter data brasileira (DD/MM/YYYY) para Date
        const [day, month, year] = dataStr.split('/')
        const dataRegistro = new Date(year, month - 1, day)
        
        // Adicionar data ao conjunto para debug
        datasEncontradas.add(dataStr)
        
        // Comparar apenas as datas (sem horário)
        const dataRegistroInicio = new Date(year, month - 1, day, 0, 0, 0, 0)
        const dataRegistroFim = new Date(year, month - 1, day, 23, 59, 59, 999)
        
        
        // Verificar se a data está dentro do período (incluindo os dias completos)
        if (dataRegistro >= start && dataRegistro <= end) {
          contadorValidos++
          return true
        } else {
          contadorForaPeriodo++
          return false
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', dataStr, error)
        contadorInvalidos++
        return false
      }
    })

    // console.log(`📊 Debug da filtragem:`)
    console.log(`  ✅ Registros válidos no período: ${contadorValidos}`)
    console.log(`  ❌ Registros inválidos: ${contadorInvalidos}`)
    console.log(`  📅 Registros fora do período: ${contadorForaPeriodo}`)
    console.log(`  📋 Total de datas únicas encontradas: ${datasEncontradas.size}`)
    console.log(`  📅 Primeiras 10 datas encontradas:`, Array.from(datasEncontradas).slice(0, 10))
    
    // Debug específico para encontrar o registro perdido
    if (contadorValidos !== 1228) {
      console.warn(`⚠️ Diferença encontrada: Esperado 1228, encontrado ${contadorValidos}`)
    }
    
    return dadosFiltrados
  }

  // Função para processar dados de um período específico
  const processPeriodData = async (startDate, endDate) => {
    try {
      setIsLoading(true)
      setSelectedPeriod({ startDate, endDate })
      
      const dadosFiltrados = filterDataByDateRange(startDate, endDate)
      
      if (dadosFiltrados.length === 0) {
        console.warn('⚠️ Nenhum dado encontrado para o período selecionado')
        // Limpar dados atuais
        setData([])
        setMetrics({})
        setOperatorMetrics([])
        setRankings([])
        setOperators([])
        return
      }

      // Processar dados do período (OTIMIZADO)
      console.log(`⚡ Processando ${dadosFiltrados.length} registros do período...`)
      const dadosProcessados = await processarDadosAssincrono(dadosFiltrados)
      
      // Converter metricasOperadores para o formato esperado pelo AgentAnalysis
      const operatorMetricsObj = {}
      if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
        Object.values(dadosProcessados.metricasOperadores).forEach(op => {
          // Filtrar apenas operadores com nomes válidos (excluir "Sem Operador", etc.)
          if (op.operador && 
              op.operador !== 'Sem Operador' && 
              !op.operador.toLowerCase().includes('sem operador') &&
              op.operador.trim().includes(' ') && // Deve ter pelo menos um espaço (nome completo)
              op.totalAtendimentos > 0) {
            
            operatorMetricsObj[op.operador] = {
              operator: op.operador,
              totalCalls: op.totalAtendimentos,
              avgDuration: parseFloat(op.tempoMedio?.toFixed(1) || 0),
              avgRatingAttendance: parseFloat(op.notaMediaAtendimento?.toFixed(1) || 0),
              avgRatingSolution: parseFloat(op.notaMediaSolucao?.toFixed(1) || 0),
              avgPauseTime: 0,
              totalRecords: op.totalAtendimentos,
              score: parseFloat(op.score?.toFixed(2) || 0)
            }
          }
        })
      } else {
        console.warn('⚠️ metricasOperadores não está disponível para processamento de período')
      }
      
      // Aplicar Dark List aos rankings
      const rankingsComDarkList = dadosProcessados.rankings.map(ranking => ({
        ...ranking,
        isExcluded: darkList.includes(ranking.operator)
      }))
      
      // Atualizar estados
      setData(dadosProcessados.dadosFiltrados)
      setMetrics(dadosProcessados.metricas)
      setOperatorMetrics(operatorMetricsObj)
      setRankings(rankingsComDarkList)
      setOperators(dadosProcessados.operadores)
      
      console.log(`📊 Dados do período processados: ${dadosProcessados.dadosFiltrados.length} registros`)
      
    } catch (error) {
      console.error('❌ Erro ao processar dados do período:', error)
      setErrors(prev => [...prev, error.message])
    } finally {
      setIsLoading(false)
    }
  }

  // Função para renovar token de acesso
  const refreshAccessToken = async () => {
    if (!userData?.refreshToken) {
      throw new Error('Refresh token não disponível')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        refresh_token: userData.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao renovar token')
    }

    const tokenData = await response.json()
    
    // Atualizar userData com novo token
    const updatedUserData = {
      ...userData,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    }
    
    setUserData(updatedUserData)
    localStorage.setItem('veloinsights_user', JSON.stringify(updatedUserData))
    
    console.log('✅ Token renovado com sucesso')
  }

  // Função para buscar dados dos últimos 60 dias
  const fetchLast60Days = async (accessToken) => {
    try {
      setIsLoading(true)
      console.log('🔄 Buscando dados dos últimos 60 dias...')
      
      // Verificar se o token está válido
      let tokenToUse = accessToken
      if (!tokenToUse && userData) {
        // Verificar se o token expirou
        if (userData.expiresAt && Date.now() > userData.expiresAt) {
          console.log('🔄 Token expirado, renovando...')
          await refreshAccessToken()
          tokenToUse = userData.accessToken
        } else {
          tokenToUse = userData.accessToken
        }
      }
      
      if (!tokenToUse) {
        throw new Error('Token de acesso não disponível')
      }
      
      // Usar range maior para garantir que temos dados dos últimos 60 dias
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${tokenToUse}`
      
      console.log('🔗 URL da API:', url.replace(tokenToUse, '***'))
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        console.log(`✅ ${result.values.length} linhas obtidas`)
        
        // Processar dados (já filtra os últimos 60 dias) - OTIMIZADO
        console.log(`⚡ Processando ${result.values.length} registros de forma otimizada...`)
        const dadosProcessados = await processarDadosAssincrono(result.values)
        
        // console.log('📊 Debug - Dados processados (últimos 60 dias):', {
        //   dadosFiltrados: dadosProcessados.dadosFiltrados.length,
        //   metricas: dadosProcessados.metricas,
        //   metricasOperadores: Object.keys(dadosProcessados.metricasOperadores).length,
        //   rankings: dadosProcessados.rankings.length,
        //   operadores: dadosProcessados.operadores.length
        // })
        
        // Converter metricasOperadores para o formato esperado pelo AgentAnalysis
        const operatorMetricsObj = {}
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          Object.values(dadosProcessados.metricasOperadores).forEach(op => {
            // Filtrar apenas operadores com nomes válidos (excluir apenas os realmente inválidos)
            if (op.operador && 
                op.operador !== 'Sem Operador' && 
                !op.operador.toLowerCase().includes('sem operador') &&
                !op.operador.toLowerCase().includes('desligado') &&
                !op.operador.toLowerCase().includes('excluído') &&
                !op.operador.toLowerCase().includes('inativo') &&
                op.totalAtendimentos > 0) {
              
              operatorMetricsObj[op.operador] = {
                operator: op.operador,
                totalCalls: op.totalAtendimentos,
                avgDuration: parseFloat(op.tempoMedio?.toFixed(1) || 0),
                avgRatingAttendance: parseFloat(op.notaMediaAtendimento?.toFixed(1) || 0),
                avgRatingSolution: parseFloat(op.notaMediaSolucao?.toFixed(1) || 0),
                avgPauseTime: 0,
                totalRecords: op.totalAtendimentos,
                score: parseFloat(op.score?.toFixed(2) || 0)
              }
            }
          })
        } else {
          console.warn('⚠️ metricasOperadores não está disponível para processamento completo')
        }
        
        
        // Aplicar Dark List aos rankings
        const rankingsComDarkList = dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        }))
        
        // Atualizar estados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        setOperatorMetrics(operatorMetricsObj)
        setRankings(rankingsComDarkList)
        setOperators(dadosProcessados.operadores)
        setErrors(dadosProcessados.erros || [])
        setFullDataset(result.values)
        
        console.log('✅ Dados dos últimos 60 dias carregados com sucesso!')
      } else {
        console.log('⚠️ Nenhum dado encontrado')
        setData([])
        setMetrics({})
        setOperatorMetrics({})
        setRankings([])
        setOperators([])
        setErrors(['Nenhum dado encontrado na planilha'])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      if (error.name === 'AbortError') {
        setErrors(['Timeout: A requisição demorou muito para responder. Tente novamente.'])
      } else {
        setErrors([`Erro ao carregar dados: ${error.message}`])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para buscar dados (simplificada) - CARREGAMENTO COMPLETO RESTAURADO
  const fetchSheetData = async (accessToken, mode = 'recent') => {
    // Para operadores (@velotax.com.br), buscar TODOS os dados históricos
    if (userData?.email?.includes('@velotax.com.br')) {
      console.log('🚀 Operador detectado - carregando TODOS os registros históricos...')
      return await fetchFullDataset(accessToken)
    }
    
    // Para outros usuários, buscar dados dos últimos 60 dias
    return await fetchLast60Days(accessToken)
  }

  return {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    isAuthenticated,
    userData,
    selectedPeriod,
    customDateRange,
    // Dark List removida - todos os operadores são contabilizados normalmente
    // Novos estados para processamento completo
    isProcessingAllRecords,
    processingProgress,
    totalRecordsToProcess,
    // Funções existentes
    fetchSheetData,
    fetchLast60Days,
    fetchFullDataset,
    processPeriodData,
    filterDataByPeriod,
    fetchDataByPeriod: fetchSheetData,
    filterDataByDateRange: filterDataByDateRange,
    // Nova função para carregar todos os registros
    loadAllRecordsWithProgress,
    // Nova função para carregar dados sob demanda
    loadDataOnDemand,
    setSelectedPeriod,
    setCustomDateRange,
    signIn,
    signOut,
    clearData: () => {
      setData([])
      setMetrics({})
      setOperatorMetrics({})
      setRankings([])
      setOperators([])
      setErrors([])
    }
    // Funções da Dark List removidas - todos os operadores são contabilizados normalmente
  }
}
