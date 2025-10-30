import React, { memo, useState, useMemo, useEffect } from 'react'
import './MetricsDashboard.css'
import TendenciaSemanalChart from './TendenciaSemanalChart2'
import CSATChart from './CSATChart'
import VolumeProdutoURAChart from './VolumeProdutoURAChart'
import VolumeHoraChart from './VolumeHoraChart'
import PausasSection from './PausasSection'
import TMAChart from './TMAChart'
import TMLChart from './TMLChart'
import MiniCard from './MiniCard'
import ChartModal from './ChartModal'
import BarMiniPreview from './BarMiniPreview'
import { 
  BsGraphUp, 
  BsStarFill, 
  BsClock, 
  BsHourglassSplit,
  BsTelephoneForward,
  BsFileText,
  BsBullseye,
  BsPauseCircle,
  BsBarChart,
  BsArrowsExpand
} from 'react-icons/bs'
import LineChartMiniPreview from './LineChartMiniPreview'
import DoughnutMiniPreview from './DoughnutMiniPreview'
import PausasPreview from './PausasPreview'
import PeriodSelectorV2 from './PeriodSelectorV2'
import SkeletonLoader from './SkeletonLoader'
import { usePausasData } from '../hooks/usePausasData'
import ChartSelector from './ChartSelector'
import ChartComparisonModal from './ChartComparisonModal'

