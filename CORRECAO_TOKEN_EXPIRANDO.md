# 🔧 CORREÇÃO DO PROBLEMA DE TOKEN EXPIrando

## 🚨 PROBLEMA IDENTIFICADO
O token estava expirando em segundos porque estávamos usando `response_type=token` que gera tokens de curta duração.

## ✅ SOLUÇÃO IMPLEMENTADA
Mudei para `response_type=code` com `access_type=offline` para obter refresh tokens.

## 📋 CONFIGURAÇÃO NECESSÁRIA

### 1. Atualizar arquivo `.env`:
```env
VITE_GOOGLE_CLIENT_ID=827325386401-2g41vcepqkge5tiu380r1decb9ek5l1v.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
VITE_GOOGLE_API_KEY=sua_api_key_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000
```

### 2. Obter Client Secret:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em "APIs e Serviços" > "Credenciais"
3. Clique no seu OAuth 2.0 Client ID
4. Copie o "Client Secret"
5. Cole no arquivo `.env` como `VITE_GOOGLE_CLIENT_SECRET`

## 🔄 COMO FUNCIONA AGORA

1. **Login**: Usuário clica em "Conectar com Google"
2. **Autorização**: Google redireciona com código de autorização
3. **Troca de Tokens**: Sistema troca código por access_token + refresh_token
4. **Persistência**: Tokens são salvos no localStorage
5. **Renovação**: Refresh token permite renovar access_token automaticamente

## 🎯 BENEFÍCIOS

- ✅ **Tokens duradouros**: Access tokens válidos por 1 hora
- ✅ **Renovação automática**: Refresh token permite renovar sem novo login
- ✅ **Sessão persistente**: Usuário não precisa fazer login toda vez
- ✅ **Segurança**: Client Secret protege a troca de tokens

## 🚀 TESTE AGORA

1. **Configure o Client Secret** no arquivo `.env`
2. **Reinicie o servidor** (`npm run dev`)
3. **Faça login** novamente
4. **Deve funcionar** sem expirar em segundos!

---

**💡 DICA**: O Client Secret é necessário para trocar o código de autorização por tokens. Sem ele, o sistema não consegue completar o fluxo OAuth2.
