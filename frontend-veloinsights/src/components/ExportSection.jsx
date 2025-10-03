import React from 'react'
import './ExportSection.css'

const ExportSection = ({ data, metrics, operatorMetrics }) => {
  const handleExportExcel = async () => {
    try {
      // Importar XLSX dinamicamente
      const XLSX = await import('xlsx')
      
      // Criar workbook
      const workbook = XLSX.utils.book_new()
      
      // Planilha com dados brutos
      const rawData = data.map(record => ({
        'Data': record.date ? new Date(record.date).toLocaleDateString('pt-BR') : '',
        'Operador': record.operator,
        'Tempo Atendimento (min)': record.duration_minutes,
        'Nota Atendimento': record.rating_attendance,
        'Nota Solução': record.rating_solution,
        'Chamadas': record.call_count,
        'Tempo Pausa (min)': record.pause_minutes,
        'Motivo Pausa': record.pause_reason
      }))
      
      const rawSheet = XLSX.utils.json_to_sheet(rawData)
      XLSX.utils.book_append_sheet(workbook, rawSheet, 'Dados Brutos')
      
      // Planilha com resumo
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total de Chamadas', metrics.totalCalls],
        ['Tempo Médio de Atendimento (min)', metrics.avgDuration],
        ['Nota Média de Atendimento', metrics.avgRatingAttendance],
        ['Nota Média de Solução', metrics.avgRatingSolution],
        ['Tempo Médio Logado (min)', metrics.avgLoggedTime],
        ['Tempo Médio Pausado (min)', metrics.avgPauseTime],
        ['Total de Operadores', metrics.totalOperators],
        ['Período Início', metrics.dataPeriod.start],
        ['Período Fim', metrics.dataPeriod.end]
      ]
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')
      
      // Planilha com métricas por operador
      const operatorData = operatorMetrics.map(op => ({
        'Operador': op.operator,
        'Total Chamadas': op.totalCalls,
        'Tempo Médio (min)': op.avgDuration,
        'Nota Atendimento': op.avgRatingAttendance,
        'Nota Solução': op.avgRatingSolution,
        'Tempo Pausa (min)': op.avgPauseTime,
        'Total Registros': op.totalRecords
      }))
      
      const operatorSheet = XLSX.utils.json_to_sheet(operatorData)
      XLSX.utils.book_append_sheet(workbook, operatorSheet, 'Por Operador')
      
      // Salvar arquivo
      const fileName = `veloinsights_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert('Erro ao exportar arquivo Excel')
    }
  }

  const handleExportPDF = async () => {
    try {
      // Importar jsPDF e html2canvas dinamicamente
      const [{ default: jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])
      
      // Capturar o conteúdo do dashboard
      const element = document.querySelector('.metrics-dashboard')
      if (!element) {
        alert('Nenhum conteúdo encontrado para exportar')
        return
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F3F7FC'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `veloinsights_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert('Erro ao exportar arquivo PDF')
    }
  }

  const handleExportCSV = () => {
    try {
      // Converter dados para CSV
      const csvData = data.map(record => ({
        'Data': record.date ? new Date(record.date).toLocaleDateString('pt-BR') : '',
        'Operador': record.operator,
        'Tempo Atendimento (min)': record.duration_minutes,
        'Nota Atendimento': record.rating_attendance,
        'Nota Solução': record.rating_solution,
        'Chamadas': record.call_count,
        'Tempo Pausa (min)': record.pause_minutes,
        'Motivo Pausa': record.pause_reason
      }))
      
      // Converter para string CSV
      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n')
      
      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `veloinsights_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('Erro ao exportar arquivo CSV')
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="export-section">
        <div className="card">
          <h2>📤 Exportação</h2>
          <p>Nenhum dado disponível para exportar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="export-section">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📤 Exportação de Dados</h2>
          <p className="card-subtitle">
            Exporte os dados processados em diferentes formatos
          </p>
        </div>
        
        <div className="export-options">
          <div className="export-card">
            <div className="export-icon">📊</div>
            <h3>Excel (XLSX)</h3>
            <p>Arquivo Excel com múltiplas planilhas contendo dados brutos, resumo e métricas por operador</p>
            <button 
              className="btn btn-primary"
              onClick={handleExportExcel}
            >
              📊 Exportar Excel
            </button>
          </div>
          
          <div className="export-card">
            <div className="export-icon">📄</div>
            <h3>PDF</h3>
            <p>Relatório em PDF com dashboard completo incluindo gráficos e métricas</p>
            <button 
              className="btn btn-secondary"
              onClick={handleExportPDF}
            >
              📄 Exportar PDF
            </button>
          </div>
          
          <div className="export-card">
            <div className="export-icon">📋</div>
            <h3>CSV</h3>
            <p>Arquivo CSV com dados processados para análise em outras ferramentas</p>
            <button 
              className="btn btn-success"
              onClick={handleExportCSV}
            >
              📋 Exportar CSV
            </button>
          </div>
        </div>
        
        <div className="export-info">
          <h4>ℹ️ Informações sobre Exportação:</h4>
          <ul>
            <li><strong>Excel:</strong> Contém 3 planilhas: dados brutos, resumo geral e métricas por operador</li>
            <li><strong>PDF:</strong> Captura visual do dashboard atual com todos os gráficos</li>
            <li><strong>CSV:</strong> Dados tabulares processados, compatível com Excel e outras ferramentas</li>
            <li>Todos os arquivos são nomeados automaticamente com a data atual</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExportSection
