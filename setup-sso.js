#!/usr/bin/env node

/**
 * Script para configurar o Google SSO no VeloInsights
 * Executa: node setup-sso.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Configuração do Google SSO para VeloInsights\n');

// Verificar se já existe arquivo .env
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  Arquivo .env já existe!');
  rl.question('Deseja sobrescrever? (s/N): ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      createEnvFile();
    } else {
      console.log('❌ Configuração cancelada.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📋 Preencha as informações do Google Cloud Console:\n');
  
  rl.question('Client ID: ', (clientId) => {
    if (!clientId.trim()) {
      console.log('❌ Client ID é obrigatório!');
      rl.close();
      return;
    }
    
    rl.question('Client Secret: ', (clientSecret) => {
      if (!clientSecret.trim()) {
        console.log('❌ Client Secret é obrigatório!');
        rl.close();
        return;
      }
      
      rl.question('Domínio permitido (padrão: @velotax.com.br): ', (domain) => {
        const finalDomain = domain.trim() || '@velotax.com.br';
        
        rl.question('ID da planilha (padrão: 1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA): ', (spreadsheetId) => {
          const finalSpreadsheetId = spreadsheetId.trim() || '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA';
          
          // Criar conteúdo do .env
          const envContent = `# Configurações do Google OAuth para VeloInsights
# Gerado automaticamente em ${new Date().toISOString()}

VITE_GOOGLE_CLIENT_ID=${clientId.trim()}
VITE_GOOGLE_CLIENT_SECRET=${clientSecret.trim()}
VITE_GOOGLE_DOMAIN=${finalDomain}
VITE_GOOGLE_SPREADSHEET_ID=${finalSpreadsheetId}
`;

          try {
            fs.writeFileSync(envPath, envContent);
            console.log('\n✅ Arquivo .env criado com sucesso!');
            console.log('\n📋 Próximos passos:');
            console.log('1. Reinicie o servidor de desenvolvimento');
            console.log('2. Acesse a aplicação no navegador');
            console.log('3. Clique em "Conectar com Google"');
            console.log('4. Faça login com sua conta @velotax.com.br');
            console.log('\n📖 Para mais informações, consulte GOOGLE_SSO_SETUP.md');
          } catch (error) {
            console.error('❌ Erro ao criar arquivo .env:', error.message);
          }
          
          rl.close();
        });
      });
    });
  });
}

// Instruções iniciais
console.log('📖 Instruções:');
console.log('1. Acesse https://console.cloud.google.com/');
console.log('2. Crie um projeto ou selecione um existente');
console.log('3. Ative a Google Sheets API');
console.log('4. Crie credenciais OAuth 2.0');
console.log('5. Configure os URIs de redirecionamento:');
console.log('   - http://localhost:5173/callback.html');
console.log('   - https://veloinsights.vercel.app/callback.html');
console.log('6. Copie o Client ID e Client Secret\n');
