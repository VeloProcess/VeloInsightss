import { OPERADORES_PERMITIDOS, OPERADORES_EXCLUIDOS, FILTRO_CONFIG } from '../config/operadores'

// Função para processar dados da planilha
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

  // Encontrar índices das colunas importantes
  const indices = {
    data: cabecalhos.findIndex(h => h && h.toLowerCase().includes('data')),
    operador: cabecalhos.findIndex(h => h && h.toLowerCase().includes('operador') || h.toLowerCase().includes('atendente')),
    tempoFalado: cabecalhos.findIndex(h => h && h.toLowerCase().includes('tempo') && h.toLowerCase().includes('falado')),
    notaAtendimento: cabecalhos.findIndex(h => h && h.toLowerCase().includes('pergunta') && h.toLowerCase().includes('atendente')),
    notaSolucao: cabecalhos.findIndex(h => h && h.toLowerCase().includes('pergunta') && h.toLowerCase().includes('solucao')),
    chamada: cabecalhos.findIndex(h => h && h.toLowerCase().includes('chamada'))
  }

  console.log('📍 Índices das colunas:', indices)

  // Processar dados linha por linha
  const dadosProcessados = []
  const operadoresEncontrados = new Set()

  linhasDados.forEach((linha, index) => {
    try {
      // Verificar se a linha tem dados suficientes
      if (!linha || linha.length < 3) return

      const operador = linha[indices.operador]
      if (!operador || operador.trim() === '') return

      // Aplicar filtros (busca flexível por nome)
      const operadorLimpo = operador.trim()
      
      if (FILTRO_CONFIG.usarListaExclusao) {
        const estaExcluido = OPERADORES_EXCLUIDOS.some(excluido => 
          operadorLimpo.toLowerCase().includes(excluido.toLowerCase()) ||
          excluido.toLowerCase().includes(operadorLimpo.toLowerCase())
        )
        if (estaExcluido) {
          console.log(`🚫 Operador excluído: ${operador}`)
          return
        }
      }

      if (FILTRO_CONFIG.usarListaPermitida) {
        const estaPermitido = OPERADORES_PERMITIDOS.some(permitido => 
          operadorLimpo.toLowerCase().includes(permitido.toLowerCase()) ||
          permitido.toLowerCase().includes(operadorLimpo.toLowerCase())
        )
        if (!estaPermitido) {
          console.log(`❌ Operador não permitido: ${operador}`)
          return
        }
      }

      // Processar dados da linha
      const dadosLinha = {
        linha: index + 2, // +2 porque começamos do índice 1 e pulamos o cabeçalho
        data: linha[indices.data] || '',
        operador: operador.trim(),
        tempoFalado: parseFloat(linha[indices.tempoFalado]) || 0,
        notaAtendimento: parseFloat(linha[indices.notaAtendimento]) || null,
        notaSolucao: parseFloat(linha[indices.notaSolucao]) || null,
        chamada: linha[indices.chamada] || ''
      }

      dadosProcessados.push(dadosLinha)
      operadoresEncontrados.add(operador.trim())

    } catch (error) {
      console.error(`❌ Erro ao processar linha ${index + 2}:`, error)
    }
  })

  console.log(`✅ ${dadosProcessados.length} linhas processadas`)
  console.log(`👥 ${operadoresEncontrados.size} operadores encontrados:`, Array.from(operadoresEncontrados))

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

// Calcular métricas gerais
const calcularMetricas = (dados) => {
  if (dados.length === 0) {
    return {
      totalAtendimentos: 0,
      tempoMedio: 0,
      notaMediaAtendimento: 0,
      notaMediaSolucao: 0,
      operadoresAtivos: 0
    }
  }

  const temposValidos = dados.filter(d => d.tempoFalado > 0)
  const notasAtendimentoValidas = dados.filter(d => d.notaAtendimento !== null)
  const notasSolucaoValidas = dados.filter(d => d.notaSolucao !== null)
  const operadoresUnicos = new Set(dados.map(d => d.operador))

  return {
    totalAtendimentos: dados.length,
    tempoMedio: temposValidos.length > 0 ? 
      temposValidos.reduce((sum, d) => sum + d.tempoFalado, 0) / temposValidos.length : 0,
    notaMediaAtendimento: notasAtendimentoValidas.length > 0 ?
      notasAtendimentoValidas.reduce((sum, d) => sum + d.notaAtendimento, 0) / notasAtendimentoValidas.length : 0,
    notaMediaSolucao: notasSolucaoValidas.length > 0 ?
      notasSolucaoValidas.reduce((sum, d) => sum + d.notaSolucao, 0) / notasSolucaoValidas.length : 0,
    operadoresAtivos: operadoresUnicos.size
  }
}

// Calcular métricas por operador
const calcularMetricasOperadores = (dados) => {
  const operadores = {}
  
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
    operadores[d.operador].tempoTotal += d.tempoFalado
    
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

  // Calcular score para cada operador
  operadores.forEach(op => {
    const normTotal = normalizar(op.totalAtendimentos, minTotal, maxTotal)
    const normTempo = normalizar(op.tempoMedio, minTempo, maxTempo)
    const normNotaAtendimento = normalizar(op.notaMediaAtendimento, minNotaAtendimento, maxNotaAtendimento)
    const normNotaSolucao = normalizar(op.notaMediaSolucao, minNotaSolucao, maxNotaSolucao)

    // Fórmula de score: mais atendimentos = melhor, menos tempo = melhor, mais notas = melhor
    op.score = 0.35 * normTotal + 
                0.20 * (1 - normTempo) + 
                0.20 * normNotaAtendimento + 
                0.20 * normNotaSolucao
  })

  // Ordenar por score
  return operadores.sort((a, b) => b.score - a.score)
}
