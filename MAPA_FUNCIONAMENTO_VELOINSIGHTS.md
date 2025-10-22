# 🗺️ MAPA DE FUNCIONAMENTO - VeloInsights

## 📋 Visão Geral do Sistema

O VeloInsights é um dashboard de análise de dados de telefonia e tickets que se conecta ao Google Sheets para visualizar métricas de atendimento.

---

## 🔄 Fluxo Principal de Dados

```
Google Sheets → API Integration → Frontend → Dashboard → Gráficos
```

### 1. **Fonte de Dados**
- **Google Sheets** (Planilha principal)
- **Colunas principais**: Data, Hora, Tipo de Chamada, Fila, Avaliação, etc.

### 2. **Integração**
- **API Google Sheets** (`api/mongodb-api.js`)
- **Webhook** (`api/sheet-sync-webhook.js`)
- **Processamento** (`api/55-api-integration.js`)

### 3. **Frontend**
- **React + Vite** (`src/`)
- **Componentes principais** (`src/components/`)
- **Hooks customizados** (`src/hooks/`)

---

## 🏗️ Arquitetura dos Componentes

### **App.jsx** (Componente Principal)
```
App.jsx
├── Autenticação (Google OAuth)
├── Navegação entre abas
├── Carregamento de dados
└── Renderização do Dashboard
```

### **Dashboard** (`MetricsDashboardNovo.jsx`)
```
Dashboard
├── Aba Telefonia
│   ├── Análise Geral (TendenciaSemanalChart)
│   ├── CSAT (CSATChart)
│   ├── Volume por Produto URA (VolumeProdutoURAChart)
│   └── Volume por Hora (VolumeHoraChart)
└── Aba Tickets
    ├── CSAT Tickets (CSATChart)
    ├── Volume por Fila (VolumeProdutoURAChart)
    └── Volume por Hora Tickets (VolumeHoraChart)
```

---

## 📊 Componentes de Gráficos

### **1. TendenciaSemanalChart.jsx**
- **Função**: Análise temporal semanal
- **Dados**: Total, Atendidas, Retidas na URA, Nota Média
- **Tipo**: Gráfico de linha temporal

### **2. CSATChart.jsx**
- **Função**: Satisfação do cliente
- **Dados**: Avaliações de atendimento
- **Tipo**: Gráfico de linha (tickets) / Barras (telefonia)

### **3. VolumeProdutoURAChart.jsx**
- **Função**: Distribuição por filas/produtos
- **Dados**: Filas da URA (coluna K)
- **Tipo**: Gráfico Polar Area
- **Tamanho**: Grande (1000px) para Tickets, Normal (400px) para Telefonia

### **4. VolumeHoraChart.jsx**
- **Função**: Volume de chamadas por hora
- **Dados**: Hora da chamada (coluna E)
- **Tipo**: Histograma de barras
- **Filtro**: Apenas chamadas atendidas (não retidas)

---

## 🔧 Hooks Customizados

### **useTicketsData.js**
- **Função**: Busca dados específicos de tickets
- **Processamento**: `processQueueData()`
- **Estados**: `ticketsData`, `isLoading`, `error`

---

## 📁 Estrutura de Arquivos

```
VeloInsights/
├── api/                          # Backend/API
│   ├── mongodb-api.js           # Conexão com dados
│   ├── sheet-sync-webhook.js    # Sincronização
│   └── 55-api-integration.js   # Integração principal
├── src/
│   ├── App.jsx                  # Componente principal
│   ├── components/              # Componentes React
│   │   ├── MetricsDashboardNovo.jsx
│   │   ├── TendenciaSemanalChart.jsx
│   │   ├── CSATChart.jsx
│   │   ├── VolumeProdutoURAChart.jsx
│   │   └── VolumeHoraChart.jsx
│   ├── hooks/                   # Hooks customizados
│   │   └── useTicketsData.js
│   └── config/                  # Configurações
└── dist/                        # Build de produção
```

---

## 🔄 Fluxo de Dados Detalhado

### **1. Carregamento Inicial**
```
App.jsx → useEffect → loadDataOnDemand('allRecords') → Google Sheets API
```

### **2. Processamento de Dados**
```
Dados Brutos → processVolumeProdutoRadar() → Dados Processados → Gráfico
```

### **3. Renderização**
```
Dados Processados → chartData (useMemo) → Chart.js → Canvas → Visualização
```

---

## 🎨 Sistema de Estilos

### **CSS Principal** (`MetricsDashboard.css`)
- **Classes principais**:
  - `.chart-container` (400px altura)
  - `.chart-container-large` (1000px altura)
  - `.charts-grid` (Layout em grid)
  - `.card` (Cards dos gráficos)

---

## 🔍 Detecção de Dados

### **Tipo de Chamada** (Colunas K, L, M)
- **Retida na URA**: Contém "retida", "ura", "abandonada"
- **Atendida**: Qualquer outro tipo

### **Período de Dados**
- **Padrão**: Todos os registros (`allRecords`)
- **Filtros**: Por data específica

---

## 📈 Métricas Calculadas

### **Volume por Hora**
- **Fonte**: Coluna E (hora)
- **Processamento**: Agrupa por hora (0-23)
- **Filtro**: Apenas chamadas atendidas

### **Volume por Fila**
- **Fonte**: Coluna K (fila)
- **Processamento**: Conta ocorrências por fila
- **Visualização**: Gráfico polar com porcentagens

### **CSAT**
- **Fonte**: Colunas O-U (avaliação)
- **Processamento**: Calcula satisfação (%)
- **Visualização**: Linha temporal

---

## 🚀 Pontos de Integração

### **1. Google Sheets API**
- **Autenticação**: OAuth 2.0
- **Leitura**: Dados em tempo real
- **Sincronização**: Webhook automático

### **2. Chart.js**
- **Biblioteca**: react-chartjs-2
- **Tipos**: Line, Bar, Polar Area
- **Plugins**: DataLabels, Filler

### **3. React Hooks**
- **useState**: Estados dos componentes
- **useEffect**: Efeitos colaterais
- **useMemo**: Otimização de dados

---

## 🔧 Configurações Importantes

### **Porta do Servidor**
- **Desenvolvimento**: 3000 (nunca mudar)
- **Produção**: Configurável

### **Tamanhos de Gráficos**
- **Grande**: 1000px altura (Tickets)
- **Normal**: 400px altura (Telefonia)

### **Período Padrão**
- **Inicial**: Todos os registros
- **Filtros**: Por data específica

---

## 📝 Próximos Passos para Detalhamento

1. **Fluxo de Autenticação** - Como funciona o OAuth
2. **Processamento de Dados** - Algoritmos específicos
3. **Otimizações** - Cache, performance
4. **Tratamento de Erros** - Fallbacks e recuperação
5. **Deploy** - Processo de produção

---

*Este mapa serve como base para entender a arquitetura geral. Cada seção pode ser expandida conforme necessário.*
