// Função para processar dados da planilha - VERSÃO SIMPLIFICADA
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

  // Encontrar índices das colunas importantes - VERSÃO PERFEITA
  const indices = {
    data: cabecalhos.findIndex(h => h && h.toLowerCase().includes('data')),
    operador: cabecalhos.findIndex(h => h && (h.toLowerCase().includes('nome do atendente') || h.toLowerCase().includes('operador'))),
    tempoFalado: cabecalhos.findIndex(h => h && h.toLowerCase().includes('tempo falado')),
    notaAtendimento: cabecalhos.findIndex(h => h && h.toLowerCase().includes('pergunta2 1 pergunta atendente')),
    notaSolucao: cabecalhos.findIndex(h => h && h.toLowerCase().includes('pergunta2 2 pergunta solucao')),
    chamada: cabecalhos.findIndex(h => h && h.toLowerCase().includes('chamada')),
    tempoPausa: cabecalhos.findIndex(h => h && h.toLowerCase().includes('dura') && h.toLowerCase().includes('pausa')),
    tempoLogado: cabecalhos.findIndex(h => h && h.toLowerCase().includes('t m logado')),
    tempoPausado: cabecalhos.findIndex(h => h && h.toLowerCase().includes('t m pausado'))
  }

  console.log('📍 Índices das colunas:', indices)

  // Processar dados linha por linha - SEM FILTROS
  const dadosProcessados = []
  const operadoresEncontrados = new Set()

  linhasDados.forEach((linha, index) => {
    try {
      // Verificar se a linha tem dados suficientes
      if (!linha || linha.length < 3) return

      const operador = linha[indices.operador]
      if (!operador || operador.trim() === '') return

      // Processar dados da linha - VERSÃO PERFEITA
      const dadosLinha = {
        linha: index + 2, // +2 porque começamos do índice 1 e pulamos o cabeçalho
        data: linha[indices.data] || '',
        operador: operador.trim(),
        tempoFalado: parseFloat(linha[indices.tempoFalado]) || 0,
        notaAtendimento: parseFloat(linha[indices.notaAtendimento]) || null,
        notaSolucao: parseFloat(linha[indices.notaSolucao]) || null,
        chamada: linha[indices.chamada] || '',
        tempoPausa: parseFloat(linha[indices.tempoPausa]) || 0,
        tempoLogado: parseFloat(linha[indices.tempoLogado]) || 0,
        tempoPausado: parseFloat(linha[indices.tempoPausado]) || 0
      }

      dadosProcessados.push(dadosLinha)
      operadoresEncontrados.add(operador.trim())

    } catch (error) {
      console.error(`❌ Erro ao processar linha ${index + 2}:`, error)
    }
  })

  console.log(`✅ ${dadosProcessados.length} linhas processadas`)
  console.log(`👥 ${operadoresEncontrados.size} operadores encontrados`)

  // Calcular métricas gerais
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

