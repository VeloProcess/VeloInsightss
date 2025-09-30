// Velodados - Cálculos de Métricas
// Funções para calcular métricas gerais e por operador

/**
 * Calcula métricas gerais da equipe
 * @param {Array} rows - Array de dados normalizados
 * @returns {Object} - Métricas gerais
 */
function calcMetrics(rows) {
  if (!rows || rows.length === 0) {
    return {
      totalCalls: 0,
      avgDuration: 0,
      avgRatingAttendance: 0,
      avgRatingSolution: 0,
      activeOperators: 0,
      avgPause: 0
    };
  }
  
  // Total de atendimentos
  const totalCalls = rows.length;
  
  // Tempo médio de atendimento
  const totalDuration = rows.reduce((sum, row) => sum + row.duration_minutes, 0);
  const avgDuration = totalDuration / totalCalls;
  
  // Nota média do atendimento (apenas linhas com rating válido)
  const validAttendanceRatings = rows.filter(row => row.rating_attendance !== null);
  const avgRatingAttendance = validAttendanceRatings.length > 0 
    ? validAttendanceRatings.reduce((sum, row) => sum + row.rating_attendance, 0) / validAttendanceRatings.length
    : 0;
  
  // Nota média da solução (apenas linhas com rating válido)
  const validSolutionRatings = rows.filter(row => row.rating_solution !== null);
  const avgRatingSolution = validSolutionRatings.length > 0
    ? validSolutionRatings.reduce((sum, row) => sum + row.rating_solution, 0) / validSolutionRatings.length
    : 0;
  
  // Operadores únicos
  const uniqueOperators = [...new Set(rows.map(row => row.operator))];
  const activeOperators = uniqueOperators.length;
  
  // Tempo médio de pausa
  const totalPause = rows.reduce((sum, row) => sum + row.pause_minutes, 0);
  const avgPause = totalPause / totalCalls;
  
  return {
    totalCalls,
    avgDuration: Math.round(avgDuration * 100) / 100,
    avgRatingAttendance: Math.round(avgRatingAttendance * 100) / 100,
    avgRatingSolution: Math.round(avgRatingSolution * 100) / 100,
    activeOperators,
    avgPause: Math.round(avgPause * 100) / 100
  };
}

/**
 * Calcula métricas por operador
 * @param {Array} rows - Array de dados normalizados
 * @returns {Object} - Métricas por operador
 */
function operatorMetrics(rows) {
  if (!rows || rows.length === 0) {
    return {};
  }
  
  const operatorData = {};
  
  // Agrupar dados por operador
  rows.forEach(row => {
    const operator = row.operator;
    
    if (!operatorData[operator]) {
      operatorData[operator] = {
        calls: [],
        totalCalls: 0,
        totalDuration: 0,
        totalPause: 0,
        ratingsAttendance: [],
        ratingsSolution: []
      };
    }
    
    operatorData[operator].calls.push(row);
    operatorData[operator].totalCalls++;
    operatorData[operator].totalDuration += row.duration_minutes;
    operatorData[operator].totalPause += row.pause_minutes;
    
    if (row.rating_attendance !== null) {
      operatorData[operator].ratingsAttendance.push(row.rating_attendance);
    }
    
    if (row.rating_solution !== null) {
      operatorData[operator].ratingsSolution.push(row.rating_solution);
    }
  });
  
  // Calcular métricas para cada operador
  const metrics = {};
  
  Object.keys(operatorData).forEach(operator => {
    const data = operatorData[operator];
    
    metrics[operator] = {
      totalCalls: data.totalCalls,
      avgDuration: Math.round((data.totalDuration / data.totalCalls) * 100) / 100,
      avgPause: Math.round((data.totalPause / data.totalCalls) * 100) / 100,
      avgRatingAttendance: data.ratingsAttendance.length > 0 
        ? Math.round((data.ratingsAttendance.reduce((sum, rating) => sum + rating, 0) / data.ratingsAttendance.length) * 100) / 100
        : 0,
      avgRatingSolution: data.ratingsSolution.length > 0
        ? Math.round((data.ratingsSolution.reduce((sum, rating) => sum + rating, 0) / data.ratingsSolution.length) * 100) / 100
        : 0,
      totalDuration: data.totalDuration,
      totalPause: data.totalPause
    };
  });
  
  return metrics;
}

/**
 * Calcula scores para ranking de operadores
 * @param {Object} opMetrics - Métricas por operador
 * @returns {Array} - Array ordenado de operadores com scores
 */
