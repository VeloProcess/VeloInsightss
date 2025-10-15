/**
 * Script para testar acesso à nova planilha
 * Descobre o nome correto da aba e testa diferentes ranges
 */

const GOOGLE_CLIENT_ID = '827325386401-2g41vcepqkge5tiu380r1decb9ek5l1v.apps.googleusercontent.com';
const NEW_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO';

// Função para descobrir as abas da planilha
async function discoverSheets() {
  try {
    console.log('🔍 Descobrindo abas da nova planilha...');
    
    // Primeiro, vamos tentar descobrir as abas usando a API de metadados
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) {
      console.error('❌ Token de acesso não encontrado');
      return;
    }

    // Tentar diferentes endpoints para descobrir as abas
    const endpoints = [
      `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?access_token=${accessToken}`,
      `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?fields=sheets.properties&access_token=${accessToken}`,
      `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?fields=sheets&access_token=${accessToken}`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 Testando: ${endpoint}`);
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Sucesso! Dados recebidos:', data);
          
          if (data.sheets) {
            console.log('📋 Abas encontradas:');
            data.sheets.forEach((sheet, index) => {
              console.log(`  ${index + 1}. ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
            });
          }
          
          return data;
        } else {
          console.log(`❌ Erro ${response.status}:`, data);
        }
      } catch (error) {
        console.log(`❌ Erro na requisição:`, error.message);
      }
    }

    // Se não conseguir descobrir as abas, vamos tentar ranges comuns
    console.log('🔄 Tentando ranges comuns...');
    const commonRanges = [
      'Sheet1!A1:Z1000',
      'Planilha1!A1:Z1000', 
      'Dados!A1:Z1000',
      'Base!A1:Z1000',
      'Data!A1:Z1000',
      'A1:Z1000' // Sem especificar aba
    ];

    for (const range of commonRanges) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/${range}?access_token=${accessToken}`;
        console.log(`🔗 Testando range: ${range}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ Sucesso com range ${range}!`);
          console.log('📊 Dados:', data);
          if (data.values && data.values.length > 0) {
            console.log(`📈 ${data.values.length} linhas encontradas`);
            console.log('🔤 Primeira linha (cabeçalhos):', data.values[0]);
          }
          return { range, data };
        } else {
          console.log(`❌ Erro ${response.status} com range ${range}:`, data);
        }
      } catch (error) {
        console.log(`❌ Erro na requisição do range ${range}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar quando a página carregar
if (typeof window !== 'undefined') {
  window.discoverSheets = discoverSheets;
  console.log('🚀 Script carregado! Execute discoverSheets() no console');
} else {
  discoverSheets();
}
