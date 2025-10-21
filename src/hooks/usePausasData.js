import { useState, useEffect, useCallback } from 'react'
import { useGoogleSheetsDirectSimple } from './useGoogleSheetsDirectSimple'

// Configuração da planilha de Pausas - usar a aba Pausas da planilha principal
const PAUSAS_CONFIG = {
  SPREADSHEET_ID: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA', // Mesma planilha principal
  RANGES: [
    'Pausas!A1:AB150000',  // Range completo da aba Pausas
    'Pausas!A:AB',         // Todas as linhas das colunas A até AB
    'Pausas!A1:AB1000',    // Range médio para teste
    'Pausas!A1:AB100',     // Range pequeno para teste
    'Pausas!A1:AB10'       // Teste básico para verificar se a aba existe
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
    if (!isAuthenticated || !userData) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Tentar diferentes ranges até encontrar um que funcione
      for (const range of PAUSAS_CONFIG.RANGES) {
        try {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${PAUSAS_CONFIG.SPREADSHEET_ID}/values/${range}`
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${userData.accessToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const result = await response.json()
            const values = result.values || []
            
            if (values.length > 0) {
              setPausasData(values)
              setIsLoading(false)
              return
            }
          }
        } catch (rangeError) {
          // Continuar para o próximo range
        }
      }
      
      throw new Error('Nenhum range funcionou para carregar dados de pausas')
      
    } catch (error) {
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
