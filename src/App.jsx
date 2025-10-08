import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DataFetcher from './components/DataFetcher'
import LoginTest from './components/LoginTest'
import MetricsDashboard from './components/MetricsDashboard'
import ChartsSection from './components/ChartsSection'
import ExportSection from './components/ExportSection'
import OperatorAnalysis from './components/OperatorAnalysis'
import ProgressIndicator from './components/ProgressIndicator'
import AdvancedFilters from './components/AdvancedFilters'
import { processarDados } from './utils/dataProcessor'
import ChartsDetailedTab from './components/ChartsDetailedTab'
import AgentAnalysis from './components/AgentAnalysis'
import PreferencesManager from './components/PreferencesManager'
import CargoSelection from './components/CargoSelection'
import ProcessingLoader from './components/ProcessingLoader'
import { CargoProvider, useCargo } from './contexts/CargoContext'
import { useGoogleSheetsDirectSimple } from './hooks/useGoogleSheetsDirectSimple'
import { useDataFilters } from './hooks/useDataFilters'
import { useTheme } from './hooks/useTheme'
import './styles/App.css'

// Componente interno que usa o hook useCargo
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('fetch')
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [viewMode, setViewMode] = useState('company') // 'company' ou 'operator'
  const [showDarkList, setShowDarkList] = useState(false)
  const [showNewLogin, setShowNewLogin] = useState(false) // Para mostrar a nova tela de login
  const [showPreferences, setShowPreferences] = useState(false)
  const [expandedOperator, setExpandedOperator] = useState(null) // Para controlar qual operador está expandido
  
  // Hook do sistema de cargos - apenas para cargo selecionado
  const { 
    selectedCargo, 
    selectCargo,
    showCargoSelection,
    userInfo
  } = useCargo()
  
  // Hook para tema
  const { theme, toggleTheme } = useTheme()
  
  // Controle de ocultar nomes para operadores
  useEffect(() => {
    // Verificar se deve ocultar nomes baseado no cargo PRINCIPAL do usuário, não no cargo selecionado
    // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
    const shouldHideNames = userInfo?.cargo === 'OPERADOR'
    document.body.setAttribute('data-hide-names', shouldHideNames.toString())
    
    return () => {
      document.body.removeAttribute('data-hide-names')
    }
  }, [userInfo?.cargo])
  
  // Estados para dados e outras configurações
  // Dark List removida - todos os operadores são contabilizados normalmente
  const [filters, setFilters] = useState({})
  const [filteredData, setFilteredData] = useState([])
  const [filteredMetrics, setFilteredMetrics] = useState(null)
  const [filteredOperatorMetrics, setFilteredOperatorMetrics] = useState(null)
  const [allRecordsLoadingStarted, setAllRecordsLoadingStarted] = useState(false)
  const [filteredRankings, setFilteredRankings] = useState(null)
  
  // Hook do Google Sheets - fonte principal de autenticação e dados
  const {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    isLoading,
    signIn,
    signOut,
    isAuthenticated,
    userData,
    // Novos estados para processamento completo
    isProcessingAllRecords,
    processingProgress,
    totalRecordsToProcess,
    loadAllRecordsWithProgress
  } = useGoogleSheetsDirectSimple()

  // Reset allRecordsLoadingStarted quando o filtro muda
  useEffect(() => {
    if (filters.period !== 'allRecords') {
      setAllRecordsLoadingStarted(false)
    }
  }, [filters.period])

  // Processar dados quando filtros mudam
  useEffect(() => {
    if (data && data.length > 0) {
      // console.log('🔄 Aplicando filtros aos dados...', filters)
      
      // Se não há filtros ativos, usar dados originais
      if (!filters.period) {
        // console.log('🔍 Sem filtros ativos, usando dados originais')
        setFilteredData(data)
        setFilteredMetrics(metrics)
        setFilteredOperatorMetrics(operatorMetrics)
        setFilteredRankings(rankings)
        return
      }

      // Se o filtro for "allRecords", carregar todos os registros (apenas uma vez)
      if (filters.period === 'allRecords' && !isProcessingAllRecords && !allRecordsLoadingStarted) {
        console.log('🚀 Filtro TODOS OS REGISTROS selecionado - iniciando carregamento completo...')
        setAllRecordsLoadingStarted(true)
        
        // Obter token de acesso do localStorage
        const userData = localStorage.getItem('veloinsights_user')
        const accessToken = userData ? JSON.parse(userData).accessToken : null
        if (accessToken && loadAllRecordsWithProgress) {
          loadAllRecordsWithProgress(accessToken)
            .then((resultado) => {
              console.log('✅ Todos os registros carregados com sucesso!')
              // Os dados já são atualizados automaticamente pelo hook
            })
            .catch((error) => {
              console.error('❌ Erro ao carregar todos os registros:', error)
              setAllRecordsLoadingStarted(false) // Reset em caso de erro
            })
        } else {
          console.warn('⚠️ Token de acesso não encontrado ou função não disponível')
          setAllRecordsLoadingStarted(false) // Reset em caso de erro
        }
        return
      }
      
      // console.log('🔍 Filtro ativo:', filters.period)

      // Encontrar a última data disponível nos dados
      const ultimaDataDisponivel = data.reduce((ultima, item) => {
        if (!item.data) return ultima
        
        let itemDate
        if (typeof item.data === 'string') {
          const [dia, mes, ano] = item.data.split('/')
          itemDate = new Date(ano, mes - 1, dia)
        } else {
          itemDate = new Date(item.data)
        }
        
        return itemDate > ultima ? itemDate : ultima
      }, new Date(0))
      
      // console.log(`🔍 Última data disponível: ${ultimaDataDisponivel.toLocaleDateString('pt-BR')}`)
      
      // Aplicar filtros de data
      const now = new Date()
      let startDate, endDate

      switch (filters.period) {
        case 'last7Days':
          startDate = new Date(ultimaDataDisponivel.getTime() - (7 * 24 * 60 * 60 * 1000))
          endDate = ultimaDataDisponivel
          break
        case 'last15Days':
          startDate = new Date(ultimaDataDisponivel.getTime() - (15 * 24 * 60 * 60 * 1000))
          endDate = ultimaDataDisponivel
          break
        case 'ultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'penultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
          break
        case 'currentMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = now
          break
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            startDate = new Date(filters.customStartDate)
            endDate = new Date(filters.customEndDate)
          } else {
            setFilteredData(data)
            setFilteredMetrics(metrics)
            setFilteredOperatorMetrics(operatorMetrics)
            setFilteredRankings(rankings)
            return
          }
          break
        default:
          setFilteredData(data)
          setFilteredMetrics(metrics)
          setFilteredOperatorMetrics(operatorMetrics)
          setFilteredRankings(rankings)
          return
      }

      // Debug das datas de filtro
      console.log(`🔍 Filtro ${filters.period}:`)
      console.log(`🔍 Data início: ${startDate.toLocaleDateString('pt-BR')}`)
      console.log(`🔍 Data fim: ${endDate.toLocaleDateString('pt-BR')}`)
      console.log(`🔍 Total de dados para filtrar: ${data.length}`)
      
      // Verificar algumas datas dos dados
      if (data.length > 0) {
        // console.log('🔍 Primeiras 5 datas dos dados:')
        // data.slice(0, 5).forEach((item, index) => {
        //   console.log(`  ${index + 1}. ${item.data}`)
        // })
        
        // console.log('🔍 Últimas 5 datas dos dados:')
        // data.slice(-5).forEach((item, index) => {
        //   console.log(`  ${index + 1}. ${item.data}`)
        // })
      }
      
      // Filtrar dados por data
      const filtered = data.filter(item => {
        if (!item.data) return false
        
        // Converter data para formato correto
        let itemDate
        if (typeof item.data === 'string') {
          // Formato DD/MM/YYYY
          const [dia, mes, ano] = item.data.split('/')
          itemDate = new Date(ano, mes - 1, dia)
        } else {
          itemDate = new Date(item.data)
        }
        
        const isValid = itemDate >= startDate && itemDate <= endDate
        
        // Debug específico para último mês
        if (filters.period === 'ultimoMes' && data.indexOf(item) < 10) {
          console.log(`🔍 Item ${data.indexOf(item)}: ${item.data} -> ${itemDate.toLocaleDateString('pt-BR')} -> ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`)
        }
        
        return isValid
      })

      console.log(`📊 Dados filtrados: ${filtered.length} de ${data.length} registros`)

      // Usar dados filtrados diretamente (já são objetos processados)
      if (filtered.length > 0) {
        setFilteredData(filtered)
        
        // Recalcular métricas apenas com dados filtrados
        const totalChamadas = filtered.length
        
        console.log(`🔍 Filtro ${filters.period}: ${filtered.length} registros encontrados`)
        
        const retidaURA = filtered.filter(item => item.chamada === 'Retida na URA').length
        const atendida = filtered.filter(item => item.chamada === 'Atendida').length
        const abandonada = filtered.filter(item => item.chamada === 'Abandonada').length
        
        
        // Calcular notas médias
        const notasAtendimento = filtered
          .filter(item => item.notaAtendimento && !isNaN(parseFloat(item.notaAtendimento)))
          .map(item => parseFloat(item.notaAtendimento))
        
        const notasSolucao = filtered
          .filter(item => item.notaSolucao && !isNaN(parseFloat(item.notaSolucao)))
          .map(item => parseFloat(item.notaSolucao))
        
        const notaMediaAtendimento = notasAtendimento.length > 0 
          ? (notasAtendimento.reduce((sum, nota) => sum + nota, 0) / notasAtendimento.length).toFixed(1)
          : '0.0'
        
        const notaMediaSolucao = notasSolucao.length > 0 
          ? (notasSolucao.reduce((sum, nota) => sum + nota, 0) / notasSolucao.length).toFixed(1)
          : '0.0'
        
        // Calcular tempos médios
        const tempoParaMinutos = (tempo) => {
          if (!tempo || tempo === '00:00:00') return 0
          if (typeof tempo === 'number') return tempo
          
          try {
            const [horas, minutos, segundos] = tempo.split(':').map(Number)
            return horas * 60 + minutos + segundos / 60
          } catch (error) {
            console.warn('Erro ao converter tempo:', tempo, error)
            return 0
          }
        }
        
        const temposFalado = filtered
          .filter(item => item.tempoFalado && item.tempoFalado !== '00:00:00')
          .map(item => tempoParaMinutos(item.tempoFalado))
          .filter(tempo => tempo > 0)
        
        const temposEspera = filtered
          .filter(item => item.tempoEspera && item.tempoEspera !== '00:00:00')
          .map(item => tempoParaMinutos(item.tempoEspera))
          .filter(tempo => tempo > 0)
        
        const tempoMedioFalado = temposFalado.length > 0 
          ? (temposFalado.reduce((sum, tempo) => sum + tempo, 0) / temposFalado.length).toFixed(1)
          : '0.0'
        
        const tempoMedioEspera = temposEspera.length > 0 
          ? (temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length).toFixed(1)
          : '0.0'
        
        // Calcular chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
        const chamadasAvaliadas = filtered.filter(item => {
          const temNotaAtendimento = item.notaAtendimento && 
            !isNaN(parseFloat(item.notaAtendimento)) && 
            parseFloat(item.notaAtendimento) >= 1 && 
            parseFloat(item.notaAtendimento) <= 5
          
          const temNotaSolucao = item.notaSolucao && 
            !isNaN(parseFloat(item.notaSolucao)) && 
            parseFloat(item.notaSolucao) >= 1 && 
            parseFloat(item.notaSolucao) <= 5
          
          return temNotaAtendimento || temNotaSolucao
        }).length
        
        // Calcular métricas completas
        const metricasFiltradas = {
          totalChamadas,
          retidaURA,
          atendida,
          abandonada,
          taxaAtendimento: totalChamadas > 0 ? ((atendida / totalChamadas) * 100).toFixed(1) : '0.0',
          taxaAbandono: totalChamadas > 0 ? ((abandonada / totalChamadas) * 100).toFixed(1) : '0.0',
          notaMediaAtendimento,
          notaMediaSolucao,
          duracaoMediaAtendimento: tempoMedioFalado,
          tempoMedioEspera: tempoMedioEspera,
          chamadasAvaliadas
        }
        
        // Calcular métricas por operador
        const operadoresMap = new Map()
        filtered.forEach(item => {
          if (item.operador && item.operador !== 'Sem Operador') {
            if (!operadoresMap.has(item.operador)) {
              operadoresMap.set(item.operador, {
                operador: item.operador,
                totalChamadas: 0,
                atendidas: 0,
                retidasURA: 0,
                abandonadas: 0,
                notasAtendimento: [],
                notasSolucao: [],
                temposFalado: [],
                chamadasAvaliadas: 0
              })
            }
            
            const op = operadoresMap.get(item.operador)
            op.totalChamadas++
            
            if (item.chamada === 'Atendida') op.atendidas++
            else if (item.chamada === 'Retida na URA') op.retidasURA++
            else if (item.chamada === 'Abandonada') op.abandonadas++
            
            if (item.notaAtendimento && !isNaN(parseFloat(item.notaAtendimento))) {
              op.notasAtendimento.push(parseFloat(item.notaAtendimento))
            }
            if (item.notaSolucao && !isNaN(parseFloat(item.notaSolucao))) {
              op.notasSolucao.push(parseFloat(item.notaSolucao))
            }
            if (item.tempoFalado && item.tempoFalado !== '00:00:00') {
              const tempoEmMinutos = tempoParaMinutos(item.tempoFalado)
              if (tempoEmMinutos > 0) {
                op.temposFalado.push(tempoEmMinutos)
              }
            }
            
            // Contar chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
            const temNotaAtendimento = item.notaAtendimento && 
              !isNaN(parseFloat(item.notaAtendimento)) && 
              parseFloat(item.notaAtendimento) >= 1 && 
              parseFloat(item.notaAtendimento) <= 5
            
            const temNotaSolucao = item.notaSolucao && 
              !isNaN(parseFloat(item.notaSolucao)) && 
              parseFloat(item.notaSolucao) >= 1 && 
              parseFloat(item.notaSolucao) <= 5
            
            if (temNotaAtendimento || temNotaSolucao) {
              op.chamadasAvaliadas++
            }
          }
        })
        
        // Processar métricas dos operadores
        const metricasOperadoresFiltradas = {}
        operadoresMap.forEach((op, nome) => {
          metricasOperadoresFiltradas[nome] = {
            totalChamadas: op.totalChamadas,
            atendidas: op.atendidas,
            retidasURA: op.retidasURA,
            abandonadas: op.abandonadas,
            taxaAtendimento: op.totalChamadas > 0 ? ((op.atendidas / op.totalChamadas) * 100).toFixed(1) : '0.0',
            notaMediaAtendimento: op.notasAtendimento.length > 0 
              ? (op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length).toFixed(1)
              : '0.0',
            notaMediaSolucao: op.notasSolucao.length > 0 
              ? (op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length).toFixed(1)
              : '0.0',
            tempoMedioFalado: op.temposFalado.length > 0 
              ? (op.temposFalado.reduce((sum, tempo) => sum + tempo, 0) / op.temposFalado.length).toFixed(1)
              : '0.0',
            chamadasAvaliadas: op.chamadasAvaliadas
          }
        })
        
        // Criar ranking dos operadores
        const rankingFiltrado = Object.entries(metricasOperadoresFiltradas)
          .map(([nome, metrica]) => ({
            operator: nome, // Campo esperado pelo MetricsDashboard
            operador: nome, // Campo alternativo
            score: (parseFloat(metrica.notaMediaAtendimento) + parseFloat(metrica.notaMediaSolucao)).toFixed(1), // Score simples baseado nas notas
            totalCalls: metrica.totalChamadas, // Campo esperado pelo MetricsDashboard
            totalAtendimentos: metrica.totalChamadas, // Campo alternativo
            avgDuration: parseFloat(metrica.tempoMedioFalado), // Campo esperado pelo MetricsDashboard
            avgRatingAttendance: parseFloat(metrica.notaMediaAtendimento), // Campo esperado pelo MetricsDashboard
            avgRatingSolution: parseFloat(metrica.notaMediaSolucao), // Campo esperado pelo MetricsDashboard
            // Campos originais para compatibilidade
            totalChamadas: metrica.totalChamadas,
            tempoMedioFalado: metrica.tempoMedioFalado,
            notaMediaAtendimento: metrica.notaMediaAtendimento,
            notaMediaSolucao: metrica.notaMediaSolucao,
            taxaAtendimento: metrica.taxaAtendimento,
            chamadasAvaliadas: metrica.chamadasAvaliadas
          }))
          .sort((a, b) => b.totalCalls - a.totalCalls)
          .slice(0, 10) // Top 10
        
        
        setFilteredMetrics(metricasFiltradas)
        setFilteredOperatorMetrics(metricasOperadoresFiltradas)
        setFilteredRankings(rankingFiltrado)
      } else {
        setFilteredData([])
        // Criar métricas zeradas quando não há dados filtrados
        const metricasZeradas = {
          totalChamadas: 0,
          retidaURA: 0,
          atendida: 0,
          abandonada: 0,
          taxaAtendimento: '0.0',
          taxaAbandono: '0.0',
          notaMediaAtendimento: '0.0',
          notaMediaSolucao: '0.0',
          duracaoMediaAtendimento: '0.0',
          tempoMedioEspera: '0.0',
          chamadasAvaliadas: 0
        }
        setFilteredMetrics(metricasZeradas)
        setFilteredOperatorMetrics({})
        setFilteredRankings([])
      }
    }
  }, [data, filters, metrics, operatorMetrics, rankings, isProcessingAllRecords, allRecordsLoadingStarted])

  // Reset do estado de carregamento quando o filtro mudar
  useEffect(() => {
    if (filters.period !== 'allRecords') {
      setAllRecordsLoadingStarted(false)
    }
  }, [filters.period])

  // Autenticação: navegar automaticamente para dashboard quando logado
  useEffect(() => {
    if (isAuthenticated && currentView === 'fetch') {
      console.log('🎯 Usuário autenticado, navegando automaticamente para dashboard...')
      setCurrentView('dashboard')
    }
  }, [isAuthenticated, currentView])

  // Debug do dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      // console.log('📊 Dashboard estado - data:', data?.length, 'isLoading:', isLoading, 'metrics:', !!metrics, 'operatorMetrics:', !!operatorMetrics)
    }
  }, [currentView, data, isLoading, metrics, operatorMetrics])


  // Função para lidar com cargo selecionado
  const handleCargoSelected = (cargo) => {
    if (userData?.email) {
      const success = selectCargo(cargo, userData.email)
      if (success) {
        console.log('🎯 Cargo selecionado:', cargo)
      } else {
        console.error('❌ Erro ao selecionar cargo')
      }
    } else {
      console.error('❌ Email do usuário não disponível')
    }
  }

  // Função para alternar sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Função para alternar notas detalhadas do operador
  const handleToggleNotes = (operatorName) => {
    if (expandedOperator === operatorName) {
      setExpandedOperator(null) // Fechar se já estiver aberto
    } else {
      setExpandedOperator(operatorName) // Abrir para este operador
    }
  }

  // Função para mudar visualização
  const handleViewChange = (view) => {
    setCurrentView(view)
    if (view === 'agents') {
      setSelectedOperator(null)
    }
  }

  // Função para selecionar operador
  const handleOperatorSelect = (op) => {
    setSelectedOperator(op)
  }

  // Funções da Dark List removidas - todos os operadores são contabilizados normalmente

  return (
    <div className="app">
      <Header 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <div className="app-content">
        <Sidebar 
          open={sidebarOpen}
          currentView={currentView}
          onViewChange={handleViewChange}
          hasData={data && data.length > 0}
          onClearData={() => {}}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedOperator={selectedOperator}
          onOperatorSelect={handleOperatorSelect}
          operatorMetrics={operatorMetrics}
          onShowPreferences={() => setShowPreferences(true)}
          onClose={() => setSidebarOpen(false)}
          selectedCargo={selectedCargo}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isLoading && (
            <ProgressIndicator 
              progress={{ current: 50, total: 100, message: 'Carregando dados...' }}
              onCancel={() => {}}
            />
          )}

          {/* Tela de carregamento para TODOS OS REGISTROS */}
          <ProcessingLoader 
            isVisible={isProcessingAllRecords}
            progress={processingProgress}
            currentRecord={Math.round((processingProgress / 100) * totalRecordsToProcess)}
            totalRecords={totalRecordsToProcess}
          />
          
          {(currentView === 'fetch' || showNewLogin) && (
            <LoginTest
              onContinue={() => {
                console.log('🚀 Continuando para dashboard...')
                setShowNewLogin(false)
                setCurrentView('dashboard')
              }}
              onSignIn={signIn}
              isLoading={isLoading}
              isLoggedIn={isAuthenticated} // Usar o estado real de autenticação
            />
          )}
          
          {currentView === 'dashboard' && (
            <>
              {!isLoading && data && data.length > 0 ? (
                <>
                  <AdvancedFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    operatorMetrics={operatorMetrics}
                    data={data}
                    pauseData={data}
                  />
                  
                  <div className="dark-list-controls">
                    <button 
                      className="btn btn-dark-list"
                      onClick={() => setShowDarkList(true)}
                      title="Gerenciar Dark List de operadores"
                    >
                      Gerenciar Operadores
                    </button>
                  </div>
                  
                  <MetricsDashboard 
                    metrics={filteredMetrics && Object.keys(filteredMetrics).length > 0 ? filteredMetrics : metrics}
                    operatorMetrics={filteredOperatorMetrics && Object.keys(filteredOperatorMetrics).length > 0 ? filteredOperatorMetrics : operatorMetrics}
                    rankings={(() => {
                      // Para o período "allRecords", sempre usar rankings originais
                      if (filters.period === 'allRecords') {
                        return rankings
                      }
                      
                      // Para outros períodos, usar filteredRankings se disponível
                      return filteredRankings && filteredRankings.length > 0 ? filteredRankings : rankings
                    })()}
                    filteredData={filteredData.length > 0 ? filteredData : data}
                    data={filteredData.length > 0 ? filteredData : data}
                    periodo={(() => {
                      // Se não há filtro selecionado, retornar null para ocultar o ranking
                      if (!filters.period) {
                        return null
                      }
                      
                      // Se há filtros ativos, sempre usar filteredData (mesmo que vazio)
                      const currentData = filteredData
                      
                      
                      if (!currentData || currentData.length === 0) {
                        return {
                          startDate: null,
                          endDate: null,
                          totalDays: 0,
                          totalRecords: 0,
                          periodLabel: 'Nenhum dado disponível'
                        }
                      }
                      
                      // Verificar se os dados são objetos ou arrays
                      const firstItem = currentData[0]
                      const isObject = typeof firstItem === 'object' && !Array.isArray(firstItem)
                      
                      let datas = []
                      
                      if (isObject) {
                        // Dados são objetos - acessar propriedade 'data'
                        datas = currentData.map(d => d.data).filter(d => d && d.trim() !== '')
                      } else {
                        // Dados são arrays - acessar índice 3
                        datas = currentData.map(d => d[3]).filter(d => d && d.trim() !== '')
                      }
                      
                      if (datas.length === 0) {
                        return {
                          startDate: null,
                          endDate: null,
                          totalDays: 0,
                          totalRecords: currentData.length,
                          periodLabel: 'Datas não disponíveis'
                        }
                      }
                      
                      // Ordenar datas para encontrar início e fim
                      const datasUnicas = [...new Set(datas)].sort((a, b) => {
                        // Converter para Date para ordenação correta
                        const dateA = new Date(a.split('/').reverse().join('-'))
                        const dateB = new Date(b.split('/').reverse().join('-'))
                        return dateA - dateB
                      })
                      const startDate = datasUnicas[0]
                      const endDate = datasUnicas[datasUnicas.length - 1]
                      
                      
                      return {
                        startDate,
                        endDate,
                        totalDays: datasUnicas.length,
                        totalRecords: currentData.length,
                        periodLabel: `${startDate} a ${endDate}`
                      }
                    })()}
                    onToggleNotes={handleToggleNotes}
                    userData={userData}
                  />
                  
                  {/* Modal de Notas Detalhadas */}
                  {expandedOperator && (
                    <div className="notes-modal-overlay" onClick={() => setExpandedOperator(null)}>
                      <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notes-modal-header">
                          <h3>📋 Notas Detalhadas - {expandedOperator}</h3>
                          <button 
                            className="close-modal-btn"
                            onClick={() => setExpandedOperator(null)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="notes-modal-content">
                          {(() => {
                            // Coletar todas as notas do operador no período atual
                            const currentData = filteredData.length > 0 ? filteredData : data
                            
                            const operatorNotes = currentData.filter(item => {
                              const isOperator = item.operador === expandedOperator
                              const hasNotes = (item.notaAtendimento && item.notaAtendimento > 0) || 
                                             (item.notaSolucao && item.notaSolucao > 0)
                              return isOperator && hasNotes
                            })
                            
                            if (operatorNotes.length === 0) {
                              return (
                                <div>
                                  <p>Nenhuma nota encontrada para este operador no período selecionado.</p>
                                </div>
                              )
                            }
                            
                            return (
                              <div className="notes-list">
                                <div className="notes-summary">
                                  <p><strong>Total de avaliações:</strong> {operatorNotes.length}</p>
                                  <p><strong>Período:</strong> {filters.period || 'Todos os registros'}</p>
                                </div>
                                <div className="notes-grid">
                                  {operatorNotes.map((note, index) => {
                                    // Função para determinar o emoji baseado na nota
                                    const getNoteEmoji = (nota) => {
                                      if (nota >= 4) return '🟢' // Notas 4 e 5
                                      if (nota === 3) return '🟡' // Nota 3
                                      return '🔴' // Notas 1 e 2
                                    }
                                    
                                    return (
                                      <div key={index} className="note-card">
                                        <div className="note-date">{note.data}</div>
                                        <div className="note-scores">
                                          {note.notaAtendimento && (
                                            <div className="note-score">
                                              <span className="score-label">Atendimento:</span>
                                              <span className="score-value">
                                                {getNoteEmoji(note.notaAtendimento)} {note.notaAtendimento}/5
                                              </span>
                                            </div>
                                          )}
                                          {note.notaSolucao && (
                                            <div className="note-score">
                                              <span className="score-label">Solução:</span>
                                              <span className="score-value">
                                                {getNoteEmoji(note.notaSolucao)} {note.notaSolucao}/5
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <ExportSection 
                    data={filteredData.length > 0 ? filteredData : data}
                    metrics={filteredMetrics || metrics}
                    operatorMetrics={filteredOperatorMetrics || operatorMetrics}
                    rankings={filteredRankings || rankings}
                  />
                </>
              ) : isLoading ? (
                <div className="loading-container">
                  <h2>🔄 Carregando dados da planilha...</h2>
                  <p>Por favor, aguarde enquanto os dados são processados.</p>
                  <div className="loading-spinner">⏳</div>
                </div>
              ) : (
                <div className="error-container">
                  <h2>❌ Erro ao carregar dados</h2>
                  <p>Não foi possível carregar os dados da planilha.</p>
                  {errors && errors.length > 0 && (
                    <div className="error-details">
                      <p>Detalhes do erro:</p>
                      <ul>
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Tentar Novamente
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* Aba Gráficos Detalhados */}
          {currentView === 'charts' && data && data.length > 0 && (
            <ChartsDetailedTab 
              data={filteredData.length > 0 ? filteredData : data}
              operatorMetrics={filteredOperatorMetrics || operatorMetrics}
              rankings={filteredRankings || rankings}
              selectedPeriod={null}
              isLoading={isLoading}
              pauseData={filteredData.length > 0 ? filteredData : data}
              userData={userData}
              filters={filters}
              originalData={data}
              onFiltersChange={setFilters}
            />
          )}
          
          {/* Aba Visualizar por Agente */}
          {currentView === 'agents' && data && data.length > 0 && (
            <AgentAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              rankings={rankings}
            />
          )}
          
          {currentView === 'operators' && data && data.length > 0 && (
            <OperatorAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              selectedOperator={selectedOperator}
            />
          )}
          
          {errors.length > 0 && (
            <div className="error-container">
              <h3>Erros encontrados:</h3>
              <details>
                <summary>Mostrar erros ({errors.length})</summary>
                <ul>
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && <li>... e mais {errors.length - 10} erros</li>}
                </ul>
              </details>
            </div>
          )}
        </main>
      </div>
      
      {/* Dark List Manager removido - todos os operadores são contabilizados normalmente */}

      {/* Preferences Manager */}
      <PreferencesManager
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Cargo Selection */}
      {showCargoSelection && userData?.email && (
        <CargoSelection
          userEmail={userData.email}
          onCargoSelected={handleCargoSelected}
        />
      )}
      
    </div>
  )
}

// Componente principal que envolve tudo com o CargoProvider
function App() {
  return (
    <CargoProvider>
      <AppContent />
    </CargoProvider>
  )
}

export default App