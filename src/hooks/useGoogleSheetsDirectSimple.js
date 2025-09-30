import { useState, useEffect, useCallback } from 'react'

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

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE_INITIAL = 'Base!A1:AC5000'
  const SHEET_RANGE_FULL = 'Base!A1:AC150000'
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const DOMINIO_PERMITIDO = '@velotax.com.br'
  
  // Estado para controle de período
  const [selectedPeriod, setSelectedPeriod] = useState('recent')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  
  // Estado para Dark List
  const [darkList, setDarkList] = useState([])

  // Carregar Dark List do localStorage
  useEffect(() => {
    const savedDarkList = localStorage.getItem('veloinsights_darklist')
    if (savedDarkList) {
      try {
        const parsed = JSON.parse(savedDarkList)
        setDarkList(parsed)
        console.log('📋 Dark List carregada:', parsed.length, 'operadores excluídos')
      } catch (error) {
        console.error('❌ Erro ao carregar Dark List:', error)
        setDarkList([])
      }
    } else {
      const initialDarkList = ['Evelin Medrado']
      setDarkList(initialDarkList)
      localStorage.setItem('veloinsights_darklist', JSON.stringify(initialDarkList))
      console.log('📋 Dark List inicial criada com Evelin Medrado')
    }
  }, [])

  // Verificar configuração
  useEffect(() => {
    if (!CLIENT_ID || CLIENT_ID === 'seu_client_id_aqui') {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env!'])
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

      // Salvar dados do usuário
      const userInfo = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        email: 'usuario@velotax.com.br' // Será obtido do token
      }

      setUserData(userInfo)
      setIsAuthenticated(true)
      
      // Salvar no localStorage
      localStorage.setItem('veloinsights_user', JSON.stringify(userInfo))
      
      console.log('🎉 Login realizado com sucesso!')
      
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
        throw new Error('Client ID não configurado')
      }

      const redirectUri = `${window.location.origin}/callback.html`
      const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly profile email'
      const responseType = 'code'
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `hd=${DOMINIO_PERMITIDO}`

      console.log('🔗 Redirecionando para Google OAuth...')
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

  // Função para buscar dados (simplificada)
  const fetchSheetData = async (accessToken, mode = 'recent') => {
    try {
      setIsLoading(true)
      console.log(`🔄 Buscando dados (modo: ${mode})...`)
      
      const range = mode === 'recent' ? SHEET_RANGE_INITIAL : SHEET_RANGE_FULL
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        console.log(`✅ ${result.values.length} linhas obtidas`)
        setData(result.values)
        return result.values
      } else {
        console.log('⚠️ Nenhum dado encontrado')
        setData([])
        return []
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error)
      setErrors(prev => [...prev, `❌ Erro ao buscar dados: ${error.message}`])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Função para limpar dados
  const clearData = () => {
    setData([])
    setMetrics({})
    setOperatorMetrics({})
    setRankings([])
    setOperators([])
    setErrors([])
  }

  // Funções para Dark List
  const addToDarkList = (operator) => {
    const newDarkList = [...darkList, operator]
    setDarkList(newDarkList)
    localStorage.setItem('veloinsights_darklist', JSON.stringify(newDarkList))
  }

  const removeFromDarkList = (operator) => {
    const newDarkList = darkList.filter(op => op !== operator)
    setDarkList(newDarkList)
    localStorage.setItem('veloinsights_darklist', JSON.stringify(newDarkList))
  }

  const clearDarkList = () => {
    setDarkList([])
    localStorage.removeItem('veloinsights_darklist')
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
    darkList,
    fetchSheetData,
    fetchDataByPeriod: fetchSheetData,
    filterDataByDateRange: () => data,
    setSelectedPeriod,
    setCustomDateRange,
    signIn,
    signOut,
    clearData,
    addToDarkList,
    removeFromDarkList,
    clearDarkList
  }
}
