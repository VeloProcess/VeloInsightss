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
  console.log('🔍 Procurando colunas T M Logado e T M Pausado...')
  
  // Encontrar índices das colunas T M Logado / Dia e T M Pausado
  let indiceTempoLogado = -1
  let indiceTempoPausado = -1
  
  cabecalhos.forEach((cabecalho, index) => {
    if (cabecalho && cabecalho.includes('T M Logado')) {
      indiceTempoLogado = index
      console.log(`✅ T M Logado encontrado na coluna ${index}: ${cabecalho}`)
    }
    if (cabecalho && cabecalho.includes('T M Pausado')) {
      indiceTempoPausado = index
      console.log(`✅ T M Pausado encontrado na coluna ${index}: ${cabecalho}`)
    }
  })
  
  console.log(`📊 Linhas de dados para processar: ${linhasDados.length}`)

  // Função para filtrar dados dos últimos 60 dias
  const filtrarUltimos60Dias = (linhas) => {
    const hoje = new Date()
    const sessentaDiasAtras = new Date(hoje.getTime() - (60 * 24 * 60 * 60 * 1000)) // 60 dias atrás
    
    console.log(`📅 Filtrando dados de ${sessentaDiasAtras.toLocaleDateString()} até ${hoje.toLocaleDateString()}`)
    
    return linhas.filter(linha => {
      const dataStr = linha[3] // Coluna D - Data
      if (!dataStr) return false
      
      try {
        // Tentar diferentes formatos de data
        let data
        if (dataStr.includes('/')) {
          // Formato DD/MM/YYYY ou DD/MM/YY
          const partes = dataStr.split('/')
          if (partes.length === 3) {
            const dia = parseInt(partes[0])
            const mes = parseInt(partes[1]) - 1 // Mês é 0-indexado
            let ano = parseInt(partes[2])
            
            // Se ano tem 2 dígitos, assumir 20XX
            if (ano < 100) {
              ano += 2000
            }
            
            data = new Date(ano, mes, dia)
          }
        } else if (dataStr.includes('-')) {
          // Formato YYYY-MM-DD
          data = new Date(dataStr)
        } else {
          // Tentar parse direto
          data = new Date(dataStr)
        }
        
        if (isNaN(data.getTime())) {
          return false
        }
        
        return data >= sessentaDiasAtras && data <= hoje
      } catch (error) {
        console.warn(`⚠️ Erro ao processar data: ${dataStr}`, error)
        return false
      }
    })
  }

  // Filtrar dados dos últimos 60 dias
  const linhasFiltradas = filtrarUltimos60Dias(linhasDados)
  console.log(`📊 Dados filtrados dos últimos 60 dias: ${linhasFiltradas.length} linhas (de ${linhasDados.length} total)`)

  // Mapeamento correto das colunas - VERSÃO PERFEITA
  const indices = {
    chamada: 0,        // Coluna A
    operador: 2,        // Coluna C  
    data: 3,           // Coluna D
    hora: 4,           // Coluna E - Hora
    tempoURA: 11,      // Coluna L - Tempo Na Ura
    tempoEspera: 12,   // Coluna M - Tempo De Espera
    tempoFalado: 13,   // Coluna N - Tempo Falado
    tempoTotal: 14,    // Coluna O - Tempo Total
    tempoLogado: indiceTempoLogado >= 0 ? indiceTempoLogado : -1, // T M Logado / Dia
    tempoPausado: indiceTempoPausado >= 0 ? indiceTempoPausado : -1, // T M Pausado
    notaAtendimento: 27, // Coluna AB - Pergunta2 1 PERGUNTA ATENDENTE
    notaSolucao: 28     // Coluna AC - Pergunta2 2 PERGUNTA SOLUCAO
  }

  console.log('📍 Índices das colunas:', indices)

  // Processar dados linha por linha - VERSÃO PERFEITA
  const dadosProcessados = []
  const operadoresEncontrados = new Set()

  let linhasProcessadas = 0
  let linhasIgnoradas = 0

  linhasFiltradas.forEach((linha, index) => {
    try {
      // Verificar se a linha tem dados suficientes
      if (!linha || linha.length < 3) {
        linhasIgnoradas++
        return
      }

      const operador = linha[indices.operador] || 'Sem Operador'

      // Processar dados da linha - VERSÃO PERFEITA (TODAS AS LINHAS)
      const dadosLinha = {
        linha: index + 2,
        chamada: linha[indices.chamada] || '',
        operador: operador.trim(),
        data: linha[indices.data] || '',
        hora: linha[indices.hora] || '00:00:00',
        tempoURA: linha[indices.tempoURA] || '00:00:00',
        tempoEspera: linha[indices.tempoEspera] || '00:00:00',
        tempoFalado: linha[indices.tempoFalado] || '00:00:00',
        tempoTotal: linha[indices.tempoTotal] || '00:00:00',
        tempoLogado: indices.tempoLogado >= 0 ? (linha[indices.tempoLogado] || '00:00:00') : '00:00:00',
        tempoPausado: indices.tempoPausado >= 0 ? (linha[indices.tempoPausado] || '00:00:00') : '00:00:00',
        notaAtendimento: parseFloat(linha[indices.notaAtendimento]) || null,
        notaSolucao: parseFloat(linha[indices.notaSolucao]) || null
      }

      dadosProcessados.push(dadosLinha)
      operadoresEncontrados.add(operador.trim())
      linhasProcessadas++

    } catch (error) {
      console.error(`❌ Erro ao processar linha ${index + 2}:`, error)
      linhasIgnoradas++
    }
  })

  console.log(`📊 Debug do processamento:`)
  console.log(`  ✅ Linhas processadas: ${linhasProcessadas}`)
  console.log(`  ❌ Linhas ignoradas: ${linhasIgnoradas}`)
  console.log(`  📋 Total esperado: ${linhasDados.length}`)
  
  // Debug específico para encontrar diferenças
  if (linhasProcessadas !== linhasDados.length) {
    console.log(`🔍 Diferença no processamento: Esperado ${linhasDados.length}, processado ${linhasProcessadas}`)
    console.log(`🔍 Diferença: ${linhasDados.length - linhasProcessadas} linhas`)
  }

  console.log(`✅ ${dadosProcessados.length} linhas processadas`)
  console.log(`👥 ${operadoresEncontrados.size} operadores encontrados`)

  // Calcular métricas gerais - VERSÃO PERFEITA IMPLEMENTADA
  const metricas = calcularMetricas(dadosProcessados)

  // Calcular métricas por operador
  const metricasOperadores = calcularMetricasOperadores(dadosProcessados)

  // Calcular ranking
  console.log('🔍 Debug - Chamando calcularRanking com:', Object.keys(metricasOperadores).length, 'operadores')
  console.log('🔍 Debug - Primeiro operador:', Object.values(metricasOperadores)[0])
  const rankings = calcularRanking(metricasOperadores)
  console.log('🔍 Debug - Rankings retornados:', rankings.length, 'itens')
  console.log('🔍 Debug - Primeiro ranking:', rankings[0])

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
  
  // Debug detalhado para cada categoria
  let retidaURA = 0
  let atendida = 0
  let abandonada = 0
  let naoClassificada = 0
  
  dados.forEach((row, index) => {
    const chamada = row.chamada || ''
    const tempoFalado = row.tempoFalado || '00:00:00'
    const tempoEspera = row.tempoEspera || '00:00:00'
    const tempoMinutos = tempoParaMinutos(tempoFalado)
    const tempoEsperaMinutos = tempoParaMinutos(tempoEspera)
    
    if (chamada.toLowerCase().includes('retida') || chamada.toLowerCase().includes('ura')) {
      retidaURA++
    } else if (chamada.toLowerCase().includes('abandonada')) {
      abandonada++
    } else if (tempoMinutos > 0 || chamada.toLowerCase().includes('atendida')) {
      atendida++
    } else if (tempoEsperaMinutos > 0 && tempoMinutos === 0 && !chamada.toLowerCase().includes('retida')) {
      abandonada++
    } else {
      naoClassificada++
      // Log das primeiras 5 linhas não classificadas para debug
      if (naoClassificada <= 5) {
        console.log(`🔍 Linha não classificada ${index + 1}:`, {
          chamada,
          tempoFalado,
          tempoEspera,
          tempoMinutos,
          tempoEsperaMinutos
        })
      }
    }
  })
  
  console.log(`📊 Debug - Contagem detalhada:`)
  console.log(`  📞 Retida na URA: ${retidaURA}`)
  console.log(`  ✅ Atendida: ${atendida}`)
  console.log(`  ❌ Abandonada: ${abandonada}`)
  console.log(`  ❓ Não classificada: ${naoClassificada}`)
  console.log(`  📊 Soma: ${retidaURA + atendida + abandonada + naoClassificada}`)
  console.log(`  📊 Total esperado: ${totalChamadas}`)

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

  // Tempo médio logado e pausado - NOVOS INDICADORES
  const temposLogado = dados.map(row => tempoParaMinutos(row.tempoLogado)).filter(tempo => tempo > 0)
  const tempoMedioLogado = temposLogado.length > 0 
    ? temposLogado.reduce((sum, tempo) => sum + tempo, 0) / temposLogado.length
    : 0

  const temposPausado = dados.map(row => tempoParaMinutos(row.tempoPausado)).filter(tempo => tempo > 0)
  const tempoMedioPausado = temposPausado.length > 0 
    ? temposPausado.reduce((sum, tempo) => sum + tempo, 0) / temposPausado.length
    : 0

  console.log(`📊 Debug - Tempos médios:`, {
    tempoMedioLogado: tempoMedioLogado.toFixed(1),
    tempoMedioPausado: tempoMedioPausado.toFixed(1),
    registrosLogado: temposLogado.length,
    registrosPausado: temposPausado.length
  })

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
    tempoMedioLogado: parseFloat(tempoMedioLogado.toFixed(1)), // NOVO INDICADOR
    tempoMedioPausado: parseFloat(tempoMedioPausado.toFixed(1)), // NOVO INDICADOR
    taxaAtendimento: parseFloat(taxaAtendimento.toFixed(1)),
    taxaAbandono: parseFloat(taxaAbandono.toFixed(1))
  }
}

