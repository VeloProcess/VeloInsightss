// Utilitário para controle de rate limiting da API do Google Sheets
class APIRateLimiter {
  constructor() {
    this.requestQueue = []
    this.isProcessing = false
    this.lastRequestTime = 0
    this.minInterval = 500 // 500ms entre requisições
  }

  // Adicionar requisição à fila
  async addRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      })
      
      this.processQueue()
    })
  }

  // Processar fila de requisições
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      
      try {
        // Aguardar intervalo mínimo entre requisições
        const timeSinceLastRequest = Date.now() - this.lastRequestTime
        if (timeSinceLastRequest < this.minInterval) {
          await new Promise(resolve => 
            setTimeout(resolve, this.minInterval - timeSinceLastRequest)
          )
        }

        // Executar requisição com retry
        const result = await this.executeWithRetry(request.requestFn)
        request.resolve(result)
        
        this.lastRequestTime = Date.now()
      } catch (error) {
        request.reject(error)
      }
    }

    this.isProcessing = false
  }

  // Executar requisição com retry e backoff exponencial
  async executeWithRetry(requestFn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await requestFn()
        
        if (response.status === 429) {
          // Rate limit atingido
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
          console.log(`⏳ Rate limit atingido. Tentativa ${attempt + 1}/${maxRetries}. Aguardando ${Math.round(delay)}ms...`)
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          } else {
            throw new Error(`Rate limit persistente após ${maxRetries} tentativas`)
          }
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return response
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error
        }
        
        const delay = baseDelay * (attempt + 1)
        console.log(`⚠️ Erro na tentativa ${attempt + 1}/${maxRetries}: ${error.message}. Aguardando ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Limpar fila (útil para resetar em caso de erro)
  clearQueue() {
    this.requestQueue.forEach(request => {
      request.reject(new Error('Fila de requisições limpa'))
    })
    this.requestQueue = []
    this.isProcessing = false
  }

  // Obter estatísticas da fila
  getQueueStats() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      lastRequestTime: this.lastRequestTime,
      timeSinceLastRequest: Date.now() - this.lastRequestTime
    }
  }
}

// Instância global do rate limiter
export const apiRateLimiter = new APIRateLimiter()

// Função helper para fazer requisições com rate limiting
export const fetchWithRateLimit = async (url, options = {}) => {
  return apiRateLimiter.addRequest(() => fetch(url, options))
}

// Função helper específica para Google Sheets API
export const fetchGoogleSheets = async (url) => {
  return apiRateLimiter.addRequest(() => fetch(url))
}
