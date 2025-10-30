import React, { useMemo } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const PausasChart = ({ data = [], periodo = null, chartType = 'bar' }) => {
  // Processar dados de TML e TMP
  const processedData = useMemo(() => {
    return processTMLTMPData(data, periodo)
  }, [data, periodo])

  // Renderizar apenas o gráfico solicitado
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderTMLTMPChart(processedData)
      case 'pie':
        return renderPieChart(processedData)
      case 'operators':
        return renderOperatorsChart(processedData)
      default:
        return renderTMLTMPChart(processedData)
    }
  }

  return (
    <div className="pausas-chart-container">
      {renderChart()}
    </div>
  )
}

// Renderizar gráfico de barras
const renderTMLTMPChart = (processedData) => {
  // Verificar se há dados para exibir
  if (!processedData.dias || processedData.dias.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Nenhum dado disponível para exibir o gráfico TML & TMP</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Verifique se há dados de pausas agrupados por mês
        </p>
      </div>
    )
  }

  // Função para converter minutos para formato HH:MM:SS
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00'
    
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const barChartData = {
    labels: processedData.dias,
    datasets: [
      {
        label: 'Tempo Logado (TML)',
        data: processedData.dias.map(dia => processedData.tempoLogadoPorDia[dia] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Tempo Pausado (TMP)',
        data: processedData.dias.map(dia => processedData.tempoPausadoPorDia[dia] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 20,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 16,
          boxHeight: 16,
          color: '#1f2937'
        }
      },
      datalabels: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return `📅 ${context[0].label}`
          },
          label: function(context) {
            const time = formatMinutesToTime(context.parsed.y)
            const label = context.dataset.label
            return `${label}: ${time}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 18,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 18,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 15,
          callback: function(value) {
            return formatMinutesToTime(value)
          }
        }
      }
    }
  }

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Bar data={barChartData} options={barOptions} />
    </div>
  )
}

// Renderizar gráfico de barras verticais para motivos de pausa
const renderPieChart = (processedData) => {
  // Verificar se os dados necessários existem
  if (!processedData.motivos || !Array.isArray(processedData.motivos) || !processedData.pausasPorMotivo) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Nenhum dado de motivos de pausa disponível</p>
      </div>
    )
  }

  // Calcular total para porcentagem
  const totalPausas = processedData.motivos.reduce((total, motivo) => 
    total + (processedData.pausasPorMotivo[motivo] || 0), 0
  )

  const barChartData = {
    labels: processedData.motivos,
    datasets: [
      {
        label: 'Quantidade',
        data: processedData.motivos.map(motivo => processedData.pausasPorMotivo[motivo] || 0),
        backgroundColor: [
          'rgba(99, 102, 241, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(236, 72, 153, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(249, 115, 22, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(20, 184, 166, 0.9)'
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.4)'
        ],
        borderWidth: 2.5,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Barras verticais
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const motivo = context.label
            const quantidade = context.parsed.y
            const percentage = ((quantidade / totalPausas) * 100).toFixed(1)
            return `${motivo}: ${quantidade} pausas (${percentage}%)`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 20,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 20,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#1f2937',
          callback: function(value) {
            return value + ' pausas'
          }
        }
      }
    }
  }

  return <Bar data={barChartData} options={barOptions} />
}

// Renderizar gráfico de operadores melhorado - agora mostra totais por mês
const renderOperatorsChart = (processedData) => {
  // Usar dados por mês (já processados)
  if (!processedData.dias || processedData.dias.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>📊 Nenhum dado disponível</p>
        <p style={{ fontSize: '14px', color: '#999' }}>Verifique se há dados de pausas no período selecionado</p>
      </div>
    )
  }

  // Função para converter minutos para formato HH:MM:SS
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00'
    const totalMinutes = Math.floor(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const secs = Math.floor((minutes % 1) * 60)
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Preparar dados por mês
  const mesesArray = processedData.dias.map(mes => {
    const tempoPausado = processedData.tempoPausadoPorDia[mes] || 0
    const tempoLogado = processedData.tempoLogadoPorDia[mes] || 0
    const tempoTotal = tempoPausado + tempoLogado
    const percentualPausa = tempoTotal > 0 ? (tempoPausado / tempoTotal) * 100 : 0
    
    return {
      mes,
      tempoPausado,
      tempoLogado,
      tempoTotal,
      percentualPausa
    }
  }).filter(item => item.tempoTotal > 0)

  if (mesesArray.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>📊 Nenhum dado disponível</p>
        <p style={{ fontSize: '14px', color: '#999' }}>Nenhum mês com dados de pausas no período selecionado</p>
      </div>
    )
  }

  // Preparar dados do gráfico por mês
  const operatorsData = {
    labels: mesesArray.map(item => item.mes),
    datasets: [
      {
        label: '⏸️ Tempo em Pausa (TMP)',
        data: mesesArray.map(item => item.tempoPausado),
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2.5,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: '✅ Tempo Online (TML)',
        data: mesesArray.map(item => item.tempoLogado),
        backgroundColor: 'rgba(34, 197, 94, 0.85)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2.5,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  }

  const operatorsOptions = {
    indexAxis: 'x', // Gráfico vertical (barras verticais)
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 20
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 16,
            family: "'Inter', sans-serif",
            weight: '700'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12,
          color: '#1f2937'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex
            return `📅 ${mesesArray[index].mes}`
          },
          label: function(context) {
            const index = context.dataIndex
            const datasetIndex = context.datasetIndex
            const item = mesesArray[index]
            
            if (datasetIndex === 0) {
              // TMP
              const percentual = item.percentualPausa.toFixed(1)
              return [
                `⏸️ Tempo em Pausa: ${formatMinutesToTime(context.parsed.y)}`,
                `📊 ${percentual}% do tempo total`
              ]
            } else {
              // TML
              const percentual = (100 - item.percentualPausa).toFixed(1)
              return [
                `✅ Tempo Online: ${formatMinutesToTime(context.parsed.y)}`,
                `📊 ${percentual}% do tempo total`
              ]
            }
          },
          footer: function(tooltipItems) {
            if (tooltipItems.length === 2) {
              const index = tooltipItems[0].dataIndex
              const item = mesesArray[index]
              return `📈 Tempo Total: ${formatMinutesToTime(item.tempoTotal)}`
            }
            return ''
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          display: false
        },
        ticks: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        stacked: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 10,
          callback: function(value) {
            return formatMinutesToTime(value)
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative' }}>
      <Bar data={operatorsData} options={operatorsOptions} />
      {/* Legenda adicional com estatísticas */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <div>
            <strong style={{ color: '#1f2937' }}>📅 Total de Meses:</strong> {mesesArray.length}
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>⏸️ Média de Pausa por Mês:</strong> {
              formatMinutesToTime(
                mesesArray.reduce((sum, item) => sum + item.tempoPausado, 0) / mesesArray.length
              )
            }
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>✅ Média Online por Mês:</strong> {
              formatMinutesToTime(
                mesesArray.reduce((sum, item) => sum + item.tempoLogado, 0) / mesesArray.length
              )
            }
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>📈 Tempo Total Geral:</strong> {
              formatMinutesToTime(
                mesesArray.reduce((sum, item) => sum + item.tempoTotal, 0)
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// Processar dados de pausas
const processTMLTMPData = (data, periodo) => {
  if (!data || data.length === 0) {
    return {
      dias: [],
      tempoLogadoPorDia: {},
      tempoPausadoPorDia: {},
      tempoMedioLogado: 0,
      tempoMedioPausado: 0,
      totalDias: 0
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (dataInicial) => {
    if (!periodo) return true
    
    try {
      const rowDate = parseBrazilianDate(dataInicial)
      if (!rowDate) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return rowDate >= startDate && rowDate <= endDate
    } catch (error) {
      return true
    }
  }

  // Função para verificar se uma célula contém erro
  const temErro = (valor) => {
    if (!valor) return false
    const valorStr = String(valor).trim()
    return valorStr.includes('#DIV/0!') || valorStr.includes('#ERROR!') || valorStr.includes('#')
  }

  // Função para converter duração (formato HH:MM:SS) para minutos
  const duracaoParaMinutos = (duracao) => {
    if (!duracao) return 0
    
    // Filtrar erros do Google Sheets
    const duracaoStr = String(duracao).trim()
    if (temErro(duracaoStr)) {
      return 0 // Linha descartada - erro na planilha
    }
    
    const partes = duracaoStr.split(':')
    if (partes.length === 3) {
      const horas = parseInt(partes[0]) || 0
      const minutos = parseInt(partes[1]) || 0
      const segundos = parseInt(partes[2]) || 0
      return horas * 60 + minutos + (segundos / 60)
    }
    
    return parseFloat(duracaoStr) || 0
  }

  // Função para obter chave do mês
  const getMesKey = (dataInicial) => {
    try {
      const date = parseBrazilianDate(dataInicial)
      if (!date) return 'Data inválida'
      
      const mes = date.getMonth() + 1
      const ano = date.getFullYear()
      return `${mes}/${ano}`
    } catch (error) {
      return 'Data inválida'
    }
  }

  const tempoLogadoPorMes = {}
  const tempoPausadoPorMes = {}
  const mesesSet = new Set()

  // Se os dados são objetos (estrutura de pausas processadas)
  if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
    data.forEach((pausa) => {
      if (pausa.dataInicial && pausa.duracao) {
        // Verificar se a data está dentro do período selecionado
        if (!isDateInPeriod(pausa.dataInicial)) {
          return
        }

        const mesKey = getMesKey(pausa.dataInicial)
        mesesSet.add(mesKey)
        
        const duracaoMinutos = duracaoParaMinutos(pausa.duracao)

        // Se é uma pausa, adiciona ao tempo pausado
        tempoPausadoPorMes[mesKey] = (tempoPausadoPorMes[mesKey] || 0) + duracaoMinutos
        
        // Para tempo logado, vamos assumir que há tempo logado baseado na jornada
        // Vamos calcular um tempo logado estimado (8 horas por dia menos pausas)
        const jornadaMinutos = 8 * 60 // 8 horas em minutos
        const tempoLogadoEstimado = jornadaMinutos - (tempoPausadoPorMes[mesKey] || 0)
        tempoLogadoPorMes[mesKey] = Math.max(0, tempoLogadoEstimado)
      }
    })
  } else {
    // Nova estrutura (array de arrays) - aba resumo
    // Coluna A=Data, B=Operador, C=Tempo em Pausa (TMP), D=Tempo Online (TML)
    let dataStartIndex = 1 // Começar da linha 2 (índice 1), assumindo linha 1 é cabeçalho
    let linhasDescartadas = 0
    
    // Verificar se primeira linha é cabeçalho
    if (data.length > 0 && Array.isArray(data[0])) {
      const primeiraLinha = data[0]
      const primeiroCampo = String(primeiraLinha[0] || '').trim().toLowerCase()
      if (primeiroCampo === 'data' || primeiroCampo.includes('data')) {
        dataStartIndex = 1 // Pular cabeçalho
      } else {
        dataStartIndex = 0 // Não há cabeçalho
      }
    }

    // Processar dados a partir do índice encontrado
    data.slice(dataStartIndex).forEach((row) => {
      if (!Array.isArray(row) || row.length < 4) {
        linhasDescartadas++ // Linha descartada - estrutura inválida
        return
      }

      // Nova estrutura: A=Data, B=Operador, C=Tempo Online (TML), D=Tempo em Pausa (TMP)
      const dataStr = String(row[0] || '').trim() // Coluna A - Data
      const operador = String(row[1] || '').trim() // Coluna B - Operador
      const tempoOnline = String(row[2] || '').trim() // Coluna C - Tempo Online (TML)
      const tempoPausa = String(row[3] || '').trim() // Coluna D - Tempo em Pausa (TMP)

      // Filtrar linhas com erros ou vazias
      if (!dataStr || !operador || temErro(dataStr) || temErro(operador) || temErro(tempoPausa) || temErro(tempoOnline)) {
        linhasDescartadas++ // Linha descartada - erro ou vazio
        return
      }

      // Verificar se a data está dentro do período selecionado
      if (!isDateInPeriod(dataStr)) {
        return
      }

      const mesKey = getMesKey(dataStr)
      mesesSet.add(mesKey)

      // Converter tempos para minutos
      const tmlMinutos = duracaoParaMinutos(tempoOnline) // Coluna C - Tempo Online (TML)
      const tmpMinutos = duracaoParaMinutos(tempoPausa) // Coluna D - Tempo em Pausa (TMP)

      // Somar os tempos por mês
      tempoPausadoPorMes[mesKey] = (tempoPausadoPorMes[mesKey] || 0) + tmpMinutos
      tempoLogadoPorMes[mesKey] = (tempoLogadoPorMes[mesKey] || 0) + tmlMinutos
    })

    // Log de linhas descartadas (conforme regras de qualidade)
    if (linhasDescartadas > 0) {
      console.log(`[PausasChart] ${linhasDescartadas} linha(s) descartada(s) devido a erros ou valores inválidos`)
    }
  }

  const meses = Array.from(mesesSet).sort()
  const totalMeses = meses.length

  // Calcular médias
  const tempoTotalLogado = Object.values(tempoLogadoPorMes).reduce((sum, time) => sum + time, 0)
  const tempoTotalPausado = Object.values(tempoPausadoPorMes).reduce((sum, time) => sum + time, 0)
  
  const tempoMedioLogado = totalMeses > 0 ? tempoTotalLogado / totalMeses : 0
  const tempoMedioPausado = totalMeses > 0 ? tempoTotalPausado / totalMeses : 0

  return {
    dias: meses, // Mantendo o nome 'dias' para compatibilidade com o componente
    tempoLogadoPorDia: tempoLogadoPorMes, // Mantendo o nome para compatibilidade
    tempoPausadoPorDia: tempoPausadoPorMes, // Mantendo o nome para compatibilidade
    tempoMedioLogado,
    tempoMedioPausado,
    totalDias: totalMeses // Mantendo o nome para compatibilidade
  }
}

// Processar dados por operador para o gráfico
const processDadosPorOperador = (data, periodo) => {
  if (!data || data.length === 0) {
    return {}
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (dataInicial) => {
    if (!periodo) return true
    
    try {
      const rowDate = parseBrazilianDate(dataInicial)
      if (!rowDate) return true
      
      const startDate = new Date(periodo.startDate)
      const endDate = new Date(periodo.endDate)
      
      return rowDate >= startDate && rowDate <= endDate
    } catch (error) {
      return true
    }
  }

  // Função para verificar se uma célula contém erro
  const temErro = (valor) => {
    if (!valor) return false
    const valorStr = String(valor).trim()
    return valorStr.includes('#DIV/0!') || valorStr.includes('#ERROR!') || valorStr.includes('#')
  }

  // Função para converter duração (formato HH:MM:SS) para minutos
  const duracaoParaMinutos = (duracao) => {
    if (!duracao) return 0
    
    const duracaoStr = String(duracao).trim()
    if (temErro(duracaoStr)) {
      return 0
    }
    
    const partes = duracaoStr.split(':')
    if (partes.length === 3) {
      const horas = parseInt(partes[0]) || 0
      const minutos = parseInt(partes[1]) || 0
      const segundos = parseInt(partes[2]) || 0
      return horas * 60 + minutos + (segundos / 60)
    }
    
    return parseFloat(duracaoStr) || 0
  }

  const dadosPorOperador = {}
  let dataStartIndex = 1

  // Verificar se primeira linha é cabeçalho
  if (data.length > 0 && Array.isArray(data[0])) {
    const primeiraLinha = data[0]
    const primeiroCampo = String(primeiraLinha[0] || '').trim().toLowerCase()
    if (primeiroCampo === 'data' || primeiroCampo.includes('data')) {
      dataStartIndex = 1
    } else {
      dataStartIndex = 0
    }
  }

  // Processar dados
  data.slice(dataStartIndex).forEach((row) => {
    if (!Array.isArray(row) || row.length < 4) {
      return
    }

    const dataStr = String(row[0] || '').trim()
    const operador = String(row[1] || '').trim()
    const tempoPausa = String(row[2] || '').trim()
    const tempoOnline = String(row[3] || '').trim()

    if (!dataStr || !operador || temErro(dataStr) || temErro(operador) || temErro(tempoPausa) || temErro(tempoOnline)) {
      return
    }

    if (!isDateInPeriod(dataStr)) {
      return
    }

    if (!dadosPorOperador[operador]) {
      dadosPorOperador[operador] = {
        tempoPausado: 0,
        tempoLogado: 0,
        total: 0
      }
    }

    const tmpMinutos = duracaoParaMinutos(tempoPausa)
    const tmlMinutos = duracaoParaMinutos(tempoOnline)

    dadosPorOperador[operador].tempoPausado += tmpMinutos
    dadosPorOperador[operador].tempoLogado += tmlMinutos
    dadosPorOperador[operador].total += tmpMinutos + tmlMinutos
  })

  return dadosPorOperador
}

// Função auxiliar para parse de data brasileira
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  return new Date(dateStr)
}

export default PausasChart
