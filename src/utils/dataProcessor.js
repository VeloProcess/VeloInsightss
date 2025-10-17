// ========================================
// PROCESSAMENTO DE DADOS - VELOINSIGHTS
// ========================================

// ========================================
// COMPARATIVOS TEMPORAIS - FASE 1
// ========================================

// Função para calcular comparativo mensal
export const calcularComparativoMensal = (dadosAtuais, dadosAnterior) => {
  if (!dadosAtuais || !dadosAnterior) {
    return {
      chamadas: { atual: 0, anterior: 0, variacao: '0%', tendencia: 'neutra' },
      duracaoMedia: { atual: '0:00', anterior: '0:00', variacao: '0%', tendencia: 'neutra' },
      satisfacao: { atual: 0, anterior: 0, variacao: '0%', tendencia: 'neutra' }
    }
  }

  // Calcular métricas atuais
  const metricasAtuais = calcularMetricasBasicas(dadosAtuais)
  
  // Calcular métricas do mês anterior
  const metricasAnterior = calcularMetricasBasicas(dadosAnterior)

  // Calcular variações percentuais
  const variacaoChamadas = calcularVariacaoPercentual(metricasAtuais.totalChamadas, metricasAnterior.totalChamadas)
  const variacaoDuracao = calcularVariacaoPercentual(metricasAtuais.duracaoMedia, metricasAnterior.duracaoMedia)
  const variacaoSatisfacao = calcularVariacaoPercentual(metricasAtuais.satisfacaoMedia, metricasAnterior.satisfacaoMedia)

  return {
    chamadas: {
      atual: metricasAtuais.totalChamadas,
      anterior: metricasAnterior.totalChamadas,
      variacao: variacaoChamadas.percentual,
      tendencia: variacaoChamadas.tendencia
    },
    duracaoMedia: {
      atual: formatarTempo(metricasAtuais.duracaoMedia),
      anterior: formatarTempo(metricasAnterior.duracaoMedia),
      variacao: variacaoDuracao.percentual,
      tendencia: variacaoDuracao.tendencia
    },
    satisfacao: {
      atual: metricasAtuais.satisfacaoMedia,
      anterior: metricasAnterior.satisfacaoMedia,
      variacao: variacaoSatisfacao.percentual,
      tendencia: variacaoSatisfacao.tendencia
    }
  }
}

// Função para calcular comparativo semanal
export const calcularComparativoSemanal = (dadosAtuais, dadosAnterior) => {
  if (!dadosAtuais || !dadosAnterior) {
    return {
      tendencias: 'neutra',
      pontosCriticos: [],
      melhoresDias: [],
      variacaoGeral: '0%'
    }
  }

  const metricasAtuais = calcularMetricasBasicas(dadosAtuais)
  const metricasAnterior = calcularMetricasBasicas(dadosAnterior)
  
  const variacaoGeral = calcularVariacaoPercentual(metricasAtuais.totalChamadas, metricasAnterior.totalChamadas)
  
  // Analisar tendências por dia da semana
  const analiseDias = analisarTendenciasPorDia(dadosAtuais, dadosAnterior)
  
  return {
    tendencias: variacaoGeral.tendencia,
    pontosCriticos: analiseDias.pontosCriticos,
    melhoresDias: analiseDias.melhoresDias,
    variacaoGeral: variacaoGeral.percentual,
    eficiencia: {
      atual: metricasAtuais.eficiencia,
      anterior: metricasAnterior.eficiencia,
      variacao: calcularVariacaoPercentual(metricasAtuais.eficiencia, metricasAnterior.eficiencia).percentual
    }
  }
}

// Função auxiliar para calcular métricas básicas
const calcularMetricasBasicas = (dados) => {
  if (!dados || dados.length === 0) {
    return {
      totalChamadas: 0,
      duracaoMedia: 0,
      satisfacaoMedia: 0,
      eficiencia: 0
    }
  }

  let totalChamadas = 0
  let totalDuracao = 0
  let totalSatisfacao = 0
  let chamadasComSatisfacao = 0

  dados.forEach(record => {
    const isObject = typeof record === 'object' && !Array.isArray(record)
    
    // Contar chamadas
    totalChamadas++
    
    // Calcular duração média
    let tempoTotal = null
    if (isObject) {
      tempoTotal = record.tempoTotal || record.tempoAtendimento || record.duracao || 
                  record.tempo || record.duration || record['Tempo Total'] || 
                  record['Tempo Atendimento'] || record['Duração'] || record['Tempo']
    } else {
      tempoTotal = record[14] // Coluna O
    }
    
    if (tempoTotal) {
      const duracaoMinutos = parseDurationToMinutes(tempoTotal)
      totalDuracao += duracaoMinutos
    }
    
    // Calcular satisfação média
    let notaAtendimento = null
    if (isObject) {
      notaAtendimento = record.notaAtendimento || record.rating || record['Nota Atendimento'] || 
                       record['Pergunta2 1 PERGUNTA ATENDENTE'] || record['AB']
    } else {
      notaAtendimento = record[27] // Coluna AB
    }
    
    if (notaAtendimento && notaAtendimento > 0) {
      totalSatisfacao += parseFloat(notaAtendimento)
      chamadasComSatisfacao++
    }
  })

  return {
    totalChamadas,
    duracaoMedia: totalChamadas > 0 ? totalDuracao / totalChamadas : 0,
    satisfacaoMedia: chamadasComSatisfacao > 0 ? totalSatisfacao / chamadasComSatisfacao : 0,
    eficiencia: totalChamadas > 0 ? (totalSatisfacao / chamadasComSatisfacao) * (totalChamadas / Math.max(totalDuracao / 60, 1)) : 0
  }
}

// Função para calcular variação percentual
const calcularVariacaoPercentual = (atual, anterior) => {
  if (anterior === 0) {
    return {
      percentual: atual > 0 ? '+100%' : '0%',
      tendencia: atual > 0 ? 'crescimento' : 'neutra'
    }
  }
  
  const variacao = ((atual - anterior) / anterior) * 100
  const percentual = variacao >= 0 ? `+${variacao.toFixed(1)}%` : `${variacao.toFixed(1)}%`
  const tendencia = variacao > 5 ? 'crescimento' : variacao < -5 ? 'declínio' : 'neutra'
  
  return { percentual, tendencia }
}

