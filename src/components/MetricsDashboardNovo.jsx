import React, { memo, useState, useMemo, useEffect } from 'react'
import './MetricsDashboard.css'
import './LoadingScreen.css'
import TendenciaSemanalChart from './TendenciaSemanalChart2'
import CSATChart from './CSATChart'
import VolumeProdutoURAChart from './VolumeProdutoURAChart'
import VolumeHoraChart from './VolumeHoraChart'
import PausasChart from './PausasChart'
import TMAChart from './TMAChart'
import TMLChart from './TMLChart'
import { usePausasData } from '../hooks/usePausasData'

const MetricsDashboard = memo(({ metrics = {}, rankings = [], octaData = null, data = [], periodo = null, fullDataset = [] }) => {
  const [activeView, setActiveView] = useState('55pbx')
  
  // Hook para carregar dados específicos de pausas
  const { pausasData, isLoading: isLoadingPausas, error: pausasError } = usePausasData()
  

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
        const motivoPausa = String(row[15] || '').trim() // Coluna P
        const duracao = String(row[14] || '').trim() // Coluna O

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
      console.log('🔍 DEBUG PAUSAS - Primeiras 5 pausas:', debugPausas.slice(0, 5))
      console.log('🔍 DEBUG PAUSAS - Total de pausas:', totalPausas)
      console.log('🔍 DEBUG PAUSAS - Total segundos:', totalSegundos)
      
      // Mostrar pausas de almoço especificamente
      const pausasAlmoco = debugPausas.filter(p => 
        p.motivo.toLowerCase().includes('almoço') || 
        p.motivo.toLowerCase().includes('almoco') ||
        p.motivo.toLowerCase().includes('lunch')
      )
      console.log('🍽️ PAUSAS DE ALMOÇO:', pausasAlmoco.slice(0, 3))
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
    
    // Debug adicional: mostrar estatísticas por tipo de pausa
    if (debugPausas.length > 0) {
      const estatisticasPorMotivo = {}
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
      
      console.log('📊 ESTATÍSTICAS POR MOTIVO:', estatisticasPorMotivo)
      
      // Calcular média por tipo de pausa
      Object.keys(estatisticasPorMotivo).forEach(motivo => {
        const stats = estatisticasPorMotivo[motivo]
        const mediaSegundos = Math.round(stats.totalSegundos / stats.count)
        const mediaFormatada = formatarTempo(mediaSegundos)
        console.log(`📈 ${motivo}: ${stats.count} pausas, média ${mediaFormatada}`)
      })
    }
    
    // Contar quantidade única de atendentes que fizeram pausas
    const atendentesComPausas = new Set()
    pausasData.slice(1).forEach((row) => {
      if (Array.isArray(row) && row.length > 15) {
        const operador = String(row[0] || '').trim()
        const atividade = String(row[9] || '').trim()
        const dataInicial = String(row[10] || '').trim()
        const motivoPausa = String(row[15] || '').trim()
        const duracao = String(row[14] || '').trim()

        if (!isDateInPeriod(dataInicial)) return

        if (operador && atividade.toLowerCase() === 'em pausa' && motivoPausa && duracao) {
          atendentesComPausas.add(operador)
        }
      }
    })
    const quantidadeAtendentes = atendentesComPausas.size

    return {
      totalPausas,
      tempoTotalPausa,
      duracaoMedia,
      quantidadeAtendentes
    }
  }, [pausasData, periodo])

  return (
    <div className="container">

      {/* Navigation Tabs */}
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
          {/* Section Title */}
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className='bx bxs-phone'></i>
              <h2>Telefonia</h2>
            </div>
          </div>

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
        <div className="chart-container">
          <TendenciaSemanalChart data={chartData} periodo={periodo} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">CSAT - Satisfação do Cliente</h3>
          <i className='bx bx-star card-icon'></i>
        </div>
        <div className="chart-container">
          <CSATChart data={chartData} periodo={periodo} />
        </div>
      </div>

      {/* Volume por Produto URA - Card Individual Maior */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Volume por Produto URA</h3>
            <i className='bx bx-line-chart card-icon'></i>
          </div>
        <div className="chart-container-large">
            <VolumeProdutoURAChart data={rawData} periodo={periodo} />
          </div>
        </div>

      {/* Volume por Hora - Card Individual Maior */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Volume por Hora</h3>
          <i className='bx bx-bar-chart-alt-2 card-icon'></i>
        </div>
        <div className="chart-container-large">
          <VolumeHoraChart data={rawData} periodo={periodo} />
        </div>
      </div>

      {/* Gráficos de TMA */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">TMA - Tempo Médio de Atendimento por Produto URA</h3>
          <i className='bx bx-time-five card-icon'></i>
        </div>
        <div className="chart-container-large">
          <TMAChart data={rawData} periodo={periodo} groupBy="produto" />
        </div>
      </div>

      {/* Ranking de Operadores */}
      {rankings && rankings.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏆 Ranking de Operadores</h3>
          </div>
          <div className="card-content">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Operador</th>
                  <th>Chamadas</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {rankings.slice(0, 3).map((operator, index) => (
                  <tr key={index}>
                    <td className="position">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}º`}
                    </td>
                    <td>{operator.operator}</td>
                    <td>{operator.totalCalls || 0}</td>
                    <td>{operator.avgRatingAttendance || 0}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}

      {/* View Octadesk */}
      {activeView === 'octadesk' && (
        <div className="view active">
          <div className="section-title">
            <i className='bx bxs-message-square-detail'></i>
            <h2>Tickets</h2>
          </div>

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
            <div className="chart-container">
              <TendenciaSemanalChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">CSAT - Satisfação do Cliente (Tickets)</h3>
              <i className='bx bx-star card-icon'></i>
            </div>
            <div className="chart-container">
              <CSATChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          {/* Volume por Fila (Tickets) - Card Individual Maior */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Volume por Fila (Tickets)</h3>
                <i className='bx bx-line-chart card-icon'></i>
              </div>
            <div className="chart-container-large">
                <VolumeProdutoURAChart data={octaData?.octaRawData || []} periodo={periodo} isTicketsTab={true} />
              </div>
            </div>

          {/* Volume por Hora (Tickets) - Card Individual Maior */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Volume por Hora (Tickets)</h3>
              <i className='bx bx-bar-chart-alt-2 card-icon'></i>
            </div>
            <div className="chart-container-large">
              <VolumeHoraChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          {/* TMA de Tickets - Card Individual Maior */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TMA - Tempo Médio de Resolução por Assunto</h3>
              <i className='bx bx-time-five card-icon'></i>
            </div>
            <div className="chart-container-large">
              <TMATicketsChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          {/* Ranking de Atendentes - Tickets */}
          {octaData?.octaRankings && octaData.octaRankings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🏆 Ranking de Atendentes</h3>
              </div>
              <div className="card-content">
                <table className="rankings-table">
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Atendente</th>
                      <th>Tickets</th>
                      <th>Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {octaData.octaRankings.slice(0, 3).map((atendente, index) => (
                      <tr key={index}>
                        <td className="position">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `${index + 1}º`}
                        </td>
                        <td>{atendente.nome || atendente.operator}</td>
                        <td>{atendente.totalTickets || atendente.totalCalls || 0}</td>
                        <td>{atendente.notaMedia || atendente.avgRatingAttendance || 0}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
              <i className='bx bx-time indicator-icon'></i>
              <div className="indicator-label">Tempo Total em Pausa</div>
              <div className="indicator-value">{pausasIndicators.tempoTotalPausa}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-timer indicator-icon'></i>
              <div className="indicator-label">Duração Média por Pausa</div>
              <div className="indicator-value">{pausasIndicators.duracaoMedia}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-user indicator-icon'></i>
              <div className="indicator-label">Quantidade de Atendentes</div>
              <div className="indicator-value">{pausasIndicators.quantidadeAtendentes}</div>
            </div>
          </div>

          {/* Cards de Gráficos - Pausas */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TML - Tempo Médio Logado</h3>
              <i className='bx bx-bar-chart-alt-2 card-icon'></i>
            </div>
            <div className="chart-container">
              <TMLChart data={pausasData} periodo={periodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Motivos de Pausa</h3>
              <i className='bx bx-pie-chart-alt-2 card-icon'></i>
            </div>
            <div className="chart-container">
              <PausasChart data={pausasData} periodo={periodo} chartType="pie" />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pausas por Operador</h3>
              <i className='bx bx-user card-icon'></i>
            </div>
            <div className="chart-container">
              <PausasChart data={pausasData} periodo={periodo} chartType="operators" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default MetricsDashboard
