import { useState, useMemo, useCallback } from 'react'
import { useDataCache } from './useDataCache'

export const useDataFilters = (data) => {
  const [filters, setFilters] = useState({
    period: 'last30days',
    operator: '',
    dateRange: {},
    minCalls: '',
    minRating: '',
    minDuration: '',
    maxDuration: ''
  })

  const {
    getCachedFilteredData,
    setCachedFilteredData,
    generateDataHash,
    generateFiltersHash,
    debounce
  } = useDataCache()

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Gerar hashes para cache
    const dataHash = generateDataHash(data)
    const filtersHash = generateFiltersHash(filters)

    // Tentar buscar dados filtrados do cache
    const cachedData = getCachedFilteredData(dataHash, filtersHash)
    if (cachedData) {
      return cachedData.data
    }
    let filtered = [...data]

    // Filtrar por operador
    if (filters.operator) {
      filtered = filtered.filter(record => record.operator === filters.operator)
    }

           // Filtrar por período
           if (filters.period !== 'custom' && filters.period !== 'all') {
             const today = new Date()
             let startDate = new Date()

             switch (filters.period) {
               case 'last7days':
                 startDate.setDate(today.getDate() - 7)
                 break
               case 'last30days':
                 startDate.setDate(today.getDate() - 30)
                 break
               case 'last3months':
                 startDate.setMonth(today.getMonth() - 3)
                 break
               default:
                 startDate = null
             }

             if (startDate) {
               filtered = filtered.filter(record => {
                 if (!record.date) return false
                 const recordDate = new Date(record.date)
                 return recordDate >= startDate && recordDate <= today
               })
             }
           } else if (filters.dateRange.start && filters.dateRange.end) {
             // Filtro personalizado por data
             const startDate = new Date(filters.dateRange.start)
             const endDate = new Date(filters.dateRange.end)
             
             filtered = filtered.filter(record => {
               if (!record.date) return false
               const recordDate = new Date(record.date)
               return recordDate >= startDate && recordDate <= endDate
             })
           }

           // Filtrar por número mínimo de chamadas
           if (filters.minCalls) {
             const minCalls = parseInt(filters.minCalls)
             filtered = filtered.filter(record => (record.call_count || 0) >= minCalls)
           }

           // Filtrar por avaliação mínima
           if (filters.minRating) {
             const minRating = parseFloat(filters.minRating)
             filtered = filtered.filter(record => 
               record.rating_attendance && record.rating_attendance >= minRating
             )
           }

           // Filtrar por duração mínima
           if (filters.minDuration) {
             const minDuration = parseFloat(filters.minDuration)
             filtered = filtered.filter(record => (record.duration_minutes || 0) >= minDuration)
           }

           // Filtrar por duração máxima
           if (filters.maxDuration) {
             const maxDuration = parseFloat(filters.maxDuration)
             filtered = filtered.filter(record => (record.duration_minutes || 0) <= maxDuration)
           }

    // Salvar no cache
    setCachedFilteredData(dataHash, filtersHash, filtered)
    console.log('✅ useDataFilters - dados filtrados finais:', filtered.length)
    return filtered
  }, [data, filters, generateDataHash, generateFiltersHash, getCachedFilteredData, setCachedFilteredData])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  return {
    filters,
    filteredData,
    handleFiltersChange
  }
}
