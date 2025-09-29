// Velodados - Parser para Dados da Velotax
// Parser específico para dados reais de call center da Velotax

/**
 * Parseia dados da Velotax e converte para formato do sistema
 * @param {Array} rawData - Dados brutos da Velotax
 * @returns {Object} - {rows: Array, errors: Array}
 */
function parseVelotaxData(rawData) {
  const rows = [];
  const errors = [];
  
  console.log('🔄 Processando dados da Velotax...');
  
  // Verificar se rawData é válido
  if (!rawData || !Array.isArray(rawData)) {
    console.error('❌ Dados inválidos recebidos:', rawData);
    return { rows: [], errors: [{ row: 0, data: rawData, error: 'Dados não são um array válido' }] };
  }
  
  try {
    rawData.forEach((record, index) => {
      try {
        // Verificar se record é válido
        if (!record || typeof record !== 'object') {
          errors.push({
            row: index + 1,
            data: record,
            error: 'Registro inválido ou nulo'
          });
          return;
        }
        
        // Mapear dados da Velotax para formato do sistema
        const mappedRecord = mapVelotaxRecord(record, index + 1);
        
        if (mappedRecord) {
          rows.push(mappedRecord);
        } else {
          errors.push({
            row: index + 1,
            data: record,
            error: 'Dados inválidos ou incompletos'
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erro na linha ${index + 1}:`, error.message);
        errors.push({
          row: index + 1,
          data: record,
          error: `Erro ao processar: ${error.message}`
        });
      }
    });
  } catch (error) {
    console.error('❌ Erro crítico no parser:', error);
    return { 
      rows: [], 
      errors: [{ row: 0, data: rawData, error: `Erro crítico: ${error.message}` }] 
    };
  }
  
  console.log(`✅ Processados: ${rows.length} registros válidos, ${errors.length} erros`);
  
  return { rows, errors };
}

/**
 * Mapeia um registro da Velotax para formato do sistema
 * @param {Object} record - Registro da Velotax
 * @param {number} rowNumber - Número da linha
 * @returns {Object|null} - Registro mapeado ou null se inválido
 */
function mapVelotaxRecord(record, rowNumber) {
  try {
    // Validar campos obrigatórios
    if (!record.Operador || !record.Data || !record['Tempo Total']) {
      return null;
    }
    
    // Converter data
    const dataChamada = parseVelotaxDate(record.Data);
    if (!dataChamada) {
      return null;
    }
    
    // Converter tempos para minutos
    const tempoTotal = parseTimeToMinutes(record['Tempo Total']);
    const tempoFalado = parseTimeToMinutes(record['Tempo Falado'] || '00:00:00');
    const tempoEspera = parseTimeToMinutes(record['Tempo De Espera'] || '00:00:00');
    
    // Calcular tempo de pausa (tempo total - tempo falado - tempo espera)
    const tempoPausa = Math.max(0, tempoTotal - tempoFalado - tempoEspera);
    
    // Determinar se houve atendimento efetivo
    const teveAtendimento = record.Operador !== 'Agentes indisponíveis' && 
                           record.Operador !== '' && 
                           tempoFalado > 0;
    
    // Calcular notas baseadas no status da chamada
    const notas = calculateVelotaxRatings(record, teveAtendimento);
    
    // Mapear para formato do sistema
    const mappedRecord = {
      date: dataChamada.toISOString(),
      operator: record.Operador || 'Sistema',
      duration_minutes: tempoTotal,
      rating_attendance: notas.attendance,
      rating_solution: notas.solution,
      pause_minutes: tempoPausa,
      // Campos adicionais específicos da Velotax
      call_status: record.Chamada,
      call_id: record['Id Ligação'],
      queue: record.Fila,
      cpf_cnpj: record['Cpf/Cnpj'],
      phone: record.Numero,
      ddd: record.DDD,
      country: record.País,
      ura_time: parseTimeToMinutes(record['Tempo Na Ura'] || '00:00:00'),
      talk_time: tempoFalado,
      wait_time: tempoEspera,
      disconnect_reason: record['Motivo De Desconexão'],
      overflow_count: parseInt(record['Quantidade De Transbordos'] || '0')
    };
    
    return mappedRecord;
    
  } catch (error) {
    console.error(`Erro ao mapear registro ${rowNumber}:`, error);
    return null;
  }
}

/**
 * Converte data da Velotax para Date
 * @param {string} dateStr - Data no formato DD/MM/YYYY
 * @returns {Date|null} - Data convertida ou null se inválida
 */
function parseVelotaxDate(dateStr) {
  try {
    if (!dateStr) return null;
    
    // Formato: DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
    const year = parseInt(parts[2]);
    
    // Ajustar ano se necessário (assumir 2024 se ano < 2000)
    const fullYear = year < 2000 ? year + 2000 : year;
    
    const date = new Date(fullYear, month, day);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * Converte tempo HH:MM:SS para minutos
 * @param {string} timeStr - Tempo no formato HH:MM:SS
 * @returns {number} - Tempo em minutos
 */
function parseTimeToMinutes(timeStr) {
  try {
    if (!timeStr) return 0;
    
    const parts = timeStr.split(':');
    if (parts.length !== 3) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return hours * 60 + minutes + (seconds / 60);
  } catch (error) {
    return 0;
  }
}

/**
 * Calcula notas baseadas no status da chamada
 * @param {Object} record - Registro da Velotax
 * @param {boolean} teveAtendimento - Se houve atendimento efetivo
 * @returns {Object} - {attendance: number, solution: number}
 */
function calculateVelotaxRatings(record, teveAtendimento) {
  let attendance = null;
  let solution = null;
  
  if (teveAtendimento) {
    // Chamada atendida com sucesso
    attendance = 5;
    solution = 5;
  } else if (record.Chamada === 'Abandonada') {
    // Chamada abandonada - nota baixa
    attendance = 2;
    solution = 1;
  } else if (record.Chamada === 'Retida na URA') {
    // Chamada retida na URA - nota média
    attendance = 3;
    solution = 3;
  } else {
    // Outros casos - nota neutra
    attendance = 3;
    solution = 3;
  }
  
  return { attendance, solution };
}

/**
 * Calcula métricas específicas da Velotax
 * @param {Array} rows - Dados mapeados
 * @returns {Object} - Métricas específicas
 */
function calculateVelotaxMetrics(rows) {
  if (!rows || rows.length === 0) {
    return {
      totalCalls: 0,
      answeredCalls: 0,
      abandonedCalls: 0,
      uraCalls: 0,
      avgCallDuration: 0,
      avgTalkTime: 0,
      avgWaitTime: 0,
      avgUraTime: 0,
      overflowRate: 0,
      uniqueOperators: 0,
      uniqueQueues: 0
    };
  }
  
  const answeredCalls = rows.filter(r => r.call_status !== 'Abandonada' && r.talk_time > 0);
  const abandonedCalls = rows.filter(r => r.call_status === 'Abandonada');
  const uraCalls = rows.filter(r => r.call_status === 'Retida na URA');
  
  const totalDuration = rows.reduce((sum, r) => sum + r.duration_minutes, 0);
  const totalTalkTime = rows.reduce((sum, r) => sum + r.talk_time, 0);
  const totalWaitTime = rows.reduce((sum, r) => sum + r.wait_time, 0);
  const totalUraTime = rows.reduce((sum, r) => sum + r.ura_time, 0);
  const totalOverflows = rows.reduce((sum, r) => sum + r.overflow_count, 0);
  
  const uniqueOperators = [...new Set(rows.map(r => r.operator))].length;
  const uniqueQueues = [...new Set(rows.map(r => r.queue).filter(q => q))].length;
  
  return {
    totalCalls: rows.length,
    answeredCalls: answeredCalls.length,
    abandonedCalls: abandonedCalls.length,
    uraCalls: uraCalls.length,
    avgCallDuration: Math.round((totalDuration / rows.length) * 100) / 100,
    avgTalkTime: Math.round((totalTalkTime / rows.length) * 100) / 100,
    avgWaitTime: Math.round((totalWaitTime / rows.length) * 100) / 100,
    avgUraTime: Math.round((totalUraTime / rows.length) * 100) / 100,
    overflowRate: Math.round((totalOverflows / rows.length) * 100) / 100,
    uniqueOperators,
    uniqueQueues
  };
}

// Exportar funções para uso global
window.parseVelotaxData = parseVelotaxData;
window.calculateVelotaxMetrics = calculateVelotaxMetrics;
