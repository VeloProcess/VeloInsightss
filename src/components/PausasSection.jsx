import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import './PausasSection.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const PausasSection = ({ pausasData, periodo }) => {
  // Função para parsear data brasileira (DD/MM/YYYY)
  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null
    
    try {
      // Remove espaços e caracteres extras
      const cleanDate = dateString.trim()
      
      // Tenta diferentes formatos
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ]
      
      for (const format of formats) {
        const match = cleanDate.match(format)
        if (match) {
          let day, month, year
          
          if (format === formats[2]) { // YYYY-MM-DD
            [, year, month, day] = match
          } else { // DD/MM/YYYY ou DD/MM/YY
            [, day, month, year] = match
            if (year.length === 2) {
              year = '20' + year
            }
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
      
      return null
    } catch (error) {
      console.log('❌ Erro ao parsear data:', dateString, error)
      return null
    }
  }

  // Processar dados de TML e TMP
  const processedData = React.useMemo(() => {
    console.log('[PausasSection] 🔄 Processando dados de pausas')
    console.log('[PausasSection] pausasData recebido:', pausasData ? `Array com ${pausasData.length} linhas` : 'null/undefined')
    console.log('[PausasSection] periodo recebido:', periodo)
    if (periodo && periodo.startDate && periodo.endDate) {
      const start = new Date(periodo.startDate)
      const end = new Date(periodo.endDate)
      console.log('[PausasSection] Período de filtro:', {
        start: start.toLocaleDateString('pt-BR'),
        end: end.toLocaleDateString('pt-BR'),
        startISO: start.toISOString(),
        endISO: end.toISOString()
      })
    } else {
      console.log('[PausasSection] ⚠️ Sem período definido, incluindo TODOS os dados')
    }
    
    if (!pausasData || pausasData.length === 0) {
      console.log('[PausasSection] ⚠️ Nenhum dado disponível para processar')
      return {
        dias: [],
        tempoLogadoPorDia: {},
        tempoPausadoPorDia: {},
        tempoMedioLogado: 0,
        tempoMedioPausado: 0,
        totalDias: 0
      }
    }
    
    console.log('[PausasSection] Primeira linha (cabeçalho):', pausasData[0])
    if (pausasData.length > 1) {
      console.log('[PausasSection] Segunda linha (exemplo):', pausasData[1])
      console.log('[PausasSection] Terceira linha (exemplo):', pausasData[2])
    }

    // Verificar se o período faz sentido comparado com os dados
    const periodoValido = periodo && periodo.startDate && periodo.endDate
    let usarFiltroPeriodo = true
    
    if (periodoValido && pausasData.length > 1) {
      // Verificar a primeira data dos dados para ver se faz sentido com o período
      const primeiraLinha = pausasData[1] // Segunda linha (após cabeçalho)
      if (Array.isArray(primeiraLinha) && primeiraLinha[0]) {
        const primeiraData = parseBrazilianDate(primeiraLinha[0])
        const startDate = new Date(periodo.startDate)
        const endDate = new Date(periodo.endDate)
        
        // Se a primeira data dos dados é muito anterior ao período (mais de 6 meses),
        // provavelmente o período está errado ou é um filtro padrão que não se aplica
        if (primeiraData && primeiraData < startDate) {
          const diffMonths = (startDate.getTime() - primeiraData.getTime()) / (30 * 24 * 60 * 60 * 1000)
          if (diffMonths > 6) {
            console.log('[PausasSection] ⚠️ Período está muito distante dos dados (primeira data:', primeiraData.toLocaleDateString('pt-BR'), 'vs período:', startDate.toLocaleDateString('pt-BR'), '), ignorando filtro e mostrando todos os dados')
            usarFiltroPeriodo = false
          }
        }
        
        // Se o período está no futuro (mais de 1 mês), também ignorar
        const now = new Date()
        if (startDate > now && (startDate.getTime() - now.getTime()) > (30 * 24 * 60 * 60 * 1000)) {
          console.log('[PausasSection] ⚠️ Período está no futuro, ignorando filtro e mostrando todos os dados')
          usarFiltroPeriodo = false
        }
      }
    } else if (!periodoValido) {
      usarFiltroPeriodo = false
      console.log('[PausasSection] Sem período definido, incluindo todos os dados')
    }
    
    // Função para verificar se uma data está dentro do período selecionado
    const isDateInPeriod = (dataInicial) => {
      if (!usarFiltroPeriodo) {
        return true // Sem filtro, incluir todos
      }
      
      try {
        const rowDate = parseBrazilianDate(dataInicial)
        if (!rowDate) {
          return true // Incluir se não conseguir parsear
        }
        
        const startDate = new Date(periodo.startDate)
        const endDate = new Date(periodo.endDate)
        
        // Ajustar horas para comparar apenas datas (sem horas)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        const rowDateNormalized = new Date(rowDate)
        rowDateNormalized.setHours(0, 0, 0, 0)
        
        const dentro = rowDateNormalized >= startDate && rowDateNormalized <= endDate
        
        return dentro
      } catch (error) {
        console.log('[PausasSection] Erro ao verificar período:', error)
        return true
      }
    }

    // Função para verificar se uma célula contém erro
    const temErro = (valor) => {
      if (!valor) return false
      const valorStr = String(valor).trim()
      return valorStr.includes('#DIV/0!') || valorStr.includes('#ERROR!') || valorStr.includes('#')
    }

    // Função para converter duração (formato HH:MM:SS) para minutos
    const duracaoParaMinutos = (duracao) => {
      if (!duracao) return 0
      
      // Filtrar erros do Google Sheets
      const duracaoStr = String(duracao).trim()
      if (temErro(duracaoStr)) {
        return 0 // Linha descartada - erro na planilha
      }
      
      const partes = duracaoStr.split(':')
      if (partes.length === 3) {
        const horas = parseInt(partes[0]) || 0
        const minutos = parseInt(partes[1]) || 0
        const segundos = parseInt(partes[2]) || 0
        return horas * 60 + minutos + (segundos / 60)
      }
      
      return parseFloat(duracao) || 0
    }

    // Função para obter chave do mês
    const getMesKey = (dataInicial) => {
      try {
        const date = parseBrazilianDate(dataInicial)
        if (!date) return 'Data inválida'
        
        const mes = date.getMonth() + 1
        const ano = date.getFullYear()
        return `${mes}/${ano}`
      } catch (error) {
        return 'Data inválida'
      }
    }

    // Função para obter chave do dia
    const getDiaKey = (dataInicial) => {
      try {
        const date = parseBrazilianDate(dataInicial)
        if (!date) return 'Data inválida'
        
        const dia = date.getDate()
        const mes = date.getMonth() + 1
        const ano = date.getFullYear()
        return `${dia}/${mes}/${ano}`
      } catch (error) {
        return 'Data inválida'
      }
    }

    const tempoLogadoPorMes = {}
    const tempoPausadoPorMes = {}
    const mesesSet = new Set()

    // Se os dados são objetos (estrutura de pausas processadas)
    if (pausasData.length > 0 && typeof pausasData[0] === 'object' && !Array.isArray(pausasData[0])) {
      // Estrutura para armazenar dados por operador e mês
      const dadosPorOperadorMes = {}
      
      pausasData.forEach((pausa) => {
        if (pausa.dataInicial && pausa.duracao && pausa.operador) {
          if (!isDateInPeriod(pausa.dataInicial)) {
            return
          }

          const mesKey = getMesKey(pausa.dataInicial)
          const operador = pausa.operador.trim()
          
          if (!dadosPorOperadorMes[mesKey]) {
            dadosPorOperadorMes[mesKey] = {}
          }
          
          if (!dadosPorOperadorMes[mesKey][operador]) {
            dadosPorOperadorMes[mesKey][operador] = {
              tempoLogado: 0,
              tempoPausado: 0
            }
          }
          
          mesesSet.add(mesKey)
          
          const duracaoMinutos = duracaoParaMinutos(pausa.duracao)

          // Se é uma pausa, adiciona ao tempo pausado
          dadosPorOperadorMes[mesKey][operador].tempoPausado += duracaoMinutos
          
          // Para tempo logado, vamos assumir que há tempo logado baseado na jornada
          const jornadaMinutos = 8 * 60 // 8 horas em minutos
          const tempoLogadoEstimado = jornadaMinutos - dadosPorOperadorMes[mesKey][operador].tempoPausado
          dadosPorOperadorMes[mesKey][operador].tempoLogado = Math.max(0, tempoLogadoEstimado)
        }
      })
      
      // Calcular médias por mês (média dos operadores)
      Object.keys(dadosPorOperadorMes).forEach(mesKey => {
        const operadoresDoMes = Object.keys(dadosPorOperadorMes[mesKey])
        const totalOperadores = operadoresDoMes.length
        
        if (totalOperadores > 0) {
          const tempoTotalLogado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMes[mesKey][operador].tempoLogado, 0)
          const tempoTotalPausado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMes[mesKey][operador].tempoPausado, 0)
          
          // Média por operador do mês (em minutos)
          const mediaLogadoPorOperador = tempoTotalLogado / totalOperadores
          const mediaPausadoPorOperador = tempoTotalPausado / totalOperadores
          
          tempoLogadoPorMes[mesKey] = mediaLogadoPorOperador
          tempoPausadoPorMes[mesKey] = mediaPausadoPorOperador
        }
      })
    } else {
      // Nova estrutura (array de arrays) - aba resumo
      // Coluna A=Data, B=Operador, C=Tempo em Pausa (TMP), D=Tempo Online (TML)
      let dataStartIndex = 1 // Começar da linha 2 (índice 1), assumindo linha 1 é cabeçalho
      let linhasDescartadas = 0
      
      // Verificar se primeira linha é cabeçalho
      if (pausasData.length > 0 && Array.isArray(pausasData[0])) {
        const primeiraLinha = pausasData[0]
        const primeiroCampo = String(primeiraLinha[0] || '').trim().toLowerCase()
        if (primeiroCampo === 'data' || primeiroCampo.includes('data')) {
          dataStartIndex = 1 // Pular cabeçalho
          console.log('[PausasSection] Cabeçalho detectado, iniciando processamento da linha 2')
        } else {
          dataStartIndex = 0 // Não há cabeçalho
          console.log('[PausasSection] Sem cabeçalho detectado, iniciando processamento da linha 1')
        }
      }
      
      // Estrutura para armazenar dados por operador e mês (para arrays)
      const dadosPorOperadorMesArray = {}
      let linhasProcessadas = 0
      let linhasValidas = 0
      
      console.log('[PausasSection] Iniciando processamento de', pausasData.length - dataStartIndex, 'linhas')
      
      pausasData.slice(dataStartIndex).forEach((row, index) => {
        if (!Array.isArray(row) || row.length < 4) {
          linhasDescartadas = (linhasDescartadas || 0) + 1 // Linha descartada - estrutura inválida
          if (index < 5) {
            console.log(`[PausasSection] Linha ${dataStartIndex + index} descartada - estrutura inválida. Length:`, row?.length, 'Row:', row)
          }
          return
        }

        linhasProcessadas++

        // Nova estrutura: A=Data, B=Operador, C=Tempo Online (TML), D=Tempo em Pausa (TMP)
        const dataStr = String(row[0] || '').trim() // Coluna A - Data
        const operador = String(row[1] || '').trim() // Coluna B - Operador
        const tempoOnline = String(row[2] || '').trim() // Coluna C - Tempo Online (TML)
        const tempoPausa = String(row[3] || '').trim() // Coluna D - Tempo em Pausa (TMP)

        if (index < 5) {
          console.log(`[PausasSection] Processando linha ${dataStartIndex + index}:`, {
            dataStr,
            operador,
            tempoPausa,
            tempoOnline,
            rowLength: row.length
          })
        }

        // Filtrar linhas com erros ou vazias
        if (!dataStr || !operador || temErro(dataStr) || temErro(operador) || temErro(tempoPausa) || temErro(tempoOnline)) {
          linhasDescartadas = (linhasDescartadas || 0) + 1 // Linha descartada - erro ou vazio
          if (index < 5) {
            console.log(`[PausasSection] Linha ${dataStartIndex + index} descartada - erro ou vazio:`, {
              temDataStr: !!dataStr,
              temOperador: !!operador,
              temErroDataStr: temErro(dataStr),
              temErroOperador: temErro(operador),
              temErroTempoPausa: temErro(tempoPausa),
              temErroTempoOnline: temErro(tempoOnline)
            })
          }
          return
        }
        
        if (!isDateInPeriod(dataStr)) {
          if (index < 5) {
            const parsedDate = parseBrazilianDate(dataStr)
            if (parsedDate && periodo && periodo.startDate && periodo.endDate) {
              const start = new Date(periodo.startDate)
              const end = new Date(periodo.endDate)
              start.setHours(0, 0, 0, 0)
              end.setHours(23, 59, 59, 999)
              const row = new Date(parsedDate)
              row.setHours(0, 0, 0, 0)
              console.log(`[PausasSection] Linha ${dataStartIndex + index} fora do período:`, {
                dataStr,
                parsedDate: parsedDate.toLocaleDateString('pt-BR'),
                periodoStart: start.toLocaleDateString('pt-BR'),
                periodoEnd: end.toLocaleDateString('pt-BR'),
                rowDate: row.toLocaleDateString('pt-BR'),
                dentroPeriodo: row >= start && row <= end,
                comparacao: `${row.toISOString()} >= ${start.toISOString()} && ${row.toISOString()} <= ${end.toISOString()}`
              })
            }
          }
          return
        }
        
        linhasValidas++
          
        const mesKey = getMesKey(dataStr)
          
          if (!dadosPorOperadorMesArray[mesKey]) {
            dadosPorOperadorMesArray[mesKey] = {}
          }
          
          if (!dadosPorOperadorMesArray[mesKey][operador]) {
            dadosPorOperadorMesArray[mesKey][operador] = {
              tempoLogado: 0,
              tempoPausado: 0
            }
          }
          
          mesesSet.add(mesKey)
          
        // Converter tempos para minutos
        const tmlMinutos = duracaoParaMinutos(tempoOnline) // Coluna C - Tempo Online (TML)
        const tmpMinutos = duracaoParaMinutos(tempoPausa) // Coluna D - Tempo em Pausa (TMP)
          
        if (index < 3) {
          console.log(`[PausasSection] Linha ${dataStartIndex + index} processada:`, {
            mesKey,
            operador,
            tmpMinutos,
            tmlMinutos
          })
        }
          
        // Somar os tempos por operador e mês
        dadosPorOperadorMesArray[mesKey][operador].tempoPausado += tmpMinutos
        dadosPorOperadorMesArray[mesKey][operador].tempoLogado += tmlMinutos
      })
      
      console.log('[PausasSection] 📊 Estatísticas de processamento:')
      console.log('[PausasSection] - Linhas processadas:', linhasProcessadas)
      console.log('[PausasSection] - Linhas válidas:', linhasValidas)
      console.log('[PausasSection] - Linhas descartadas:', linhasDescartadas)
      
      // Log de linhas descartadas (conforme regras de qualidade)
      if (linhasDescartadas > 0) {
        console.log(`[PausasSection] ${linhasDescartadas} linha(s) descartada(s) devido a erros ou valores inválidos`)
      }
      
      // Calcular TOTAIS por mês (soma de todos os operadores) para arrays
      Object.keys(dadosPorOperadorMesArray).forEach(mesKey => {
        const operadoresDoMes = Object.keys(dadosPorOperadorMesArray[mesKey])
        
        if (operadoresDoMes.length > 0) {
          // SOMAR todos os tempos de todos os operadores do mês (não fazer média)
          const tempoTotalLogado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMesArray[mesKey][operador].tempoLogado, 0)
          const tempoTotalPausado = operadoresDoMes.reduce((sum, operador) => 
            sum + dadosPorOperadorMesArray[mesKey][operador].tempoPausado, 0)
          
          // Armazenar TOTAIS (não médias) - em minutos
          tempoLogadoPorMes[mesKey] = tempoTotalLogado
          tempoPausadoPorMes[mesKey] = tempoTotalPausado
          
          console.log(`[PausasSection] Mês ${mesKey} - Total Logado: ${tempoTotalLogado.toFixed(2)} min (${(tempoTotalLogado/60).toFixed(2)} horas), Total Pausado: ${tempoTotalPausado.toFixed(2)} min (${(tempoTotalPausado/60).toFixed(2)} horas)`)
        }
      })
    }

    const meses = Array.from(mesesSet).sort()
    const totalMeses = meses.length

    console.log('[PausasSection] Meses encontrados:', meses)
    console.log('[PausasSection] Total de meses:', totalMeses)
    console.log('[PausasSection] Tempo logado por mês:', tempoLogadoPorMes)
    console.log('[PausasSection] Tempo pausado por mês:', tempoPausadoPorMes)

    // Calcular médias
    const tempoTotalLogado = Object.values(tempoLogadoPorMes).reduce((sum, time) => sum + time, 0)
    const tempoTotalPausado = Object.values(tempoPausadoPorMes).reduce((sum, time) => sum + time, 0)
    
    const tempoMedioLogado = totalMeses > 0 ? tempoTotalLogado / totalMeses : 0
    const tempoMedioPausado = totalMeses > 0 ? tempoTotalPausado / totalMeses : 0

    console.log('[PausasSection] Tempo total logado:', tempoTotalLogado, 'minutos')
    console.log('[PausasSection] Tempo total pausado:', tempoTotalPausado, 'minutos')
    console.log('[PausasSection] Tempo médio logado:', tempoMedioLogado, 'minutos')
    console.log('[PausasSection] Tempo médio pausado:', tempoMedioPausado, 'minutos')

    const result = {
      dias: meses, // Mantendo o nome 'dias' para compatibilidade com o componente
      tempoLogadoPorDia: tempoLogadoPorMes, // Mantendo o nome para compatibilidade
      tempoPausadoPorDia: tempoPausadoPorMes, // Mantendo o nome para compatibilidade
      tempoMedioLogado,
      tempoMedioPausado,
      totalDias: totalMeses // Mantendo o nome para compatibilidade
    }
    
    console.log('[PausasSection] Resultado final processado:', result)
    return result
  }, [pausasData, periodo])

  // Função para converter minutos para formato HH:MM:SS
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00'
    
    const totalMinutes = Math.floor(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const secs = Math.floor((minutes % 1) * 60)
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Dados do gráfico
  const chartData = {
    labels: processedData.dias,
    datasets: [
      {
        label: 'Tempo Logado (TML)',
        data: processedData.dias.map(dia => processedData.tempoLogadoPorDia[dia] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 12
      }
      },
      {
        label: 'Tempo Pausado (TMP)',
        data: processedData.dias.map(dia => processedData.tempoPausadoPorDia[dia] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 1
      }
      }
    ]
  }

  // Opções do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 0 // Remove animações que podem causar números aparecerem
    },
    layout: {
      padding: {
        top: 0.5,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false // Legenda será exibida no header ao lado do título
      },
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        formatter: function(value) {
          return formatMinutesToTime(value)
        },
        anchor: 'end',
        align: 'top',
        offset: 8
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return `📅 ${context[0].label}`
          },
          label: function(context) {
            const time = formatMinutesToTime(context.parsed.y)
            const label = context.dataset.label
            return `${label}: ${time}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 15,
          callback: function(value) {
            return formatMinutesToTime(value)
          }
        }
      }
    }
  }

  console.log('[PausasSection] Renderizando componente')
  console.log('[PausasSection] chartData:', chartData)
  console.log('[PausasSection] processedData.dias:', processedData.dias)
  console.log('[PausasSection] processedData.tempoLogadoPorDia:', processedData.tempoLogadoPorDia)
  console.log('[PausasSection] processedData.tempoPausadoPorDia:', processedData.tempoPausadoPorDia)

  return (
    <div className="pausas-section">
      {/* Card TML & TMP */}
      <div className="pausas-card">
        <div className="pausas-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <h3 className="pausas-card-title">Tempo Médio Logado e Pausado (TML & TMP)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: 'rgba(34, 197, 94, 0.8)', 
                  borderRadius: '4px',
                  border: '2px solid rgba(34, 197, 94, 1)'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Tempo Logado (TML)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.8)', 
                  borderRadius: '4px',
                  border: '2px solid rgba(239, 68, 68, 1)'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Tempo Pausado (TMP)</span>
              </div>
            </div>
          </div>
          <i className='bx bx-bar-chart-alt-2 pausas-card-icon'></i>
        </div>
        <div className="pausas-chart-container" style={{ minHeight: '500px', height: '500px' }}>
          {chartData && chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>📊 Nenhum dado disponível</p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Dados processados: {processedData.dias.length} meses encontrados
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Verifique o console para mais detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PausasSection
