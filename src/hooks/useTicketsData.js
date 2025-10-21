import { useState, useEffect, useCallback } from 'react'
import { useGoogleSheetsDirectSimple } from './useGoogleSheetsDirectSimple'
import { fetchGoogleSheets } from '../utils/apiRateLimiter'

// Configuração da planilha de Tickets (Telefonia)
const TICKETS_CONFIG = {
  SPREADSHEET_ID: '1QkDmUTGAQQ7uF4ZBnHHcdrCyvjN76I_TN-RwTgvyn0o',
  SHEET_NAMES: ['Tickets', 'tickets', 'TICKETS', 'Página1', 'Sheet1'], // Diferentes nomes possíveis
  RANGES: [
    'A1:B1000',    // Range médio para teste - começar com range menor
    'A1:B100',     // Range pequeno para teste
    'A1:B10',      // Teste básico
    'A1:B150000',  // Range específico das colunas A e B - só se os menores falharem
    'A:B'          // Todas as linhas das colunas A e B - último recurso
  ]
}

// Cache simples para evitar múltiplas chamadas
let ticketsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos


export const useTicketsData = (filters = {}) => {
  // Usar o mesmo hook do sistema principal para obter userData e isAuthenticated
  const { userData, isAuthenticated } = useGoogleSheetsDirectSimple()
  
  const [ticketsData, setTicketsData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função para buscar dados da planilha de Tickets
  const fetchTicketsData = useCallback(async () => {
    if (!userData?.accessToken) {
      console.error('❌ Access token não disponível para buscar dados de tickets')
      return
    }

    // Verificar cache primeiro
    const now = Date.now()
    if (ticketsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📋 Usando dados em cache para tickets')
      setTicketsData(ticketsCache)
      return ticketsCache
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando dados da aba Tickets...')
      console.log('🔍 Spreadsheet ID:', TICKETS_CONFIG.SPREADSHEET_ID)
      console.log('🔍 Ranges disponíveis:', TICKETS_CONFIG.RANGES)
      
      // Tentar diferentes nomes de aba e ranges até encontrar dados
      for (const sheetName of TICKETS_CONFIG.SHEET_NAMES) {
        console.log(`🔍 Tentando aba: ${sheetName}`)
        
        for (const range of TICKETS_CONFIG.RANGES) {
          try {
            const fullRange = `${sheetName}!${range}`
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${TICKETS_CONFIG.SPREADSHEET_ID}/values/${fullRange}?access_token=${userData.accessToken}`
            
            console.log(`🔗 Tentando: ${fullRange}`)
            
            // Usar rate limiter global
            const response = await fetchGoogleSheets(url)
            const result = await response.json()
            
            if (result.values && result.values.length > 0) {
              console.log(`✅ Dados encontrados em: ${fullRange}`)
              console.log(`📊 Total de linhas: ${result.values.length}`)
              console.log(`📋 Primeiras linhas:`, result.values.slice(0, 5))
              
              // Armazenar no cache
              ticketsCache = result.values
              cacheTimestamp = Date.now()
              
              setTicketsData(result.values)
              return result.values
            }
          } catch (rangeError) {
            console.warn(`⚠️ Erro em ${sheetName}!${range}:`, rangeError.message)
            continue
          }
        }
      }
      
      // Se chegou aqui, nenhum range funcionou
      throw new Error('Nenhum range da aba Tickets retornou dados válidos')
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados de tickets:', error)
      setError(error.message)
      setTicketsData([])
    } finally {
      setIsLoading(false)
    }
  }, [userData?.accessToken])

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && userData?.accessToken) {
      fetchTicketsData()
    }
  }, [isAuthenticated, userData?.accessToken, fetchTicketsData])

  // Função para processar dados de filas da coluna B
  const processQueueData = useCallback((data) => {
    if (!data || data.length === 0) {
      console.log('⚠️ processQueueData: Sem dados para processar')
      return {
        queueCounts: {},
        totalTickets: 0,
        processedRows: 0
      }
    }

    console.log('🔍 processQueueData: Processando dados de tickets:', {
      totalRows: data.length,
      firstRow: data[0],
      sampleRows: data.slice(0, 3)
    })

    const queueCounts = {}
    let processedRows = 0

    // Processar dados a partir da linha 2 (pular cabeçalho)
    data.slice(1).forEach((row, index) => {
      if (Array.isArray(row) && row.length >= 2) {
        const ticketId = row[0] // Coluna A - ID do ticket
        const queueName = row[1] // Coluna B - Nome da fila
        
        if (queueName && queueName.trim() !== '') {
          const normalizedQueue = queueName.trim()
          
          // Excluir filas de cobrança
          if (!normalizedQueue.toLowerCase().includes('cobrança') && 
              !normalizedQueue.toLowerCase().includes('cobranca')) {
            
            queueCounts[normalizedQueue] = (queueCounts[normalizedQueue] || 0) + 1
            processedRows++
            
            // Log das primeiras filas encontradas
            if (processedRows <= 10) {
              console.log(`✅ Ticket ${ticketId} - Fila: ${normalizedQueue}`)
            }
          } else {
            console.log(`🚫 Filtrando fila de cobrança: ${normalizedQueue}`)
          }
        }
      }
    })

    console.log('📊 Resumo do processamento de filas:', {
      processedRows,
      totalQueues: Object.keys(queueCounts).length,
      queueCounts
    })

    return {
      queueCounts,
      totalTickets: processedRows,
      processedRows
    }
  }, [])

  return {
    ticketsData,
    isLoading,
    error,
    fetchTicketsData,
    processQueueData,
    isAuthenticated
  }
}
