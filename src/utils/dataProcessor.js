// Função para processar dados da planilha - VERSÃO PERFEITA IMPLEMENTADA
export const processarDados = (dados) => {
  if (!dados || dados.length === 0) {
    console.log('⚠️ Nenhum dado para processar')
    return {
      dadosFiltrados: [],
      operadores: [],
      metricas: {},
      rankings: []
    }
  }

  console.log(`🔄 Processando ${dados.length} linhas...`)

  // Primeira linha são os cabeçalhos
  const cabecalhos = dados[0]
  const linhasDados = dados.slice(1)

  console.log('📋 Cabeçalhos encontrados:', cabecalhos)

  // Mapeamento correto das colunas - VERSÃO PERFEITA
  const indices = {
    chamada: 0,        // Coluna A
    operador: 2,        // Coluna C  
    data: 3,           // Coluna D
    tempoURA: 11,      // Coluna L - Tempo Na Ura
    tempoEspera: 12,   // Coluna M - Tempo De Espera
    tempoFalado: 13,   // Coluna N - Tempo Falado
    tempoTotal: 14,    // Coluna O - Tempo Total
    notaAtendimento: 27, // Coluna AB - Pergunta2 1 PERGUNTA ATENDENTE
    notaSolucao: 28     // Coluna AC - Pergunta2 2 PERGUNTA SOLUCAO
  }

  console.log('📍 Índices das colunas:', indices)

  // Processar dados linha por linha - VERSÃO PERFEITA
  const dadosProcessados = []
  const operadoresEncontrados = new Set()

  linhasDados.forEach((linha, index) => {
    try {
      // Verificar se a linha tem dados suficientes
      if (!linha || linha.length < 3) return

      const operador = linha[indices.operador] || 'Sem Operador'

      // Processar dados da linha - VERSÃO PERFEITA (TODAS AS LINHAS)
      const dadosLinha = {
        linha: index + 2,
        chamada: linha[indices.chamada] || '',
        operador: operador.trim(),
        data: linha[indices.data] || '',
        tempoURA: linha[indices.tempoURA] || '00:00:00',
        tempoEspera: linha[indices.tempoEspera] || '00:00:00',
        tempoFalado: linha[indices.tempoFalado] || '00:00:00',
        tempoTotal: linha[indices.tempoTotal] || '00:00:00',
        notaAtendimento: parseFloat(linha[indices.notaAtendimento]) || null,
        notaSolucao: parseFloat(linha[indices.notaSolucao]) || null
      }

      dadosProcessados.push(dadosLinha)
      operadoresEncontrados.add(operador.trim())

    } catch (error) {
      console.error(`❌ Erro ao processar linha ${index + 2}:`, error)
    }
  })

  console.log(`✅ ${dadosProcessados.length} linhas processadas`)
  console.log(`👥 ${operadoresEncontrados.size} operadores encontrados`)

  // Calcular métricas gerais - VERSÃO PERFEITA IMPLEMENTADA
  const metricas = calcularMetricas(dadosProcessados)

  // Calcular métricas por operador
  const metricasOperadores = calcularMetricasOperadores(dadosProcessados)

  // Calcular ranking
  const rankings = calcularRanking(metricasOperadores)

  return {
    dadosFiltrados: dadosProcessados,
    operadores: Array.from(operadoresEncontrados),
    metricas,
    metricasOperadores,
    rankings
  }
}