// Calcular métricas gerais - VERSÃO PERFEITA
const calcularMetricas = (dados) => {
  if (dados.length === 0) {
    return {
      totalAtendimentos: 0,
      tempoMedio: 0,
      notaMediaAtendimento: 0,
      notaMediaSolucao: 0,
      tempoMedioLogado: 0,
      tempoMedioPausado: 0,
      operadoresAtivos: 0
    }
  }

  const temposValidos = dados.filter(d => d.tempoFalado > 0)
  const notasAtendimentoValidas = dados.filter(d => d.notaAtendimento !== null)
  const notasSolucaoValidas = dados.filter(d => d.notaSolucao !== null)
  const temposLogadoValidos = dados.filter(d => d.tempoLogado > 0)
  const temposPausadoValidos = dados.filter(d => d.tempoPausado > 0)
  const operadoresUnicos = new Set(dados.map(d => d.operador))

  return {
    totalAtendimentos: dados.length,
    tempoMedio: temposValidos.length > 0 ? 
      temposValidos.reduce((sum, d) => sum + d.tempoFalado, 0) / temposValidos.length : 0,
    notaMediaAtendimento: notasAtendimentoValidas.length > 0 ?
      notasAtendimentoValidas.reduce((sum, d) => sum + d.notaAtendimento, 0) / notasAtendimentoValidas.length : 0,
    notaMediaSolucao: notasSolucaoValidas.length > 0 ?
      notasSolucaoValidas.reduce((sum, d) => sum + d.notaSolucao, 0) / notasSolucaoValidas.length : 0,
    tempoMedioLogado: temposLogadoValidos.length > 0 ?
      temposLogadoValidos.reduce((sum, d) => sum + d.tempoLogado, 0) / temposLogadoValidos.length : 0,
    tempoMedioPausado: temposPausadoValidos.length > 0 ?
      temposPausadoValidos.reduce((sum, d) => sum + d.tempoPausado, 0) / temposPausadoValidos.length : 0,
    operadoresAtivos: operadoresUnicos.size
  }
}

// Calcular métricas por operador - VERSÃO PERFEITA
const calcularMetricasOperadores = (dados) => {
  const operadores = {}
  
  dados.forEach(d => {
    if (!operadores[d.operador]) {
      operadores[d.operador] = {
        operador: d.operador,
        totalAtendimentos: 0,
        tempoTotal: 0,
        tempoPausaTotal: 0,
        tempoLogadoTotal: 0,
        tempoPausadoTotal: 0,
        notasAtendimento: [],
        notasSolucao: []
      }
    }

    operadores[d.operador].totalAtendimentos++
    operadores[d.operador].tempoTotal += d.tempoFalado
    operadores[d.operador].tempoPausaTotal += d.tempoPausa
    operadores[d.operador].tempoLogadoTotal += d.tempoLogado
    operadores[d.operador].tempoPausadoTotal += d.tempoPausado
    
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
    op.tempoMedioPausa = op.totalAtendimentos > 0 ? op.tempoPausaTotal / op.totalAtendimentos : 0
    op.tempoMedioLogado = op.totalAtendimentos > 0 ? op.tempoLogadoTotal / op.totalAtendimentos : 0
    op.tempoMedioPausado = op.totalAtendimentos > 0 ? op.tempoPausadoTotal / op.totalAtendimentos : 0
    op.notaMediaAtendimento = op.notasAtendimento.length > 0 ? 
      op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length : 0
    op.notaMediaSolucao = op.notasSolucao.length > 0 ?
      op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length : 0
  })

  return operadores
}

// Calcular ranking
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

  // Calcular score para cada operador - VERSÃO PERFEITA
  operadores.forEach(op => {
    const normTotal = normalizar(op.totalAtendimentos, minTotal, maxTotal)
    const normTempo = normalizar(op.tempoMedio, minTempo, maxTempo)
    const normNotaAtendimento = normalizar(op.notaMediaAtendimento, minNotaAtendimento, maxNotaAtendimento)
    const normNotaSolucao = normalizar(op.notaMediaSolucao, minNotaSolucao, maxNotaSolucao)
    const normTempoPausa = normalizar(op.tempoMedioPausa, Math.min(...operadores.map(o => o.tempoMedioPausa)), Math.max(...operadores.map(o => o.tempoMedioPausa)))

    // Fórmula de score PERFEITA:
    // score = 0.35*norm(totalAtendimentos) + 0.20*(1 - norm(tempoMedioAtendimento)) + 0.20*norm(notaAtendimento) + 0.20*norm(notaSolucao) - 0.05*norm(tempoPausa)
    op.score = 0.35 * normTotal + 
                0.20 * (1 - normTempo) + 
                0.20 * normNotaAtendimento + 
                0.20 * normNotaSolucao -
                0.05 * normTempoPausa
  })

  // Ordenar por score
  return operadores.sort((a, b) => b.score - a.score)
}