// Velodados - Parser de Arquivos
// Processamento de CSV e Excel no frontend

/**
 * Parseia um arquivo CSV ou Excel e retorna dados normalizados
 * @param {File} file - Arquivo selecionado pelo usuário
 * @returns {Promise<Object>} - {rows: Array, errors: Array}
 */
async function parseFile(file) {
  const errors = [];
  const rows = [];
  
  try {
    // Verificar tipo de arquivo
    const fileType = getFileType(file);
    if (!fileType) {
      throw new Error('Tipo de arquivo não suportado. Use CSV ou Excel.');
    }
    
    // Ler conteúdo do arquivo
    const content = await readFileContent(file);
    
    // Processar baseado no tipo
    if (fileType === 'csv') {
      const result = parseCSV(content);
      rows.push(...result.rows);
      errors.push(...result.errors);
    } else if (fileType === 'excel') {
      const result = parseExcel(content);
      rows.push(...result.rows);
      errors.push(...result.errors);
    }
    
    return { rows, errors };
    
  } catch (error) {
    errors.push({ 
      row: 0, 
      data: null, 
      error: `Erro ao processar arquivo: ${error.message}` 
    });
    return { rows, errors };
  }
}

/**
 * Determina o tipo de arquivo baseado na extensão
 * @param {File} file - Arquivo
 * @returns {string|null} - Tipo do arquivo ou null se não suportado
 */
function getFileType(file) {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return 'csv';
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return 'excel';
  }
  
  return null;
}

/**
 * Lê o conteúdo de um arquivo como texto ou ArrayBuffer
 * @param {File} file - Arquivo
 * @returns {Promise<string|ArrayBuffer>} - Conteúdo do arquivo
 */
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (e) => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    // Para Excel, usar ArrayBuffer; para CSV, usar texto
    if (getFileType(file) === 'excel') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'UTF-8');
    }
  });
}

/**
 * Parseia conteúdo CSV
 * @param {string} content - Conteúdo CSV
 * @returns {Object} - {rows: Array, errors: Array}
 */
function parseCSV(content) {
  const rows = [];
  const errors = [];
  const lines = content.split('\n');
  
  // Verificar se há cabeçalho
  if (lines.length < 2) {
    errors.push({ row: 0, data: null, error: 'Arquivo CSV muito pequeno ou vazio' });
    return { rows, errors };
  }
  
  // Extrair cabeçalhos
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];
  
  // Verificar se todos os cabeçalhos obrigatórios estão presentes
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push({ 
      row: 0, 
      data: null, 
      error: `Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}` 
    });
  }
  
  // Processar linhas de dados
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Pular linhas vazias
    
    try {
      const values = parseCSVLine(line);
      const rowData = {};
      
      // Mapear valores para cabeçalhos
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      // Validar e normalizar dados
      const normalizedData = validateAndNormalizeRow(rowData);
      if (normalizedData) {
        rows.push(normalizedData);
      } else {
        errors.push({ 
          row: i + 1, 
          data: rowData, 
          error: 'Dados inválidos ou incompletos' 
        });
      }
      
    } catch (error) {
      errors.push({ 
        row: i + 1, 
        data: line, 
        error: `Erro ao processar linha: ${error.message}` 
      });
    }
  }
  
  return { rows, errors };
}

/**
 * Parseia uma linha CSV considerando aspas e vírgulas
 * @param {string} line - Linha CSV
 * @returns {Array} - Array de valores
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Parseia conteúdo Excel usando SheetJS
 * @param {ArrayBuffer} content - Conteúdo Excel
 * @returns {Object} - {rows: Array, errors: Array}
 */
function parseExcel(content) {
  const rows = [];
  const errors = [];
  
  try {
    // Usar SheetJS para ler o arquivo
    const workbook = XLSX.read(content, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      errors.push({ row: 0, data: null, error: 'Planilha Excel vazia' });
      return { rows, errors };
    }
    
    // Verificar cabeçalhos
    const headers = Object.keys(data[0]).map(h => h.trim().toLowerCase());
    const requiredHeaders = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      errors.push({ 
        row: 0, 
        data: null, 
        error: `Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}` 
      });
    }
    
    // Processar dados
    data.forEach((rowData, index) => {
      try {
        const normalizedData = validateAndNormalizeRow(rowData);
        if (normalizedData) {
          rows.push(normalizedData);
        } else {
          errors.push({ 
            row: index + 1, 
            data: rowData, 
            error: 'Dados inválidos ou incompletos' 
          });
        }
      } catch (error) {
        errors.push({ 
          row: index + 1, 
          data: rowData, 
          error: `Erro ao processar linha: ${error.message}` 
        });
      }
    });
    
  } catch (error) {
    errors.push({ 
      row: 0, 
      data: null, 
      error: `Erro ao processar arquivo Excel: ${error.message}` 
    });
  }
  
  return { rows, errors };
}

/**
 * Valida e normaliza uma linha de dados
 * @param {Object} row - Dados da linha
 * @returns {Object|null} - Dados normalizados ou null se inválidos
 */
function validateAndNormalizeRow(row) {
  const requiredFields = ['date', 'operator', 'duration_minutes', 'rating_attendance', 'rating_solution', 'pause_minutes'];
  
  // Verificar se todos os campos obrigatórios existem
  for (const field of requiredFields) {
    if (!(field in row) || row[field] === undefined || row[field] === '') {
      return null;
    }
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
    return null;
  }
  
  if (normalized.rating_solution && (normalized.rating_solution < 1 || normalized.rating_solution > 5)) {
    return null;
  }
  
  if (normalized.duration_minutes < 0 || normalized.pause_minutes < 0) {
    return null;
  }
  
  return normalized;
}

// Exportar funções para uso global
window.parseFile = parseFile;