// Função para analisar tendências por dia
const analisarTendenciasPorDia = (dadosAtuais, dadosAnterior) => {
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const analiseDias = {}
  
  // Analisar dados atuais
  dadosAtuais.forEach(record => {
    const isObject = typeof record === 'object' && !Array.isArray(record)
    let dataStr = null
    
    if (isObject) {
      dataStr = record.data || record.dataAtendimento || record['Data'] || record['Data Atendimento']
    } else {
      dataStr = record[3] // Coluna D
    }
    
    if (dataStr) {
      try {
        const data = new Date(dataStr.split('/').reverse().join('-'))
        const diaSemana = diasSemana[data.getDay()]
        
        if (!analiseDias[diaSemana]) {
          analiseDias[diaSemana] = { atual: 0, anterior: 0 }
        }
        analiseDias[diaSemana].atual++
      } catch (error) {
        // Ignorar datas inválidas
      }
    }
  })
  
  // Analisar dados anteriores
  dadosAnterior.forEach(record => {
    const isObject = typeof record === 'object' && !Array.isArray(record)
    let dataStr = null
    
    if (isObject) {
      dataStr = record.data || record.dataAtendimento || record['Data'] || record['Data Atendimento']
    } else {
      dataStr = record[3] // Coluna D
    }
    
    if (dataStr) {
      try {
        const data = new Date(dataStr.split('/').reverse().join('-'))
        const diaSemana = diasSemana[data.getDay()]
        
        if (!analiseDias[diaSemana]) {
          analiseDias[diaSemana] = { atual: 0, anterior: 0 }
        }
        analiseDias[diaSemana].anterior++
      } catch (error) {
        // Ignorar datas inválidas
      }
    }
  })
  
  // Identificar pontos críticos e melhores dias
  const pontosCriticos = []
  const melhoresDias = []
  
  Object.entries(analiseDias).forEach(([dia, dados]) => {
    const variacao = dados.anterior > 0 ? ((dados.atual - dados.anterior) / dados.anterior) * 100 : 0
    
    if (variacao < -10) {
      pontosCriticos.push(dia)
    } else if (variacao > 10) {
      melhoresDias.push(dia)
    }
  })
  
  return { pontosCriticos, melhoresDias }
}

// Função para formatar tempo
const formatarTempo = (minutos) => {
  if (!minutos || minutos === 0) return '0:00'
  
  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)
  
  return `${horas}:${mins.toString().padStart(2, '0')}`
}

// Função para converter HH:MM:SS para minutos
const parseDurationToMinutes = (durationString) => {
  if (!durationString || typeof durationString !== 'string') return 0
  
  const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    return (hours * 60) + minutes + (seconds / 60);
  }
  
  return parseFloat(durationString) || 0;
}

// ========================================
// SISTEMA DE PAGINAÇÃO E PERFORMANCE
// ========================================

// Configurações de paginação OTIMIZADAS
const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 500,    // Reduzido de 1000 para 500
  MAX_PAGE_SIZE: 2000,       // Reduzido de 5000 para 2000
  MIN_PAGE_SIZE: 50,         // Reduzido de 100 para 50
  CHUNK_SIZE: 100,           // Processamento em chunks de 100
  BATCH_DELAY: 10            // Delay entre batches (ms)
}

// Cache de métricas para otimização
const metricsCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para gerar chave de cache
const generateCacheKey = (dataHash, page, pageSize, filters) => {
  return `${dataHash}_${page}_${pageSize}_${JSON.stringify(filters)}`
}

// Função para verificar se cache é válido
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION
}

// Função para gerar hash dos dados
const generateDataHash = (dados) => {
  const dataString = JSON.stringify(dados.slice(0, 10)) // Primeiras 10 linhas para hash
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Função para processar dados com paginação OTIMIZADA
export const processarDadosPaginado = async (dados, page = 1, pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, filters = {}) => {
  
  const startTime = performance.now()
  const dataHash = generateDataHash(dados)
  const cacheKey = generateCacheKey(dataHash, page, pageSize, filters)
  
  // Verificar cache
  const cachedResult = metricsCache.get(cacheKey)
  if (isCacheValid(cachedResult)) {
    return cachedResult.data
  }

  // Processamento em chunks assíncronos para melhor performance
  const processChunk = async (chunk) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const processed = processarDados(chunk)
        resolve(processed)
      }, PAGINATION_CONFIG.BATCH_DELAY)
    })
  }
  
  // Calcular índices de paginação
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const totalRecords = dados.length
  const totalPages = Math.ceil(totalRecords / pageSize)
  
  // Aplicar filtros se necessário
  let dadosFiltrados = dados
  if (filters.dateRange) {
    dadosFiltrados = dados.filter(linha => {
      const data = linha[3] // Coluna D - Data
      if (!data) return false
      const dataObj = new Date(data.split('/').reverse().join('-'))
      return dataObj >= filters.dateRange.start && dataObj <= filters.dateRange.end
    })
  }
  
  // Paginar dados
  const dadosPagina = dadosFiltrados.slice(startIndex, endIndex)
  
  // Processar métricas da página usando funções existentes
  const metricas = calcularMetricasGerais(dadosPagina)
  const metricasOperadores = calcularMetricasOperadores(dadosPagina)
  const rankings = calcularRanking(metricasOperadores)
  
  const result = {
    dadosFiltrados: dadosPagina,
    metricas,
    metricasOperadores,
    rankings,
    operadores: Object.keys(metricasOperadores),
    pagination: {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalRecords)
    },
    period: {
      startDate: dadosPagina.length > 0 ? dadosPagina[0][3] : null,
      endDate: dadosPagina.length > 0 ? dadosPagina[dadosPagina.length - 1][3] : null,
      totalDays: dadosPagina.length > 0 ? new Set(dadosPagina.map(d => d[3])).size : 0
    }
  }
  
  // Armazenar no cache
  metricsCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  })
  
  const endTime = performance.now()
  
  return result
}

// Função para limpar cache
export const clearMetricsCache = () => {
  metricsCache.clear()
}

// Função para obter estatísticas de cache
export const getCacheStats = () => {
  return {
    size: metricsCache.size,
    entries: Array.from(metricsCache.keys())
  }
}

// ========================================
// PROCESSAMENTO TRADICIONAL (MANTIDO PARA COMPATIBILIDADE)
// ========================================

