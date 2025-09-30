# 🔐 Google SSO - VeloInsights

## 🚀 Configuração Rápida

### Opção 1: Script Automático
```bash
node setup-sso.js
```

### Opção 2: Manual
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione suas credenciais:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
VITE_GOOGLE_DOMAIN=@velotax.com.br
VITE_GOOGLE_SPREADSHEET_ID=1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA
```

## 📋 Checklist de Configuração

### Google Cloud Console
- [ ] Projeto criado/selecionado
- [ ] Google Sheets API ativada
- [ ] Credenciais OAuth 2.0 criadas
- [ ] URIs de redirecionamento configurados:
  - `http://localhost:5173/callback.html`
  - `https://veloinsights.vercel.app/callback.html`

### Arquivo .env
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Domínio permitido definido
- [ ] ID da planilha definido

### Planilha Google Sheets
- [ ] Planilha compartilhada com o email do projeto
- [ ] Permissão de visualizador ou editor concedida

## 🔧 Testando a Configuração

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a aplicação:**
   ```
   http://localhost:5173
   ```

3. **Teste o login:**
   - Clique em "Conectar com Google"
   - Faça login com conta @velotax.com.br
   - Verifique se os dados são carregados

## 🛠️ Solução de Problemas

### Erro: "Client ID não configurado"
- Verifique se o arquivo `.env` existe
- Confirme se `VITE_GOOGLE_CLIENT_ID` está definido
- Reinicie o servidor após criar o `.env`

### Erro: "Acesso negado"
- Verifique se o email termina com `@velotax.com.br`
- Confirme se a planilha está compartilhada
- Verifique as permissões no Google Cloud Console

### Erro: "redirect_uri_mismatch"
- Adicione `http://localhost:5173/callback.html` nas URIs autorizadas
- Para produção, adicione `https://seu-dominio.com/callback.html`

## 📱 URLs Importantes

- **Desenvolvimento:** `http://localhost:5173`
- **Callback:** `http://localhost:5173/callback.html`
- **Produção:** `https://veloinsights.vercel.app`
- **Google Cloud Console:** `https://console.cloud.google.com/`

## 🔒 Segurança

- ✅ Tokens armazenados apenas no localStorage
- ✅ Domínio restrito a @velotax.com.br
- ✅ Logout limpa todos os dados sensíveis
- ✅ Não há envio de credenciais para servidores externos

## 📞 Suporte

Em caso de problemas:
1. Verifique o console do navegador
2. Consulte `GOOGLE_SSO_SETUP.md` para instruções detalhadas
3. Teste com diferentes contas do domínio
4. Verifique se as APIs estão ativadas no Google Cloud Console
