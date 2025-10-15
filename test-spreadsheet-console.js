// Script para testar a nova planilha diretamente no console do navegador
// Cole este código no console do navegador (F12)

async function testNewSpreadsheet() {
  const NEW_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO';
  const accessToken = localStorage.getItem('google_access_token');
  
  if (!accessToken) {
    console.error('❌ Token não encontrado. Faça login primeiro.');
    return;
  }
  
  console.log('🚀 Testando nova planilha...');
  console.log('📊 ID da planilha:', NEW_SPREADSHEET_ID);
  console.log('🔑 Token encontrado:', accessToken.substring(0, 20) + '...');
  
  // Testar diferentes endpoints
  const endpoints = [
    `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?access_token=${accessToken}`,
    `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?fields=sheets.properties&access_token=${accessToken}`,
    `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?fields=sheets&access_token=${accessToken}`
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`\n🔗 Testando endpoint ${i + 1}:`);
    console.log(endpoint.replace(accessToken, '***'));
    
    try {
      const response = await fetch(endpoint);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sucesso! Dados recebidos:');
        console.log(data);
        
        if (data.sheets) {
          console.log('\n📋 Abas encontradas:');
          data.sheets.forEach((sheet, index) => {
            console.log(`  ${index + 1}. "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
          });
        }
        
        // Testar ranges com a primeira aba encontrada
        if (data.sheets && data.sheets.length > 0) {
          const firstSheet = data.sheets[0].properties.title;
          console.log(`\n🧪 Testando ranges com a aba "${firstSheet}":`);
          
          const ranges = ['A1:Z100', 'A1:AC1000', 'A1:AC5000'];
          for (const range of ranges) {
            try {
              const rangeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/${firstSheet}!${range}?access_token=${accessToken}`;
              console.log(`  🔗 Testando: ${firstSheet}!${range}`);
              
              const rangeResponse = await fetch(rangeUrl);
              if (rangeResponse.ok) {
                const rangeData = await rangeResponse.json();
                console.log(`  ✅ Sucesso! ${rangeData.values ? rangeData.values.length : 0} linhas encontradas`);
                if (rangeData.values && rangeData.values.length > 0) {
                  console.log(`  📊 Primeira linha:`, rangeData.values[0]);
                }
                break; // Parar no primeiro sucesso
              } else {
                console.log(`  ❌ Falha: ${rangeResponse.status}`);
              }
            } catch (error) {
              console.log(`  ❌ Erro:`, error.message);
            }
          }
        }
        
        return data; // Retornar dados do primeiro sucesso
      } else {
        const errorText = await response.text();
        console.log('❌ Erro:', errorText);
      }
    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
    }
  }
  
  console.log('\n🔍 Tentando ranges sem especificar aba...');
  const rangesWithoutSheet = ['A1:Z100', 'A1:AC1000'];
  for (const range of rangesWithoutSheet) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/${range}?access_token=${accessToken}`;
      console.log(`🔗 Testando range: ${range}`);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Sucesso! ${data.values ? data.values.length : 0} linhas encontradas`);
        if (data.values && data.values.length > 0) {
          console.log('📊 Primeira linha:', data.values[0]);
        }
        return data;
      } else {
        console.log(`❌ Falha: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro:`, error.message);
    }
  }
  
  console.log('\n❌ Não foi possível acessar a planilha. Verifique:');
  console.log('1. Se a planilha está compartilhada com sua conta');
  console.log('2. Se você tem permissão de visualização');
  console.log('3. Se o ID da planilha está correto');
}

// Executar o teste
testNewSpreadsheet();