// Função para processar dados da planilha - VERSÃO PERFEITA IMPLEMENTADA
export const processarDados = (dados, processAllRecords = false) => {
  if (!dados || dados.length === 0) {
    return {
      dadosFiltrados: [],
      operadores: [],
      metricas: {},
      rankings: []
    }
  }


  // Primeira linha são os cabeçalhos
  const cabecalhos = dados[0]
  const linhasDados = dados.slice(1)

  
  // Encontrar índices das colunas T M Logado / Dia e T M Pausado
  let indiceTempoLogado = -1
  let indiceTempoPausado = -1
  
  cabecalhos.forEach((cabecalho, index) => {
    if (cabecalho && cabecalho.includes('T M Logado')) {
      indiceTempoLogado = index
    }
    if (cabecalho && cabecalho.includes('T M Pausado')) {
      indiceTempoPausado = index
    }
  })
  

  // Função para filtrar dados dos últimos 60 dias (ou todos se processAllRecords = true)
  const filtrarUltimos60Dias = (linhas) => {
    // Se processAllRecords for true, retornar todos os dados sem filtro
    if (processAllRecords) {
      console.log(`✅ processAllRecords=true: retornando todos os ${linhas.length} registros sem filtro`)
      return linhas
    }
    const hoje = new Date()
    const sessentaDiasAtras = new Date(hoje.getTime() - (60 * 24 * 60 * 60 * 1000)) // 60 dias atrás
    
    
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

  // Filtrar dados dos últimos 60 dias (ou todos se processAllRecords = true)
  const linhasFiltradas = filtrarUltimos60Dias(linhasDados)

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


  // Processar dados linha por linha - VERSÃO PERFEITA
  const dadosProcessados = []
  const operadoresEncontrados = new Set()

  let linhasProcessadas = 0
  let linhasIgnoradas = 0

  linhasFiltradas.forEach((linha, index) => {
    try {
      // Verificar se a linha tem dados suficientes - CORRIGIDO PARA PERMITIR LINHAS COM PELO MENOS 1 ELEMENTO
      if (!linha || !Array.isArray(linha) || linha.length < 1) {
        console.warn(`⚠️ Linha ${index + 2} ignorada: linha vazia ou sem dados`)
        console.warn(`⚠️ Conteúdo da linha:`, linha)
        console.warn(`⚠️ Tipo da linha:`, typeof linha, Array.isArray(linha))
        linhasIgnoradas++
        return
      }

      const operador = linha[indices.operador] || 'Sem Operador'

      // Processar dados da linha - VERSÃO PERFEITA (TODAS AS LINHAS)
      const chamada = linha[indices.chamada] || ''
      const tempoFalado = linha[indices.tempoFalado] || '00:00:00'
      const tempoEspera = linha[indices.tempoEspera] || '00:00:00'
      
      // Função para converter tempo HH:MM:SS para minutos
      const tempoParaMinutos = (tempo) => {
        if (!tempo || tempo === '00:00:00') return 0
        const [horas, minutos, segundos] = tempo.split(':').map(Number)
        return horas * 60 + minutos + segundos / 60
      }
      
      const tempoMinutos = tempoParaMinutos(tempoFalado)
      const tempoEsperaMinutos = tempoParaMinutos(tempoEspera)
      
      // Classificar status da chamada
      let status = 'naoClassificada'
      if (chamada.toLowerCase().includes('retida') || chamada.toLowerCase().includes('ura')) {
        status = 'retida'
      } else if (chamada.toLowerCase().includes('abandonada')) {
        status = 'abandonada'
      } else if (tempoMinutos > 0 || chamada.toLowerCase().includes('atendida')) {
        status = 'atendida'
      } else if (tempoEsperaMinutos > 0 && tempoMinutos === 0 && !chamada.toLowerCase().includes('retida')) {
        status = 'abandonada'
      }
      
      const dadosLinha = {
        linha: index + 2,
        chamada: chamada,
        operador: operador.trim(),
        data: linha[indices.data] || '',
        hora: linha[indices.hora] || '00:00:00',
        tempoURA: linha[indices.tempoURA] || '00:00:00',
        tempoEspera: tempoEspera,
        tempoFalado: tempoFalado,
        tempoTotal: linha[indices.tempoTotal] || '00:00:00',
        tempoLogado: indices.tempoLogado >= 0 ? (linha[indices.tempoLogado] || '00:00:00') : '00:00:00',
        tempoPausado: indices.tempoPausado >= 0 ? (linha[indices.tempoPausado] || '00:00:00') : '00:00:00',
        notaAtendimento: parseFloat(linha[indices.notaAtendimento]) || null,
        notaSolucao: parseFloat(linha[indices.notaSolucao]) || null,
        status: status
      }

      dadosProcessados.push(dadosLinha)
      operadoresEncontrados.add(operador.trim())
      linhasProcessadas++

    } catch (error) {
      console.error(`❌ Erro ao processar linha ${index + 2}:`, error)
      console.error(`❌ Dados da linha problemática:`, linha)
      linhasIgnoradas++
    }
  })

  // Debug do processamento
  console.log(`📊 Debug do processamento:`)
  console.log(`📊 Total de linhas de dados: ${linhasDados.length}`)
  console.log(`📊 Linhas filtradas: ${linhasFiltradas.length}`)
  console.log(`📊 Linhas processadas: ${linhasProcessadas}`)
  console.log(`📊 Linhas ignoradas: ${linhasIgnoradas}`)
  console.log(`📊 processAllRecords: ${processAllRecords}`)
  console.log(`📊 Diferença: ${linhasFiltradas.length - linhasProcessadas} linhas perdidas no processamento`)
  
  // Verificar se há diferença no processamento
  if (linhasFiltradas.length !== linhasProcessadas) {
    console.warn(`⚠️ Diferença no processamento: Esperado ${linhasFiltradas.length}, processado ${linhasProcessadas}`)
    console.warn(`⚠️ ${linhasFiltradas.length - linhasProcessadas} linhas foram perdidas durante o processamento`)
    
    // Debug adicional: mostrar algumas linhas que podem estar causando problema
    console.log(`🔍 Debug das primeiras 5 linhas filtradas:`)
    for (let i = 0; i < Math.min(5, linhasFiltradas.length); i++) {
      const linha = linhasFiltradas[i]
      console.log(`  Linha ${i + 1}:`, {
        length: linha?.length,
        tipo: typeof linha,
        isArray: Array.isArray(linha),
        primeiroElemento: linha?.[0],
        segundoElemento: linha?.[1],
        terceiroElemento: linha?.[2]
      })
    }
  } else {
    console.log(`✅ Todos os ${linhasFiltradas.length} registros foram processados com sucesso!`)
  }
  
  // Verificar se há diferença no processamento
  if (linhasDados.length !== linhasProcessadas) {
    console.warn(`⚠️ Diferença no processamento: Esperado ${linhasDados.length}, processado ${linhasProcessadas}`)
  } else {
    console.log(`✅ Todos os ${linhasDados.length} registros foram processados com sucesso!`)
  }

  // Calcular métricas gerais - VERSÃO PERFEITA IMPLEMENTADA
  // Usar a função calcularMetricas para obter métricas reais
  const metricasCalculadas = calcularMetricas(dadosProcessados)
  
  const metricas = {
    totalChamadas: dadosProcessados.length,
    retidaURA: dadosProcessados.filter(d => d.status === 'retida').length,
    atendida: dadosProcessados.filter(d => d.status === 'atendida').length,
    abandonada: dadosProcessados.filter(d => d.status === 'abandonada').length,
    duracaoMediaAtendimento: metricasCalculadas.duracaoMediaAtendimento,
    tempoMedioEspera: metricasCalculadas.tempoMedioEspera,
    tempoMedioURA: metricasCalculadas.tempoMedioURA,
    notaMediaAtendimento: metricasCalculadas.notaMediaAtendimento,
    notaMediaSolucao: metricasCalculadas.notaMediaSolucao,
    taxaAtendimento: metricasCalculadas.taxaAtendimento,
    taxaAbandono: metricasCalculadas.taxaAbandono,
    chamadasAvaliadas: metricasCalculadas.chamadasAvaliadas
  }

  // Calcular métricas por operador
  const metricasOperadores = calcularMetricasOperadores(dadosProcessados)

  // Calcular ranking
  const rankings = calcularRanking(metricasOperadores)

  // Calcular informações de período
  const datas = dadosProcessados.map(d => d[3]).filter(d => d)
  const datasUnicas = [...new Set(datas)].sort()
  const periodo = {
    startDate: datasUnicas.length > 0 ? datasUnicas[0] : null,
    endDate: datasUnicas.length > 0 ? datasUnicas[datasUnicas.length - 1] : null,
    totalDays: datasUnicas.length,
    totalRecords: dadosProcessados.length,
    periodLabel: datasUnicas.length > 0 ? 
      `${datasUnicas[0]} a ${datasUnicas[datasUnicas.length - 1]}` : 
      'Período não disponível'
  }

  return {
    dadosFiltrados: dadosProcessados,
    operadores: Array.from(operadoresEncontrados),
    metricas,
    metricasOperadores,
    rankings,
    periodo
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
  
  // console.log(`📊 Debug - Total de linhas processadas: ${totalChamadas}`)
  
  // Verificar se temos exatamente 5000 linhas (incluindo cabeçalho)
  if (totalChamadas < 4999) {
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
        console.log(`🔍 Linha não classificada ${naoClassificada}:`, {
          chamada,
          tempoFalado,
          tempoEspera,
          tempoMinutos,
          tempoEsperaMinutos
        })
      }
    }
  })
  
  // console.log(`📊 Debug - Contagem detalhada:`)

  // console.log(`📊 Debug - Status das chamadas:`, {
  //   retidaURA,
  //   atendida,
  //   abandonada,
  //   soma: retidaURA + atendida + abandonada
  // })

  // Cálculo de médias - VERSÃO CORRIGIDA COM COLUNAS ESPECÍFICAS
  // Duração Média: usar coluna Tempo Total (O)
  const temposTotal = dados.map(row => tempoParaMinutos(row.tempoTotal)).filter(tempo => tempo > 0)
  const duracaoMediaAtendimento = temposTotal.length > 0 ? temposTotal.reduce((sum, tempo) => sum + tempo, 0) / temposTotal.length : 0

  const temposEspera = dados.map(row => tempoParaMinutos(row.tempoEspera)).filter(tempo => tempo > 0)
  const tempoMedioEspera = temposEspera.length > 0 ? temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length : 0

  const temposURA = dados.map(row => tempoParaMinutos(row.tempoURA)).filter(tempo => tempo > 0)
  const tempoMedioURA = temposURA.length > 0 ? temposURA.reduce((sum, tempo) => sum + tempo, 0) / temposURA.length : 0

  // Tempo médio logado e pausado - NOVOS INDICADORES
  const temposLogado = dados.map(row => tempoParaMinutos(row.tempoLogado)).filter(tempo => tempo > 0)
  const tempoMedioLogado = temposLogado.length > 0 ? temposLogado.reduce((sum, tempo) => sum + tempo, 0) / temposLogado.length : 0

  const temposPausado = dados.map(row => tempoParaMinutos(row.tempoPausado)).filter(tempo => tempo > 0)
  const tempoMedioPausado = temposPausado.length > 0 ? temposPausado.reduce((sum, tempo) => sum + tempo, 0) / temposPausado.length : 0


  // Notas médias - VERSÃO CORRIGIDA COM COLUNAS AB E AC
  const notasAtendimentoValidas = dados.filter(d => d.notaAtendimento !== null)
  const notaMediaAtendimento = notasAtendimentoValidas.length > 0 ?
    notasAtendimentoValidas.reduce((sum, d) => sum + d.notaAtendimento, 0) / notasAtendimentoValidas.length : 0

  const notasSolucaoValidas = dados.filter(d => d.notaSolucao !== null)
  const notaMediaSolucao = notasSolucaoValidas.length > 0 ?
    notasSolucaoValidas.reduce((sum, d) => sum + d.notaSolucao, 0) / notasSolucaoValidas.length : 0

  // Taxa de Sucesso: média das colunas AB e AC
  const taxaSucesso = (notaMediaAtendimento + notaMediaSolucao) / 2


  // Calcular chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
  const chamadasAvaliadas = dados.filter(item => {
    const temNotaAtendimento = item.notaAtendimento !== null && 
      item.notaAtendimento >= 1 && 
      item.notaAtendimento <= 5
    
    const temNotaSolucao = item.notaSolucao !== null && 
      item.notaSolucao >= 1 && 
      item.notaSolucao <= 5
    
    return temNotaAtendimento || temNotaSolucao
  }).length

  // Taxas
  const taxaAtendimento = totalChamadas > 0 ? (atendida / totalChamadas) * 100 : 0
  const taxaAbandono = totalChamadas > 0 ? (abandonada / totalChamadas) * 100 : 0


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
    taxaAbandono: parseFloat(taxaAbandono.toFixed(1)),
    taxaSucesso: parseFloat(taxaSucesso.toFixed(1)), // NOVA MÉTRICA: média das colunas AB e AC
    chamadasAvaliadas // NOVA MÉTRICA
  }
}

