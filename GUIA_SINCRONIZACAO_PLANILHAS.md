# 🔄 Guia de Sincronização Automática de Planilhas

## 📋 Visão Geral

Este sistema permite que quando a **planilha original** for alterada, ela automaticamente atualize a **planilha que o sistema usa**, mantendo tudo sincronizado.

## 🎯 Como Funciona

1. **Planilha Original** (fonte dos dados) → **Planilha do Sistema** (usada pelo VeloInsights)
2. **Google Apps Script** monitora mudanças na planilha original
3. **Sincronização automática** copia dados quando há alterações
4. **Sistema notificado** via webhook quando sincronização é concluída

## 🚀 Configuração Passo a Passo

### 1️⃣ **Configurar Google Apps Script**

1. **Acesse** [script.google.com](https://script.google.com)
2. **Crie** um novo projeto
3. **Cole** o código do arquivo `google-apps-script-sync.js`
4. **Configure** as variáveis no início do script:

```javascript
const PLANILHA_ORIGINAL_ID = 'ID_DA_SUA_PLANILHA_ORIGINAL' // Substitua aqui
const PLANILHA_SISTEMA_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA' // Já configurado
const ABA_ORIGINAL = 'Base' // Nome da aba na planilha original
const ABA_SISTEMA = 'Base' // Nome da aba na planilha do sistema
```

### 2️⃣ **Configurar Permissões**

1. **Autorize** o script a acessar suas planilhas
2. **Conceda** permissões para:
   - Google Sheets API
   - Google Drive API
   - Mail API (para emails de erro)

### 3️⃣ **Configurar Triggers (Gatilhos)**

1. **Vá** para "Triggers" no menu lateral
2. **Crie** um novo trigger:
   - **Função**: `onEdit`
   - **Tipo**: `On edit`
   - **Fonte**: `From spreadsheet`
   - **ID da planilha**: ID da sua planilha original

### 4️⃣ **Testar Sincronização**

1. **Abra** a planilha original
2. **Faça** uma pequena alteração
3. **Aguarde** 2-3 segundos
4. **Verifique** se a planilha do sistema foi atualizada

## 🔧 Configurações Avançadas

### **Sincronização Manual**

O script cria um menu personalizado na planilha original:
- **"Sincronizar Agora"**: Força sincronização imediata
- **"Configurar Sincronização"**: Altera ID da planilha destino
- **"Ver Logs"**: Visualiza histórico de sincronizações

### **Notificações por Email**

Em caso de erro, o sistema envia email para:
```javascript
const emailDestino = 'admin@velotax.com.br' // Configure aqui
```

### **Webhook para Sistema**

O sistema recebe notificações em:
```
https://velo-insightss.vercel.app/api/sheet-sync-webhook
```

## 📊 Monitoramento

### **Logs Automáticos**

O script mantém logs das últimas 50 sincronizações:
- ✅ Sucessos
- ❌ Erros
- 📅 Timestamps
- 📊 Quantidade de linhas sincronizadas

### **Verificação Manual**

Para verificar se está funcionando:
1. **Abra** a planilha original
2. **Menu** "VeloInsights Sync" → "Ver Logs"
3. **Verifique** histórico de sincronizações

## 🛠️ Troubleshooting

### **Erro: "Abas não encontradas"**
- Verifique se os nomes das abas estão corretos
- Certifique-se de que as abas existem em ambas as planilhas

### **Erro: "Permissão negada"**
- Reautorize o script
- Verifique se o script tem acesso às planilhas

### **Sincronização não funciona**
- Verifique se o trigger está ativo
- Teste a sincronização manual primeiro
- Verifique os logs para erros

### **Dados não aparecem no sistema**
- Aguarde alguns minutos para o sistema detectar mudanças
- Use o botão "Sincronizar" no sistema
- Verifique se a planilha do sistema foi realmente atualizada

## 🔒 Segurança

### **Permissões Mínimas**
- O script só precisa de acesso às planilhas específicas
- Não requer acesso a outros arquivos do Google Drive

### **Backup Automático**
- A planilha original nunca é modificada
- Apenas a planilha do sistema é atualizada
- Dados originais sempre preservados

## 📈 Performance

### **Otimizações**
- Sincronização só ocorre quando há mudanças
- Delay de 2 segundos para evitar múltiplas execuções
- Limpeza automática de dados antigos

### **Limites do Google Apps Script**
- Máximo 6 minutos de execução por trigger
- Máximo 100 execuções por dia (gratuito)
- Para uso intensivo, considere upgrade para conta paga

## 🎉 Resultado Final

Após a configuração:

1. ✅ **Alteração na planilha original** → **Sincronização automática**
2. ✅ **Dados sempre atualizados** no sistema VeloInsights
3. ✅ **Notificações** quando sincronização é concluída
4. ✅ **Logs** para monitoramento e troubleshooting
5. ✅ **Sincronização manual** disponível quando necessário

**O sistema agora mantém automaticamente a planilha sincronizada!** 🚀
