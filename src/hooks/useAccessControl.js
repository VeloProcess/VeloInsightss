import { useState, useEffect } from 'react'

export const useAccessControl = () => {
  const [userRole, setUserRole] = useState('OPERADOR')
  const [permissions, setPermissions] = useState({
    canViewAllData: false,
    canEditData: false,
    canDeleteData: false,
    canViewReports: true,
    canExportData: false
  })

  useEffect(() => {
    // Simular verificação de permissões baseada no cargo
    const checkPermissions = () => {
      const role = localStorage.getItem('userRole') || 'OPERADOR'
      setUserRole(role)
      
      switch (role) {
        case 'SUPERADMIN':
          setPermissions({
            canViewAllData: true,
            canEditData: true,
            canDeleteData: true,
            canViewReports: true,
            canExportData: true
          })
          break
        case 'GESTOR':
          setPermissions({
            canViewAllData: true,
            canEditData: true,
            canDeleteData: false,
            canViewReports: true,
            canExportData: true
          })
          break
        case 'ANALISTA':
          setPermissions({
            canViewAllData: true,
            canEditData: false,
            canDeleteData: false,
            canViewReports: true,
            canExportData: true
          })
          break
        default: // OPERADOR
          setPermissions({
            canViewAllData: false,
            canEditData: false,
            canDeleteData: false,
            canViewReports: true,
            canExportData: false
          })
      }
    }

    checkPermissions()
  }, [])

  return {
    userRole,
    permissions,
    isAdmin: userRole === 'SUPERADMIN',
    isManager: userRole === 'GESTOR',
    isAnalyst: userRole === 'ANALISTA',
    isOperator: userRole === 'OPERADOR'
  }
}
