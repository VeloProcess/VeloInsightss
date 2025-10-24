import React, { memo, useState, useMemo, useEffect } from 'react'
import './MetricsDashboard.css'
import TendenciaSemanalChart from './TendenciaSemanalChart2'
import CSATChart from './CSATChart'
import VolumeProdutoURAChart from './VolumeProdutoURAChart'
import VolumeHoraChart from './VolumeHoraChart'
import PausasSection from './PausasSection'
import TMAChart from './TMAChart'
import TMLChart from './TMLChart'
import { usePausasData } from '../hooks/usePausasData'

const MetricsDashboard = memo(({ metrics = {}, octaData = null, data = [], periodo = null, fullDataset = [] }) => {
  const [activeView, setActiveView] = useState('55pbx')
  
  // Hook para carregar dados específicos de pausas
  const { pausasData, isLoading: isLoadingPausas, error: pausasError } = usePausasData()
  
  // Verificar se há erro de permissão no octaData
  const hasOctaPermissionError = octaData?.error && octaData.error.includes('Acesso negado')
  

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

  return (
    <div className="container">

      {/* Section Title */}
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className='bx bxs-phone'></i>
          <h2>Telefonia</h2>
        </div>
      </div>

      {/* Navigation Tabs - MOVIDOS PARA BAIXO */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeView === '55pbx' ? 'active' : ''}`}
          onClick={() => setActiveView('55pbx')}
        >
          <i className='bx bx-phone'></i>
          Telefonia
        </button>
        <button 
          className={`nav-tab ${activeView === 'octadesk' ? 'active' : ''}`}
          onClick={() => setActiveView('octadesk')}
        >
          <i className='bx bx-support'></i>
          Tickets
        </button>
        <button 
          className={`nav-tab ${activeView === 'pausas' ? 'active' : ''}`}
          onClick={() => setActiveView('pausas')}
        >
          <i className='bx bx-pause-circle'></i>
          Pausas
        </button>
      </div>

      {/* View 55pbx */}
      {activeView === '55pbx' && (
        <div className="view active">
          {/* Indicadores */}
          <div className="indicators-grid">
            <div className="indicator-card">
              <i className='bx bx-time-five indicator-icon'></i>
              <div className="indicator-label">TMA Geral</div>
              <div className="indicator-value">{metrics.duracaoMediaAtendimento || '0.0'} min</div>
            </div>
          </div>

          {/* Cards de Gráficos */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Análise Geral</h3>
              <i className='bx bx-trending-up card-icon'></i>
            </div>
            <div className="chart-container-analise">
              <TendenciaSemanalChart data={chartData} periodo={periodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">CSAT - Satisfação do Cliente</h3>
              <i className='bx bx-star card-icon'></i>
            </div>
            <div className="chart-container-csat">
              <CSATChart data={chartData} periodo={periodo} />
            </div>
          </div>

          {/* Containers lado a lado - Volume URA e Volume Hora */}
          <div className="charts-side-by-side">
            {/* Volume por Produto URA - Card Individual Maior */}
            <div className="card card-ura">
              <div className="card-header">
                <h3 className="card-title">Volume por Produto URA</h3>
                <i className='bx bx-line-chart card-icon'></i>
              </div>
              <div className="chart-container-ura">
                <VolumeProdutoURAChart data={rawData} periodo={periodo} />
              </div>
            </div>

            {/* Volume por Hora - Card Individual Maior */}
            <div className="card card-hora">
              <div className="card-header">
                <h3 className="card-title">Volume por Hora</h3>
                <i className='bx bx-bar-chart-alt-2 card-icon'></i>
              </div>
              <div className="chart-container-hora">
                <VolumeHoraChart data={rawData} periodo={periodo} />
              </div>
            </div>
          </div>

          {/* Gráfico TMA */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TMA - Tempo Médio de Atendimento por Produto URA</h3>
              <i className='bx bx-time-five card-icon'></i>
            </div>
            <div className="chart-container-tma">
              <TMAChart data={rawData} periodo={periodo} groupBy="produto" />
            </div>
          </div>
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
              <div className="indicator-label">Performance Geral</div>
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
              <TendenciaSemanalChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">CSAT - Satisfação do Cliente (Tickets)</h3>
              <i className='bx bx-star card-icon'></i>
            </div>
            <div className="chart-container-tickets">
              <CSATChart data={octaData?.octaRawData || []} periodo={periodo} />
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
                <VolumeProdutoURAChart data={octaData?.octaRawData || []} periodo={periodo} isTicketsTab={true} />
              </div>
            </div>

            {/* Volume por Hora (Tickets) - Card Individual Maior */}
            <div className="card card-hora">
              <div className="card-header">
                <h3 className="card-title">Volume por Hora (Tickets)</h3>
                <i className='bx bx-bar-chart-alt-2 card-icon'></i>
              </div>
            <div className="chart-container-hora">
                <VolumeHoraChart data={octaData?.octaRawData || []} periodo={periodo} />
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
              <TMAChart data={octaData?.octaRawData || []} periodo={periodo} groupBy="assunto" />
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
          <PausasSection pausasData={pausasData} periodo={periodo} />
        </div>
      )}
    </div>
  )
})

export default MetricsDashboard