// Calcular métricas por operador - VERSÃO PERFEITA IMPLEMENTADA
export const calcularMetricasOperadores = (dados) => {
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
        notasSolucao: [],
        chamadasAvaliadas: 0
      }
    }

    operadores[d.operador].totalAtendimentos++
    const tempoMinutos = tempoParaMinutos(d.tempoTotal) // Usar coluna Tempo Total (O)
    operadores[d.operador].tempoTotal += tempoMinutos
    
    if (d.notaAtendimento !== null) {
      operadores[d.operador].notasAtendimento.push(d.notaAtendimento)
    }
    
    if (d.notaSolucao !== null) {
      operadores[d.operador].notasSolucao.push(d.notaSolucao)
    }
    
    // Contar chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
    const temNotaAtendimento = d.notaAtendimento !== null && 
      d.notaAtendimento >= 1 && 
      d.notaAtendimento <= 5
    
    const temNotaSolucao = d.notaSolucao !== null && 
      d.notaSolucao >= 1 && 
      d.notaSolucao <= 5
    
    if (temNotaAtendimento || temNotaSolucao) {
      operadores[d.operador].chamadasAvaliadas++
    }
  })

  // Calcular médias
  Object.values(operadores).forEach(op => {
    op.tempoMedio = op.totalAtendimentos > 0 ? op.tempoTotal / op.totalAtendimentos : 0
    op.notaMediaAtendimento = op.notasAtendimento.length > 0 ? op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length : 0
    op.notaMediaSolucao = op.notasSolucao.length > 0 ? op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length : 0
    
  })

  return operadores
}