// Calcular métricas gerais - VERSÃO PERFEITA IMPLEMENTADA
const calcularMetricas = (dados) => {
  if (dados.length === 0) {
    return {
      totalChamadas: 0,
      retidaURA: 0,
      atendida: 0,
      abandonada: 0,
      notaMediaAtendimento: 0,
      notaMediaSolucao: 0,
      duracaoMediaAtendimento: 0,
      tempoMedioEspera: 0,
      tempoMedioURA: 0,
      taxaAtendimento: 0,
      taxaAbandono: 0
    }
  }

  // Função para converter tempo HH:MM:SS para minutos
  const tempoParaMinutos = (tempo) => {
    if (!tempo || tempo === '00:00:00') return 0
    const [horas, minutos, segundos] = tempo.split(':').map(Number)
    return horas * 60 + minutos + segundos / 60
  }

  // Contagem de chamadas por status - VERSÃO PERFEITA CORRIGIDA
  const totalChamadas = dados.length
  
  console.log(`📊 Debug - Total de linhas processadas: ${totalChamadas}`)
  
  // Verificar se temos exatamente 5000 linhas (incluindo cabeçalho)
  if (totalChamadas < 4999) {
    console.log(`⚠️ Aviso: Esperávamos ~5000 linhas, mas temos apenas ${totalChamadas}`)
  }
  
  const retidaURA = dados.filter(row => {
    const chamada = row.chamada || ''
    return chamada.toLowerCase().includes('retida') || chamada.toLowerCase().includes('ura')
  }).length

  const atendida = dados.filter(row => {
    const tempoFalado = row.tempoFalado || '00:00:00'
    const chamada = row.chamada || ''
    const tempoMinutos = tempoParaMinutos(tempoFalado)
    return tempoMinutos > 0 || chamada.toLowerCase().includes('atendida')
  }).length

  const abandonada = dados.filter(row => {
    const tempoEspera = row.tempoEspera || '00:00:00'
    const tempoFalado = row.tempoFalado || '00:00:00'
    const chamada = row.chamada || ''
    const tempoEsperaMinutos = tempoParaMinutos(tempoEspera)
    const tempoFaladoMinutos = tempoParaMinutos(tempoFalado)
    return tempoEsperaMinutos > 0 && tempoFaladoMinutos === 0 && !chamada.toLowerCase().includes('retida')
  }).length

  console.log(`📊 Debug - Status das chamadas:`, {
    retidaURA,
    atendida,
    abandonada,
    soma: retidaURA + atendida + abandonada
  })

  // Cálculo de médias - VERSÃO PERFEITA
  const temposFalado = dados.map(row => tempoParaMinutos(row.tempoFalado)).filter(tempo => tempo > 0)
  const duracaoMediaAtendimento = temposFalado.length > 0 
    ? temposFalado.reduce((sum, tempo) => sum + tempo, 0) / temposFalado.length
    : 0

  const temposEspera = dados.map(row => tempoParaMinutos(row.tempoEspera)).filter(tempo => tempo > 0)
  const tempoMedioEspera = temposEspera.length > 0 
    ? temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length
    : 0

  const temposURA = dados.map(row => tempoParaMinutos(row.tempoURA)).filter(tempo => tempo > 0)
  const tempoMedioURA = temposURA.length > 0 
    ? temposURA.reduce((sum, tempo) => sum + tempo, 0) / temposURA.length
    : 0

  // Notas médias
  const notasAtendimentoValidas = dados.filter(d => d.notaAtendimento !== null)
  const notaMediaAtendimento = notasAtendimentoValidas.length > 0 ?
    notasAtendimentoValidas.reduce((sum, d) => sum + d.notaAtendimento, 0) / notasAtendimentoValidas.length : 0

  const notasSolucaoValidas = dados.filter(d => d.notaSolucao !== null)
  const notaMediaSolucao = notasSolucaoValidas.length > 0 ?
    notasSolucaoValidas.reduce((sum, d) => sum + d.notaSolucao, 0) / notasSolucaoValidas.length : 0

  console.log(`📊 Debug - Notas:`, {
    notasAtendimentoValidas: notasAtendimentoValidas.length,
    notasSolucaoValidas: notasSolucaoValidas.length,
    notaMediaAtendimento: notaMediaAtendimento.toFixed(2),
    notaMediaSolucao: notaMediaSolucao.toFixed(2)
  })

  // Taxas
  const taxaAtendimento = totalChamadas > 0 ? (atendida / totalChamadas) * 100 : 0
  const taxaAbandono = totalChamadas > 0 ? (abandonada / totalChamadas) * 100 : 0

  console.log('📊 Métricas calculadas:', {
    totalChamadas,
    retidaURA,
    atendida,
    abandonada,
    duracaoMediaAtendimento: duracaoMediaAtendimento.toFixed(1),
    tempoMedioEspera: tempoMedioEspera.toFixed(1),
    tempoMedioURA: tempoMedioURA.toFixed(1),
    taxaAtendimento: taxaAtendimento.toFixed(1),
    taxaAbandono: taxaAbandono.toFixed(1)
  })

  return {
    totalCalls: totalChamadas, // Corrigido para compatibilidade com MetricsDashboard
    totalChamadas,
    retidaURA,
    atendida,
    abandonada,
    notaMediaAtendimento: parseFloat(notaMediaAtendimento.toFixed(1)),
    notaMediaSolucao: parseFloat(notaMediaSolucao.toFixed(1)),
    avgRatingAttendance: parseFloat(notaMediaAtendimento.toFixed(1)), // Campo esperado pelo dashboard
    avgRatingSolution: parseFloat(notaMediaSolucao.toFixed(1)), // Campo esperado pelo dashboard
    duracaoMediaAtendimento: parseFloat(duracaoMediaAtendimento.toFixed(1)),
    tempoMedioEspera: parseFloat(tempoMedioEspera.toFixed(1)),
    tempoMedioURA: parseFloat(tempoMedioURA.toFixed(1)),
    taxaAtendimento: parseFloat(taxaAtendimento.toFixed(1)),
    taxaAbandono: parseFloat(taxaAbandono.toFixed(1))
  }
}

