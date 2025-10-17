import React, { createContext, useContext, useState, useEffect } from 'react'
import { CARGO_PERMISSIONS, getCargoConfig, canAssumeCargo, getAvailableCargoConfigs } from '../config/cargos'
import { getUserByEmail, getUserCargo, getUserName, USUARIOS_CONFIG } from '../config/usuarios'

const CargoContext = createContext()

export const useCargo = () => {
  const context = useContext(CargoContext)
  if (!context) {
    throw new Error('useCargo deve ser usado dentro de um CargoProvider')
  }
  return context
}

export const CargoProvider = ({ children }) => {
  const [selectedCargo, setSelectedCargo] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [showCargoSelection, setShowCargoSelection] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Função para fazer login automático baseado no email
  const autoLogin = (email) => {
    const user = getUserByEmail(email)
    if (user) {
      console.log('🚀 Login automático para:', user.nome, 'como', user.cargo)
      setSelectedCargo(user.cargo)
      setUserEmail(email)
      setUserInfo(user)
      setShowCargoSelection(false)
      setLastActivity(Date.now())

      // Salvar no localStorage com timestamp
      localStorage.setItem('selectedCargo', user.cargo)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('cargoTimestamp', Date.now().toString())
      localStorage.setItem('lastActivity', Date.now().toString())
      
      return true
    }
    return false
  }

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedCargo = localStorage.getItem('selectedCargo')
    const savedEmail = localStorage.getItem('userEmail')
    const savedTimestamp = localStorage.getItem('cargoTimestamp')
    const savedLastActivity = localStorage.getItem('lastActivity')
    
    // Verificar se passou 10 minutos offline
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000 // 10 minutos em millisegundos
    
    if (savedCargo && savedEmail && savedTimestamp && savedLastActivity) {
      const timeDiff = now - parseInt(savedLastActivity)
      
      if (timeDiff < tenMinutes) {
        // Ainda dentro dos 10 minutos
        setSelectedCargo(savedCargo)
        setUserEmail(savedEmail)
        setUserInfo(getUserByEmail(savedEmail))
        setLastActivity(parseInt(savedLastActivity))
        setShowCargoSelection(false)
      } else {
        // Passou de 10 minutos offline, limpar dados
        localStorage.removeItem('selectedCargo')
        localStorage.removeItem('cargoTimestamp')
        localStorage.removeItem('lastActivity')
        setShowCargoSelection(true)
      }
    } else {
      setShowCargoSelection(true)
    }
  }, [])

  // Monitorar atividade do usuário
  useEffect(() => {
    const updateActivity = () => {
      const now = Date.now()
      setLastActivity(now)
      localStorage.setItem('lastActivity', now.toString())
    }

    // Eventos que indicam atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Verificar a cada minuto se passou de 10 minutos offline
    const checkInterval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastActivity
      const tenMinutes = 10 * 60 * 1000
      
      if (timeDiff >= tenMinutes && selectedCargo) {
        // Passou de 10 minutos offline, fazer logout
        logout()
      }
    }, 60000) // Verificar a cada minuto

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(checkInterval)
    }
  }, [lastActivity, selectedCargo])

  // Detectar quando a página é fechada/recarregada
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Limpar dados ao fechar/recarregar
      localStorage.removeItem('selectedCargo')
      localStorage.removeItem('cargoTimestamp')
      localStorage.removeItem('lastActivity')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Função para selecionar cargo
  const selectCargo = (cargo, email) => {
    const user = getUserByEmail(email)
    
    if (!user) {
      console.error('Usuário não encontrado:', email)
      return false
    }

    // Verificar se o usuário pode assumir este cargo usando a hierarquia
    const userCargo = user.cargo
    if (!canAssumeCargo(userCargo, cargo)) {
      console.error('Usuário não tem permissão para assumir este cargo')
      return false
    }

    setSelectedCargo(cargo)
    setUserEmail(email)
    setUserInfo(user)
    setShowCargoSelection(false)
    setLastActivity(Date.now())

    // Salvar no localStorage com timestamp
    localStorage.setItem('selectedCargo', cargo)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('cargoTimestamp', Date.now().toString())
    localStorage.setItem('lastActivity', Date.now().toString())

    return true
  }

  // Função para logout
  const logout = () => {
    setSelectedCargo(null)
    setUserEmail(null)
    setUserInfo(null)
    setShowCargoSelection(true)
    setLastActivity(Date.now())
    
    // Limpar localStorage
    localStorage.removeItem('selectedCargo')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('cargoTimestamp')
    localStorage.removeItem('lastActivity')
  }

  // Função para verificar permissão
  const hasPermission = (permission) => {
    if (!selectedCargo) {
      // Se não há cargo selecionado mas há usuário logado, usar cargo padrão do usuário
      if (userEmail) {
        const userCargo = getUserCargo(userEmail)
        if (userCargo) {
          const cargoConfig = getCargoConfig(userCargo)
          return cargoConfig.permissions[permission] || false
        }
      }
      return false
    }
    
    const cargoConfig = getCargoConfig(selectedCargo)
    const result = cargoConfig.permissions[permission] || false
    
    return result
  }

  // Função para verificar se pode ver dados de outro usuário
  const canViewUserData = (targetEmail) => {
    if (!userEmail || !targetEmail) return false
    
    // Sempre pode ver seus próprios dados
    if (userEmail.toLowerCase() === targetEmail.toLowerCase()) return true
    
    const userCargo = getUserCargo(userEmail)
    const targetCargo = getUserCargo(targetEmail)
    
    const userConfig = getCargoConfig(userCargo)
    const targetConfig = getCargoConfig(targetCargo)
    
    // Administrador pode ver todos
    if (userConfig.level >= 4) return true
    
    // Gestão pode ver Monitor e Editor
    if (userConfig.level >= 3) {
      return targetConfig.level <= 2 // Monitor ou Editor
    }
    
    // Monitor pode ver apenas Editor
    if (userConfig.level >= 2) {
      return targetConfig.level <= 1 // Apenas Editor
    }
    
    // Editor não pode ver dados de ninguém além de si mesmo
    return false
  }

  // Função para obter cargo atual (selecionado ou padrão do usuário)
  const getCurrentCargo = () => {
    if (selectedCargo) {
      return selectedCargo
    }
    
    // Se não há cargo selecionado mas há usuário logado, usar cargo padrão do usuário
    if (userEmail) {
      return getUserCargo(userEmail)
    }
    
    return null
  }

  // Função para obter cargo config
  const getCurrentCargoConfig = () => {
    const currentCargo = getCurrentCargo()
    return getCargoConfig(currentCargo)
  }

  // Função para obter usuários que o usuário atual pode ver
  const getVisibleUsers = () => {
    if (!userEmail) return []
    
    const userCargo = getUserCargo(userEmail)
    const userConfig = getCargoConfig(userCargo)
    
    // Implementar lógica baseada no cargo
    // Por enquanto retorna todos os usuários
    return USUARIOS_CONFIG
  }

  // Função para obter cargos disponíveis para o usuário atual
  const getAvailableCargos = () => {
    if (!userEmail) {
      return []
    }
    
    const user = getUserByEmail(userEmail)
    if (!user) {
      return []
    }
    
    const availableCargos = getAvailableCargoConfigs(user.cargo)
    return availableCargos
  }

  // Função para verificar se pode assumir um cargo específico
  const canAssumeCargoCheck = (cargo) => {
    if (!userEmail) return false
    
    const user = getUserByEmail(userEmail)
    if (!user) return false
    
    return canAssumeCargo(user.cargo, cargo)
  }

  const value = {
    selectedCargo,
    userEmail,
    userInfo,
    showCargoSelection,
    lastActivity,
    selectCargo,
    autoLogin,
    logout,
    hasPermission,
    canViewUserData,
    getCurrentCargo,
    getCurrentCargoConfig,
    getVisibleUsers,
    getAvailableCargos,
    canAssumeCargoCheck,
    setShowCargoSelection
  }

  return (
    <CargoContext.Provider value={value}>
      {children}
    </CargoContext.Provider>
  )
}
