# 🎨 VeloInsights - Frontend

## 📋 Visão Geral
Este é o frontend completo do sistema VeloInsights - Dashboard de Análise de Atendimentos.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Comandos
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura do Projeto

```
frontend-veloinsights/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AgentAnalysis.jsx    # Análise por agente (com drag & drop)
│   │   ├── MetricsDashboard.jsx  # Dashboard principal (com drag & drop)
│   │   ├── ChartsDetailedPage.jsx # Gráficos detalhados
│   │   ├── LoginTest.jsx        # Tela de login
│   │   ├── UploadArea.jsx        # Upload de arquivos (com drag & drop)
│   │   └── ...                   # Outros componentes
│   ├── hooks/               # Custom hooks
│   │   ├── useGoogleSheetsDirectSimple.js # Integração Google Sheets
│   │   ├── useTheme.js      # Gerenciamento de temas
│   │   ├── useUserPreferences.js # Preferências do usuário
│   │   └── ...
│   ├── styles/              # Estilos CSS
│   │   ├── themes.css       # Variáveis de tema
│   │   ├── App.css          # Estilos principais
│   │   └── ...
│   ├── utils/               # Utilitários
│   │   ├── dataProcessor.js # Processamento de dados
│   │   └── ...
│   └── config/              # Configurações
├── public/                  # Arquivos públicos
├── package.json             # Dependências
├── vite.config.js          # Configuração Vite
└── index.html              # HTML principal
```

## 🎨 Sistema de Temas

### Cores Principais
```css
:root {
  --color-bg-light: #F3F7FC;      /* Fundo claro */
  --color-bg-dark: #272A30;       /* Fundo escuro */
  --color-blue-primary: #1634FF;   /* Azul principal */
  --color-blue-light: #1694FF;     /* Azul claro */
  --color-text-primary: #000000;   /* Texto principal */
  --color-text-light: #FFFFFF;     /* Texto claro */
}
```

### Tema Claro vs Escuro
- **Tema Claro**: Fundo `#F3F7FC`, texto preto
- **Tema Escuro**: Fundo `#272A30`, texto branco
- Toggle automático baseado na preferência do sistema

## 🔧 Funcionalidades Principais

### 1. 📊 Dashboard Principal
- Métricas gerais de atendimento
- Cards arrastáveis (drag & drop)
- Ranking de operadores
- Filtros por período

### 2. 👤 Análise por Agente
- Lista de operadores ordenada por score
- Drag & drop para reordenar
- Análise individual de cada agente
- Métricas mensais expansíveis
- Gráfico de evolução de performance

### 3. 📈 Gráficos Detalhados
- Gráficos de atendimentos por dia
- Distribuição de notas
- Análise personalizada por operador
- Integração com Chart.js

### 4. 🔐 Sistema de Login
- Login com Google OAuth2
- Design responsivo com gradientes
- Integração com Google Sheets API

### 5. 📁 Upload de Arquivos
- Drag & drop múltiplo
- Suporte a CSV e XLSX
- Lista de arquivos com progresso
- Validação de tipos e tamanhos

## 🎯 Drag & Drop Features

### Bibliotecas Utilizadas
- `@dnd-kit/core` - Core do drag & drop
- `@dnd-kit/sortable` - Componentes sortáveis
- `@dnd-kit/utilities` - Utilitários

### Componentes com Drag & Drop
1. **AgentAnalysis**: Reordenar operadores
2. **MetricsDashboard**: Reordenar cards de métricas
3. **UploadArea**: Upload múltiplo de arquivos

### Persistência
- Ordem salva no `localStorage`
- Botões para restaurar ordem original
- Toggle entre modo normal e drag & drop

## 🔌 Integração Google Sheets

### Configuração
```javascript
// src/hooks/useGoogleSheetsDirectSimple.js
const CLIENT_ID = "827325386401-2g41vcepqkge5tiu380r1decb9ek5l1v.apps.googleusercontent.com"
const CLIENT_SECRET = "GOCSPX-..." // Configurado via variável de ambiente
```

### Fluxo de Autenticação
1. Login com Google OAuth2
2. Troca de código por tokens
3. Acesso à API do Google Sheets
4. Processamento automático dos dados

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações
- Sidebar colapsável
- Cards empilhados em mobile
- Gráficos responsivos
- Formulários adaptativos

## 🎨 Design System

### Componentes Padrão
- **Cards**: Bordas arredondadas, sombras suaves
- **Botões**: Gradientes azuis, hover effects
- **Inputs**: Bordas arredondadas, focus states
- **Modais**: Backdrop blur, animações suaves

### Animações
- Transições CSS suaves (0.3s ease)
- Hover effects em cards
- Loading spinners
- Drag & drop feedback visual

## 🔧 Desenvolvimento

### Hot Reload
- Vite HMR ativo
- Atualizações instantâneas
- Preservação de estado

### Debugging
- React DevTools recomendado
- Console logs organizados
- Error boundaries implementados

## 📦 Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^5.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0",
  "chart.js": "^4.0.0",
  "react-chartjs-2": "^5.0.0"
}
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Arquivos de Saída
- `dist/` - Arquivos otimizados
- `dist/assets/` - CSS e JS minificados
- `dist/index.html` - HTML principal

## 📞 Suporte

### Contatos
- **Desenvolvedor Principal**: [Seu contato]
- **Documentação**: Este README
- **Issues**: [Link para repositório]

### Logs Importantes
- Console do navegador para debugging
- Network tab para requisições
- Application tab para localStorage

---

**🎉 Frontend completo e funcional pronto para desenvolvimento!**
