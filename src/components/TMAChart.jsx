import React, { useMemo, memo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

const TMAChart = memo(({ data = [], periodo = null, groupBy = 'fila' }) => {
  // Função para converter tempo HH:MM:SS para minutos
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 0
    
    try {
      // Formato HH:MM:SS
      const parts = timeString.split(':')
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseInt(parts[2]) || 0
        return hours * 60 + minutes + seconds / 60
      }
      
      // Formato "X min(s)" - para tickets
      if (timeString.includes('min(s)')) {
        const match = timeString.match(/(\d+)\s*min\(s\)/)
        if (match) {
          return parseInt(match[1]) || 0
        }
      }
      
      // Formato "X hora(s) Y min(s)" - para tickets
      if (timeString.includes('hora(s)') && timeString.includes('min(s)')) {
        const horaMatch = timeString.match(/(\d+)\s*hora\(s\)/)
        const minMatch = timeString.match(/(\d+)\s*min\(s\)/)
        const horas = horaMatch ? parseInt(horaMatch[1]) || 0 : 0
        const mins = minMatch ? parseInt(minMatch[1]) || 0 : 0
        return horas * 60 + mins
      }
      
      // Formato "X hora(s)" - para tickets
      if (timeString.includes('hora(s)')) {
        const match = timeString.match(/(\d+)\s*hora\(s\)/)
        if (match) {
          return parseInt(match[1]) * 60 || 0
        }
      }
      
    } catch (error) {
      // Silenciar erros de parsing para evitar spam no console
    }
    return 0
  }

  // Função para formatar minutos para HH:MM:SS ou DD dias, HH:MM:SS
  const formatMinutesToDisplay = (minutes) => {
    if (minutes === 0) return '00:00:00'
    
    const totalMinutes = Math.floor(minutes)
    const seconds = Math.floor((minutes % 1) * 60)
    
    // Se passar de 24 horas (1440 minutos), usar formato DD dias, HH:MM:SS
    if (totalMinutes >= 1440) {
      const days = Math.floor(totalMinutes / 1440)
      const remainingMinutes = totalMinutes % 1440
      const hours = Math.floor(remainingMinutes / 60)
      const mins = remainingMinutes % 60
      
      return `${days} dias, ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    } else {
      // Formato normal HH:MM:SS
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }

  // Função para parsear data brasileira
  const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null
    
    // Se tiver espaço, pega apenas a parte da data (ignora horário)
    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      dateStr = dateStr.split(' ')[0]
    }
    
    // Tenta formato YYYY-MM-DD (ex: "2025-01-28")
    const ymdPattern = /^(\d{4})-(\d{2})-(\d{2})$/
    const ymdMatch = dateStr.match(ymdPattern)
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10)
      const month = parseInt(ymdMatch[2], 10)
      const day = parseInt(ymdMatch[3], 10)
      return new Date(year, month - 1, day)
    }
    
    // Tenta formato DD/MM/YYYY (ex: "28/01/2025")
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      return new Date(year, month - 1, day)
    }
    
    return null
  }

  // Função para verificar se uma data está dentro do período
  const isDateInPeriod = (dateStr) => {
    if (!periodo || !periodo.startDate || !periodo.endDate) return true
    
    try {
      const date = parseBrazilianDate(dateStr)
      if (!date || isNaN(date.getTime())) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      // Normalizar para comparar apenas a data (sem hora)
      const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      return recordDate >= startDateNorm && recordDate <= endDateNorm
    } catch (error) {
      // Silenciar erros de parsing para evitar spam no console
      return true
    }
  }

  // Processar dados de TMA mensal (stacked bar)
  const processTMAData = (data, periodo, groupBy) => {
    console.log('🔍 [TMAChart] Iniciando processamento')
    console.log('📊 [TMAChart] Total de registros:', data?.length || 0)
    console.log('📅 [TMAChart] Período:', periodo)
    console.log('📝 [TMAChart] GroupBy:', groupBy)
    console.log('⚠️ [TMAChart] IGNORANDO filtro de período - processando TODOS os dados para gráfico mensal')
    
    if (!data || data.length === 0) {
      console.log('❌ [TMAChart] Nenhum dado disponível')
      return {
        labels: [],
        datasets: [],
        totalCalls: 0,
        averageTMA: 0
      }
    }
    
    // Detectar se são dados de tickets (assunto) ou telefonia (produto)
    const isTicketData = groupBy === 'assunto'
    const isProductData = groupBy === 'produto' || groupBy === 'assunto' || groupBy === undefined || groupBy === null
    console.log('🏷️ [TMAChart] Tipo de dados:', isTicketData ? 'TICKETS (assunto)' : isProductData ? 'TELEFONIA (produto)' : 'TELEFONIA (geral)')
    
    // Agrupar por mês e produto (se aplicável)
    const monthlyData = {}
    const produtos = {} // Para agrupar por produto se necessário
    
    let processedCount = 0
    let skippedCount = 0
    let skippedByReason = {
      header: 0,
      notArray: 0,
      shortRecord: 0,
      emptyFields: 0,
      dateParseError: 0,
      tempoZero: 0
    }
    
    // Processar registros e agrupar por mês e fila
    data.forEach((record, index) => {
      if (index < 14) {
        skippedByReason.header++
        return
      }
      
      const isRecordArray = Array.isArray(record)
      if (!isRecordArray) {
        skippedByReason.notArray++
        skippedCount++
        return
      }
      
      // Validar tamanho baseado no tipo de dados
      const minLength = isTicketData ? 28 : 15 // Tickets precisa mais colunas
      if (record.length <= minLength) {
        skippedByReason.shortRecord++
        skippedCount++
        return
      }
      
      // TMA - selecionar colunas baseado no tipo de dados
      let dateField, tempoField
      
      if (isTicketData) {
        // DADOS DE TICKETS (assunto)
        // Coluna AC (índice 28) - Data, Coluna K (índice 10) - Tempo de resolução
        dateField = record[28]  // Coluna AC - Data
        tempoField = record[10] // Coluna K - Tempo de resolução
      } else {
        // DADOS DE TELEFONIA (produto/geral)
        // Coluna D (índice 3) - Data, Coluna O (índice 14) - Tempo Total, Coluna K (índice 10) - Produto/Fila
        dateField = record[3]  // Coluna D - Data
        tempoField = record[14] // Coluna O - Tempo Total
        // Se for por produto, precisamos também da coluna K
      }
      
      // Log apenas das 3 primeiras linhas úteis
      if (index <= 16 && dateField && tempoField) {
        console.log(`🔍 [TMAChart] Linha ${index}:`, {
          'Data': dateField,
          'Tempo': tempoField,
          'Tipo': isTicketData ? 'TICKETS' : 'TELEFONIA'
        })
      }
      
      // Apenas validar Data e Tempo (não precisa de Fila)
      if (!dateField || !tempoField) {
        skippedByReason.emptyFields++
        skippedCount++
        return
      }
      
      
      // Verificar data apenas para logging, mas processar todos os dados
      let recordDate = null
      try {
        recordDate = parseBrazilianDate(dateField)
      } catch (e) {
        skippedByReason.dateParseError++
        skippedCount++
        return
      }
      
      if (!recordDate) {
        skippedByReason.dateParseError++
        skippedCount++
        return
      }
      
      // IGNORAR filtro de período para gráfico mensal
      // O gráfico precisa mostrar TODOS os meses, não apenas o período selecionado
      // if (periodo && periodo.startDate && periodo.endDate) {
      //   const startDate = new Date(periodo.startDate)
      //   const endDate = new Date(periodo.endDate)
      //   
      //   if (recordDate < startDate || recordDate > endDate) {
      //     skippedByReason.dateOutOfPeriod++
      //     skippedCount++
      //     return
      //   }
      // }
      
      // TMA - agrupar por mês e produto (se aplicável)
      const tempoMinutos = parseTimeToMinutes(tempoField)
      if (tempoMinutos <= 0) {
        skippedByReason.tempoZero++
        skippedCount++
        return
      }
      
      // Extrair produto/fila se for agrupamento por produto ou assunto
      let produto = null
      let temProdutoValido = false
      
      // Produtos permitidos (sem o prefixo 4691-)
      const produtosPermitidos = [
        'IRPF',
        'Calculadora',
        'OFF',
        'Empréstimo Pessoal',
        'Tabulação Pendente',
        'PIX',
        'Antecipação da Restituição',
        'Declaração Anual'
      ]
      
      if (isProductData || isTicketData) {
        // Para TICKETS, usar coluna B (índice 1) - Assunto
        // Para TELEFONIA, usar coluna K (índice 10) - Fila/Produto
        const produtoField = isTicketData ? record[1] : record[10]
        if (produtoField) {
          const produtoStr = String(produtoField).trim()
          
          // Filtrar apenas produtos permitidos (remover prefixo 4691- se existir)
          const produtoLimpo = produtoStr.replace(/^4691-/, '').trim()
          
          if (produtosPermitidos.includes(produtoLimpo)) {
            produto = produtoLimpo
            temProdutoValido = true
            
            // Log apenas os primeiros produtos encontrados
            if (processedCount < 5) {
              console.log('✅ [TMAChart] Produto/Assunto encontrado:', produtoLimpo)
            }
          }
        }
      } else {
        temProdutoValido = true // Para TMA geral, sempre válido
      }
      
      // Extrair mês/ano usando recordDate que já foi parseado
      try {
        if (recordDate) {
          const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
          
          // Sempre usar estrutura de produto (mesmo que não tenha produto válido)
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {}
          }
          
          if (produto && temProdutoValido) {
            // Agrupar por produto/assunto E mês
            if (!monthlyData[monthKey][produto]) {
              monthlyData[monthKey][produto] = { totalTime: 0, callCount: 0 }
            }
            
            monthlyData[monthKey][produto].totalTime += tempoMinutos
            monthlyData[monthKey][produto].callCount += 1
            processedCount++
          } else if (!isProductData && !isTicketData) {
            // TMA GERAL - apenas por mês (só se não for por produto ou tickets)
            if (!monthlyData[monthKey]['GERAL']) {
              monthlyData[monthKey]['GERAL'] = { totalTime: 0, callCount: 0 }
            }
            
            monthlyData[monthKey]['GERAL'].totalTime += tempoMinutos
            monthlyData[monthKey]['GERAL'].callCount += 1
            processedCount++
          }
          // Se for por produto/assunto mas não tiver válido, ignora
        }
      } catch (e) {
        skippedCount++
        // Ignorar erros de parsing
      }
    })
    
    console.log('✅ [TMAChart] Processamento concluído:')
    console.log('   📊 Processados:', processedCount)
    console.log('   ⏭️  Ignorados:', skippedCount)
    console.log('   📅 Meses encontrados:', Object.keys(monthlyData))
    console.log('📊 [TMAChart] Motivos de descarte:', skippedByReason)
    
    // Ordenar meses
    const months = Object.keys(monthlyData).sort()
    
    console.log('📋 [TMAChart] Datasets preparados:', {
      totalMonths: months.length,
      months,
      monthlyDataKeys: Object.keys(monthlyData),
      primeiroMesKeys: months.length > 0 ? Object.keys(monthlyData[months[0]] || {}) : []
    })
    
    // Preparar datasets baseado no tipo de agrupamento
    let datasets = []
    
    if (isProductData) {
      // Extrair todos os produtos únicos
      const produtos = new Set()
      Object.values(monthlyData).forEach(monthData => {
        if (typeof monthData === 'object' && !monthData.callCount) {
          Object.keys(monthData).forEach(produto => produtos.add(produto))
        }
      })
      const produtosArray = Array.from(produtos).sort() // Ordenar alfabeticamente
      
      // Criar uma linha por produto
      const colors = [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(34, 197, 94, 1)'
      ]
      
      datasets = produtosArray.map((produto, idx) => ({
        label: produto,
        data: months.map(month => {
          const monthData = monthlyData[month]?.[produto]
          return monthData && monthData.callCount > 0 
            ? monthData.totalTime / monthData.callCount 
            : 0
        }),
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length].replace('1)', '0.1)'),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    } else {
      // TMA GERAL - uma única linha
      datasets = [{
        label: 'TMA Geral',
        data: months.map(month => {
          const monthData = monthlyData[month]
          return monthData && monthData.callCount > 0 
            ? monthData.totalTime / monthData.callCount 
            : 0
        }),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    }
    
    const calculateTotalCalls = () => {
      if (isProductData) {
        return Object.values(monthlyData).reduce((sum, monthData) => {
          if (typeof monthData === 'object' && !monthData.callCount) {
            return sum + Object.values(monthData).reduce((mSum, produto) => mSum + (produto.callCount || 0), 0)
          }
          return sum
        }, 0)
      } else {
        return Object.values(monthlyData).reduce((sum, month) => sum + (month.callCount || 0), 0)
      }
    }
    
    const result = {
      labels: months.map(m => {
        const [year, month] = m.split('-')
        const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        return `${monthsNames[parseInt(month) - 1]}/${year}`
      }),
      datasets,
      totalCalls: calculateTotalCalls(),
      averageTMA: 0
    }
    
    console.log('🎯 [TMAChart] Resultado final:', {
      totalLabels: result.labels.length,
      labels: result.labels,
      totalDatasets: result.datasets.length,
      datasets: result.datasets.map(d => ({
        label: d.label,
        dataLength: d.data.length,
        data: d.data
      }))
    })
    
    return result
  }
  
  const processTMAOld = (data, periodo, groupBy) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        values: [],
        totalCalls: 0,
        averageTMA: 0
      }
    }

    // Detectar se são dados de tickets (array) ou dados de telefonia (objeto)
    // Detecção mais simples e robusta
    const isTicketData = Array.isArray(data[0]) && data.length > 0 && 
      data.slice(14, 20).some(record => 
        Array.isArray(record) && record.length > 28 && 
        record[28] && // Coluna AC deve ter data
        record[1] && // Coluna B deve ter assunto
        record[10] && // Coluna K deve ter tempo
        !record[3] // Coluna D não deve ter data (diferencia de telefonia)
      )
    
    // Se não conseguiu detectar, tentar detecção alternativa
    const isTicketDataAlt = Array.isArray(data[0]) && data.length > 0 && 
      data.slice(14, 20).some(record => 
        Array.isArray(record) && record.length > 10 && 
        record[1] && // Coluna B deve ter assunto
        record[10] && // Coluna K deve ter tempo
        !record[3] // Coluna D não deve ter data
      )
    
    const finalIsTicketData = isTicketData || isTicketDataAlt
    
    // Filas específicas que queremos mostrar (mesmas do Volume por Fila)
    const filasEspecificas = [
      { nome: 'IRPF', palavras: ['IRPF', 'IMPOSTO DE RENDA'] },
      { nome: 'CALCULADORA', palavras: ['CALCULADORA', 'CALCULO', 'CÁLCULO', 'DARF', 'CALCULADORA DE DARF'] },
      { nome: 'ANTECIPAÇÃO DA RESTITUIÇÃO', palavras: ['ANTECIPAÇÃO', 'RESTITUIÇÃO', 'ANTECIPACAO', 'REPASSE', 'LOTES'] },
      { nome: 'OFF', palavras: ['OFF', 'OFFLINE'] },
      { nome: 'EMPRÉSTIMO PESSOAL', palavras: ['EMPRÉSTIMO', 'EMPRESTIMO', 'PESSOAL', 'CRÉDITO'] },
      { nome: 'TABULAÇÃO PENDENTE', palavras: ['TABULAÇÃO', 'TABULACAO', 'PENDENTE'] },
      { nome: 'PIX', palavras: ['PIX', 'TRANSFERÊNCIA', 'TRANSFERENCIA', 'RECEBIMENTO'] },
      { nome: 'FINANCEIRO', palavras: ['FINANCEIRO', 'FINANÇAS', 'FINANCAS'] }
    ]

    // Otimização: limitar processamento para evitar travamentos
    const maxRecords = 50000 // Reduzido de 150k para 50k
    const dataToProcess = data.length > maxRecords ? data.slice(0, maxRecords) : data

    const groupedData = {}
    let processedRecords = 0
    let totalTimeMinutes = 0
    let totalCalls = 0
    let filasEncontradas = new Set()

    // Processar dados linha por linha com otimizações
    dataToProcess.forEach((record, index) => {
      // Pular cabeçalho e linhas iniciais
      if (index < 14) return

      // Validação antecipada para evitar processamento desnecessário
      if (!Array.isArray(record) || record.length <= 14) return

        let dateField, filaField, tempoField
        
        if (finalIsTicketData) {
        // Validar se tem dados suficientes antes de processar
        if (record.length <= 28) return
        
          // Para dados de tickets - usar estrutura diferente
          dateField = record[28] // Coluna AC - Dia
          filaField = record[1] // Coluna B - Assunto
          tempoField = record[10] // Coluna K - Tempo de resolução
        } else {
          // Para dados de telefonia - estrutura original
          dateField = record[3] // Coluna D - Data
          filaField = record[10] // Coluna K - Fila/Produto
          tempoField = record[14] // Coluna O - Tempo Total
        }

      // Verificar se está no período (otimização: só se tem dateField)
        if (dateField && !isDateInPeriod(dateField)) {
          return
        }

      // Validar dados necessários
        if (!filaField) return
        
        // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
        let tempoValido = tempoField
        if (!tempoValido && finalIsTicketData) {
          tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
        }
        
        if (!tempoValido) return

        const fila = String(filaField).trim()
        
        // Filtrar apenas filas específicas
        const filaNormalizada = fila.toUpperCase()
        const filaEncontrada = filasEspecificas.find(filaEspecifica => 
          filaEspecifica.palavras.some(palavra => 
            filaNormalizada.includes(palavra.toUpperCase()) ||
            palavra.toUpperCase().includes(filaNormalizada)
          )
        )
        
        if (!filaEncontrada) {
          return // Pular se não for uma fila específica
        }
        
        filasEncontradas.add(filaEncontrada.nome)
        
        const tempoMinutos = parseTimeToMinutes(tempoValido)

        // Ignorar tempos zerados
        if (tempoMinutos <= 0) {
          return
        }

        // Usar o nome padronizado da fila
        const filaPadronizada = filaEncontrada.nome

        // Inicializar grupo se não existir
        if (!groupedData[filaPadronizada]) {
          groupedData[filaPadronizada] = {
            totalTime: 0,
            callCount: 0
          }
        }

        // Acumular dados
        groupedData[filaPadronizada].totalTime += tempoMinutos
        groupedData[filaPadronizada].callCount += 1
        totalTimeMinutes += tempoMinutos
        totalCalls += 1
        processedRecords++
    })

    // Se não encontrou dados com filtros específicos, tentar sem filtros
    if (totalCalls === 0) {
      
      // Tentar processar sem filtros específicos
      dataToProcess.forEach((record, index) => {
        if (index < 14) return

        if (Array.isArray(record) && record.length > 14) {
          let dateField, filaField, tempoField
          
          if (finalIsTicketData) {
            // Para dados de tickets - usar estrutura diferente
            dateField = record[28] // Coluna AC - Dia
            filaField = record[1] // Coluna B - Assunto (tentar coluna B)
            tempoField = record[10] // Coluna K - Tempo de resolução (tentar coluna K)
          } else {
            // Para dados de telefonia - estrutura original
            dateField = record[3] // Coluna D - Data
            filaField = record[10] // Coluna K - Fila/Produto
            tempoField = record[14] // Coluna O - Tempo Total
          }

          if (dateField && !isDateInPeriod(dateField)) return
          if (!filaField) return
          
          // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
          let tempoValido = tempoField
          if (!tempoValido && finalIsTicketData) {
            tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
          }
          
          if (!tempoValido) return

          const fila = String(filaField).trim()
          const tempoMinutos = parseTimeToMinutes(tempoValido)

          if (tempoMinutos <= 0) return

          // Filtrar apenas filas de cobrança (excluir)
          if (fila.toLowerCase().includes('cobrança') || 
              fila.toLowerCase().includes('cobranca') ||
              fila.toLowerCase().includes('cobran')) {
            return
          }

          if (!groupedData[fila]) {
            groupedData[fila] = {
              totalTime: 0,
              callCount: 0
            }
          }

          groupedData[fila].totalTime += tempoMinutos
          groupedData[fila].callCount += 1
          totalTimeMinutes += tempoMinutos
          totalCalls += 1
          processedRecords++
        }
      })
    }
    
    // Se ainda não encontrou dados, tentar processamento mais agressivo
    if (totalCalls === 0) {
      
      dataToProcess.forEach((record, index) => {
        if (index < 14) return

        if (Array.isArray(record) && record.length > 10) {
          // Tentar diferentes combinações de colunas
          const possibleCombinations = [
            { date: record[28], fila: record[1], tempo: record[10] }, // Tickets
            { date: record[3], fila: record[10], tempo: record[14] }, // Telefonia
            { date: record[28], fila: record[2], tempo: record[11] }, // Alternativa 1
            { date: record[3], fila: record[11], tempo: record[15] }, // Alternativa 2
          ]
          
          for (const combo of possibleCombinations) {
            if (combo.date && combo.fila) { // Removido combo.tempo da condição obrigatória
              if (combo.date && !isDateInPeriod(combo.date)) continue
              
              const fila = String(combo.fila).trim()
              
              // Para tickets, tempo pode estar vazio - usar tempo padrão se necessário
              let tempoValido = combo.tempo
              if (!tempoValido && finalIsTicketData) {
                tempoValido = '1 min(s)' // Tempo padrão para tickets sem tempo
              }
              
              if (!tempoValido) continue
              
              const tempoMinutos = parseTimeToMinutes(tempoValido)
              
              if (tempoMinutos <= 0) continue
              
              // Filtrar apenas filas de cobrança (excluir)
              if (fila.toLowerCase().includes('cobrança') || 
                  fila.toLowerCase().includes('cobranca') ||
                  fila.toLowerCase().includes('cobran')) {
                continue
              }
              
              if (!groupedData[fila]) {
                groupedData[fila] = {
                  totalTime: 0,
                  callCount: 0
                }
              }
              
              groupedData[fila].totalTime += tempoMinutos
              groupedData[fila].callCount += 1
              totalTimeMinutes += tempoMinutos
              totalCalls += 1
              processedRecords++
              break // Usar apenas a primeira combinação válida
            }
          }
        }
      })
    }

    // Calcular TMA por grupo e ordenar
    const tmaData = Object.entries(groupedData)
      .map(([fila, data]) => ({
        fila,
        tma: data.totalTime / data.callCount,
        callCount: data.callCount
      }))
      .sort((a, b) => b.tma - a.tma) // Ordenar por TMA decrescente

    const labels = tmaData.map(item => item.fila)
    const values = tmaData.map(item => item.tma)
    const averageTMA = totalCalls > 0 ? totalTimeMinutes / totalCalls : 0

    return {
      labels,
      values,
      totalCalls,
      averageTMA,
      callCounts: tmaData.map(item => item.callCount)
    }
  }

  // Processar dados com useMemo e cores vibrantes
  const chartData = useMemo(() => {
    console.log('🔄 [TMAChart] useMemo executado')
    const processedData = processTMAData(data, periodo, groupBy)

    // Cores vibrantes para cada fila
    const colors = [
      'rgba(59, 130, 246, 0.9)',   // Azul
      'rgba(16, 185, 129, 0.9)',   // Verde
      'rgba(251, 146, 60, 0.9)',    // Laranja
      'rgba(239, 68, 68, 0.9)',     // Vermelho
      'rgba(139, 92, 246, 0.9)',    // Roxo
      'rgba(34, 197, 94, 0.9)'      // Verde claro
    ]

    // Se processedData já tem datasets, usar diretamente (já vem formatado com cores)
    if (processedData.datasets) {
      console.log('✅ [TMAChart] Usando datasets formatados')
      const result = {
        labels: processedData.labels,
        datasets: processedData.datasets
      }
      console.log('📦 [TMAChart] Chart data final:', result)
      return result
    }

    console.log('⚠️ [TMAChart] Usando fallback')
    // Fallback para formato antigo (caso necessário)
    return {
      labels: processedData.labels,
      datasets: [{
          label: 'Tempo Médio de Atendimento',
        data: processedData.values || [],
        backgroundColor: colors[0],
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderRadius: 6
      }],
      totalCalls: processedData.totalCalls || 0,
      averageTMA: processedData.averageTMA || 0
    }
  }, [data, periodo, groupBy])

  const handleTitleClick = (fila) => {
    console.log('Clicou em:', fila)
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false // Remove qualquer título do gráfico
      },
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 14,
            weight: '600',
            family: "'Inter', sans-serif"
          },
          color: '#1F2937',
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '700'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.x
            
            // Validar se value é um número válido
            if (!value || isNaN(value) || value === 0) {
              return `${label}: 00:00:00`
            }
            
            return `${label}: ${formatMinutesToDisplay(value)}`
          }
        }
      },
      datalabels: {
        display: true, // Ativado para mostrar valores
        color: '#1F2937',
        font: {
          size: 12,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          if (!value || isNaN(value) || value === 0) {
            return ''
          }
          return formatMinutesToDisplay(value) // Formato HH:MM:SS
        },
        anchor: 'end', // Acima do ponto
        align: 'top',
        offset: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 4,
        padding: 4
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tempo Médio (minutos)',
          color: '#374151',
          font: {
            size: 14,
            weight: '700'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return formatMinutesToDisplay(value)
          },
          font: {
            size: 12
          }
        }
      }
    },
  }

  // Estado de loading/erro
  if (!data || data.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados de TMA...</p>
        </div>
      </div>
    )
  }

  if (chartData.labels.length === 0) {
    return (
      <div className="tma-chart-container">
        <div className="tma-chart-error">
          <i className='bx bx-error-circle'></i>
          <p>Nenhum dado de TMA encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {chartData && chartData.labels && chartData.labels.length > 0 ? 
        <Line data={chartData} options={options} /> : 
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Sem dados para exibir
        </div>
      }
    </div>
  )
})

export default TMAChart
