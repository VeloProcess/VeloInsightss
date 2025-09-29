const FormData = require('form-data');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🚀 Testando API com arquivo real da Velotax...');
    
    const filePath = 'Base_teste/Relatório Detalhes de Ligações_01jan a 21Set.xlsx';
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Arquivo não encontrado:', filePath);
      return;
    }
    
    console.log('📁 Arquivo encontrado:', filePath);
    console.log('📏 Tamanho:', (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2), 'MB');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    console.log('📡 Enviando para API...');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ Sucesso!');
    console.log('📊 Resultados:');
    console.log('  - Total de linhas:', result.totalRows);
    console.log('  - Linhas válidas:', result.validRows);
    console.log('  - Erros:', result.errorCount);
    console.log('  - Tipo de dados:', result.isVelotaxData ? 'Velotax' : 'Padrão');
    
    if (result.data && result.data.length > 0) {
      console.log('📋 Primeira linha de dados:');
      console.log('  - Data:', result.data[0].date);
      console.log('  - Operador:', result.data[0].operator);
      console.log('  - Duração:', result.data[0].duration_minutes, 'min');
      console.log('  - Avaliação:', result.data[0].rating_attendance);
    }
    
    console.log('🎉 Teste da API concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAPI();
