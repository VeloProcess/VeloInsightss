// Google Apps Script - Sincronização por Tempo (Alternativa Simples)
// Este script executa a cada 15 minutos para verificar mudanças

// CONFIGURAÇÕES
const PLANILHA_ORIGINAL_ID = 'ID_DA_PLANILHA_ORIGINAL' // Substitua pelo ID da planilha original
const PLANILHA_SISTEMA_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA' // ID da planilha do sistema
const ABA_ORIGINAL = 'Base' // Nome da aba na planilha original
const ABA_SISTEMA = 'Base' // Nome da aba na planilha do sistema

/**
 * Função executada automaticamente a cada 15 minutos
 * Configure um trigger de tempo para esta função
 */
function sincronizacaoPorTempo() {
  try {
    console.log('🕐 Verificação automática de sincronização iniciada...')
    
    // Verificar se houve mudanças na planilha original
    const ultimaModificacao = verificarUltimaModificacao()
    const ultimaSincronizacao = obterUltimaSincronizacao()
    
    if (ultimaModificacao > ultimaSincronizacao) {
      console.log('🔄 Mudanças detectadas, iniciando sincronização...')
      sincronizarPlanilhas()
      salvarTimestampSincronizacao()
    } else {
      console.log('✅ Nenhuma mudança detectada')
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação automática:', error)
    enviarEmailErro(error)
  }
}

/**
 * Verificar última modificação da planilha original
 */
function verificarUltimaModificacao() {
  const planilhaOriginal = SpreadsheetApp.openById(PLANILHA_ORIGINAL_ID)
  const arquivo = DriveApp.getFileById(PLANILHA_ORIGINAL_ID)
  return arquivo.getLastUpdated().getTime()
}

/**
 * Obter timestamp da última sincronização
 */
function obterUltimaSincronizacao() {
  const properties = PropertiesService.getScriptProperties()
  const timestamp = properties.getProperty('ULTIMA_SINCRONIZACAO')
  return timestamp ? parseInt(timestamp) : 0
}

/**
 * Salvar timestamp da sincronização atual
 */
function salvarTimestampSincronizacao() {
  const properties = PropertiesService.getScriptProperties()
  properties.setProperty('ULTIMA_SINCRONIZACAO', Date.now().toString())
}

/**
 * Sincronizar dados entre as planilhas
 */
function sincronizarPlanilhas() {
  try {
    console.log('🚀 Iniciando sincronização de planilhas...')
    
    // Abrir planilhas
    const planilhaOriginal = SpreadsheetApp.openById(PLANILHA_ORIGINAL_ID)
    const planilhaSistema = SpreadsheetApp.openById(PLANILHA_SISTEMA_ID)
    
    const abaOriginal = planilhaOriginal.getSheetByName(ABA_ORIGINAL)
    const abaSistema = planilhaSistema.getSheetByName(ABA_SISTEMA)
    
    if (!abaOriginal || !abaSistema) {
      throw new Error('Abas não encontradas')
    }
    
    // Obter dados da planilha original
    console.log('📊 Obtendo dados da planilha original...')
    const ultimaLinha = abaOriginal.getLastRow()
    const ultimaColuna = abaOriginal.getLastColumn()
    
    if (ultimaLinha === 0 || ultimaColuna === 0) {
      console.log('⚠️ Planilha original está vazia')
      return
    }
    
    const dadosOriginais = abaOriginal.getRange(1, 1, ultimaLinha, ultimaColuna).getValues()
    
    // Limpar dados antigos da planilha do sistema
    console.log('🧹 Limpando dados antigos da planilha do sistema...')
    abaSistema.clear()
    
    // Copiar dados para a planilha do sistema
    console.log('📋 Copiando dados para a planilha do sistema...')
    const rangeDestino = abaSistema.getRange(1, 1, ultimaLinha, ultimaColuna)
    rangeDestino.setValues(dadosOriginais)
    
    // Aplicar formatação básica
    console.log('🎨 Aplicando formatação...')
    aplicarFormatacao(abaSistema, ultimaLinha, ultimaColuna)
    
    console.log('✅ Sincronização concluída com sucesso!')
    console.log(`📊 ${ultimaLinha} linhas e ${ultimaColuna} colunas sincronizadas`)
    
    // Notificar sistema via webhook
    notificarSistemaAtualizado()
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    throw error
  }
}

/**
 * Aplicar formatação básica na planilha de destino
 */
function aplicarFormatacao(aba, numLinhas, numColunas) {
  // Formatar cabeçalho
  if (numLinhas > 0) {
    const cabecalho = aba.getRange(1, 1, 1, numColunas)
    cabecalho.setBackground('#4285F4')
    cabecalho.setFontColor('#FFFFFF')
    cabecalho.setFontWeight('bold')
    
    // Formatar bordas
    const rangeCompleto = aba.getRange(1, 1, numLinhas, numColunas)
    rangeCompleto.setBorder(true, true, true, true, true, true)
    
    // Auto-resize colunas
    aba.autoResizeColumns(1, numColunas)
  }
}

/**
 * Notificar o sistema que os dados foram atualizados
 */
function notificarSistemaAtualizado() {
  try {
    const webhookUrl = 'https://velo-insightss.vercel.app/api/sheet-sync-webhook'
    
    const payload = {
      spreadsheetId: PLANILHA_SISTEMA_ID,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script-timer',
      action: 'sync_completed',
      rows: abaOriginal.getLastRow(),
      columns: abaOriginal.getLastColumn()
    }
    
    UrlFetchApp.fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload)
    })
    
    console.log('📡 Sistema notificado sobre atualização')
  } catch (error) {
    console.log('⚠️ Erro ao notificar sistema:', error)
  }
}

