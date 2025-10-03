// Sistema de Cargos e Hierarquia
export const CARGO_HIERARCHY = {
  DIRETOR: 4,
  SUPERADMIN: 4,
  GESTOR: 3,
  ANALISTA: 2,
  OPERADOR: 1
}

// Hierarquia de acesso - quais cargos cada usuário pode assumir
export const CARGO_ACCESS_HIERARCHY = {
  DIRETOR: ['DIRETOR', 'GESTOR', 'ANALISTA', 'OPERADOR'],
  SUPERADMIN: ['DIRETOR', 'GESTOR', 'ANALISTA', 'OPERADOR'],
  GESTOR: ['GESTOR', 'ANALISTA', 'OPERADOR'],
  ANALISTA: ['ANALISTA', 'OPERADOR'],
  OPERADOR: ['OPERADOR']
}

export const CARGO_PERMISSIONS = {
  DIRETOR: {
    level: 4,
    name: 'Diretor',
    icon: '👑',
    color: '#8B5CF6',
    permissions: {
      canViewAllUsers: true,
      canViewManagers: true,
      canViewAnalysts: true,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: true,
      canViewAlerts: true,
      canViewMeasures: true
    }
  },
  SUPERADMIN: {
    level: 4,
    name: 'SuperAdmin',
    icon: '👑',
    color: '#8B5CF6',
    permissions: {
      canViewAllUsers: true,
      canViewManagers: true,
      canViewAnalysts: true,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: true,
      canViewAlerts: true,
      canViewMeasures: true
    }
  },
  GESTOR: {
    level: 3,
    name: 'Gestor',
    icon: '👔',
    color: '#3B82F6',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: true,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: true,
      canViewAlerts: true,
      canViewMeasures: true
    }
  },
  ANALISTA: {
    level: 2,
    name: 'Analista',
    icon: '📊',
    color: '#10B981',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: false,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: false,
      canViewAlerts: true,
      canViewMeasures: false
    }
  },
  OPERADOR: {
    level: 1,
    name: 'Operador',
    icon: '👤',
    color: '#6B7280',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: false,
      canViewOperators: false,
      canViewGeneralMetrics: false,
      canViewSystemSettings: false,
      canViewAlerts: false,
      canViewMeasures: false,
      canViewOwnData: true,
      canViewOwnPosition: true
    }
  }
}

// Função para verificar se um cargo tem permissão
export const hasPermission = (userCargo, permission) => {
  const cargoConfig = CARGO_PERMISSIONS[userCargo?.toUpperCase()]
  if (!cargoConfig) return false
  
  return cargoConfig.permissions[permission] || false
}

// Função para verificar nível hierárquico
export const hasHigherLevel = (userCargo, targetCargo) => {
  const userLevel = CARGO_PERMISSIONS[userCargo?.toUpperCase()]?.level || 0
  const targetLevel = CARGO_PERMISSIONS[targetCargo?.toUpperCase()]?.level || 0
  
  return userLevel >= targetLevel
}

// Função para obter configuração do cargo
export const getCargoConfig = (cargo) => {
  const result = CARGO_PERMISSIONS[cargo?.toUpperCase()] || CARGO_PERMISSIONS.OPERADOR
  
  // Debug apenas se cargo não encontrado
  if (!CARGO_PERMISSIONS[cargo?.toUpperCase()]) {
    console.warn('⚠️ Cargo não encontrado:', cargo, 'usando OPERADOR como padrão')
  }
  
  return result
}

// Função para verificar se pode ver dados de outro usuário
export const canViewUserData = (viewerCargo, targetCargo, viewerEmail, targetEmail) => {
  const viewerConfig = getCargoConfig(viewerCargo)
  
  // Sempre pode ver seus próprios dados
  if (viewerEmail === targetEmail) return true
  
  // Diretor/SuperAdmin pode ver todos
  if (viewerConfig.level >= 4) return true
  
  // Gestor pode ver Analistas e Operadores
  if (viewerConfig.level >= 3) {
    const targetConfig = getCargoConfig(targetCargo)
    return targetConfig.level <= 2 // Analista ou Operador
  }
  
  // Analista pode ver apenas Operadores
  if (viewerConfig.level >= 2) {
    const targetConfig = getCargoConfig(targetCargo)
    return targetConfig.level <= 1 // Apenas Operador
  }
  
  // Operador não pode ver dados de ninguém além de si mesmo
  return false
}

// Função para verificar se um usuário pode assumir um cargo específico
export const canAssumeCargo = (userCargo, targetCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  const targetCargoUpper = targetCargo?.toUpperCase()
  
  const allowedCargos = CARGO_ACCESS_HIERARCHY[userCargoUpper] || []
  return allowedCargos.includes(targetCargoUpper)
}

// Função para obter lista de cargos que um usuário pode assumir
export const getAvailableCargos = (userCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  return CARGO_ACCESS_HIERARCHY[userCargoUpper] || ['OPERADOR']
}

// Função para obter configurações dos cargos disponíveis para um usuário
export const getAvailableCargoConfigs = (userCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  
  const availableCargos = CARGO_ACCESS_HIERARCHY[userCargoUpper] || ['OPERADOR']
  
  const configs = availableCargos.map(cargo => {
    const config = getCargoConfig(cargo)
    return {
      cargo,
      ...config
    }
  })
  
  return configs
}
