import { useCargo } from '../contexts/CargoContext'
import { getUserByEmail, getUserCargo, USUARIOS_CONFIG } from '../config/usuarios'
import { getCargoConfig } from '../config/cargos'

// Hook personalizado para controle de acesso
export const useAccessControl = () => {
  const { 
    selectedCargo, 
    userEmail, 
    hasPermission, 
    canViewUserData,
    getCurrentCargoConfig 
  } = useCargo()

  // Função para obter o nome do operador baseado no email do usuário
  const getOperatorNameFromEmail = (email) => {
    const user = USUARIOS_CONFIG.find(u => u.email.toLowerCase() === email.toLowerCase())
    return user ? user.nome : null
  }

  // Verificar se pode ver dados de um operador específico
  const canViewOperatorData = (operatorEmail) => {
    if (!userEmail || !operatorEmail) return false
    
    // Sempre pode ver seus próprios dados
    if (userEmail.toLowerCase() === operatorEmail.toLowerCase()) return true
    
    // Usar a função do contexto
    return canViewUserData(operatorEmail)
  }

  // Verificar se pode ver métricas gerais
  const canViewGeneralMetrics = () => {
    return hasPermission('canViewGeneralMetrics')
  }

  // Verificar se pode ver configurações do sistema
  const canViewSystemSettings = () => {
    return hasPermission('canViewSystemSettings')
  }

  // Verificar se pode ver avisos
  const canViewAlerts = () => {
    return hasPermission('canViewAlerts')
  }

  // Verificar se pode ver medidas
  const canViewMeasures = () => {
    return hasPermission('canViewMeasures')
  }

  // Obter dados filtrados baseado no cargo
  const getFilteredData = (data) => {
    if (!data || !userEmail) return []
    
    const cargoConfig = getCurrentCargoConfig()
    
    // Operador só vê seus próprios dados
    if (cargoConfig.level === 1) {
      const operatorName = getOperatorNameFromEmail(userEmail)
      
      return data.filter(record => {
        // Comparar por campo operador (nome na planilha)
        const recordOperator = record.operador || record.chamada
        return operatorName && recordOperator && recordOperator.toLowerCase().includes(operatorName.toLowerCase())
      })
    }
    
    // Outros cargos podem ver dados baseado nas permissões
    return data
  }

  // Obter operadores visíveis baseado no cargo
  const getVisibleOperators = (operators) => {
    if (!operators || !userEmail) return []
    
    const cargoConfig = getCurrentCargoConfig()
    
    // Operador só vê seus próprios dados
    if (cargoConfig.level === 1) {
      const operatorName = getOperatorNameFromEmail(userEmail)
      console.log('🔍 Debug getVisibleOperators:', {
        userEmail,
        operatorName,
        operatorsCount: operators.length,
        operatorsSample: operators.slice(0, 3).map(op => op.operator)
      })
      
      return operators.filter(op => {
        // Comparar por nome do operador (não por email)
        return operatorName && op.operator && op.operator.toLowerCase().includes(operatorName.toLowerCase())
      })
    }
    
    // Outros cargos podem ver operadores baseado nas permissões
    return operators
  }

  // Verificar se pode acessar uma view específica
  const canAccessView = (viewName) => {
    const cargoConfig = getCurrentCargoConfig()
    
    switch (viewName) {
      case 'dashboard':
        return true // Todos podem acessar o dashboard
      case 'agents':
        return cargoConfig.level >= 1 // Todos podem ver análise de agentes
      case 'charts':
        return cargoConfig.level >= 1 // Todos podem ver gráficos
      case 'export':
        return cargoConfig.level >= 2 // Analista ou superior
      case 'settings':
        return cargoConfig.level >= 3 // Gestor ou superior
      default:
        return true
    }
  }

  // Obter informações do usuário atual
  const getCurrentUserInfo = () => {
    if (!userEmail) return null
    
    const user = getUserByEmail(userEmail)
    const cargoConfig = getCurrentCargoConfig()
    
    return {
      email: userEmail,
      nome: user?.nome || 'Usuário',
      cargo: selectedCargo,
      cargoConfig,
      level: cargoConfig.level
    }
  }

  return {
    selectedCargo,
    userEmail,
    canViewOperatorData,
    canViewGeneralMetrics,
    canViewSystemSettings,
    canViewAlerts,
    canViewMeasures,
    getFilteredData,
    getVisibleOperators,
    canAccessView,
    getCurrentUserInfo,
    getOperatorNameFromEmail,
    hasPermission
  }
}
