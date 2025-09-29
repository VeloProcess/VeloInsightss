import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import UploadArea from './components/UploadArea'
import MetricsDashboard from './components/MetricsDashboard'
import ChartsSection from './components/ChartsSection'
import ExportSection from './components/ExportSection'
import OperatorAnalysis from './components/OperatorAnalysis'
import ProgressIndicator from './components/ProgressIndicator'
import AdvancedFilters from './components/AdvancedFilters'
import DarkListManager from './components/DarkListManager'
import { useDataProcessing } from './hooks/useDataProcessing'
import { useDataFilters } from './hooks/useDataFilters'
import { useTheme } from './hooks/useTheme'
import './styles/App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 100, message: '' })
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [viewMode, setViewMode] = useState('company') // 'company' ou 'operator'
  const [showDarkList, setShowDarkList] = useState(false)
  
  // Sistema de temas
  const { theme, toggleTheme } = useTheme()
  
  const {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    darkList,
    operators,
    updateDarkList,
    extractOperators,
    processFile,
    clearData
  } = useDataProcessing()

  const {
    filters,
    filteredData,
    handleFiltersChange
  } = useDataFilters(data)

  const handleFileUpload = async (file) => {
    setIsProcessing(true)
    setProgress({ current: 0, total: 100, message: 'Iniciando processamento...' })
    
    try {
      await processFile(file, (progressData) => {
        setProgress(progressData)
      })
      setCurrentView('dashboard')
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      alert(`Erro ao processar arquivo: ${error.message}`)
      setCurrentView('upload') // Voltar para upload em caso de erro
    } finally {
      setIsProcessing(false)
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
    setCurrentView('upload')
    setSelectedOperator(null)
    setViewMode('company')
  }

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator || null)
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
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isProcessing && (
            <ProgressIndicator 
              progress={progress}
              onCancel={() => setIsProcessing(false)}
            />
          )}
          
          {currentView === 'upload' && (
            <UploadArea 
              onFileUpload={handleFileUpload}
              disabled={isProcessing}
            />
          )}
          
          {currentView === 'dashboard' && data && data.length > 0 && (
            <>
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                operatorMetrics={operatorMetrics}
                data={data}
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
              />
              <ChartsSection 
                data={data}
                operatorMetrics={operatorMetrics}
              />
              <ExportSection 
                data={data}
                metrics={metrics}
                operatorMetrics={operatorMetrics}
              />
            </>
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
      <DarkListManager
        operators={operators}
        darkList={darkList}
        onDarkListChange={updateDarkList}
        isVisible={showDarkList}
        onToggle={() => setShowDarkList(!showDarkList)}
      />
    </div>
  )
}

export default App