// Calcular ranking - VERSÃO CORRIGIDA E FUNCIONAL
export const calcularRanking = (metricasOperadores) => {
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
      chamadasAvaliadas: op.chamadasAvaliadas || 0,
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

// Função auxiliar para normalização (já no sistema, mas repetida para clareza)
const normalizar = (valor, min, max) => {
  if (max === min) return 0.5
  const norm = (valor - min) / (max - min)
  return Math.max(0, Math.min(1, norm))
}

/**
 * Calcula dados para gráfico "Evolução dos Atendimentos" (linha temporal diária).
 * @param {Array<Object>} dados - Dados filtrados.
 * @returns {Object} Dataset Chart.js para linha.
 */
export const calcEvolucaoAtendimentos = (dados) => {
  console.log('🔍 calcEvolucaoAtendimentos - Dados recebidos:', dados?.length)
  
  if (!dados || dados.length === 0) {
    console.log('❌ Nenhum dado disponível para evolução')
    return {
      labels: [],
      datasets: [{
        label: 'Atendimentos por Dia',
        data: [],
        borderColor: 'var(--color-blue-primary)',
        backgroundColor: 'rgba(22, 52, 255, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'var(--color-blue-primary)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
      }],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          x: { display: true },
          y: { display: true, beginAtZero: true }
        }
      }
    }
  }
  
  const atendimentosPorData = {}
  dados.forEach((d) => {
    // Verificar se o campo é 'data' ou 'date'
    const dataField = d.data || d.date
    if (!dataField) return
    
    const dataISO = new Date(dataField.split('/').reverse().join('-')).toISOString().split('T')[0] // Normaliza DD/MM/YYYY para YYYY-MM-DD
    if (!atendimentosPorData[dataISO]) atendimentosPorData[dataISO] = 0
    // Verificar se há tempo falado ou duração
    const tempoFalado = d.tempoFalado || d.duration_minutes || d.tempoTotal || 0
    if (tempoFalado > 0) atendimentosPorData[dataISO]++
  })

  const labels = Object.keys(atendimentosPorData).sort()
  const data = labels.map((label) => atendimentosPorData[label])
  
  console.log('🔍 calcEvolucaoAtendimentos - Resultado:', { labels: labels.length, data: data.length })

  return {
    labels,
    datasets: [{
      label: '📈 Evolução dos Atendimentos',
      data,
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(22, 52, 255, 0.08)',
      borderWidth: 2,
      pointBackgroundColor: 'var(--color-primary)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: 'var(--color-primary-light)',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
      fill: true,
      tension: 0.3,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowBlur: 12,
      shadowColor: 'rgba(22, 52, 255, 0.15)'
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animation: {
        duration: 3000,
        easing: 'easeInOutQuart',
        delay: (context) => context.dataIndex * 100,
        onComplete: function() {
          // Efeito de glitch após animação
          this.chart.canvas.style.filter = 'hue-rotate(180deg) brightness(1.2)';
          setTimeout(() => {
            this.chart.canvas.style.filter = 'none';
          }, 200);
        }
      },
      plugins: {
        zoom: { zoom: { mode: 'x' } },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 25,
            font: {
              size: 18,
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            color: 'var(--color-primary)',
            generateLabels: function(chart) {
              return [{
                text: '📈 Evolução dos Atendimentos',
                fillStyle: 'var(--color-primary)',
                strokeStyle: '#ffffff',
                lineWidth: 2,
                pointStyle: 'circle',
                hidden: false,
                index: 0
              }]
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: 'var(--color-primary)',
          bodyColor: '#ffffff',
          borderColor: 'var(--color-primary)',
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: true,
          padding: 15,
          titleFont: {
            size: 16,
            weight: 'bold',
            family: "'Courier New', monospace"
          },
          bodyFont: {
            size: 14,
            weight: '500',
            family: "'Courier New', monospace"
          },
          callbacks: {
            title: function(context) {
              return `📅 ${context[0].label}`
            },
            label: function(context) {
              const value = context.parsed.y
              const trend = context.dataIndex > 0 ? 
                (value > context.dataset.data[context.dataIndex - 1] ? '📈' : 
                 value < context.dataset.data[context.dataIndex - 1] ? '📉' : '➡️') : '🆕'
              return `${trend} ${value} atendimentos`
            },
            afterLabel: function(context) {
              if (context.dataIndex > 0) {
                const prevValue = context.dataset.data[context.dataIndex - 1]
                const currentValue = context.parsed.y
                const change = currentValue - prevValue
                const changePercent = ((change / prevValue) * 100).toFixed(1)
                return change > 0 ? 
                  `📊 +${change} (+${changePercent}%)` : 
                  `📊 ${change} (${changePercent}%)`
              }
              return ''
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10
          },
          title: {
            display: true,
            text: 'Período',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10,
            callback: function(value) {
              return `${value}`
            }
          },
          title: {
            display: true,
            text: 'Total de Atendimentos',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: '#ff00ff',
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 3,
          hoverRadius: 10
        },
        line: {
          borderCapStyle: 'round',
          borderJoinStyle: 'round'
        }
      },
      onClick: (e) => { /* Drill-down: mostrar detalhes do dia */ }
    }
  }
}

/**
 * Calcula dados para gráfico "Top Operadores" (barra por total de atendimentos).
 * @param {Object} opMetrics - Métricas por operador.
 * @param {number} topN - Número de tops (default 5).
 * @returns {Object} Dataset Chart.js para barra.
 */
export const calcTopOperadores = (opMetrics, topN = 5) => {
  console.log('🔍 calcTopOperadores - OperatorMetrics recebidos:', Object.keys(opMetrics).length)
  
  if (!opMetrics || Object.keys(opMetrics).length === 0) {
    console.log('❌ Nenhum operador disponível')
    return {
      labels: [],
      datasets: [{
        label: 'Total Atendimentos',
        data: [],
        backgroundColor: 'var(--color-blue-primary)',
        borderColor: 'var(--color-blue-primary)',
        borderWidth: 2
      }],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { 
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          x: { display: true, beginAtZero: true },
          y: { display: true }
        }
      }
    }
  }
  
  const validos = Object.values(opMetrics)
    .filter((op) => {
      const operador = op.operador || op.operator || 'Não informado'
      const totalAtendimentos = op.totalAtendimentos || op.totalCalls || 0
      return totalAtendimentos > 0 && 
             !operador.toLowerCase().includes('desligado') && 
             !operador.toLowerCase().includes('sem operador')
    })
    .sort((a, b) => (b.totalAtendimentos || b.totalCalls || 0) - (a.totalAtendimentos || a.totalCalls || 0))
    .slice(0, topN)

  const labels = validos.map((op) => op.operador || op.operator || 'Não informado')
  const data = validos.map((op) => op.totalAtendimentos || op.totalCalls || 0)
  
  console.log('🔍 calcTopOperadores - Resultado:', { labels: labels.length, data: data.length })

  return {
    labels,
    datasets: [{
      label: '🏆 Top Operadores',
      data,
      backgroundColor: [
        'rgba(22, 52, 255, 0.8)',
        'rgba(21, 162, 55, 0.8)',
        'rgba(252, 194, 0, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'var(--color-primary)',
        'var(--color-secondary)',
        'var(--color-accent)',
        'var(--color-warning)',
        'var(--color-error)'
      ],
      borderWidth: 3,
      borderRadius: 8,
      borderSkipped: false,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 15,
      shadowColor: 'rgba(22, 52, 255, 0.5)',
      hoverBackgroundColor: [
        'rgba(22, 52, 255, 1)',
        'rgba(21, 162, 55, 1)',
        'rgba(252, 194, 0, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 4,
      hoverShadowOffsetX: 0,
      hoverShadowOffsetY: 0,
      hoverShadowBlur: 25,
      hoverShadowColor: 'rgba(255, 255, 255, 0.8)'
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
        delay: (context) => context.dataIndex * 150,
        onComplete: function() {
          // Efeito de scan após animação
          this.chart.canvas.style.filter = 'brightness(1.3) contrast(1.2)';
          setTimeout(() => {
            this.chart.canvas.style.filter = 'none';
          }, 300);
        }
      },
      plugins: { 
        zoom: { zoom: { mode: 'y' } },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 25,
            font: { 
              size: 18, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            color: 'var(--color-primary)',
            generateLabels: function(chart) {
              return [{
                text: '🏆 Top Operadores',
                fillStyle: '#00ffff',
                strokeStyle: '#ffffff',
                lineWidth: 2,
                pointStyle: 'rect',
                hidden: false,
                index: 0
              }]
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: 'var(--color-primary)',
          bodyColor: '#ffffff',
          borderColor: 'var(--color-primary)',
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: true,
          padding: 15,
          titleFont: {
            size: 16,
            weight: 'bold',
            family: "'Courier New', monospace"
          },
          bodyFont: {
            size: 14,
            weight: '500',
            family: "'Courier New', monospace"
          },
          callbacks: {
            title: function(context) {
              const rank = context[0].dataIndex + 1
              const medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
              return `${medals[rank - 1] || '🏅'} ${context[0].label}`
            },
            label: function(context) {
              const value = context.parsed.x
              const percentage = ((value / Math.max(...context.dataset.data)) * 100).toFixed(1)
              return `📞 ${value} atendimentos (${percentage}% do líder)`
            },
            afterLabel: function(context) {
              const rank = context.dataIndex + 1
              const total = context.dataset.data.length
              return `📊 Posição: ${rank}º de ${total} operadores`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          beginAtZero: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10,
            callback: function(value) {
              return `${value}`
            }
          },
          title: {
            display: true,
            text: 'Total de Atendimentos',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10
          },
          title: {
            display: true,
            text: 'Operadores',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 8,
          borderSkipped: false
        }
      }
    }
  }
}

/**
 * Calcula dados para gráfico "Performance dos Melhores" (multi-barra com TMA/notas para top 5).
 * @param {Object} opMetrics - Métricas por operador.
 * @param {number} topN - Número de tops (default 5).
 * @returns {Object} Dataset Chart.js para barra agrupada.
 */
export const calcPerformanceMelhores = (opMetrics, topN = 5) => {
  console.log('🔍 calcPerformanceMelhores - OperatorMetrics recebidos:', Object.keys(opMetrics).length)
  
  const validos = Object.values(opMetrics)
    .filter((op) => {
      const operador = op.operador || op.operator || 'Não informado'
      const totalAtendimentos = op.totalAtendimentos || op.totalCalls || 0
      return totalAtendimentos > 0 && 
             !operador.toLowerCase().includes('desligado') && 
             !operador.toLowerCase().includes('sem operador')
    })
    .sort((a, b) => (b.totalAtendimentos || b.totalCalls || 0) - (a.totalAtendimentos || a.totalCalls || 0))
    .slice(0, topN)

  const labels = validos.map((op) => op.operador || op.operator || 'Não informado')
  const tmaData = validos.map((op) => op.tempoMedio || op.avgDuration || 0)
  const notaAtendData = validos.map((op) => op.notaMediaAtendimento || op.avgRatingAttendance || 0)
  const notaSoluData = validos.map((op) => op.notaMediaSolucao || op.avgRatingSolution || 0)
  
  console.log('🔍 calcPerformanceMelhores - Resultado:', { labels: labels.length, tmaData: tmaData.length })

  return {
    labels,
    datasets: [
      {
        label: '⏱️ TMA (min)',
        data: tmaData,
        backgroundColor: 'rgba(22, 52, 255, 0.8)',
        borderColor: 'var(--color-primary)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 15,
        shadowColor: 'rgba(22, 52, 255, 0.5)',
        hoverBackgroundColor: 'rgba(22, 52, 255, 1)',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverShadowOffsetX: 0,
        hoverShadowOffsetY: 0,
        hoverShadowBlur: 25,
        hoverShadowColor: 'rgba(22, 52, 255, 0.8)'
      },
      {
        label: '⭐ Nota Atendimento',
        data: notaAtendData,
        backgroundColor: 'rgba(21, 162, 55, 0.8)',
        borderColor: 'var(--color-secondary)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 15,
        shadowColor: 'rgba(21, 162, 55, 0.5)',
        hoverBackgroundColor: 'rgba(21, 162, 55, 1)',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverShadowOffsetX: 0,
        hoverShadowOffsetY: 0,
        hoverShadowBlur: 25,
        hoverShadowColor: 'rgba(21, 162, 55, 0.8)'
      },
      {
        label: '🎯 Nota Solução',
        data: notaSoluData,
        backgroundColor: 'rgba(252, 194, 0, 0.8)',
        borderColor: 'var(--color-accent)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 15,
        shadowColor: 'rgba(252, 194, 0, 0.5)',
        hoverBackgroundColor: 'rgba(252, 194, 0, 1)',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverShadowOffsetX: 0,
        hoverShadowOffsetY: 0,
        hoverShadowBlur: 25,
        hoverShadowColor: 'rgba(252, 194, 0, 0.8)'
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2500,
        easing: 'easeInOutQuart',
        delay: (context) => context.dataIndex * 100,
        onComplete: function() {
          // Efeito de matrix após animação
          this.chart.canvas.style.filter = 'hue-rotate(90deg) saturate(1.5)';
          setTimeout(() => {
            this.chart.canvas.style.filter = 'none';
          }, 400);
        }
      },
      scales: { 
        y: { 
          display: true,
          beginAtZero: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10
          },
          title: {
            display: true,
            text: 'Valores',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        },
        x: { 
          display: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10
          },
          title: {
            display: true,
            text: 'Operadores',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        }
      },
      plugins: {
        zoom: { zoom: { mode: 'xy' } },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 25,
            font: { 
              size: 18, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            color: '#00ffff'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: 'var(--color-primary)',
          bodyColor: '#ffffff',
          borderColor: 'var(--color-primary)',
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: true,
          padding: 15,
          titleFont: {
            size: 16,
            weight: 'bold',
            family: "'Courier New', monospace"
          },
          bodyFont: {
            size: 14,
            weight: '500',
            family: "'Courier New', monospace"
          },
          callbacks: {
            title: function(context) {
              return `👤 ${context[0].label}`
            },
            label: function(context) {
              const labels = ['⏱️ TMA (min)', '⭐ Nota Atendimento', '🎯 Nota Solução']
              const value = context.parsed.y
              const label = labels[context.datasetIndex]
              
              if (context.datasetIndex === 0) { // TMA
                return `${label}: ${value} minutos`
              } else { // Notas
                const stars = '⭐'.repeat(Math.round(value))
                return `${label}: ${value}/5 ${stars}`
              }
            },
            afterLabel: function(context) {
              const value = context.parsed.y
              const datasetIndex = context.datasetIndex
              
              if (datasetIndex === 0) { // TMA
                if (value < 5) return '🚀 Excelente tempo!'
                if (value < 10) return '👍 Bom tempo'
                return '⚠️ Tempo alto'
              } else { // Notas
                if (value >= 4.5) return '🏆 Excelente!'
                if (value >= 4) return '👍 Muito bom'
                if (value >= 3) return '⚠️ Regular'
                return '❌ Precisa melhorar'
              }
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 8,
          borderSkipped: false
        }
      }
    }
  }
}

/**
 * Calcula dados para gráfico "Ranking de Qualidade" (barra ordenada por score).
 * @param {Object} opMetrics - Métricas por operador.
 * @returns {Object} Dataset Chart.js para barra.
 */
export const calcRankingQualidade = (opMetrics) => {
  console.log('🔍 calcRankingQualidade - OperatorMetrics recebidos:', Object.keys(opMetrics).length)
  
  // Calcula scores usando fórmula oficial
  const totals = Object.values(opMetrics).map((op) => op.totalAtendimentos || op.totalCalls || 0)
  const tempos = Object.values(opMetrics).map((op) => op.tempoMedio || op.avgDuration || 0)
  const notasAtend = Object.values(opMetrics).map((op) => op.notaMediaAtendimento || op.avgRatingAttendance || 0)
  const notasSolu = Object.values(opMetrics).map((op) => op.notaMediaSolucao || op.avgRatingSolution || 0)
  const pausas = Object.values(opMetrics).map((op) => op.tempoMedioPausado || op.avgPauseTime || 0) // Se disponível

  const minTotal = Math.min(...totals), maxTotal = Math.max(...totals)
  const minTempo = Math.min(...tempos), maxTempo = Math.max(...tempos)
  const minNotaAtend = Math.min(...notasAtend), maxNotaAtend = Math.max(...notasAtend)
  const minNotaSolu = Math.min(...notasSolu), maxNotaSolu = Math.max(...notasSolu)
  const minPausa = Math.min(...pausas), maxPausa = Math.max(...pausas)

  const ranking = Object.values(opMetrics)
    .filter((op) => {
      const operador = op.operador || op.operator || 'Não informado'
      const totalAtendimentos = op.totalAtendimentos || op.totalCalls || 0
      return totalAtendimentos > 0 && 
             !operador.toLowerCase().includes('desligado') && 
             !operador.toLowerCase().includes('sem operador')
    })
    .map((op) => {
      const normTotal = normalizar(op.totalAtendimentos || op.totalCalls || 0, minTotal, maxTotal)
      const normTempo = normalizar(op.tempoMedio || op.avgDuration || 0, minTempo, maxTempo)
      const normNotaAtend = normalizar(op.notaMediaAtendimento || op.avgRatingAttendance || 0, minNotaAtend, maxNotaAtend)
      const normNotaSolu = normalizar(op.notaMediaSolucao || op.avgRatingSolution || 0, minNotaSolu, maxNotaSolu)
      const normPausa = normalizar(op.tempoMedioPausado || op.avgPauseTime || 0, minPausa, maxPausa)

      const score = 0.35 * normTotal +
                    0.20 * (1 - normTempo) +
                    0.20 * normNotaAtend +
                    0.20 * normNotaSolu -
                    0.05 * normPausa
      return { operador: op.operador || op.operator || 'Não informado', score: Math.max(0, Math.min(100, score * 100)) }
    })
    .sort((a, b) => b.score - a.score)

  const labels = ranking.map((r) => r.operador)
  const data = ranking.map((r) => r.score)
  
  console.log('🔍 calcRankingQualidade - Resultado:', { labels: labels.length, data: data.length })

  return {
    labels,
    datasets: [{
      label: '📊 Score de Qualidade',
      data,
      backgroundColor: data.map((score, index) => {
        if (score >= 80) return 'rgba(22, 52, 255, 0.8)' // Azul para excelente
        if (score >= 60) return 'rgba(21, 162, 55, 0.8)' // Verde para bom
        if (score >= 40) return 'rgba(252, 194, 0, 0.8)' // Amarelo para regular
        return 'rgba(239, 68, 68, 0.8)' // Vermelho para baixo
      }),
      borderColor: data.map((score, index) => {
        if (score >= 80) return 'var(--color-primary)'
        if (score >= 60) return 'var(--color-secondary)'
        if (score >= 40) return 'var(--color-accent)'
        return 'var(--color-error)'
      }),
      borderWidth: 3,
      borderRadius: 8,
      borderSkipped: false,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 15,
      shadowColor: 'rgba(22, 52, 255, 0.5)',
      hoverBackgroundColor: data.map((score, index) => {
        if (score >= 80) return 'rgba(22, 52, 255, 1)'
        if (score >= 60) return 'rgba(21, 162, 55, 1)'
        if (score >= 40) return 'rgba(252, 194, 0, 1)'
        return 'rgba(239, 68, 68, 1)'
      }),
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 4,
      hoverShadowOffsetX: 0,
      hoverShadowOffsetY: 0,
      hoverShadowBlur: 25,
      hoverShadowColor: 'rgba(255, 255, 255, 0.8)'
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: {
        duration: 3000,
        easing: 'easeInOutQuart',
        delay: (context) => context.dataIndex * 50,
        onComplete: function() {
          // Efeito de holograma após animação
          this.chart.canvas.style.filter = 'hue-rotate(360deg) brightness(1.5) contrast(1.3)';
          setTimeout(() => {
            this.chart.canvas.style.filter = 'none';
          }, 500);
        }
      },
      plugins: { 
        zoom: { zoom: { mode: 'y' } },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 25,
            font: { 
              size: 18, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            color: 'var(--color-primary)',
            generateLabels: function(chart) {
              return [{
                text: '📊 Score de Qualidade',
                fillStyle: '#00ffff',
                strokeStyle: '#ffffff',
                lineWidth: 2,
                pointStyle: 'rect',
                hidden: false,
                index: 0
              }]
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: 'var(--color-primary)',
          bodyColor: '#ffffff',
          borderColor: 'var(--color-primary)',
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: true,
          padding: 15,
          titleFont: {
            size: 16,
            weight: 'bold',
            family: "'Courier New', monospace"
          },
          bodyFont: {
            size: 14,
            weight: '500',
            family: "'Courier New', monospace"
          },
          callbacks: {
            title: function(context) {
              const rank = context[0].dataIndex + 1
              const medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
              return `${medals[rank - 1] || '🏅'} ${context[0].label}`
            },
            label: function(context) {
              const score = context.parsed.x
              let level = ''
              let emoji = ''
              if (score >= 80) {
                level = '💎 NEURAL PERFEITO'
                emoji = '🌟'
              } else if (score >= 60) {
                level = '🔮 NEURAL ALTO'
                emoji = '⚡'
              } else if (score >= 40) {
                level = '⚡ NEURAL MÉDIO'
                emoji = '🔮'
              } else {
                level = '❌ NEURAL BAIXO'
                emoji = '📉'
              }
              return `📊 Score: ${score.toFixed(1)}%`
            },
            afterLabel: function(context) {
              const score = context.parsed.x
              let quality = ''
              let emoji = ''
              
              if (score >= 80) {
                quality = 'Excelente'
                emoji = '🏆'
              } else if (score >= 60) {
                quality = 'Bom'
                emoji = '👍'
              } else if (score >= 40) {
                quality = 'Regular'
                emoji = '⚠️'
              } else {
                quality = 'Baixo'
                emoji = '❌'
              }
              
              return `${emoji} Qualidade: ${quality}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10,
            callback: function(value) {
              return `${value}%`
            }
          },
          title: {
            display: true,
            text: 'Score (%)',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(22, 52, 255, 0.2)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            color: 'var(--color-primary)',
            font: { 
              size: 12, 
              weight: 'bold',
              family: "'Courier New', monospace"
            },
            padding: 10
          },
          title: {
            display: true,
            text: 'Operadores',
            color: 'var(--color-primary)',
            font: {
              size: 14,
              weight: 'bold',
              family: "'Courier New', monospace"
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 8,
          borderSkipped: false
        }
      }
    }
  }
}