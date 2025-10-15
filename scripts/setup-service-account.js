// setup-service-account.js
// Script para configurar Service Account com Google Sheets

import fs from 'fs'
import { google } from 'googleapis'

// 1. Configure suas credenciais do Service Account
const SERVICE_ACCOUNT_KEY = {
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "sua-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSUA_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "seu-service-account@seu-projeto.iam.gserviceaccount.com",
  "client_id": "seu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/seu-service-account%40seu-projeto.iam.gserviceaccount.com"
}

// 2. ID da planilha
const SPREADSHEET_ID = '1TXfLHMUSy-HTNUSmn3GR2lLEe_8dOVdI'

async function testServiceAccount() {
  try {
    console.log('🔐 Testando Service Account...')
    
    // Configurar autenticação
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })
    
    const sheets = google.sheets({ version: 'v4', auth })
    
    // Testar acesso à planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Base!A1:AC10' // Primeiras 10 linhas
    })
    
    console.log('✅ Acesso à planilha funcionando!')
    console.log('📊 Dados obtidos:', response.data.values?.length || 0, 'linhas')
    console.log('📋 Primeira linha:', response.data.values?.[0])
    
    return true
    
  } catch (error) {
    console.error('❌ Erro ao acessar planilha:', error.message)
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('🔑 SOLUÇÃO: Compartilhe a planilha com o email do Service Account')
      console.log('📧 Email:', SERVICE_ACCOUNT_KEY.client_email)
    }
    
    return false
  }
}

// Executar teste
testServiceAccount()
