import { useState, useEffect } from 'react'

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    autoRefresh: false,
    refreshInterval: 30000, // 30 segundos
    defaultPeriod: 'last15Days',
    showAdvancedMetrics: false,
    compactMode: false
  })

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Erro ao carregar preferências:', error)
      }
    }
  }, [])

  // Salvar preferências no localStorage
  const updatePreferences = (newPreferences) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
    localStorage.setItem('userPreferences', JSON.stringify(updated))
  }

  // Resetar preferências para padrão
  const resetPreferences = () => {
    const defaultPrefs = {
      theme: 'light',
      language: 'pt-BR',
      notifications: true,
      autoRefresh: false,
      refreshInterval: 30000,
      defaultPeriod: 'last15Days',
      showAdvancedMetrics: false,
      compactMode: false
    }
    setPreferences(defaultPrefs)
    localStorage.setItem('userPreferences', JSON.stringify(defaultPrefs))
  }

  return {
    preferences,
    updatePreferences,
    resetPreferences
  }
}
