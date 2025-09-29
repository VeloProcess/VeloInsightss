import React, { Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'

/**
 * Wrapper para lazy loading de componentes
 * Mostra loading enquanto o componente carrega
 */
const LazyWrapper = ({ 
  children, 
  fallback = null, 
  loadingMessage = 'Carregando componente...',
  showSpinner = true 
}) => {
  const defaultFallback = showSpinner ? (
    <LoadingSpinner 
      size="medium" 
      message={loadingMessage}
      type="skeleton"
    />
  ) : fallback

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * Componente para lazy loading de gráficos
 * Otimizado para componentes Chart.js
 */
export const LazyChart = ({ 
  children, 
  height = 400,
  loadingMessage = 'Carregando gráfico...'
}) => {
  return (
    <LazyWrapper 
      fallback={
        <div 
          className="chart-loading-placeholder"
          style={{ height: `${height}px` }}
        >
          <LoadingSpinner 
            size="large" 
            message={loadingMessage}
            type="pulse"
          />
        </div>
      }
      loadingMessage={loadingMessage}
    >
      {children}
    </LazyWrapper>
  )
}

/**
 * Componente para lazy loading de tabelas grandes
 */
export const LazyTable = ({ 
  children, 
  rowCount = 10,
  loadingMessage = 'Carregando dados...'
}) => {
  return (
    <LazyWrapper 
      fallback={
        <div className="table-loading-placeholder">
          <LoadingSpinner 
            size="medium" 
            message={loadingMessage}
            type="skeleton"
          />
          <div className="skeleton-table">
            {Array.from({ length: rowCount }).map((_, index) => (
              <div key={index} className="skeleton-row">
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
              </div>
            ))}
          </div>
        </div>
      }
      loadingMessage={loadingMessage}
    >
      {children}
    </LazyWrapper>
  )
}

export default LazyWrapper