const MetricsDashboard = memo(({ metrics = {}, octaData = null, data = [], periodo = null, fullDataset = [], onFiltersChange = null, filters = null }) => {
  const [activeView, setActiveView] = useState('55pbx')
  
  // Função para lidar com mudança de período
  const handlePeriodChange = (newPeriod) => {
    if (onFiltersChange) {
      // Se for customRange, passar as datas junto
      if (typeof newPeriod === 'object' && newPeriod.type === 'customRange') {
        const newFilters = { 
          ...filters, 
          period: 'customRange',
          customStartDate: newPeriod.customStartDate,
          customEndDate: newPeriod.customEndDate
        }
        onFiltersChange(newFilters)
      } else {
        // Para outros períodos, limpar as datas customizadas
        const newFilters = { 
          ...filters, 
          period: newPeriod,
          customStartDate: null,
          customEndDate: null
        }
        onFiltersChange(newFilters)
      }
    }
  }
  
  // Usar o período dos filtros do App.jsx
  const selectedPeriod = filters?.period || null
  const [isAnaliseGeralModalOpen, setIsAnaliseGeralModalOpen] = useState(false)
  const [isCSATModalOpen, setIsCSATModalOpen] = useState(false)
  const [isVolumeURAModalOpen, setIsVolumeURAModalOpen] = useState(false)
  const [isVolumeHoraModalOpen, setIsVolumeHoraModalOpen] = useState(false)
  const [isTMAModalOpen, setIsTMAModalOpen] = useState(false)
  
  // Estados para modais de tickets
  const [isTicketsAnaliseGeralModalOpen, setIsTicketsAnaliseGeralModalOpen] = useState(false)
  const [isTicketsTMAModalOpen, setIsTicketsTMAModalOpen] = useState(false)
  const [isTicketsVolumeFilaModalOpen, setIsTicketsVolumeFilaModalOpen] = useState(false)
  const [isTicketsVolumeHoraModalOpen, setIsTicketsVolumeHoraModalOpen] = useState(false)
  const [isTicketsTMAResolucaoModalOpen, setIsTicketsTMAResolucaoModalOpen] = useState(false)
  
  // Estados para modais de pausas
  const [isPausasModalOpen, setIsPausasModalOpen] = useState(false)
  
  // Estados para comparação de gráficos
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedCharts, setSelectedCharts] = useState([])
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  
  // Hook para carregar dados específicos de pausas
  const { pausasData, isLoading: isLoadingPausas, error: pausasError } = usePausasData()
  
  // Debug: Log quando os dados mudarem
  React.useEffect(() => {
    console.log('[MetricsDashboardNovo] Estado de pausas atualizado:', {
      isLoadingPausas,
      pausasError,
      pausasDataLength: pausasData?.length || 0,
      pausasDataPreview: pausasData?.slice(0, 3) || []
    })
  }, [pausasData, isLoadingPausas, pausasError])
  
  // Verificar se há erro de permissão no octaData
  const hasOctaPermissionError = octaData?.error && octaData.error.includes('Acesso negado')
  

  // Calcular objeto periodo baseado no selectedPeriod
  const calculatedPeriodo = useMemo(() => {
    const now = new Date()
    let startDate, endDate, totalDays
    
    // Se for um objeto de range customizado
    if (selectedPeriod && typeof selectedPeriod === 'object') {
      if (selectedPeriod.type === 'customRange') {
        // Range de datas customizado
        startDate = new Date(selectedPeriod.startDate)
        endDate = new Date(selectedPeriod.endDate)
        totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      }
    }
    // Se for um mês específico (formato YYYY-MM)
    else if (selectedPeriod && selectedPeriod.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = selectedPeriod.split('-')
      const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1)
      const lastDay = new Date(parseInt(year), parseInt(month), 0)
      startDate = firstDay
      endDate = lastDay
      totalDays = lastDay.getDate()
    } else {
      switch(selectedPeriod) {
        case 'previousDay':
          // Dia anterior
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
          endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
          totalDays = 1
          break
        case 'currentMonth':
          // Mês atual: do dia 01 até hoje (ou última data disponível)
          const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          startDate = firstDayOfCurrentMonth
          endDate = new Date(now)
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'last3Months':
          // Últimos 3 meses completos
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
          startDate = threeMonthsAgo
          endDate = lastDayOfLastMonth
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'last7Days':
          endDate = new Date(now)
          startDate = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000))
          totalDays = 7
          break
        case 'last15Days':
          startDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
          endDate = new Date(now)
          totalDays = 15
          break
        case 'last90Days':
          startDate = new Date(now.getTime() - (89 * 24 * 60 * 60 * 1000))
          endDate = new Date(now)
          totalDays = 90
          break
        case 'customRange':
          // Range personalizado - usar datas dos filtros
          if (filters?.customStartDate && filters?.customEndDate) {
            const [anoInicio, mesInicio, diaInicio] = filters.customStartDate.split('-')
            const [anoFim, mesFim, diaFim] = filters.customEndDate.split('-')
            
            startDate = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio))
            endDate = new Date(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim))
            totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          } else {
            // Sem datas, usar mês atual
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now)
            totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          }
          break
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'penultimateMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'ultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'penultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
          totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          break
        case 'allRecords':
          startDate = null
          endDate = null
          totalDays = 0
          break
        default:
          startDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
          endDate = new Date(now)
          totalDays = 15
      }
    }
    
    return { startDate, endDate, totalDays }
  }, [selectedPeriod, filters])

  // Preparar dados para os gráficos - usar dados processados
  const chartData = useMemo(() => {
    // Sempre usar dados processados (objetos) em vez de dados brutos (arrays)
    return data.length > 0 ? data : []
  }, [data])

  // Preparar dados brutos para gráficos que precisam do formato de array
  const rawData = useMemo(() => {
    // Usar fullDataset se disponível, senão usar data
    return fullDataset.length > 0 ? fullDataset : data
  }, [fullDataset, data])

  // Preparar dados de tickets - extrair array correto do octaData
  const ticketsData = useMemo(() => {
    if (!octaData) return []
    
    // Se octaData é um array, usar diretamente
    if (Array.isArray(octaData)) return octaData
    
    // Tentar diferentes propriedades possíveis (incluindo as que vimos no debug)
    const possibleDataKeys = ['octaData', 'octaRawData', 'data', 'tickets', 'records', 'items', 'rows', 'values', 'results', 'list']
    
    for (const key of possibleDataKeys) {
      if (octaData[key] && Array.isArray(octaData[key])) {
        return octaData[key]
      }
    }
    
    // Buscar em estruturas aninhadas (objetos dentro de objetos)
    for (const key of Object.keys(octaData)) {
      const value = octaData[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Verificar se este objeto tem propriedades com arrays
        for (const nestedKey of possibleDataKeys) {
          if (value[nestedKey] && Array.isArray(value[nestedKey])) {
            return value[nestedKey]
          }
        }
      }
    }
    
    // Se não encontrar array, retornar vazio
    return []
  }, [octaData])

  // Preparar dados para mini previews (últimos 5 registros)
  const miniPreviewData = useMemo(() => {
    const last5Records = chartData && chartData.length > 0 ? chartData.slice(-5) : []
    const last5Tickets = ticketsData && ticketsData.length > 0 ? ticketsData.slice(-5) : []
    const last5Raw = rawData && rawData.length > 0 ? rawData.slice(-5) : []
    
    return {
      telefonia: last5Records,
      tickets: last5Tickets,
      rawData: last5Raw
    }
  }, [chartData, ticketsData, rawData])

  // Processar dados de pausas para os indicadores
  const pausasIndicators = useMemo(() => {
    if (!pausasData || pausasData.length === 0) {
      return {
        totalPausas: 0,
        tempoTotalPausa: '00:00:00',
        duracaoMedia: 0,
        pausasPorHora: 0
      }
    }

    // Função para verificar se uma data está dentro do período selecionado
    const isDateInPeriod = (dataInicial) => {
      if (!periodo) return true // Se não há período, incluir todos os dados
      
      try {
        const rowDate = parseBrazilianDate(dataInicial)
        if (!rowDate) return true
        
        const startDate = new Date(periodo.startDate)
        const endDate = new Date(periodo.endDate)
        
        return rowDate >= startDate && rowDate <= endDate
      } catch (error) {
        return true
      }
    }

    // Função para parse de data brasileira
    const parseBrazilianDate = (dateStr) => {
      if (!dateStr) return null
      if (dateStr instanceof Date) return dateStr
      
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const year = parseInt(parts[2])
        return new Date(year, month, day)
      }
      
      return new Date(dateStr)
    }

    let totalPausas = 0
    let totalSegundos = 0
    const debugPausas = [] // Para debug

    // Processar dados de pausas específicos
    pausasData.slice(1).forEach((row) => { // Pular cabeçalho
      if (Array.isArray(row) && row.length > 15) {
        const operador = String(row[0] || '').trim() // Coluna A
        const atividade = String(row[9] || '').trim() // Coluna J
        const dataInicial = String(row[10] || '').trim() // Coluna K
        const motivoPausa = String(row[16] || '').trim() // Coluna Q - Motivo Da Pausa
        const duracao = String(row[15] || '').trim() // Coluna P - DuracaoCalculo

        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(dataInicial)) {
          return // Pular esta linha se não estiver no período
        }

        // Só processar se atividade for "em pausa" (não "online")
        if (operador && atividade.toLowerCase() === 'em pausa' && motivoPausa && duracao) {
          totalPausas++
          
          // Converter duração HH:MM:SS para segundos
          const partes = duracao.split(':')
          if (partes.length === 3) {
            const horas = parseInt(partes[0]) || 0
            const minutos = parseInt(partes[1]) || 0
            const segundos = parseInt(partes[2]) || 0
            const duracaoSegundos = (horas * 3600) + (minutos * 60) + segundos
            totalSegundos += duracaoSegundos
            
            // Debug: armazenar informações da pausa
            debugPausas.push({
              operador,
              motivo: motivoPausa,
              duracao,
              duracaoSegundos,
              data: dataInicial
            })
          }
        }
      }
    })

    // Debug: mostrar algumas pausas para análise
    if (debugPausas.length > 0) {
      // Debug removido para otimização
      
      // Mostrar pausas de almoço especificamente
      const pausasAlmoco = debugPausas.filter(p => 
        p.motivo.toLowerCase().includes('almoço') || 
        p.motivo.toLowerCase().includes('almoco') ||
        p.motivo.toLowerCase().includes('lunch')
      )
      // Debug removido para otimização
    }

    // Converter segundos totais para formato HH:MM:SS
    const formatarTempo = (segundos) => {
      const horas = Math.floor(segundos / 3600)
      const minutos = Math.floor((segundos % 3600) / 60)
      const segs = segundos % 60
      
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
    }

    const tempoTotalPausa = formatarTempo(totalSegundos)
    const duracaoMediaSegundos = totalPausas > 0 ? Math.round(totalSegundos / totalPausas) : 0
    const duracaoMedia = formatarTempo(duracaoMediaSegundos) // Converter para HH:MM:SS
    
    // Calcular estatísticas por tipo de pausa
    const estatisticasPorMotivo = {}
    if (debugPausas.length > 0) {
      debugPausas.forEach(pausa => {
        const motivo = pausa.motivo.toLowerCase()
        if (!estatisticasPorMotivo[motivo]) {
          estatisticasPorMotivo[motivo] = {
            count: 0,
            totalSegundos: 0,
            duracoes: []
          }
        }
        estatisticasPorMotivo[motivo].count++
        estatisticasPorMotivo[motivo].totalSegundos += pausa.duracaoSegundos
        estatisticasPorMotivo[motivo].duracoes.push(pausa.duracao)
      })
      
      // Debug removido para otimização
      
      // Calcular média por tipo de pausa
      Object.keys(estatisticasPorMotivo).forEach(motivo => {
        const stats = estatisticasPorMotivo[motivo]
        const mediaSegundos = Math.round(stats.totalSegundos / stats.count)
        const mediaFormatada = formatarTempo(mediaSegundos)
        // Debug removido para otimização
      })
    }
    
    // Calcular duração média por tipo de pausa
    const duracaoMediaPorTipo = {}
    Object.keys(estatisticasPorMotivo).forEach(motivo => {
      const stats = estatisticasPorMotivo[motivo]
      const mediaSegundos = Math.round(stats.totalSegundos / stats.count)
      duracaoMediaPorTipo[motivo] = formatarTempo(mediaSegundos)
    })
    
    // Função para normalizar nome do operador (remover prefixos e sufixos)
    const normalizarNomeOperador = (nome) => {
      if (!nome) return ''
      
      let nomeNormalizado = nome.trim()
      
      // Remover prefixos
      if (nomeNormalizado.toLowerCase().startsWith('desl ')) {
        nomeNormalizado = nomeNormalizado.substring(5).trim()
      }
      
      // Remover sufixos de exclusão
      if (nomeNormalizado.includes(' - Excluído')) {
        nomeNormalizado = nomeNormalizado.split(' - Excluído')[0].trim()
      }
      if (nomeNormalizado.includes(' - Excluido')) {
        nomeNormalizado = nomeNormalizado.split(' - Excluido')[0].trim()
      }
      
      return nomeNormalizado
    }
    
    // Contar quantidade única de atendentes que trabalharam (online ou em pausa)
    const atendentesQueTrabalharam = new Set()
    const atendentesDetalhes = []
    const operadoresNormalizados = new Map() // Mapear nome normalizado para nome original
    
    pausasData.slice(1).forEach((row) => {
      if (Array.isArray(row) && row.length > 15) {
        const operador = String(row[0] || '').trim()
        const atividade = String(row[9] || '').trim()
        const dataInicial = String(row[10] || '').trim()
        const duracao = String(row[15] || '').trim() // Coluna P - DuracaoCalculo

        if (!isDateInPeriod(dataInicial)) return

        // Contar qualquer operador que tenha atividade (online ou em pausa) com duração
        if (operador && (atividade.toLowerCase() === 'online' || atividade.toLowerCase() === 'em pausa') && duracao) {
          const nomeNormalizado = normalizarNomeOperador(operador)
          
          // Só adicionar se o nome normalizado for válido
          if (nomeNormalizado.length >= 3 && /[a-z]/.test(nomeNormalizado.toLowerCase())) {
            // Usar nome normalizado como chave única
            if (!operadoresNormalizados.has(nomeNormalizado)) {
              operadoresNormalizados.set(nomeNormalizado, operador) // Guardar nome original
            }
            
            atendentesQueTrabalharam.add(nomeNormalizado)
            
            // Armazenar detalhes para debug
            atendentesDetalhes.push({
              operador: nomeNormalizado, // Usar nome normalizado
              operadorOriginal: operador, // Guardar nome original
              atividade,
              dataInicial,
              duracao
            })
          }
        }
      }
    })
    
    // Debug removido para otimização
    
    // Mostrar estatísticas por operador (apenas os válidos)
    const estatisticasPorOperador = {}
    atendentesDetalhes.forEach(detail => {
      if (!estatisticasPorOperador[detail.operador]) {
        estatisticasPorOperador[detail.operador] = {
          totalRegistros: 0,
          atividades: new Set(),
          datas: new Set(),
          nomeOriginal: detail.operadorOriginal
        }
      }
      estatisticasPorOperador[detail.operador].totalRegistros++
      estatisticasPorOperador[detail.operador].atividades.add(detail.atividade)
      estatisticasPorOperador[detail.operador].datas.add(detail.dataInicial)
    })
    
    // Debug removido para otimização
    Object.keys(estatisticasPorOperador).sort().forEach(operador => {
      const stats = estatisticasPorOperador[operador]
      // Debug removido para otimização
    })
    
    const quantidadeAtendentes = atendentesQueTrabalharam.size

    return {
      totalPausas,
      tempoTotalPausa,
      duracaoMedia,
      quantidadeAtendentes,
      duracaoMediaPorTipo
    }
  }, [pausasData, periodo])

  // Handlers para comparação de gráficos
  const handleOpenSelector = () => {
    setIsSelectorOpen(true)
  }

  const handleSelectCharts = (charts) => {
    setSelectedCharts(charts)
    setIsSelectorOpen(false)
    setIsComparisonModalOpen(true)
  }

  // Renderizar gráfico baseado na seleção
  const renderChart = (chartConfig) => {
    if (!chartConfig) return null

    const commonProps = { periodo: calculatedPeriodo }
    
    switch (chartConfig.component) {
      case 'TendenciaSemanalChart':
        return <TendenciaSemanalChart data={chartConfig.id.includes('tickets') ? ticketsData : chartData} {...commonProps} />
      case 'CSATChart':
        return <CSATChart data={chartConfig.id.includes('tickets') ? ticketsData : chartData} {...commonProps} />
      case 'VolumeHoraChart':
        return <VolumeHoraChart data={chartConfig.id.includes('tickets') ? ticketsData : chartData} {...commonProps} />
      case 'TMAChart':
        if (chartConfig.id === 'tickets-tma-resolucao') {
          return <TMAChart data={ticketsData} periodo={calculatedPeriodo} groupBy="assunto" />
        } else {
          return <TMAChart data={chartConfig.id.includes('tickets') ? ticketsData : rawData} periodo={calculatedPeriodo} groupBy="produto" />
        }
      case 'VolumeProdutoURAChart':
        return <VolumeProdutoURAChart data={ticketsData} periodo={calculatedPeriodo} isTicketsTab={true} />
      default:
        return <div className="empty-chart">Gráfico não disponível</div>
    }
  }

  return (
    <div className="container">


      {/* View 55pbx */}
      {activeView === '55pbx' && (
        <div className="view active">

      {/* Seletor de Período e Botão de Comparação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <button 
          onClick={handleOpenSelector}
          className="comparison-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'var(--color-text-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <BsArrowsExpand style={{ fontSize: '18px' }} />
          Comparar Gráficos
        </button>
        
        <PeriodSelectorV2 
          onPeriodChange={handlePeriodChange}
          currentPeriod={selectedPeriod}
          customStartDate={filters?.customStartDate}
          customEndDate={filters?.customEndDate}
        />
      </div>

      {/* Separador entre seções */}
      <div className="section-separator">
            <div className="separator-line"></div>
            <div className="separator-text">Telefonia</div>
            <div className="separator-line"></div>
          </div>


          {/* Mini Cards - Primeira Linha (3 cards) */}
          <div className="mini-cards-container">
            {/* Mini Card - Análise Geral */}
            <MiniCard
              title="Análise Geral"
              icon={<BsGraphUp />}
              description="Tendências gerais"
              previewData={<BarMiniPreview data={miniPreviewData.telefonia} type="line" />}
              onClick={() => setIsAnaliseGeralModalOpen(true)}
              delay={0}
            />

            {/* Mini Card - CSAT */}
            <MiniCard
              title="CSAT - Satisfação do Cliente"
              icon={<BsStarFill />}
              description="Satisfação do cliente"
              previewData={<LineChartMiniPreview data={miniPreviewData.telefonia} type="csat" />}
              onClick={() => setIsCSATModalOpen(true)}
              delay={0.05}
            />

            {/* Mini Card - Volume Hora */}
            <MiniCard
              title="Volume por Hora"
              icon={<BsClock />}
              description="Volume por hora"
              previewData={<BarMiniPreview data={miniPreviewData.rawData} type="grouped" />}
              onClick={() => setIsVolumeHoraModalOpen(true)}
              delay={0.1}
            />
          </div>

          {/* Mini Cards - Segunda Linha (2 cards centralizados) */}
          <div className="mini-cards-container-tickets-row2">
            {/* Mini Card - TMA */}
            <MiniCard
              title="TMA - Tempo Médio de Atendimento"
              icon={<BsHourglassSplit />}
              description="Tempo médio por produto"
              previewData={<DoughnutMiniPreview data={miniPreviewData.rawData} groupBy="produto" />}
              onClick={() => setIsTMAModalOpen(true)}
              delay={0.15}
            />

            {/* Mini Card - Volume X Contact Rate (Em breve) */}
            <MiniCard
              title="Volume de chamadas X contact rate"
              icon={<BsBarChart />}
              description="Em breve"
              previewData={<BarMiniPreview data={miniPreviewData.rawData} type="stacked" />}
              onClick={() => {}}
              disabled={true}
              delay={0.2}
            />
          </div>

          {/* Modal para Análise Geral */}
          <ChartModal
            isOpen={isAnaliseGeralModalOpen}
            onClose={() => setIsAnaliseGeralModalOpen(false)}
            title="Análise Geral"
            icon="📊"
          >
            <div className="chart-container-analise">
              <TendenciaSemanalChart data={chartData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          {/* Modal para CSAT */}
          <ChartModal
            isOpen={isCSATModalOpen}
            onClose={() => setIsCSATModalOpen(false)}
            title="CSAT - Satisfação do Cliente"
            icon="⭐"
          >
            <div className="chart-container-csat">
              <CSATChart data={chartData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          {/* Modal para Volume Hora */}
          <ChartModal
            isOpen={isVolumeHoraModalOpen}
            onClose={() => setIsVolumeHoraModalOpen(false)}
            title="Volume por Hora"
            icon="⏰"
          >
            <div className="chart-container-hora">
              <VolumeHoraChart data={rawData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          {/* Modal para TMA */}
          <ChartModal
            isOpen={isTMAModalOpen}
            onClose={() => setIsTMAModalOpen(false)}
            title="TMA - Tempo Médio de Atendimento"
            icon="⏱️"
          >
            <div className="chart-container-tma">
              <TMAChart data={rawData} periodo={calculatedPeriodo} groupBy="produto" />
            </div>
          </ChartModal>

          {/* Separador entre seções */}
          <div className="section-separator">
            <div className="separator-line"></div>
            <div className="separator-text">TICKETS</div>
            <div className="separator-line"></div>
          </div>

          {/* Mini Cards Horizontais - Tickets */}
          <div className="mini-cards-container">
            {/* Mini Card - Análise Geral de Tickets */}
            <MiniCard
              title="Análise Geral de Tickets"
              icon={<BsFileText />}
              description="Tendências gerais"
              previewData={<BarMiniPreview data={miniPreviewData.tickets} type="line" />}
              onClick={() => setIsTicketsAnaliseGeralModalOpen(true)}
            />

            {/* Mini Card - TMA Operação Tickets */}
            <MiniCard
              title="FCR"
              icon={<BsHourglassSplit />}
              description="First Call Resolution"
              previewData={<LineChartMiniPreview data={miniPreviewData.tickets} type="tma" />}
              onClick={() => setIsTicketsTMAModalOpen(true)}
            />

            {/* Mini Card - Volume por Fila (Tickets) */}
            <MiniCard
              title="Volume por Produto"
              icon={<BsBarChart />}
              description="Volume por Produto"
              previewData={<BarMiniPreview data={miniPreviewData.tickets} type="horizontal" />}
              onClick={() => setIsTicketsVolumeFilaModalOpen(true)}
            />
          </div>

          {/* Segunda linha de tickets - 2 cards centralizados */}
          <div className="mini-cards-container-tickets-row2">
            {/* Mini Card - Volume por Hora (Tickets) */}
            <MiniCard
              title="Volume por Hora (Tickets)"
              icon={<BsClock />}
              description="Volume por hora"
              previewData={<BarMiniPreview data={miniPreviewData.tickets} type="grouped" />}
              onClick={() => setIsTicketsVolumeHoraModalOpen(true)}
            />

            {/* Mini Card - TMA Resolução por Assunto */}
            <MiniCard
              title="TMA - Tempo Médio de Resolução por Assunto"
              icon={<BsBullseye />}
              description="Tempo médio por assunto"
              previewData={<DoughnutMiniPreview data={miniPreviewData.tickets} groupBy="assunto" />}
              onClick={() => setIsTicketsTMAResolucaoModalOpen(true)}
            />
          </div>

          {/* Modais para gráficos de tickets */}
          <ChartModal
            isOpen={isTicketsAnaliseGeralModalOpen}
            onClose={() => setIsTicketsAnaliseGeralModalOpen(false)}
            title="Análise Geral de Tickets"
            icon="📊"
          >
            <div className="chart-container-analise">
              <TendenciaSemanalChart data={ticketsData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          <ChartModal
            isOpen={isTicketsTMAModalOpen}
            onClose={() => setIsTicketsTMAModalOpen(false)}
            title="TMA Operação Tickets"
            icon="⏱️"
          >
            <div className="chart-container-csat">
              <CSATChart data={ticketsData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          <ChartModal
            isOpen={isTicketsVolumeFilaModalOpen}
            onClose={() => setIsTicketsVolumeFilaModalOpen(false)}
            title="Volume por Fila (Tickets)"
            icon="📋"
          >
            <div className="chart-container-ura">
              <VolumeProdutoURAChart data={ticketsData} periodo={calculatedPeriodo} isTicketsTab={true} />
            </div>
          </ChartModal>

          <ChartModal
            isOpen={isTicketsVolumeHoraModalOpen}
            onClose={() => setIsTicketsVolumeHoraModalOpen(false)}
            title="Volume por Hora (Tickets)"
            icon="⏰"
          >
            <div className="chart-container-hora">
              <VolumeHoraChart data={ticketsData} periodo={calculatedPeriodo} />
            </div>
          </ChartModal>

          <ChartModal
            isOpen={isTicketsTMAResolucaoModalOpen}
            onClose={() => setIsTicketsTMAResolucaoModalOpen(false)}
            title="TMA - Tempo Médio de Resolução por Assunto"
            icon="🎯"
          >
            <div className="chart-container-tma">
              <TMAChart data={ticketsData} periodo={calculatedPeriodo} groupBy="assunto" />
            </div>
          </ChartModal>

          {/* Separador entre seções */}
          <div className="section-separator">
            <div className="separator-line"></div>
            <div className="separator-text">PAUSAS</div>
            <div className="separator-line"></div>
          </div>

          {/* Mini Cards Horizontais - Pausas */}
          <div className="mini-cards-container-pausas">
            {/* Mini Card - Pausas */}
            <MiniCard
              title="Pausas por Mês"
              icon={<BsPauseCircle />}
              description={isLoadingPausas ? "Carregando..." : pausasError ? "Erro ao carregar" : `${pausasData?.length || 0} registros`}
              previewData={<PausasPreview />}
              onClick={() => setIsPausasModalOpen(true)}
            />
          </div>

          {/* Modal para gráfico de pausas */}
          <ChartModal
            isOpen={isPausasModalOpen}
            onClose={() => setIsPausasModalOpen(false)}
            title="Pausas - Total por Mês (TML & TMP)"
            icon="⏸️"
          >
            <div className="chart-container-pausas">
              {isLoadingPausas ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳</div>
                  Carregando dados de pausas...
                </div>
              ) : pausasError ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
                  <div style={{ fontSize: '18px', marginBottom: '10px' }}>❌</div>
                  Erro ao carregar dados de pausas
                  <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                    {pausasError}
                  </div>
                </div>
              ) : (
                <>
                  {console.log('[MetricsDashboardNovo] Renderizando PausasSection com:', {
                    pausasDataLength: pausasData?.length || 0,
                    periodo: calculatedPeriodo,
                    isLoadingPausas,
                    pausasError
                  })}
                  <PausasSection pausasData={pausasData} periodo={calculatedPeriodo} />
                </>
              )}
            </div>
          </ChartModal>

        </div>
      )}

      {/* View Octadesk */}
      {activeView === 'octadesk' && (
        <div className="view active">
          <div className="section-title">
            <i className='bx bxs-message-square-detail'></i>
            <h2>Tickets</h2>
          </div>

          {/* Mensagem de erro de permissão */}
          {hasOctaPermissionError && (
            <div className="error-message" style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0',
              color: '#dc2626'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                <strong>Problema de Acesso aos Dados de Tickets</strong>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {octaData.error}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                💡 <strong>Solução:</strong> Solicite ao administrador para compartilhar a planilha de tickets OCTA com sua conta Google.
              </p>
            </div>
          )}

          <div className="indicators-grid">
            <div className="indicator-card">
              <i className='bx bx-message-detail indicator-icon'></i>
              <div className="indicator-label">Total de Tickets</div>
              <div className="indicator-value">{octaData?.octaMetrics?.totalTickets || 0}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-time-five indicator-icon'></i>
              <div className="indicator-label">Pesquisa</div>
              <div className="indicator-value">{octaData?.octaMetrics?.porcentagemGeral || '0%'}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-check-circle indicator-icon'></i>
              <div className="indicator-label">Tickets Avaliados</div>
              <div className="indicator-value">{octaData?.octaMetrics?.totalAvaliados || 0}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-star indicator-icon'></i>
              <div className="indicator-label">Avaliações Boas</div>
              <div className="indicator-value">{(parseInt(octaData?.octaMetrics?.bomSemComentario?.replace(/\./g, '') || '0') + parseInt(octaData?.octaMetrics?.bomComComentario?.replace(/\./g, '') || '0')).toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* Cards de Gráficos - Tickets */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Análise Geral de Tickets</h3>
              <i className='bx bx-trending-up card-icon'></i>
            </div>
            <div className="chart-container-analise">
              <TendenciaSemanalChart data={octaData?.octaRawData || []} periodo={calculatedPeriodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TMA Operação Tickets</h3>
              <i className='bx bx-star card-icon'></i>
            </div>
            <div className="chart-container-tickets">
              <CSATChart data={octaData?.octaRawData || []} periodo={calculatedPeriodo} />
            </div>
          </div>

          {/* Containers lado a lado - Volume Fila e Volume Hora (Tickets) */}
          <div className="charts-side-by-side">
            {/* Volume por Fila (Tickets) - Card Individual Maior */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Volume por Fila (Tickets)</h3>
                <i className='bx bx-line-chart card-icon'></i>
              </div>
            <div className="chart-container-ura">
                <VolumeProdutoURAChart data={octaData?.octaRawData || []} periodo={calculatedPeriodo} isTicketsTab={true} />
              </div>
            </div>

            {/* Volume por Hora (Tickets) - Card Individual Maior */}
            <div className="card card-hora">
              <div className="card-header">
                <h3 className="card-title">Volume por Hora (Tickets)</h3>
                <i className='bx bx-bar-chart-alt-2 card-icon'></i>
              </div>
            <div className="chart-container-hora">
                <VolumeHoraChart data={octaData?.octaRawData || []} periodo={calculatedPeriodo} />
              </div>
            </div>
          </div>

          {/* TMA de Tickets - Card Individual Maior */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TMA - Tempo Médio de Resolução por Assunto</h3>
              <i className='bx bx-time-five card-icon'></i>
            </div>
            <div className="chart-container-tma">
              <TMAChart data={octaData?.octaRawData || []} periodo={calculatedPeriodo} groupBy="assunto" />
            </div>
          </div>
        </div>
      )}

      {/* View Pausas */}
      {activeView === 'pausas' && (
        <div className="view active">
          <div className="section-title">
            <i className='bx bxs-pause-circle'></i>
            <h2>Pausas</h2>
          </div>

          <div className="indicators-grid">
            <div className="indicator-card">
              <i className='bx bx-user indicator-icon'></i>
              <div className="indicator-label">Quantidade de Atendentes</div>
              <div className="indicator-value">{pausasIndicators.quantidadeAtendentes}</div>
            </div>
            
            {/* Indicadores por tipo de pausa */}
            {pausasIndicators.duracaoMediaPorTipo && Object.keys(pausasIndicators.duracaoMediaPorTipo)
              .filter(motivo => {
                const motivoLower = motivo.toLowerCase()
                // Filtrar tipos indesejados
                return !motivoLower.includes('login') && 
                       !motivoLower.includes('98') && 
                       !motivoLower.includes('registro de ponto')
              })
              .map(motivo => {
                // Limpar números do início do nome
                const motivoLimpo = motivo.replace(/^\d+\s*/, '').trim()
                return (
                  <div key={motivo} className="indicator-card">
                    <i className='bx bx-coffee indicator-icon'></i>
                    <div className="indicator-label">Média - {motivoLimpo}</div>
                    <div className="indicator-value">{pausasIndicators.duracaoMediaPorTipo[motivo]}</div>
                  </div>
                )
              })}
          </div>

          {/* Cards de Gráficos - Pausas */}
          <PausasSection pausasData={pausasData} periodo={calculatedPeriodo} />
        </div>
      )}

      {/* Modais de Comparação */}
      <ChartSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectCharts={handleSelectCharts}
      />

      <ChartComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        chart1={selectedCharts[0] ? renderChart(selectedCharts[0]) : null}
        chart2={selectedCharts[1] ? renderChart(selectedCharts[1]) : null}
      />
    </div>
  )
})

export default MetricsDashboard
