// Velodados - Web Worker para Processamento de Arquivos Grandes
// Processa arquivos grandes em background sem travar a UI

// Configurações
const CHUNK_SIZE = 1000; // Processar 1000 linhas por vez
const MAX_MEMORY_ROWS = 50000; // Máximo de linhas em memória
const REQUIRED_HEADERS = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];

// Estado do processamento
let isProcessing = false;
let isCancelled = false;
let processedRows = 0;
let totalRows = 0;
let validRows = [];
let errors = [];
let headers = [];

// Função para validar e normalizar uma linha
function validateAndNormalizeRow(row, rowIndex) {
  // Verificar se todos os campos obrigatórios existem
  for (const field of REQUIRED_HEADERS) {
    if (!(field in row) || row[field] === undefined || row[field] === '') {
      return { valid: false, error: `Campo obrigatório '${field}' ausente` };
    }
  }
  
  try {
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
      return { valid: false, error: 'Avaliação de atendimento deve estar entre 1 e 5' };
    }
    
    if (normalized.rating_solution && (normalized.rating_solution < 1 || normalized.rating_solution > 5)) {
      return { valid: false, error: 'Avaliação de solução deve estar entre 1 e 5' };
    }
    
    if (normalized.duration_minutes < 0 || normalized.pause_minutes < 0) {
      return { valid: false, error: 'Duração e pausa devem ser valores positivos' };
    }
    
    return { valid: true, data: normalized };
    
  } catch (error) {
    return { valid: false, error: `Erro ao normalizar dados: ${error.message}` };
  }
}

// Função para processar chunk de dados
function processChunk(chunk, startIndex) {
  const chunkResults = {
    validRows: [],
    errors: []
  };
  
  chunk.forEach((row, index) => {
    if (isCancelled) return;
    
    const rowIndex = startIndex + index;
    const validation = validateAndNormalizeRow(row, rowIndex);
    
    if (validation.valid) {
      chunkResults.validRows.push(validation.data);
    } else {
      chunkResults.errors.push({
        row: rowIndex + 1,
        data: row,
        error: validation.error
      });
    }
  });
  
  return chunkResults;
}

// Função para processar arquivo CSV com PapaParse
function processCSVFile(fileContent) {
  return new Promise((resolve, reject) => {
    const results = {
      rows: [],
      errors: [],
      totalRows: 0
    };
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      chunk: function(chunk, parser) {
        if (isCancelled) {
          parser.abort();
          return;
        }
        
        // Processar chunk
        const chunkResults = processChunk(chunk.data, processedRows);
        
        // Adicionar resultados
        results.rows.push(...chunkResults.validRows);
        results.errors.push(...chunkResults.errors);
        
        processedRows += chunk.data.length;
        results.totalRows = processedRows;
        
        // Enviar progresso
        self.postMessage({
          type: 'progress',
          data: {
            processed: processedRows,
            total: results.totalRows,
            valid: results.rows.length,
            errors: results.errors.length,
            percentage: Math.round((processedRows / results.totalRows) * 100)
          }
        });
        
        // Limitar memória - enviar dados em lotes
        if (results.rows.length >= MAX_MEMORY_ROWS) {
          self.postMessage({
            type: 'chunk_ready',
            data: {
              rows: results.rows.splice(0, MAX_MEMORY_ROWS),
              errors: results.errors.splice(0, results.errors.length)
            }
          });
        }
      },
      complete: function(results) {
        if (!isCancelled) {
          // Enviar dados finais
          self.postMessage({
            type: 'chunk_ready',
            data: {
              rows: results.rows,
              errors: results.errors
            }
          });
          
          // Enviar resultado final
          self.postMessage({
            type: 'complete',
            data: {
              totalRows: results.totalRows,
              validRows: results.rows.length,
              errors: results.errors.length
            }
          });
        }
      },
      error: function(error) {
        if (!isCancelled) {
          self.postMessage({
            type: 'error',
            data: {
              message: `Erro ao processar CSV: ${error.message}`,
              error: error
            }
          });
        }
      }
    });
  });
}

// Função para processar arquivo Excel (removida - será processado no thread principal)

// Listener para mensagens do thread principal
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'start_processing':
      isProcessing = true;
      isCancelled = false;
      processedRows = 0;
      validRows = [];
      errors = [];
      
      console.log('🔍 Web Worker recebeu:', data.fileType);
      
      if (data.fileType === 'csv') {
        console.log('✅ Processando CSV no Web Worker');
        processCSVFile(data.content);
      } else {
        console.log('❌ Web Worker recebeu tipo não suportado:', data.fileType);
        // Este worker só processa CSV
        self.postMessage({
          type: 'error',
          data: {
            message: 'Web Worker só processa arquivos CSV. Excel deve ser processado no thread principal.',
            error: new Error('Tipo não suportado no Web Worker')
          }
        });
      }
      break;
      
    case 'cancel_processing':
      isCancelled = true;
      isProcessing = false;
      self.postMessage({
        type: 'cancelled',
        data: { message: 'Processamento cancelado pelo usuário' }
      });
      break;
      
    case 'reset':
      isProcessing = false;
      isCancelled = false;
      processedRows = 0;
      validRows = [];
      errors = [];
      break;
  }
};

// Função para verificar se o worker está funcionando
self.postMessage({
  type: 'ready',
  data: { message: 'File processor worker ready' }
});
