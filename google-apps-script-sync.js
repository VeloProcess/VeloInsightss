// Google Apps Script - Sincronização Automática de Planilhas
// Este script deve ser executado na PLANILHA ORIGINAL (fonte)

// CONFIGURAÇÕES
const PLANILHA_ORIGINAL_ID = 'ID_DA_PLANILHA_ORIGINAL' // Substitua pelo ID da planilha original
const PLANILHA_SISTEMA_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA' // ID da planilha do sistema
const ABA_ORIGINAL = 'Base' // Nome da aba na planilha original
const ABA_SISTEMA = 'Base' // Nome da aba na planilha do sistema
const RANGE_COPIAR = 'A1:AC150000' // Range completo para copiar

/**
 * Função principal - executada quando a planilha é editada
 */
function onEdit(e) {
  // Verificar se a edição foi na aba correta
  if (e.source.getActiveSheet().getName() === ABA_ORIGINAL) {
    console.log('🔄 Planilha original foi editada, iniciando sincronização...')
    
    // Aguardar 2 segundos para garantir que a edição foi concluída
    Utilities.sleep(2000)
    
    // Executar sincronização
    sincronizarPlanilhas()
  }
}

/**
 * Função para sincronizar dados entre as planilhas
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
    const dadosOriginais = abaOriginal.getRange(RANGE_COPIAR).getValues()
    
    // Limpar dados antigos da planilha do sistema
    console.log('🧹 Limpando dados antigos da planilha do sistema...')
    abaSistema.clear()
    
    // Copiar dados para a planilha do sistema
    console.log('📋 Copiando dados para a planilha do sistema...')
    const rangeDestino = abaSistema.getRange(1, 1, dadosOriginais.length, dadosOriginais[0].length)
    rangeDestino.setValues(dadosOriginais)
    
    // Aplicar formatação básica
    console.log('🎨 Aplicando formatação...')
    aplicarFormatacao(abaSistema, dadosOriginais.length)
    
    console.log('✅ Sincronização concluída com sucesso!')
    console.log(`📊 ${dadosOriginais.length} linhas sincronizadas`)
    
    // Notificar sistema via webhook (opcional)
    notificarSistemaAtualizado()
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    
    // Enviar email de erro (opcional)
    enviarEmailErro(error)
  }
}

/**
 * Aplicar formatação básica na planilha de destino
 */
function aplicarFormatacao(aba, numLinhas) {
  // Formatar cabeçalho
  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn())
  cabecalho.setBackground('#4285F4')
  cabecalho.setFontColor('#FFFFFF')
  cabecalho.setFontWeight('bold')
  
  // Formatar bordas
  const rangeCompleto = aba.getRange(1, 1, numLinhas, aba.getLastColumn())
  rangeCompleto.setBorder(true, true, true, true, true, true)
  
  // Auto-resize colunas
  aba.autoResizeColumns(1, aba.getLastColumn())
}

/**
 * Notificar o sistema que os dados foram atualizados
 */
function notificarSistemaAtualizado() {
  try {
    const webhookUrl = 'https://velo-insightss.vercel.app/api/sheet-updated' // URL do seu sistema
    
    const payload = {
      spreadsheetId: PLANILHA_SISTEMA_ID,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script',
      action: 'sync_completed'
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
    const emailDestino = 'admin@velotax.com.br' // Substitua pelo email correto
    
    MailApp.sendEmail({
      to: emailDestino,
      subject: 'Erro na Sincronização de Planilhas - VeloInsights',
      body: `Erro na sincronização automática:\n\n${error.toString()}\n\nTimestamp: ${new Date().toISOString()}`
    })
    
    console.log('📧 Email de erro enviado')
  } catch (emailError) {
    console.error('❌ Erro ao enviar email:', emailError)
  }
}

/**
 * Função para sincronização manual (pode ser chamada via menu)
 */
function sincronizacaoManual() {
  console.log('🔄 Sincronização manual iniciada...')
  sincronizarPlanilhas()
}

/**
 * Criar menu personalizado na planilha
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('🔄 VeloInsights Sync')
    .addItem('Sincronizar Agora', 'sincronizacaoManual')
    .addItem('Configurar Sincronização', 'configurarSincronizacao')
    .addSeparator()
    .addItem('Ver Logs', 'verLogs')
    .addToUi()
}

/**
 * Configurar parâmetros de sincronização
 */
function configurarSincronizacao() {
  const ui = SpreadsheetApp.getUi()
  
  const response = ui.prompt(
    'Configurar Sincronização',
    'Digite o ID da planilha do sistema:',
    ui.ButtonSet.OK_CANCEL
  )
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const novoId = response.getResponseText()
    if (novoId) {
      // Salvar configuração
      PropertiesService.getScriptProperties().setProperty('PLANILHA_SISTEMA_ID', novoId)
      ui.alert('✅ Configuração salva!', 'ID da planilha do sistema atualizado.', ui.ButtonSet.OK)
    }
  }
}

/**
 * Ver logs de sincronização
 */
function verLogs() {
  const ui = SpreadsheetApp.getUi()
  const logs = PropertiesService.getScriptProperties().getProperty('SYNC_LOGS') || 'Nenhum log encontrado'
  
  ui.alert('Logs de Sincronização', logs, ui.ButtonSet.OK)
}

/**
 * Salvar log de sincronização
 */
function salvarLog(mensagem) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${mensagem}\n`
  
  const logsExistentes = PropertiesService.getScriptProperties().getProperty('SYNC_LOGS') || ''
  const novosLogs = logsExistentes + logEntry
  
  // Manter apenas os últimos 50 logs
  const linhas = novosLogs.split('\n')
  const logsLimitados = linhas.slice(-50).join('\n')
  
  PropertiesService.getScriptProperties().setProperty('SYNC_LOGS', logsLimitados)
}
