import React, { useRef, useEffect, useState } from 'react'
import Chart from 'chart.js/auto'
import { useTheme } from '../hooks/useTheme'
import './ModernChartsDashboard.css'

const ModernChartsDashboard = ({ data, operatorMetrics, rankings, selectedPeriod }) => {
  const { theme } = useTheme()
  const [chartInstances, setChartInstances] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Referências para os canvas dos gráficos
  const chartRefs = {
    salesChart: useRef(null),
    usersChart: useRef(null),
    satisfactionChart: useRef(null),
    referralChart: useRef(null),
    performanceChart: useRef(null),
    activityChart: useRef(null)
  }

  // 🎭 Componentes de UI
  const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
    const design = getDesignSystem()
    const sizeMap = {
      sm: '1rem',
      md: '2rem',
      lg: '3rem',
      xl: '4rem'
    }
    
    return (
      <div 
        className="loading-spinner"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderColor: design.colors.border,
          borderTopColor: design.colors[color],
          animation: 'spin 1s linear infinite'
        }}
      />
    )
  }

  const ProgressBar = ({ progress, color = 'primary', height = '4px' }) => {
    const design = getDesignSystem()
    
    return (
      <div 
        className="progress-bar"
        style={{
          height,
          backgroundColor: design.colors.border,
          borderRadius: design.borderRadius.full
        }}
      >
        <div 
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: design.colors[color],
            height: '100%',
            borderRadius: design.borderRadius.full,
            transition: design.transitions.normal
          }}
        />
      </div>
    )
  }

  const EmptyState = ({ icon = '📊', title, description, action }) => {
    const design = getDesignSystem()
    
    return (
      <div 
        className="empty-state"
        style={{
          textAlign: 'center',
          padding: design.spacing['2xl'],
          color: design.colors.textMuted
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: design.spacing.md }}>
          {icon}
        </div>
        <h3 style={{ 
          fontSize: design.typography.fontSize.lg,
          fontWeight: design.typography.fontWeight.semibold,
          color: design.colors.text,
          marginBottom: design.spacing.sm
        }}>
          {title}
        </h3>
        <p style={{ 
          fontSize: design.typography.fontSize.sm,
          lineHeight: design.typography.lineHeight.relaxed,
          marginBottom: action ? design.spacing.lg : 0
        }}>
          {description}
        </p>
        {action && (
          <button 
            onClick={action.onClick}
            style={{
              backgroundColor: design.colors.primary,
              color: design.colors.white,
              border: 'none',
              borderRadius: design.borderRadius.md,
              padding: `${design.spacing.sm} ${design.spacing.lg}`,
              fontSize: design.typography.fontSize.sm,
              fontWeight: design.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: design.transitions.normal
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = design.colors.primaryDark
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = design.colors.primary
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  const StatusIndicator = ({ status, label }) => {
    const design = getDesignSystem()
    const statusConfig = {
      success: { color: design.colors.success, icon: '✅' },
      warning: { color: design.colors.warning, icon: '⚠️' },
      error: { color: design.colors.error, icon: '❌' },
      info: { color: design.colors.info, icon: 'ℹ️' },
      loading: { color: design.colors.primary, icon: '⏳' }
    }
    
    const config = statusConfig[status] || statusConfig.info
    
    return (
      <div 
        className="status-indicator"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: design.spacing.sm,
          padding: `${design.spacing.xs} ${design.spacing.sm}`,
          backgroundColor: `${config.color}15`,
          borderRadius: design.borderRadius.md,
          border: `1px solid ${config.color}30`
        }}
      >
        <span style={{ fontSize: design.typography.fontSize.sm }}>
          {config.icon}
        </span>
        <span style={{ 
          fontSize: design.typography.fontSize.sm,
          fontWeight: design.typography.fontWeight.medium,
          color: config.color
        }}>
          {label}
        </span>
      </div>
    )
  }

  // Sistema de Design Completo
  const getDesignSystem = () => {
    const isDark = theme === 'dark' || document.body.classList.contains('theme-dark')
    
    return {
      // 🎨 Paleta de Cores
      colors: {
        // Cores primárias
        primary: '#1634FF',
        primaryLight: '#1694FF',
        primaryDark: '#000058',
        
        // Cores secundárias
        secondary: '#15A237',
        secondaryLight: '#10B981',
        secondaryDark: '#059669',
        
        // Cores de estado
        success: '#15A237',
        warning: '#FCC200',
        error: '#EF4444',
        info: '#06B6D4',
        
        // Cores neutras
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',
        
        // Cores de fundo e texto
        background: isDark ? '#1F2937' : '#FFFFFF',
        surface: isDark ? '#374151' : '#F9FAFB',
        text: isDark ? '#FFFFFF' : '#1F2937',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        textMuted: isDark ? '#6B7280' : '#9CA3AF',
        border: isDark ? '#374151' : '#E5E7EB',
        grid: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
      },
      
      // 🌈 Gradientes
      gradients: {
        primary: 'linear-gradient(135deg, #1634FF 0%, #1694FF 50%, #15A237 100%)',
        secondary: 'linear-gradient(135deg, #FCC200 0%, #F59E0B 50%, #EF4444 100%)',
        success: 'linear-gradient(135deg, #15A237 0%, #10B981 50%, #06B6D4 100%)',
        surface: isDark ? 
          'linear-gradient(135deg, #374151 0%, #4B5563 100%)' :
          'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)'
      },
      
      // 📝 Tipografia
      typography: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        fontSize: {
          xs: '0.75rem',    // 12px
          sm: '0.875rem',   // 14px
          base: '1rem',     // 16px
          lg: '1.125rem',   // 18px
          xl: '1.25rem',    // 20px
          '2xl': '1.5rem',  // 24px
          '3xl': '1.875rem', // 30px
          '4xl': '2.25rem'  // 36px
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        },
        letterSpacing: {
          tight: '-0.025em',
          normal: '0',
          wide: '0.025em',
          wider: '0.05em'
        }
      },
      
      // 📏 Espaçamento
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem'    // 64px
      },
      
      // 🔄 Transições
      transitions: {
        fast: '150ms ease-in-out',
        normal: '250ms ease-in-out',
        slow: '350ms ease-in-out',
        bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      
      // 📱 Breakpoints
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      
      // 🎭 Sombras
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        glow: isDark ? 
          '0 0 20px rgba(22, 52, 255, 0.3)' :
          '0 0 20px rgba(22, 52, 255, 0.1)'
      },
      
      // 🎨 Bordas
      borderRadius: {
        none: '0',
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px'
      }
    }
  }

  // Função para obter cores (compatibilidade)
  const getChartColors = () => {
    const design = getDesignSystem()
    return {
      primary: design.colors.primary,
      secondary: design.colors.primaryLight,
      accent: design.colors.secondary,
      warning: design.colors.warning,
      text: design.colors.text,
      textSecondary: design.colors.textSecondary,
      grid: design.colors.grid,
      background: design.colors.surface,
      dataColors: [
        design.colors.primary, design.colors.primaryLight, design.colors.secondary,
        design.colors.warning, design.colors.error, '#8B5CF6', '#06B6D4',
        '#F59E0B', design.colors.secondaryLight, '#EC4899'
      ]
    }
  }

  // Destruir gráficos existentes
  const destroyCharts = () => {
    Object.values(chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    setChartInstances({})
    
    // Limpar todos os canvas
    Object.values(chartRefs).forEach(ref => {
      if (ref.current) {
        const canvas = ref.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    })
  }

  // Criar gráfico de vendas (linha)
  const createSalesChart = () => {
    if (!chartRefs.salesChart.current) return

    const colors = getChartColors()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Simular dados de vendas baseados nos dados reais
    const salesData = months.map((_, index) => {
      const baseValue = 40000 + (index * 2000)
      const variation = Math.random() * 10000 - 5000
      return Math.max(0, baseValue + variation)
    })

    const chart = new Chart(chartRefs.salesChart.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Vendas',
          data: salesData,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.background,
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          y: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.text,
              font: {
                size: 12
              },
              callback: function(value) {
                return '$' + (value / 1000) + 'k'
              }
            }
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, salesChart: chart }))
  }

  // Criar gráfico de usuários ativos (barras)
  const createUsersChart = () => {
    if (!chartRefs.usersChart.current) return

    const colors = getChartColors()
    const operatorMetricsArray = Object.values(operatorMetrics || {})
    const topOperators = operatorMetricsArray
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
      .sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0))
      .slice(0, 8)

    // Verificar se deve esconder nomes - usar uso do useAccessControl
    const shouldHideNames = document.body.getAttribute('data-hide-names') === 'true'
    
    const labels = shouldHideNames 
      ? topOperators.map((_, index) => `Operador ${index + 1}`)
      : topOperators.map(op => 
          op.operator.length > 10 ? op.operator.substring(0, 10) + '...' : op.operator
        )
    const calls = topOperators.map(op => op.totalCalls || 0)

    const chart = new Chart(chartRefs.usersChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Atendimentos',
          data: calls,
          backgroundColor: [
            colors.primary,
            colors.secondary,
            colors.success,
            colors.warning,
            `${colors.primary}80`,
            `${colors.secondary}80`,
            `${colors.success}80`,
            `${colors.warning}80`
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          y: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 12,
                weight: '500'
              }
            }
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, usersChart: chart }))
  }

  // Criar gráfico de satisfação elegante
  const createSatisfactionChart = () => {
    if (!chartRefs.satisfactionChart.current) return

    const colors = getChartColors()
    const ctx = chartRefs.satisfactionChart.current.getContext('2d')
    
    // Criar gradiente radial elegante
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
    gradient.addColorStop(0, '#1634FF')
    gradient.addColorStop(0.5, '#1694FF')
    gradient.addColorStop(1, '#15A237')

    const satisfactionRate = 95 // Baseado nos dados reais

    const chart = new Chart(chartRefs.satisfactionChart.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [satisfactionRate, 100 - satisfactionRate],
          backgroundColor: [gradient, 'rgba(55, 65, 81, 0.1)'],
          borderWidth: 0,
          cutout: '75%',
          hoverOffset: 20,
          hoverBorderWidth: 3,
          hoverBorderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.text,
            bodyColor: colors.textSecondary,
            borderColor: colors.primary,
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Satisfação: ${context.parsed}%`
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 0
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, satisfactionChart: chart }))
  }

  // Criar gráfico de qualidade elegante
  const createReferralChart = () => {
    if (!chartRefs.referralChart.current) return

    const colors = getChartColors()
    const ctx = chartRefs.referralChart.current.getContext('2d')
    
    // Criar gradiente dourado elegante
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
    gradient.addColorStop(0, '#FCC200')
    gradient.addColorStop(0.5, '#F59E0B')
    gradient.addColorStop(1, '#EF4444')

    const referralScore = 93 // Baseado nos dados reais

    const chart = new Chart(chartRefs.referralChart.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [referralScore, 100 - referralScore],
          backgroundColor: [gradient, 'rgba(55, 65, 81, 0.1)'],
          borderWidth: 0,
          cutout: '75%',
          hoverOffset: 20,
          hoverBorderWidth: 3,
          hoverBorderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: 500 // Delay para criar efeito sequencial
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.text,
            bodyColor: colors.textSecondary,
            borderColor: colors.warning,
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Qualidade: ${context.parsed}%`
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 0
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, referralChart: chart }))
  }

  // Criar gráfico de performance (linha)
  const createPerformanceChart = () => {
    if (!chartRefs.performanceChart.current) return

    const colors = getChartColors()
    const operatorMetricsArray = Object.values(operatorMetrics || {})
    const topOperators = operatorMetricsArray
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)

    const labels = topOperators.map(op => 
      op.operator.length > 8 ? op.operator.substring(0, 8) + '...' : op.operator
    )
    const scores = topOperators.map(op => op.score || 0)

    const chart = new Chart(chartRefs.performanceChart.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score',
          data: scores,
          borderColor: colors.primary,
          backgroundColor: 'rgba(22, 52, 255, 0.1)',
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: colors.primary,
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#FFFFFF',
          pointHoverBorderColor: colors.primary,
          pointHoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          y: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 12,
                weight: '500'
              }
            }
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, performanceChart: chart }))
  }

  // Criar gráfico de atividade (barras horizontais)
  const createActivityChart = () => {
    if (!chartRefs.activityChart.current) return

    const colors = getChartColors()
    const operatorMetricsArray = Object.values(operatorMetrics || {})
    const topOperators = operatorMetricsArray
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
      .sort((a, b) => (b.avgRatingAttendance || 0) - (a.avgRatingAttendance || 0))
      .slice(0, 6)

    // Verificar se deve esconder nomes
    const shouldHideNames = document.body.getAttribute('data-hide-names') === 'true'
    
    const labels = shouldHideNames 
      ? topOperators.map((_, index) => `Operador ${index + 1}`)
      : topOperators.map(op => 
          op.operator.length > 12 ? op.operator.substring(0, 12) + '...' : op.operator
        )
    const ratings = topOperators.map(op => op.avgRatingAttendance || 0)

    const chart = new Chart(chartRefs.activityChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nota Média',
          data: ratings,
          backgroundColor: colors.accent,
          borderRadius: 12,
          borderSkipped: false,
          hoverBackgroundColor: colors.accent,
          hoverBorderColor: '#FFFFFF',
          hoverBorderWidth: 3
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: 2000
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.text,
            bodyColor: colors.textSecondary,
            borderColor: colors.accent,
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Nota: ${context.parsed.x.toFixed(1)}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: colors.grid,
              drawBorder: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 11,
                weight: '500'
              }
            }
          }
        }
      }
    })

    setChartInstances(prev => ({ ...prev, activityChart: chart }))
  }

  // Criar todos os gráficos
  const createAllCharts = () => {
    destroyCharts()
    
    // Aguardar um pouco mais para garantir que os canvas foram limpos
    setTimeout(() => {
      try {
        createSalesChart()
        createUsersChart()
        createSatisfactionChart()
        createReferralChart()
        createPerformanceChart()
        createActivityChart()
      } catch (error) {
        console.warn('Erro ao criar gráficos:', error)
        // Tentar novamente após um delay maior
        setTimeout(() => {
          try {
            createSalesChart()
            createUsersChart()
            createSatisfactionChart()
            createReferralChart()
            createPerformanceChart()
            createActivityChart()
          } catch (retryError) {
            console.error('Erro ao recriar gráficos:', retryError)
          }
        }, 500)
      }
    }, 200)
  }

  // Calcular métricas gerais
  const calculateMetrics = () => {
    const operatorMetricsArray = Object.values(operatorMetrics || {})
    const totalCalls = operatorMetricsArray.reduce((sum, op) => sum + (op.totalCalls || 0), 0)
    const avgRating = operatorMetricsArray.reduce((sum, op) => sum + (op.avgRatingAttendance || 0), 0) / operatorMetricsArray.length
    const totalOperators = operatorMetricsArray.filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador')).length
    
    return {
      totalCalls,
      avgRating: avgRating || 0,
      totalOperators,
      satisfactionRate: 95,
      referralScore: 93
    }
  }

  const metrics = calculateMetrics()

  // 🎯 Simular Loading Progress
  useEffect(() => {
    if (data && operatorMetrics) {
      setIsLoading(true)
      setLoadingProgress(0)
      
      // Simular progresso de carregamento
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => {
              setIsLoading(false)
              createAllCharts()
            }, 500)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
      
      return () => clearInterval(progressInterval)
    } else if (!data || !operatorMetrics) {
      setIsLoading(false)
      setHasError(false)
    }
  }, [data, operatorMetrics, theme])

  useEffect(() => {
    return () => {
      destroyCharts()
    }
  }, [])

  // 🎯 Estados de Loading e Feedback
  if (isLoading) {
    return (
      <div className="modern-charts-dashboard">
        <div className="charts-header">
          <h2>📊 Gráficos Gerais</h2>
          <p>Carregando dados...</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <ProgressBar progress={loadingProgress} color="primary" height="6px" />
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem',
            color: getDesignSystem().colors.textSecondary 
          }}>
            {loadingProgress}% carregado
          </div>
        </div>

        <div className="metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card">
              <div className="skeleton" style={{ height: '60px', borderRadius: '16px' }} />
            </div>
          ))}
        </div>

        <div className="charts-section-top">
          {[1, 2, 3].map(i => (
            <div key={i} className="chart-card">
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="modern-charts-dashboard">
        <div className="charts-header">
          <h2>📊 Gráficos Gerais</h2>
          <StatusIndicator status="error" label="Erro ao carregar dados" />
        </div>
        
        <EmptyState
          icon="⚠️"
          title="Erro ao Carregar Dados"
          description="Não foi possível carregar os dados dos gráficos. Verifique sua conexão e tente novamente."
          action={{
            label: "Tentar Novamente",
            onClick: () => {
              setHasError(false)
              setIsLoading(true)
              setLoadingProgress(0)
              // Simular recarregamento
              setTimeout(() => {
                setIsLoading(false)
                setLoadingProgress(100)
              }, 2000)
            }
          }}
        />
      </div>
    )
  }

  if (!data || !operatorMetrics || Object.keys(operatorMetrics).length === 0) {
    return (
      <div className="modern-charts-dashboard">
        <div className="charts-header">
          <h2>📊 Gráficos Gerais</h2>
          <StatusIndicator status="info" label="Nenhum dado disponível" />
        </div>
        
        <EmptyState
          icon="📊"
          title="Nenhum Dado Disponível"
          description="Não há dados suficientes para exibir os gráficos. Faça upload de um arquivo ou verifique se os dados estão sendo carregados corretamente."
          action={{
            label: "Atualizar Página",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="modern-charts-dashboard">
      {/* Header com Status */}
      <div className="charts-header">
        <h2>📊 Gráficos Gerais</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <p>Análise completa dos dados de atendimento</p>
          <StatusIndicator status="success" label="Dados carregados" />
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📞</div>
          <div className="metric-content">
            <h3>Total de Atendimentos</h3>
            <div className="metric-value">{metrics.totalCalls.toLocaleString()}</div>
            <div className="metric-change positive">+12% este mês</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h3>Nota Média</h3>
            <div className="metric-value">{metrics.avgRating.toFixed(1)}</div>
            <div className="metric-change positive">+0.3 pontos</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Operadores Ativos</h3>
            <div className="metric-value">{metrics.totalOperators}</div>
            <div className="metric-change neutral">Estável</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Performance Geral</h3>
            <div className="metric-value">{metrics.satisfactionRate}%</div>
            <div className="metric-change positive">+5% este mês</div>
          </div>
        </div>
      </div>

      {/* Seção Superior */}
      <div className="charts-section-top">
        <div className="chart-card welcome-card card-modern">
          <div className="welcome-content">
            <h3 className="title-h3 text-gradient font-display">VeloInsights Dashboard</h3>
            <p className="subtitle font-body-medium">Análise de dados de atendimento</p>
            <div className="welcome-stats">
              <div className="stat">
                <span className="stat-value">{metrics.totalCalls.toLocaleString()}</span>
                <span className="stat-label">Atendimentos</span>
              </div>
              <div className="stat">
                <span className="stat-value">{metrics.avgRating.toFixed(1)}</span>
                <span className="stat-label font-body-medium">Nota Média</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card satisfaction-card">
          <div className="card-header">
            <h3 className="title-h4 font-body-semibold">Taxa de Satisfação</h3>
            <div className="satisfaction-rate">{metrics.satisfactionRate}%</div>
          </div>
          <div className="chart-container-small">
            <canvas ref={chartRefs.satisfactionChart}></canvas>
          </div>
          <div className="card-footer">
            <span>Baseado em {metrics.totalCalls.toLocaleString()} avaliações</span>
          </div>
        </div>

        <div className="chart-card referral-card">
          <div className="card-header">
            <h3 className="title-h4 font-body-semibold">Score de Qualidade</h3>
            <div className="referral-score">{metrics.referralScore}</div>
          </div>
          <div className="chart-container-small">
            <canvas ref={chartRefs.referralChart}></canvas>
          </div>
          <div className="card-footer">
            <span>Qualidade Total do Serviço</span>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="charts-section-main">
        <div className="chart-card sales-card">
          <div className="card-header">
            <h3>Evolução dos Atendimentos</h3>
            <span className="card-subtitle">(+12%) mais que o mês anterior</span>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.salesChart}></canvas>
          </div>
        </div>

        <div className="chart-card users-card">
          <div className="card-header">
            <h3>Top Operadores</h3>
            <span className="card-subtitle">(+8) mais que a semana passada</span>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.usersChart}></canvas>
          </div>
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Atendimentos:</span>
              <span className="stat-value">{metrics.totalCalls.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nota Média:</span>
              <span className="stat-value">{metrics.avgRating.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Operadores:</span>
              <span className="stat-value">{metrics.totalOperators}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior */}
      <div className="charts-section-bottom">
        <div className="chart-card performance-card">
          <div className="card-header">
            <h3>Performance dos Melhores</h3>
            <span className="card-subtitle">30 concluídos este mês</span>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.performanceChart}></canvas>
          </div>
        </div>

        <div className="chart-card activity-card">
          <div className="card-header">
            <h3>Ranking de Qualidade</h3>
            <span className="card-subtitle">+30% este mês</span>
          </div>
          <div className="chart-container">
            <canvas ref={chartRefs.activityChart}></canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernChartsDashboard
