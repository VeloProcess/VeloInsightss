// Velodados - Parser para Arquivos Grandes
// Gerencia processamento de arquivos grandes usando Web Workers e streaming

class LargeFileParser {
  constructor() {
    this.worker = null;
    this.isProcessing = false;
    this.isCancelled = false;
    this.progressCallback = null;
    this.chunkCallback = null;
    this.completeCallback = null;
    this.errorCallback = null;
    
    this.MAX_CLIENT_SIZE = 50 * 1024 * 1024; // 50MB
    this.allRows = [];
    this.allErrors = [];
  }
  
  /**
   * Inicializa o Web Worker
   */
  initWorker() {
    if (this.worker) {
      this.worker.terminate();
    }
    
    this.worker = new Worker('js/file-processor-worker.js');
    
    this.worker.onmessage = (e) => {
      const { type, data } = e.data;
      
      switch (type) {
        case 'ready':
          console.log('✅ Web Worker pronto para processamento');
          break;
          
        case 'progress':
          this.handleProgress(data);
          break;
          
        case 'chunk_ready':
          this.handleChunk(data);
          break;
          
        case 'complete':
          this.handleComplete(data);
          break;
          
        case 'error':
          this.handleError(data);
          break;
          
        case 'cancelled':
          this.handleCancelled(data);
          break;
      }
    };
    
    this.worker.onerror = (error) => {
      console.error('❌ Erro no Web Worker:', error);
      this.handleError({
        message: 'Erro no Web Worker: ' + error.message,
        error: error
      });
    };
  }
  
  /**
   * Processa um arquivo grande
   * @param {File} file - Arquivo para processar
   * @param {Object} callbacks - Callbacks para progresso, chunks, etc.
   */
  async processFile(file, callbacks = {}) {
    this.progressCallback = callbacks.onProgress;
    this.chunkCallback = callbacks.onChunk;
    this.completeCallback = callbacks.onComplete;
    this.errorCallback = callbacks.onError;
    
    // Verificar tamanho do arquivo
    const fileSize = file.size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    console.log(`📁 Processando arquivo: ${file.name} (${fileSizeMB}MB)`);
    
    // Se arquivo for muito grande, usar backend
    if (fileSize > this.MAX_CLIENT_SIZE) {
      console.log('📤 Arquivo muito grande, enviando para backend...');
      return this.processLargeFileOnServer(file, callbacks);
    }
    
    // Processar no cliente
    this.isProcessing = true;
    this.isCancelled = false;
    this.allRows = [];
    this.allErrors = [];
    
    try {
      // Inicializar worker se necessário
      if (!this.worker) {
        this.initWorker();
      }
      
      // Determinar tipo de arquivo
      const fileType = this.getFileType(file);
      if (!fileType) {
        throw new Error('Tipo de arquivo não suportado. Use CSV ou Excel.');
      }
      
      // Se for Excel, processar no thread principal
      if (fileType === 'excel') {
        await this.processExcelInMainThread(file);
        return;
      }
      
      // Para CSV, usar Web Worker
      if (fileType === 'csv') {
        // Ler conteúdo do arquivo
        const content = await this.readFileContent(file, fileType);
        
        // Iniciar processamento no worker
        this.worker.postMessage({
          type: 'start_processing',
          data: {
            fileType: 'csv', // Forçar CSV
            content: content
          }
        });
      } else {
        throw new Error('Tipo de arquivo não suportado. Use CSV ou Excel.');
      }
      
    } catch (error) {
      this.handleError({
        message: `Erro ao processar arquivo: ${error.message}`,
        error: error
      });
    }
  }
  
