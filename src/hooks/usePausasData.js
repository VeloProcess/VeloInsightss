import { useState, useEffect, useCallback } from 'react'
import { useGoogleSheetsDirectSimple } from './useGoogleSheetsDirectSimple'

// Configuração da planilha de Pausas - usar a aba resumo da nova planilha
const PAUSAS_CONFIG = {
  SPREADSHEET_ID: '1rMMUvPXwg8R9a1VglHse75QLu8tVj7kAFLdHCDlEvR8', // Nova planilha de pausas
  RANGES: [
    'resumo!A1:G150000',  // Range completo da aba resumo (colunas A-G)
    'resumo!A:G',         // Todas as linhas das colunas A até G
    'resumo!A1:G1000',    // Range médio para teste
    'resumo!A1:G100',     // Range pequeno para teste
    'resumo!A1:G10'       // Teste básico para verificar se a aba existe
  ]
}

export const usePausasData = (filters = {}) => {
  // Usar o mesmo hook do sistema principal para obter userData e isAuthenticated
  const { userData, isAuthenticated } = useGoogleSheetsDirectSimple()
  
  const [pausasData, setPausasData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Função para carregar dados da planilha de pausas
  const loadPausasData = useCallback(async () => {
    console.log('[usePausasData] Iniciando carregamento de dados de pausas')
    console.log('[usePausasData] isAuthenticated:', isAuthenticated)
    console.log('[usePausasData] userData:', userData ? 'presente' : 'ausente')
    
    if (!isAuthenticated || !userData) {
      console.log('[usePausasData] Autenticação não disponível, abortando carregamento')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[usePausasData] Tentando carregar da planilha:', PAUSAS_CONFIG.SPREADSHEET_ID)
      
      // Tentar diferentes ranges até encontrar um que funcione
      for (const range of PAUSAS_CONFIG.RANGES) {
        try {
          console.log('[usePausasData] Tentando range:', range)
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${PAUSAS_CONFIG.SPREADSHEET_ID}/values/${range}`
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${userData.accessToken}`,
              'Content-Type': 'application/json'
            }
          })

          console.log('[usePausasData] Response status:', response.status)

          if (response.ok) {
            const result = await response.json()
            const values = result.values || []
            
            console.log('[usePausasData] Dados recebidos - Total de linhas:', values.length)
            if (values.length > 0) {
              console.log('[usePausasData] Primeira linha (cabeçalho):', values[0])
              console.log('[usePausasData] Segunda linha (exemplo):', values[1])
              console.log('[usePausasData] Terceira linha (exemplo):', values[2])
            }
            
            if (values.length > 0) {
              setPausasData(values)
              setIsLoading(false)
              console.log('[usePausasData] ✅ Dados carregados com sucesso!')
              return
            }
          } else {
            const errorText = await response.text()
            console.log('[usePausasData] ❌ Erro na resposta:', response.status, errorText.substring(0, 200))
          }
        } catch (rangeError) {
          console.log('[usePausasData] ❌ Erro ao tentar range', range, ':', rangeError.message)
          // Continuar para o próximo range
        }
      }
      
      throw new Error('Nenhum range funcionou para carregar dados de pausas')
      
    } catch (error) {
      console.error('[usePausasData] ❌ Erro geral:', error)
      setError(error.message)
      setPausasData([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, userData])

  // Carregar dados quando autenticação estiver pronta
  useEffect(() => {
    if (isAuthenticated && userData) {
      loadPausasData()
    }
  }, [isAuthenticated, userData, loadPausasData])

  // Função para recarregar dados manualmente
  const refreshPausasData = useCallback(() => {
    loadPausasData()
  }, [loadPausasData])

  return {
    pausasData,
    isLoading,
    error,
    refreshPausasData,
    isAuthenticated
  }
}

export default usePausasData