function computeScores(opMetrics) {
  const operators = Object.keys(opMetrics);
  
  if (operators.length === 0) {
    return [];
  }
  
  // Calcular métricas globais para normalização
  const globalMetrics = {
    maxCalls: Math.max(...operators.map(op => opMetrics[op].totalCalls)),
    maxDuration: Math.max(...operators.map(op => opMetrics[op].totalDuration)),
    maxRatingAttendance: Math.max(...operators.map(op => opMetrics[op].avgRatingAttendance)),
    maxRatingSolution: Math.max(...operators.map(op => opMetrics[op].avgRatingSolution)),
    maxPause: Math.max(...operators.map(op => opMetrics[op].avgPause))
  };
  
  // Função de normalização (0 a 1)
  const normalize = (value, max) => max > 0 ? value / max : 0;
  
  // Calcular scores para cada operador
  const scores = operators.map(operator => {
    const metrics = opMetrics[operator];
    
    // Fórmula do score (conforme especificação):
    // score = 0.35*norm(total) + 0.20*(1 - norm(avgDuration))
    //       + 0.20*norm(avgRatingAttendance) + 0.20*norm(avgRatingSolution)
    //       - 0.05*norm(avgPause)
    
    const normTotal = normalize(metrics.totalCalls, globalMetrics.maxCalls);
    const normDuration = normalize(metrics.avgDuration, globalMetrics.maxDuration);
    const normRatingAttendance = normalize(metrics.avgRatingAttendance, globalMetrics.maxRatingAttendance);
    const normRatingSolution = normalize(metrics.avgRatingSolution, globalMetrics.maxRatingSolution);
    const normPause = normalize(metrics.avgPause, globalMetrics.maxPause);
    
    const score = (0.35 * normTotal) + 
                  (0.20 * (1 - normDuration)) + 
                  (0.20 * normRatingAttendance) + 
                  (0.20 * normRatingSolution) - 
                  (0.05 * normPause);
    
    return {
      operator,
      score: Math.round(score * 1000) / 1000, // 3 casas decimais
      metrics: {
        totalCalls: metrics.totalCalls,
        avgDuration: metrics.avgDuration,
        avgRatingAttendance: metrics.avgRatingAttendance,
        avgRatingSolution: metrics.avgRatingSolution,
        avgPause: metrics.avgPause
      }
    };
  });
  
  // Ordenar por score (maior para menor)
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Calcula estatísticas de distribuição das avaliações
 * @param {Array} rows - Array de dados normalizados
 * @returns {Object} - Estatísticas de distribuição
 */
function ratingDistribution(rows) {
  const attendanceDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const solutionDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  rows.forEach(row => {
    if (row.rating_attendance !== null && row.rating_attendance >= 1 && row.rating_attendance <= 5) {
      attendanceDistribution[Math.round(row.rating_attendance)]++;
    }
    
    if (row.rating_solution !== null && row.rating_solution >= 1 && row.rating_solution <= 5) {
      solutionDistribution[Math.round(row.rating_solution)]++;
    }
  });
  
  return {
    attendance: attendanceDistribution,
    solution: solutionDistribution
  };
}

/**
 * Calcula estatísticas por período (diário)
 * @param {Array} rows - Array de dados normalizados
 * @returns {Object} - Estatísticas por dia
 */
function dailyStats(rows) {
  const dailyData = {};
  
  rows.forEach(row => {
    const date = new Date(row.date).toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        calls: 0,
        totalDuration: 0,
        avgRatingAttendance: 0,
        avgRatingSolution: 0,
        operators: new Set()
      };
    }
    
    dailyData[date].calls++;
    dailyData[date].totalDuration += row.duration_minutes;
    dailyData[date].operators.add(row.operator);
    
    if (row.rating_attendance !== null) {
      dailyData[date].avgRatingAttendance += row.rating_attendance;
    }
    
    if (row.rating_solution !== null) {
      dailyData[date].avgRatingSolution += row.rating_solution;
    }
  });
  
  // Calcular médias e converter para array
  const result = Object.values(dailyData).map(day => ({
    date: day.date,
    calls: day.calls,
    avgDuration: Math.round((day.totalDuration / day.calls) * 100) / 100,
    avgRatingAttendance: Math.round((day.avgRatingAttendance / day.calls) * 100) / 100,
    avgRatingSolution: Math.round((day.avgRatingSolution / day.calls) * 100) / 100,
    uniqueOperators: day.operators.size
  }));
  
  // Ordenar por data
  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Exportar funções para uso global
window.calcMetrics = calcMetrics;
window.operatorMetrics = operatorMetrics;
window.computeScores = computeScores;
window.ratingDistribution = ratingDistribution;
window.dailyStats = dailyStats;
