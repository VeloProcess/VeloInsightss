import { useState, useEffect, useCallback } from 'react'

export const useDataCache = () => {
  const [cache, setCache] = useState(new Map())
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  })

  // Função para obter dados do cache
  const getFromCache = useCallback((key) => {
    const cached = cache.get(key)
    if (cached) {
      // Verificar se o cache não expirou
      if (Date.now() - cached.timestamp < cached.ttl) {
        setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }))
        return cached.data
      } else {
        // Cache expirado, remover
        cache.delete(key)
        setCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(key)
          return newCache
        })
      }
    }
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }))
    return null
  }, [cache])

  // Função para salvar dados no cache
  const setCacheData = useCallback((key, data, ttl = 300000) => { // 5 minutos por padrão
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    }
    
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(key, cacheEntry)
      return newCache
    })
    
    setCacheStats(prev => ({ ...prev, size: cache.size + 1 }))
  }, [cache.size])

  // Função para limpar cache
  const clearCache = useCallback(() => {
    setCache(new Map())
    setCacheStats({ hits: 0, misses: 0, size: 0 })
  }, [])

  // Função para remover item específico do cache
  const removeFromCache = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setCacheStats(prev => ({ ...prev, size: Math.max(0, prev.size - 1) }))
  }, [])

  // Limpeza automática de cache expirado
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCache(prev => {
        const newCache = new Map()
        let removedCount = 0
        
        prev.forEach((value, key) => {
          if (now - value.timestamp < value.ttl) {
            newCache.set(key, value)
          } else {
            removedCount++
          }
        })
        
        if (removedCount > 0) {
          setCacheStats(stats => ({ 
            ...stats, 
            size: Math.max(0, stats.size - removedCount) 
          }))
        }
        
        return newCache
      })
    }, 60000) // Verificar a cada minuto

    return () => clearInterval(interval)
  }, [])

  return {
    getFromCache,
    setCacheData,
    clearCache,
    removeFromCache,
    cacheStats,
    cacheSize: cache.size
  }
}
