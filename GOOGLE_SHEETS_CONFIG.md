# 🔧 Configuração do Google Sheets API

## 📋 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Google Sheets API Configuration
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_CLIENT_SECRET=your_client_secret_here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

## 🚀 Passos para Configurar

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - **Google Sheets API**
   - **Google Drive API**

### 2. Configurar OAuth2

1. Vá para "APIs e serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth"
3. Selecione "Aplicativo da Web"
4. Configure os URIs de redirecionamento:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.com` (produção)

### 3. Configurar Tela de Consentimento

1. Vá para "APIs e serviços" > "Tela de consentimento OAuth"
2. Escolha "Externo" como tipo de usuário
3. Preencha as informações necessárias
4. Adicione os escopos:
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`

### 4. Obter Credenciais

1. Após criar o cliente OAuth, copie:
   - **Client ID** → `REACT_APP_GOOGLE_CLIENT_ID`
   - **Client Secret** → `REACT_APP_GOOGLE_CLIENT_SECRET`

2. Para API Key:
   - Vá para "APIs e serviços" > "Credenciais"
   - Clique em "Criar credenciais" > "Chave de API"
   - Copie a chave → `REACT_APP_GOOGLE_API_KEY`

### 5. Configurar Permissões da Planilha

1. Abra a planilha no Google Sheets
2. Clique em "Compartilhar"
3. Adicione o email do cliente OAuth com permissão de "Visualizador"
4. Ou torne a planilha pública (não recomendado para dados sensíveis)

## 🔒 Segurança

- **Nunca** commite o arquivo `.env` no Git
- Use diferentes credenciais para desenvolvimento e produção
- Monitore o uso da API no Google Cloud Console
- Configure limites de quota se necessário

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o domínio está configurado nos URIs de redirecionamento
- Use HTTPS em produção

### Erro de Permissão
- Verifique se a planilha está compartilhada com o cliente OAuth
- Confirme se os escopos estão corretos

### Erro de API Key
- Verifique se a API Key está ativa
- Confirme se as APIs necessárias estão habilitadas

## 📊 Estrutura da Planilha

A planilha deve ter as seguintes colunas:

- **Data** - Data do atendimento
- **Nome do Atendente** - Nome do operador
- **Tempo Falado** - Duração em minutos
- **Pergunta2 1 PERGUNTA ATENDENTE** - Nota de atendimento (1-5)
- **Pergunta2 2 PERGUNTA SOLUCAO** - Nota de solução (1-5)
- **Chamada** - Status da chamada
- **Desconexão** - Motivo da desconexão
- **Duração** - Duração da pausa
- **Motivo da Pausa** - Motivo da pausa
- **Data Inicial** - Data da pausa
- **T M Logado / Dia** - Tempo médio logado
- **T M Pausado** - Tempo médio pausado