  /**
   * Processa arquivo grande no servidor
   * @param {File} file - Arquivo para processar
   * @param {Object} callbacks - Callbacks
   */
  async processLargeFileOnServer(file, callbacks) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Enviar arquivo para o servidor
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Processar dados no servidor
        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: result.filename
          })
        });
        
        if (!processResponse.ok) {
          throw new Error(`Erro ao processar dados: ${processResponse.statusText}`);
        }
        
        const processResult = await processResponse.json();
        
        if (callbacks.onComplete) {
          callbacks.onComplete({
            rows: processResult.data.rows || [],
            errors: processResult.data.errors || [],
            totalRows: processResult.data.totalRows || 0,
            processedOnServer: true
          });
        }
        
      } else {
        throw new Error(result.error || 'Erro desconhecido no servidor');
      }
      
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError({
          message: `Erro ao processar no servidor: ${error.message}`,
          error: error
        });
      }
    }
  }
  
  /**
   * Determina o tipo de arquivo
   * @param {File} file - Arquivo
   * @returns {string|null} - Tipo do arquivo
   */
  getFileType(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return 'csv';
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel';
    }
    
    return null;
  }
  
  /**
   * Lê o conteúdo do arquivo
   * @param {File} file - Arquivo
   * @param {string} fileType - Tipo do arquivo
   * @returns {Promise} - Conteúdo do arquivo
   */
  readFileContent(file, fileType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      if (fileType === 'excel') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    });
  }
  
  /**
   * Processa arquivo Excel no thread principal
   * @param {File} file - Arquivo Excel
   */
  async processExcelInMainThread(file) {
    try {
      console.log('🔍 Processando Excel no thread principal...');
      
      // Verificar tamanho do arquivo
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`📏 Tamanho do arquivo: ${fileSizeMB.toFixed(2)}MB`);
      
      if (fileSizeMB > 50) {
        throw new Error(`Arquivo muito grande (${fileSizeMB.toFixed(2)}MB). Máximo suportado: 50MB. Tente dividir o arquivo em partes menores.`);
      }
      
      // Verificar se XLSX está disponível
      if (typeof XLSX === 'undefined') {
        console.error('❌ XLSX não está definido!');
        throw new Error('Biblioteca XLSX não carregada. Recarregue a página.');
      }
      
      console.log('✅ XLSX está disponível');
      
      // Ler arquivo
      const arrayBuffer = await this.readFileContent(file, 'excel');
      
      // Processar com XLSX com configurações otimizadas
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter com configurações otimizadas para arquivos grandes
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
        dateNF: 'yyyy-mm-dd'
      });
      
      if (data.length === 0) {
        throw new Error('Planilha Excel vazia');
      }
      
      // Verificar cabeçalhos
      const headers = Object.keys(data[0]).map(h => h.trim().toLowerCase());
      const requiredHeaders = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];
      
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
      }
      
      // Processar dados em chunks (menor para arquivos grandes)
      const CHUNK_SIZE = fileSizeMB > 20 ? 500 : 1000;
      const results = {
        rows: [],
        errors: [],
        totalRows: data.length
      };
      
      let processedRows = 0;
      
      console.log(`📊 Processando ${data.length} linhas em chunks de ${CHUNK_SIZE}...`);
      
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        if (this.isCancelled) break;
        
        const chunk = data.slice(i, i + CHUNK_SIZE);
        const chunkResults = this.processChunk(chunk, i);
        
        results.rows.push(...chunkResults.validRows);
        results.errors.push(...chunkResults.errors);
        
        processedRows = i + chunk.length;
        
        // Enviar progresso
        if (this.progressCallback) {
          this.progressCallback({
            processed: processedRows,
            total: results.totalRows,
            valid: results.rows.length,
            errors: results.errors.length,
            percentage: Math.round((processedRows / results.totalRows) * 100)
          });
        }
        
        // Enviar chunk se necessário (menor limite para arquivos grandes)
        const maxRows = fileSizeMB > 20 ? 25000 : 50000;
        if (results.rows.length >= maxRows) {
          if (this.chunkCallback) {
            this.chunkCallback({
              rows: results.rows.splice(0, maxRows),
              errors: results.errors.splice(0, results.errors.length)
            });
          }
        }
        
        // Pausa maior para arquivos grandes
        const pauseTime = fileSizeMB > 20 ? 50 : 10;
        await new Promise(resolve => setTimeout(resolve, pauseTime));
      }
      
      if (!this.isCancelled) {
        // Enviar dados finais
        if (this.chunkCallback) {
          this.chunkCallback({
            rows: results.rows,
            errors: results.errors
          });
        }
        
        // Enviar resultado final
        if (this.completeCallback) {
          this.completeCallback({
            rows: results.rows,
            errors: results.errors,
            totalRows: results.totalRows,
            validRows: results.rows.length,
            processedOnServer: false
          });
        }
      }
      
    } catch (error) {
      if (this.errorCallback) {
        this.errorCallback({
          message: `Erro ao processar Excel: ${error.message}`,
          error: error
        });
      }
    }
  }
  
  /**
   * Processa chunk de dados
   * @param {Array} chunk - Chunk de dados
   * @param {number} startIndex - Índice inicial
   * @returns {Object} - Resultados do chunk
   */
  processChunk(chunk, startIndex) {
    const chunkResults = {
      validRows: [],
      errors: []
    };
    
    const requiredFields = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];
    
    chunk.forEach((row, index) => {
      if (this.isCancelled) return;
      
      const rowIndex = startIndex + index;
      
      try {
        // Verificar se todos os campos obrigatórios existem
        let isValid = true;
        for (const field of requiredFields) {
          if (!(field in row) || row[field] === undefined || row[field] === '') {
            isValid = false;
            break;
          }
        }
        
        if (!isValid) {
          chunkResults.errors.push({
            row: rowIndex + 1,
            data: row,
            error: 'Dados inválidos ou incompletos'
          });
          return;
        }
        
        // Normalizar dados
        const normalized = {
          date: new Date(row.date).toISOString(),
          operator: String(row.operator).trim(),
          duration_minutes: parseFloat(row.duration_minutes) || 0,
          rating_attendance: parseFloat(row.rating_attendance) || null,
          rating_solution: parseFloat(row.rating_solution) || null,
          pause_minutes: parseFloat(row.pause_minutes) || 0
        };
        
        // Validar ranges
        if (normalized.rating_attendance && (normalized.rating_attendance < 1 || normalized.rating_attendance > 5)) {
          chunkResults.errors.push({
            row: rowIndex + 1,
            data: row,
            error: 'Avaliação de atendimento deve estar entre 1 e 5'
          });
          return;
        }
        
        if (normalized.rating_solution && (normalized.rating_solution < 1 || normalized.rating_solution > 5)) {
          chunkResults.errors.push({
            row: rowIndex + 1,
            data: row,
            error: 'Avaliação de solução deve estar entre 1 e 5'
          });
          return;
        }
        
        if (normalized.duration_minutes < 0 || normalized.pause_minutes < 0) {
          chunkResults.errors.push({
            row: rowIndex + 1,
            data: row,
            error: 'Duração e pausa devem ser valores positivos'
          });
          return;
        }
        
        chunkResults.validRows.push(normalized);
        
      } catch (error) {
        chunkResults.errors.push({
          row: rowIndex + 1,
          data: row,
          error: `Erro ao processar linha: ${error.message}`
        });
      }
    });
    
    return chunkResults;
  }
  
  /**
   * Manipula progresso do processamento
   * @param {Object} data - Dados de progresso
   */
  handleProgress(data) {
    if (this.progressCallback) {
      this.progressCallback(data);
    }
  }
  
  /**
   * Manipula chunk de dados processados
   * @param {Object} data - Dados do chunk
   */
  handleChunk(data) {
    this.allRows.push(...data.rows);
    this.allErrors.push(...data.errors);
    
    if (this.chunkCallback) {
      this.chunkCallback({
        rows: data.rows,
        errors: data.errors,
        totalRows: this.allRows.length,
        totalErrors: this.allErrors.length
      });
    }
  }
  
  /**
   * Manipula conclusão do processamento
   * @param {Object} data - Dados finais
   */
  handleComplete(data) {
    this.isProcessing = false;
    
    if (this.completeCallback) {
      this.completeCallback({
        rows: this.allRows,
        errors: this.allErrors,
        totalRows: data.totalRows,
        validRows: data.validRows,
        processedOnServer: false
      });
    }
  }
  
  /**
   * Manipula erros
   * @param {Object} data - Dados do erro
   */
  handleError(data) {
    this.isProcessing = false;
    
    if (this.errorCallback) {
      this.errorCallback(data);
    }
  }
  
  /**
   * Manipula cancelamento
   * @param {Object} data - Dados do cancelamento
   */
  handleCancelled(data) {
    this.isProcessing = false;
    this.isCancelled = true;
    
    if (this.errorCallback) {
      this.errorCallback(data);
    }
  }
  
  /**
   * Cancela o processamento
   */
  cancel() {
    if (this.isProcessing && this.worker) {
      this.worker.postMessage({
        type: 'cancel_processing'
      });
    }
  }
  
  /**
   * Limpa recursos
   */
  cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isProcessing = false;
    this.isCancelled = false;
    this.allRows = [];
    this.allErrors = [];
  }
}

// Exportar para uso global
window.LargeFileParser = LargeFileParser;
