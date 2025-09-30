# 🔐 Configuração do Google SSO para VeloInsights

## 📋 Pré-requisitos

1. Conta Google com acesso ao domínio `@velotax.com.br`
2. Acesso ao Google Cloud Console
3. Permissões para criar credenciais OAuth

## 🚀 Passo a Passo

### 1. Configurar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**:
   - Vá para "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Sheets API"
   - Clique em "Ativar"

### 2. Criar Credenciais OAuth 2.0

1. Vá para "APIs e Serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
3. Selecione "Aplicativo da Web"
4. Configure os **URIs de redirecionamento autorizados**:
   ```
   http://localhost:5173/callback.html
   https://veloinsights.vercel.app/callback.html
   https://seu-dominio.com/callback.html
   ```
5. Salve e copie o **Client ID** e **Client Secret**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Configurações do Google OAuth para VeloInsights
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
VITE_GOOGLE_DOMAIN=@velotax.com.br
VITE_GOOGLE_SPREADSHEET_ID=1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA
```

### 4. Configurar Planilha Google Sheets

1. Acesse a planilha: `https://docs.google.com/spreadsheets/d/1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA`
2. Compartilhe com o email do projeto Google Cloud
3. Dê permissão de **Visualizador** ou **Editor**

## 🔧 Funcionalidades do SSO

### ✅ O que está implementado:

- **Autenticação OAuth 2.0** com Google
- **Restrição de domínio** (@velotax.com.br)
- **Armazenamento seguro** de tokens no localStorage
- **Renovação automática** de tokens
- **Logout seguro** com limpeza de dados
- **Callback automático** após autorização
- **Tratamento de erros** completo

### 🎯 Fluxo de Autenticação:

1. Usuário clica em "Entrar com Google"
2. Redirecionamento para Google OAuth
3. Usuário autoriza o acesso
4. Google redireciona para `/callback.html`
5. Sistema troca código por tokens
6. Dados do usuário são salvos
7. Acesso às planilhas é liberado

## 🛠️ Solução de Problemas

### Erro: "Client ID não configurado"
- Verifique se o arquivo `.env` existe
- Confirme se `VITE_GOOGLE_CLIENT_ID` está definido

### Erro: "Client Secret não configurado"
- Verifique se `VITE_GOOGLE_CLIENT_SECRET` está definido
- Confirme se não há espaços extras

### Erro: "Domínio não autorizado"
- Verifique se o email do usuário termina com `@velotax.com.br`
- Confirme se o domínio está configurado corretamente

### Erro: "Acesso negado à planilha"
- Verifique se a planilha está compartilhada
- Confirme se o email do projeto tem permissão

## 📱 URLs de Desenvolvimento

- **Local**: `http://localhost:5173`
- **Callback**: `http://localhost:5173/callback.html`
- **Produção**: `https://veloinsights.vercel.app`

## 🔒 Segurança

- Tokens são armazenados apenas no localStorage do navegador
- Não há envio de credenciais para servidores externos
- Domínio restrito a `@velotax.com.br`
- Logout limpa todos os dados sensíveis

## 📞 Suporte

Em caso de problemas:
1. Verifique o console do navegador para erros
2. Confirme as configurações do Google Cloud Console
3. Teste com diferentes contas do domínio
4. Verifique se as APIs estão ativadas