/**
 * Enviar email em caso de erro
 */
function enviarEmailErro(error) {
  try {
    const emailDestino = 'admin@velotax.com.br' // Configure aqui
    
    MailApp.sendEmail({
      to: emailDestino,
      subject: 'Erro na Sincronização Automática - VeloInsights',
      body: `Erro na sincronização automática por tempo:\n\n${error.toString()}\n\nTimestamp: ${new Date().toISOString()}\n\nPlanilha Original: ${PLANILHA_ORIGINAL_ID}\nPlanilha Sistema: ${PLANILHA_SISTEMA_ID}`
    })
    
    console.log('📧 Email de erro enviado')
  } catch (emailError) {
    console.error('❌ Erro ao enviar email:', emailError)
  }
}

/**
 * Função para sincronização manual
 */
function sincronizacaoManual() {
  console.log('🔄 Sincronização manual iniciada...')
  sincronizarPlanilhas()
  salvarTimestampSincronizacao()
}

/**
 * Criar menu personalizado na planilha
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('🔄 VeloInsights Sync')
    .addItem('Sincronizar Agora', 'sincronizacaoManual')
    .addItem('Ver Status', 'verStatusSincronizacao')
    .addSeparator()
    .addItem('Configurar IDs', 'configurarIds')
    .addToUi()
}

/**
 * Ver status da sincronização
 */
function verStatusSincronizacao() {
  const ui = SpreadsheetApp.getUi()
  
  const ultimaModificacao = verificarUltimaModificacao()
  const ultimaSincronizacao = obterUltimaSincronizacao()
  
  const status = ultimaModificacao > ultimaSincronizacao ? 'Pendente' : 'Atualizado'
  
  const mensagem = `Status da Sincronização:\n\n` +
    `Última modificação: ${new Date(ultimaModificacao).toLocaleString()}\n` +
    `Última sincronização: ${new Date(ultimaSincronizacao).toLocaleString()}\n` +
    `Status: ${status}`
  
  ui.alert('Status da Sincronização', mensagem, ui.ButtonSet.OK)
}

/**
 * Configurar IDs das planilhas
 */
function configurarIds() {
  const ui = SpreadsheetApp.getUi()
  
  const response = ui.prompt(
    'Configurar ID da Planilha Original',
    'Digite o ID da planilha original (fonte dos dados):',
    ui.ButtonSet.OK_CANCEL
  )
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const novoId = response.getResponseText()
    if (novoId) {
      PropertiesService.getScriptProperties().setProperty('PLANILHA_ORIGINAL_ID', novoId)
      ui.alert('✅ Configuração salva!', 'ID da planilha original atualizado.', ui.ButtonSet.OK)
    }
  }
}
