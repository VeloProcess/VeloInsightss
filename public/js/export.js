// Velodados - Exportações
// Funções para exportar dados em Excel e PDF

/**
 * Exporta dados para Excel
 * @param {Array} data - Dados para exportar
 */
function exportExcel(data) {
  if (!data || data.length === 0) {
    alert('Nenhum dado disponível para exportar');
    return;
  }
  
  try {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Aba 1: Dados brutos
    const rawData = data.map(row => ({
      'Data': new Date(row.date).toLocaleDateString('pt-BR'),
      'Operador': row.operator,
      'Duração (min)': row.duration_minutes,
      'Avaliação Atendimento': row.rating_attendance || '',
      'Avaliação Solução': row.rating_solution || '',
      'Pausa (min)': row.pause_minutes
    }));
    
    const rawSheet = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, rawSheet, 'Dados Brutos');
    
    // Aba 2: Resumo por operador
    const operatorMetrics = operatorMetrics(data);
    const summaryData = Object.keys(operatorMetrics).map(operator => {
      const metrics = operatorMetrics[operator];
      return {
        'Operador': operator,
        'Total Atendimentos': metrics.totalCalls,
        'Duração Média (min)': metrics.avgDuration,
        'Avaliação Atendimento': metrics.avgRatingAttendance,
        'Avaliação Solução': metrics.avgRatingSolution,
        'Pausa Média (min)': metrics.avgPause
      };
    });
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo por Operador');
    
    // Aba 3: Ranking
    const scores = computeScores(operatorMetrics);
    const rankingData = scores.map((item, index) => ({
      'Posição': index + 1,
      'Operador': item.operator,
      'Score': item.score,
      'Total Atendimentos': item.metrics.totalCalls,
      'Duração Média (min)': item.metrics.avgDuration,
      'Avaliação Atendimento': item.metrics.avgRatingAttendance,
      'Avaliação Solução': item.metrics.avgRatingSolution,
      'Pausa Média (min)': item.metrics.avgPause
    }));
    
    const rankingSheet = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, rankingSheet, 'Ranking');
    
    // Aba 4: Estatísticas gerais
    const generalMetrics = calcMetrics(data);
    const generalData = [
      { 'Métrica': 'Total de Atendimentos', 'Valor': generalMetrics.totalCalls },
      { 'Métrica': 'Duração Média (min)', 'Valor': generalMetrics.avgDuration },
      { 'Métrica': 'Avaliação Atendimento', 'Valor': generalMetrics.avgRatingAttendance },
      { 'Métrica': 'Avaliação Solução', 'Valor': generalMetrics.avgRatingSolution },
      { 'Métrica': 'Operadores Ativos', 'Valor': generalMetrics.activeOperators },
      { 'Métrica': 'Pausa Média (min)', 'Valor': generalMetrics.avgPause }
    ];
    
    const generalSheet = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(wb, generalSheet, 'Estatísticas Gerais');
    
    // Gerar arquivo
    const fileName = `velodados_relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log('✅ Arquivo Excel exportado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao exportar Excel:', error);
    alert('Erro ao exportar arquivo Excel: ' + error.message);
  }
}

/**
 * Exporta dashboard para PDF
 */
function exportPDF() {
  try {
    // Usar html2canvas para capturar o dashboard
    const element = document.querySelector('.main-content');
    
    if (!element) {
      alert('Elemento do dashboard não encontrado');
      return;
    }
    
    // Mostrar loading
    showPDFLoading();
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#F3F7FC'
    }).then(canvas => {
      // Criar PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurações da página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // Margem de 10mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar título
      pdf.setFontSize(20);
      pdf.setTextColor(22, 52, 255); // --color-blue-primary
      pdf.text('Velodados - Dashboard de Atendimentos', 10, 20);
      
      // Adicionar data de geração
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 10, 30);
      
      // Adicionar imagem do dashboard
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      
      // Adicionar rodapé
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Velodados Dashboard', 10, pageHeight - 10);
      }
      
      // Salvar arquivo
      const fileName = `velodados_dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      hidePDFLoading();
      console.log('✅ Arquivo PDF exportado com sucesso');
      
    }).catch(error => {
      console.error('❌ Erro ao capturar dashboard:', error);
      hidePDFLoading();
      alert('Erro ao gerar PDF: ' + error.message);
    });
    
  } catch (error) {
    console.error('❌ Erro ao exportar PDF:', error);
    hidePDFLoading();
    alert('Erro ao exportar PDF: ' + error.message);
  }
}

/**
 * Mostra loading para PDF
 */
function showPDFLoading() {
  // Criar overlay de loading
  const overlay = document.createElement('div');
  overlay.id = 'pdf-loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  overlay.innerHTML = `
    <div style="
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="color: var(--color-blue-primary); margin-bottom: 15px;">
        ⏳ Gerando PDF...
      </h3>
      <p style="color: #666; margin: 0;">
        Por favor, aguarde enquanto capturamos o dashboard.
      </p>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

/**
 * Esconde loading do PDF
 */
function hidePDFLoading() {
  const overlay = document.getElementById('pdf-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Exporta dados para CSV
 * @param {Array} data - Dados para exportar
 * @param {string} filename - Nome do arquivo
 */
function exportCSV(data, filename = 'velodados_dados.csv') {
  if (!data || data.length === 0) {
    alert('Nenhum dado disponível para exportar');
    return;
  }
  
  try {
    // Cabeçalhos
    const headers = [
      'Data',
      'Operador',
      'Duração (min)',
      'Avaliação Atendimento',
      'Avaliação Solução',
      'Pausa (min)'
    ];
    
    // Converter dados para CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        new Date(row.date).toLocaleDateString('pt-BR'),
        `"${row.operator}"`,
        row.duration_minutes,
        row.rating_attendance || '',
        row.rating_solution || '',
        row.pause_minutes
      ].join(','))
    ].join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    console.log('✅ Arquivo CSV exportado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao exportar CSV:', error);
    alert('Erro ao exportar CSV: ' + error.message);
  }
}

// Exportar funções para uso global
window.exportExcel = exportExcel;
window.exportPDF = exportPDF;
window.exportCSV = exportCSV;
