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
import PeriodSelector from './components/PeriodSelector'
import AdvancedFilters from './components/AdvancedFilters'
import DarkListManager from './components/DarkListManager'
import ChartsDetailedTab from './components/ChartsDetailedTab'
import AgentAnalysis from './components/AgentAnalysis'
import PreferencesManager from './components/PreferencesManager'
import { useGoogleSheetsDirectSimple } from './hooks/useGoogleSheetsDirectSimple'
import { useDataFilters } from './hooks/useDataFilters'
import { useTheme } from './hooks/useTheme'
import './styles/App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('fetch')
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [viewMode, setViewMode] = useState('company') // 'company' ou 'operator'
  const [showDarkList, setShowDarkList] = useState(false)
  const [showNewLogin, setShowNewLogin] = useState(false) // Para mostrar a nova tela de login
  const [showPreferences, setShowPreferences] = useState(false)
  
  
  // Sistema de temas
  const { theme, toggleTheme } = useTheme()
  

  // Hook do Google Sheets
  const {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    isAuthenticated,
    userData,
    selectedPeriod,
    customDateRange,
    fetchSheetData,
    fetchFullDataset,
    processPeriodData,
    fetchDataByPeriod,
    filterDataByDateRange,
    setSelectedPeriod,
    setCustomDateRange,
    signIn,
    signOut,
    clearData,
    // Dark List functions
    darkList,
    addToDarkList,
    removeFromDarkList,
    clearDarkList
  } = useGoogleSheetsDirectSimple()

  const {
    filters,
    filteredData,
    handleFiltersChange
  } = useDataFilters(data)

  // Mostrar nova tela de login apenas se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated && currentView === 'fetch') {
      setShowNewLogin(true)
    }
  }, [isAuthenticated, currentView])

  // Navegar automaticamente para o dashboard quando autenticado
  useEffect(() => {
    if (isAuthenticated && userData && !showNewLogin) {
      console.log('🎯 Usuário autenticado, navegando para dashboard...')
      setCurrentView('dashboard')
      
      // Se não há dados, tentar carregar
      if (data.length === 0) {
        console.log('📊 Carregando dados automaticamente...')
        handleFetchData()
      }
    }
  }, [isAuthenticated, userData, showNewLogin])

  const handleFetchData = async () => {
    try {
      if (!isAuthenticated || !userData) {
        console.error('❌ Usuário não autenticado!')
        return
      }
      
      console.log('🔄 Iniciando carregamento do dataset completo...')
      
      // Carregar dataset completo da planilha
      await fetchFullDataset(userData.accessToken)
      
      // Aguardar um pouco para o estado ser atualizado
      setTimeout(() => {
        console.log('📊 Dados após busca:', data.length)
        if (data && data.length > 0) {
          console.log('✅ Navegando para dashboard...')
          setCurrentView('dashboard')
        } else {
          console.log('⚠️ Nenhum dado encontrado')
        }
      }, 1000)
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    }
  }

  const handleSignIn = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error("Erro ao fazer login:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setCurrentView('fetch')
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }


  // Funções para controle de período
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
  }

  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange)
  }

  const handlePeriodSelect = async (startDate, endDate) => {
    try {
      console.log(`🔄 Processando dados do período: ${startDate} até ${endDate}`)
      await processPeriodData(startDate, endDate)
    } catch (error) {
      console.error('❌ Erro ao processar período:', error)
    }
  }

  const handleFetchFullData = async () => {
    try {
      if (!isAuthenticated || !userData) {
        console.error('❌ Usuário não autenticado!')
        return
      }
      
      console.log('🔄 Carregando dados completos...')
      await fetchDataByPeriod('full')
      
    } catch (error) {
      console.error("Erro ao carregar dados completos:", error)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
    setSidebarOpen(false)
    
    // Resetar seleção de operador ao mudar de view
    if (view !== 'operators') {
      setSelectedOperator(null)
    }
  }

  const handleClearData = () => {
    clearData()
    setCurrentView('fetch')
    setSelectedOperator(null)
    setViewMode('company')
  }

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator || null)
  }

  const updateDarkList = (newDarkList) => {
    setDarkList(newDarkList)
  }


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
          onClearData={handleClearData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedOperator={selectedOperator}
          onOperatorSelect={handleOperatorSelect}
          operatorMetrics={operatorMetrics}
          onShowPreferences={() => setShowPreferences(true)}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isLoading && (
            <ProgressIndicator 
              progress={{ current: 50, total: 100, message: 'Carregando dados...' }}
              onCancel={() => {}}
            />
          )}
          
          {(currentView === 'fetch' || showNewLogin) && (
            <LoginTest
              onContinue={() => setShowNewLogin(false)}
              onSignIn={signIn}
              isLoading={isLoading}
            />
          )}
          
          {currentView === 'dashboard' && (
            <>
              {data && data.length > 0 ? (
                <>
                  
                  {/* Conteúdo da Aba Dashboard Principal */}
                  {currentView === 'dashboard' && (
                    <>
                      <PeriodSelector
                        onPeriodSelect={handlePeriodSelect}
                        isLoading={isLoading}
                        selectedPeriod={selectedPeriod}
                      />
                      
                      <AdvancedFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        operatorMetrics={operatorMetrics}
                        data={data}
                        pauseData={data}
                      />
                      
                      {/* Botão para gerenciar Dark List */}
                      <div className="dark-list-controls">
                        <button 
                          className="btn btn-dark-list"
                          onClick={() => setShowDarkList(true)}
                          title="Gerenciar Dark List de operadores"
                        >
                          🎯 Gerenciar Dark List ({darkList.length} excluídos)
                        </button>
                      </div>
                      
                      <MetricsDashboard 
                        metrics={metrics}
                        operatorMetrics={operatorMetrics}
                        rankings={rankings}
                        filteredData={filteredData}
                        darkList={darkList}
                        addToDarkList={addToDarkList}
                        removeFromDarkList={removeFromDarkList}
                      />
                    </>
                  )}
                  
                  {/* Export Section disponível em todas as abas */}
                  <ExportSection 
                    data={data}
                    metrics={metrics}
                    operatorMetrics={operatorMetrics}
                    rankings={rankings}
                  />
                </>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#F3F7FC',
                  backgroundColor: '#272A30',
                  borderRadius: '12px',
                  margin: '20px'
                }}>
                  <h2>📊 Carregando dados da planilha...</h2>
                  <p>Por favor, aguarde enquanto os dados são processados.</p>
                  {isLoading && <div className="loading-spinner">⏳</div>}
                </div>
              )}
            </>
          )}
          
          {/* Aba Gráficos Detalhados */}
          {currentView === 'charts' && data && data.length > 0 && (
            <ChartsDetailedTab 
              data={data}
              operatorMetrics={operatorMetrics}
              rankings={rankings}
              selectedPeriod={selectedPeriod}
              isLoading={isLoading}
              pauseData={data}
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
            <div className="error-summary">
              <h3>⚠️ Erros encontrados durante o processamento:</h3>
              <p>Total de erros: {errors.length}</p>
              <details>
                <summary>Ver detalhes dos erros</summary>
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
      
      {/* Dark List Manager */}
      {showDarkList && (
        <DarkListManager
          operators={operators}
          darkList={darkList}
          onDarkListChange={updateDarkList}
          isVisible={showDarkList}
          onToggle={() => setShowDarkList(!showDarkList)}
        />
      )}

      {/* Preferences Manager */}
      <PreferencesManager
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  )
}

export default App
