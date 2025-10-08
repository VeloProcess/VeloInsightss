import { useState, useEffect, useCallback } from 'react'
import { processarDados } from '../utils/dataProcessor'

// Função para processamento assíncrono otimizado
const processarDadosAssincrono = async (dados, processAllRecords = false) => {
  return new Promise((resolve) => {
    // Mostrar progresso no console
    console.log(`⚡ Iniciando processamento de ${dados.length} registros...`)
    
    // Usar setTimeout para não bloquear a UI
    setTimeout(() => {
      const startTime = performance.now()
      const resultado = processarDados(dados, processAllRecords)
      const endTime = performance.now()
      
      console.log(`✅ Processamento concluído em ${(endTime - startTime).toFixed(2)}ms`)
      resolve(resultado)
    }, 0)
  })
}

// Função para processamento completo com progresso
const processarTodosOsDadosComProgresso = async (dados, onProgress) => {
  return new Promise((resolve) => {
    console.log(`🚀 Iniciando processamento completo de ${dados.length - 1} registros históricos...`)
    
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
          console.log(`📊 Processando dados finais...`)
          const startTime = performance.now()
          const resultado = processarDados(dados, true) // processAllRecords = true
          const endTime = performance.now()
          
          console.log(`✅ Processamento completo concluído em ${(endTime - startTime).toFixed(2)}ms`)
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
      console.log('✅ Client ID configurado:', CLIENT_ID)
    }
  }, [CLIENT_ID])

  // Função para trocar código por tokens (sem useCallback para evitar dependências)
  const exchangeCodeForTokens = async (authCode) => {
    try {
      setIsLoading(true)
      
      const redirectUri = `${window.location.origin}/callback.html`
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
      
      console.log('🔑 Client Secret configurado:', clientSecret ? 'SIM' : 'NÃO')
      
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
      console.log('✅ Token obtido com sucesso')

      // Obter informações do usuário do Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`)
      
      if (!userResponse.ok) {
        throw new Error('Erro ao obter informações do usuário')
      }
      
      const googleUserInfo = await userResponse.json()
      
      console.log('👤 Informações do usuário:', googleUserInfo)
      
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
          
          // Carregar dados automaticamente para usuário já logado
          console.log('📊 Carregando dados para usuário já logado...')
          setIsLoading(true)
          
          // Para operadores, carregar TODOS os registros históricos
          const loadDataFunction = userInfo.email?.includes('@velotax.com.br') 
            ? fetchFullDataset(userInfo.accessToken)
            : fetchSheetData(userInfo.accessToken)
          
          loadDataFunction
            .then(() => {
              console.log('✅ Dados carregados com sucesso para usuário já logado!')
            })
            .catch(error => {
              console.error('❌ Erro ao carregar dados para usuário já logado:', error)
            })
            .finally(() => {
              setIsLoading(false)
            })
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

  // Função para buscar todos os dados da planilha
  const fetchFullDataset = async (accessToken) => {
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
        
        // Processar TODOS os dados históricos (não apenas os últimos 2000)
        console.log(`⚡ Processando TODOS os ${result.values.length} registros históricos...`)
        
        // Processamento assíncrono com progresso
        const dadosProcessados = await processarDadosAssincrono(result.values, true) // processAllRecords = true
        
        // Atualizar estados com dados processados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
          operator: op.operador,
          totalCalls: op.totalAtendimentos,
          avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
          avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
          avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
          avgPauseTime: 0,
          totalRecords: op.totalAtendimentos
        })))
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
      setError(error.message)
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
        setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
          operator: op.operador,
          totalCalls: op.totalAtendimentos,
          avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
          avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
          avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
          avgPauseTime: 0,
          totalRecords: op.totalAtendimentos
        })))
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

  // Função para filtrar dados por período
  const filterDataByPeriod = (startDate, endDate) => {
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
      
      const dadosFiltrados = filterDataByPeriod(startDate, endDate)
      
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
      setError(error.message)
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

  // Função para buscar dados (simplificada) - agora busca todos os dados por padrão para operadores
  const fetchSheetData = async (accessToken, mode = 'recent') => {
    // Para operadores (@velotax.com.br), buscar todos os dados históricos
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
    filterDataByDateRange: () => data,
    // Nova função para carregar todos os registros
    loadAllRecordsWithProgress,
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
