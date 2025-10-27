// apiRateLimiter.js - Sistema de controle de taxa para APIs

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  // Verificar se a requisição pode ser feita
  canMakeRequest(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Obter histórico de requisições para esta chave
    let keyRequests = this.requests.get(key) || []
    
    // Filtrar requisições dentro da janela de tempo
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart)
    
    // Verificar se ainda há espaço para mais requisições
    if (keyRequests.length < this.maxRequests) {
      // Adicionar esta requisição ao histórico
      keyRequests.push(now)
      this.requests.set(key, keyRequests)
      return true
    }
    
    return false
  }

  // Obter tempo até a próxima requisição permitida
  getTimeUntilNextRequest(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    let keyRequests = this.requests.get(key) || []
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart)
    
    if (keyRequests.length < this.maxRequests) {
      return 0
    }
    
    // Retornar tempo até a requisição mais antiga expirar
    const oldestRequest = Math.min(...keyRequests)
    return oldestRequest + this.windowMs - now
  }

  // Limpar histórico de requisições
  clear(key = null) {
    if (key) {
      this.requests.delete(key)
    } else {
      this.requests.clear()
    }
  }

  // Obter estatísticas
  getStats(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    let keyRequests = this.requests.get(key) || []
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart)
    
    return {
      requestsInWindow: keyRequests.length,
      maxRequests: this.maxRequests,
      remainingRequests: Math.max(0, this.maxRequests - keyRequests.length),
      windowMs: this.windowMs,
      resetTime: keyRequests.length > 0 ? Math.min(...keyRequests) + this.windowMs : now
    }
  }
}

// Instância global do rate limiter
const globalRateLimiter = new RateLimiter(100, 60000) // 100 requests por minuto

// Função para fazer requisição com rate limiting
export const makeRateLimitedRequest = async (requestFn, key = 'default', retryDelay = 1000) => {
  if (!globalRateLimiter.canMakeRequest(key)) {
    const waitTime = globalRateLimiter.getTimeUntilNextRequest(key)
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`)
  }
  
  try {
    return await requestFn()
  } catch (error) {
    // Se for erro de rate limit da API, aguardar e tentar novamente
    if (error.message.includes('rate limit') || error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return makeRateLimitedRequest(requestFn, key, retryDelay * 2)
    }
    throw error
  }
}

// Função específica para requisições do Google Sheets com rate limiting
export const fetchGoogleSheets = async (url, options = {}) => {
  const requestFn = async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Acesso negado. Verifique as permissões da planilha.')
      } else if (response.status === 429) {
        throw new Error('Rate limit excedido. Aguarde um momento e tente novamente.')
      } else if (response.status === 404) {
        throw new Error('Planilha não encontrada. Verifique o ID da planilha.')
      }
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
    }

    return response
  }

  return makeRateLimitedRequest(requestFn, 'google-sheets', 2000)
}

// Hook para usar rate limiting em componentes React
export const useRateLimiter = (maxRequests = 100, windowMs = 60000) => {
  const rateLimiter = new RateLimiter(maxRequests, windowMs)
  
  const canMakeRequest = (key = 'default') => rateLimiter.canMakeRequest(key)
  const getTimeUntilNextRequest = (key = 'default') => rateLimiter.getTimeUntilNextRequest(key)
  const getStats = (key = 'default') => rateLimiter.getStats(key)
  const clear = (key = null) => rateLimiter.clear(key)
  
  return {
    canMakeRequest,
    getTimeUntilNextRequest,
    getStats,
    clear
  }
}

export default globalRateLimiter