// Calcular métricas por operador - VERSÃO PERFEITA IMPLEMENTADA
const calcularMetricasOperadores = (dados) => {
  const operadores = {}
  
  // Função para converter tempo HH:MM:SS para minutos
  const tempoParaMinutos = (tempo) => {
    if (!tempo || tempo === '00:00:00' || tempo === '') return 0
    
    try {
      // Se já é um número, retorna como está
      if (typeof tempo === 'number') return tempo
      
      // Se é string, tenta converter
      if (typeof tempo === 'string') {
        // Remove espaços e converte para minúsculas
        const tempoLimpo = tempo.trim().toLowerCase()
        
        // Se contém ':', assume formato HH:MM:SS ou MM:SS
        if (tempoLimpo.includes(':')) {
          const partes = tempoLimpo.split(':')
          if (partes.length === 3) {
            // HH:MM:SS
            const [horas, minutos, segundos] = partes.map(Number)
            return horas * 60 + minutos + segundos / 60
          } else if (partes.length === 2) {
            // MM:SS
            const [minutos, segundos] = partes.map(Number)
            return minutos + segundos / 60
          }
        }
        
        // Se não tem ':', tenta converter diretamente para número
        const numero = parseFloat(tempoLimpo)
        if (!isNaN(numero)) return numero
      }
      
      return 0
    } catch (error) {
      console.warn('Erro ao converter tempo:', tempo, error)
      return 0
    }
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
    const tempoMinutos = tempoParaMinutos(d.tempoFalado)
    operadores[d.operador].tempoTotal += tempoMinutos
    
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

// Calcular ranking - VERSÃO CORRIGIDA E FUNCIONAL
const calcularRanking = (metricasOperadores) => {
  const operadores = Object.values(metricasOperadores)
  
  if (operadores.length === 0) {
    return []
  }
  
  // Filtrar operadores válidos (com nome, não desligados e não "Sem Operador")
  const operadoresValidos = operadores.filter(op => {
    if (!op.operador || op.operador.trim() === '') return false
    
    const nome = op.operador.toLowerCase()
    const isDesligado = nome.includes('desl') || 
                       nome.includes('desligado') || 
                       nome.includes('excluído') || 
                       nome.includes('inativo')
    
    const isSemOperador = nome.includes('sem operador') || 
                         nome.includes('agentes indisponíveis')
    
    return !isDesligado && !isSemOperador
  })
  
  if (operadoresValidos.length === 0) {
    return []
  }
  
  // Normalizar valores para calcular score
  const totalAtendimentos = operadoresValidos.map(op => Number(op.totalAtendimentos) || 0)
  const temposMedios = operadoresValidos.map(op => Number(op.tempoMedio) || 0)
  const notasAtendimento = operadoresValidos.map(op => Number(op.notaMediaAtendimento) || 0)
  const notasSolucao = operadoresValidos.map(op => Number(op.notaMediaSolucao) || 0)

  const minTotal = Math.min(...totalAtendimentos)
  const maxTotal = Math.max(...totalAtendimentos)
  const minTempo = Math.min(...temposMedios)
  const maxTempo = Math.max(...temposMedios)
  const minNotaAtendimento = Math.min(...notasAtendimento)
  const maxNotaAtendimento = Math.max(...notasAtendimento)
  const minNotaSolucao = Math.min(...notasSolucao)
  const maxNotaSolucao = Math.max(...notasSolucao)

  // Função de normalização segura
  const normalizar = (valor, min, max) => {
    if (max === min) return 0.5
    const normalized = (valor - min) / (max - min)
    return Math.max(0, Math.min(1, normalized))
  }

  // Calcular score para cada operador
  const rankings = operadoresValidos.map(op => {
    const totalAtend = Number(op.totalAtendimentos) || 0
    const tempoMed = Number(op.tempoMedio) || 0
    const notaAtend = Number(op.notaMediaAtendimento) || 0
    const notaSol = Number(op.notaMediaSolucao) || 0
    
    const normTotal = normalizar(totalAtend, minTotal, maxTotal)
    const normTempo = normalizar(tempoMed, minTempo, maxTempo)
    const normNotaAtendimento = normalizar(notaAtend, minNotaAtendimento, maxNotaAtendimento)
    const normNotaSolucao = normalizar(notaSol, minNotaSolucao, maxNotaSolucao)

    // Fórmula de score do projeto Velodados
    const score = 0.35 * normTotal + 
                  0.20 * (1 - normTempo) + 
                  0.20 * normNotaAtendimento + 
                  0.20 * normNotaSolucao

    return {
      operator: op.operador.trim(),
      totalCalls: totalAtend,
      avgDuration: parseFloat(tempoMed.toFixed(1)),
      avgRatingAttendance: parseFloat(notaAtend.toFixed(1)),
      avgRatingSolution: parseFloat(notaSol.toFixed(1)),
      avgPauseTime: 0,
      totalRecords: totalAtend,
      score: (score * 100).toFixed(1),
      isExcluded: false,
      isDesligado: op.operador.toLowerCase().includes('desl') || 
                  op.operador.toLowerCase().includes('desligado') ||
                  op.operador.toLowerCase().includes('excluído') ||
                  op.operador.toLowerCase().includes('inativo')
    }
  })

  // Ordenar por score (maior primeiro)
  return rankings.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
}