// Calcular métricas por operador - VERSÃO PERFEITA IMPLEMENTADA
const calcularMetricasOperadores = (dados) => {
  const operadores = {}
  
  // Função para converter tempo HH:MM:SS para minutos
  const tempoParaMinutos = (tempo) => {
    if (!tempo || tempo === '00:00:00') return 0
    const [horas, minutos, segundos] = tempo.split(':').map(Number)
    return horas * 60 + minutos + segundos / 60
  }
  
  dados.forEach(d => {
    if (!operadores[d.operador]) {
      operadores[d.operador] = {
        operador: d.operador,
        totalAtendimentos: 0,
        tempoTotal: 0,
        notasAtendimento: [],
        notasSolucao: []
      }
    }

    operadores[d.operador].totalAtendimentos++
    operadores[d.operador].tempoTotal += tempoParaMinutos(d.tempoFalado)
    
    if (d.notaAtendimento !== null) {
      operadores[d.operador].notasAtendimento.push(d.notaAtendimento)
    }
    
    if (d.notaSolucao !== null) {
      operadores[d.operador].notasSolucao.push(d.notaSolucao)
    }
  })

  // Calcular médias
  Object.values(operadores).forEach(op => {
    op.tempoMedio = op.totalAtendimentos > 0 ? op.tempoTotal / op.totalAtendimentos : 0
    op.notaMediaAtendimento = op.notasAtendimento.length > 0 ? 
      op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length : 0
    op.notaMediaSolucao = op.notasSolucao.length > 0 ?
      op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length : 0
  })

  return operadores
}

// Calcular ranking - VERSÃO FUNCIONAL PERFEITA
const calcularRanking = (metricasOperadores) => {
  const operadores = Object.values(metricasOperadores)
  
  // Normalizar valores para calcular score
  const totalAtendimentos = operadores.map(op => op.totalAtendimentos)
  const temposMedios = operadores.map(op => op.tempoMedio)
  const notasAtendimento = operadores.map(op => op.notaMediaAtendimento)
  const notasSolucao = operadores.map(op => op.notaMediaSolucao)

  const minTotal = Math.min(...totalAtendimentos)
  const maxTotal = Math.max(...totalAtendimentos)
  const minTempo = Math.min(...temposMedios)
  const maxTempo = Math.max(...temposMedios)
  const minNotaAtendimento = Math.min(...notasAtendimento)
  const maxNotaAtendimento = Math.max(...notasAtendimento)
  const minNotaSolucao = Math.min(...notasSolucao)
  const maxNotaSolucao = Math.max(...notasSolucao)

  // Função de normalização
  const normalizar = (valor, min, max) => {
    if (max === min) return 0.5
    return (valor - min) / (max - min)
  }

  // Calcular score para cada operador - VERSÃO FUNCIONAL PERFEITA
  operadores.forEach(op => {
    const normTotal = normalizar(op.totalAtendimentos, minTotal, maxTotal)
    const normTempo = normalizar(op.tempoMedio, minTempo, maxTempo)
    const normNotaAtendimento = normalizar(op.notaMediaAtendimento, minNotaAtendimento, maxNotaAtendimento)
    const normNotaSolucao = normalizar(op.notaMediaSolucao, minNotaSolucao, maxNotaSolucao)

    // Fórmula de score FUNCIONAL PERFEITA:
    // score = 0.40*norm(totalAtendimentos) + 0.30*(1 - norm(tempoMedioAtendimento)) + 0.15*norm(notaAtendimento) + 0.15*norm(notaSolucao)
    op.score = 0.40 * normTotal + 
                0.30 * (1 - normTempo) + 
                0.15 * normNotaAtendimento + 
                0.15 * normNotaSolucao
  })

  // Ordenar por score
  return operadores.sort((a, b) => b.score - a.score)
}