# 🔧 Configuração para Desenvolvedor Frontend

## ⚙️ Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Google OAuth2 Configuration
VITE_GOOGLE_CLIENT_ID=827325386401-2g41vcepqkge5tiu380r1decb9ek5l1v.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-[SEU_CLIENT_SECRET_AQUI]

# Google Sheets Configuration
VITE_SHEET_ID=[ID_DA_PLANILHA_GOOGLE_SHEETS]
VITE_SHEET_RANGE=A:Z

# API Configuration (se necessário)
VITE_API_URL=http://localhost:3000
```

## 🎯 Pontos de Atenção para Desenvolvimento

### 1. **Sistema de Temas**
- **Arquivo**: `src/styles/themes.css`
- **Hook**: `src/hooks/useTheme.js`
- **Importante**: Sempre usar variáveis CSS, nunca cores hardcoded

### 2. **Drag & Drop**
- **Bibliotecas**: `@dnd-kit/*`
- **Componentes**: `AgentAnalysis`, `MetricsDashboard`, `UploadArea`
- **Persistência**: `localStorage` com chaves específicas

### 3. **Google Sheets Integration**
- **Hook Principal**: `src/hooks/useGoogleSheetsDirectSimple.js`
- **Configuração**: OAuth2 com Client ID/Secret
- **Processamento**: `src/utils/dataProcessor.js`

### 4. **Componentes Críticos**
- `src/components/AgentAnalysis.jsx` - Análise por agente
- `src/components/MetricsDashboard.jsx` - Dashboard principal
- `src/components/ChartsDetailedPage.jsx` - Gráficos detalhados
- `src/components/LoginTest.jsx` - Sistema de login

## 🚨 Problemas Conhecidos e Soluções

### 1. **Tema não aplicado corretamente**
```css
/* Solução: Usar !important quando necessário */
.theme-light .component {
  color: #000000 !important;
}
```

### 2. **Drag & Drop não funciona**
- Verificar se `@dnd-kit` está instalado
- Confirmar que `{...listeners}` está no handle correto
- Verificar IDs únicos nos componentes

### 3. **Google Sheets não carrega**
- Verificar Client ID/Secret
- Confirmar permissões da planilha
- Verificar CORS se necessário

### 4. **Charts não renderizam**
- Verificar se Chart.js está importado
- Confirmar dados no formato correto
- Verificar tema aplicado aos gráficos

## 📊 Estrutura de Dados Esperada

### Dados da Planilha Google Sheets
```javascript
// Formato esperado dos dados
const data = [
  {
    chamada: "Nome do Operador",
    tempoFalado: "00:05:30",
    pergunta2_1: 5,
    pergunta2_2: 4,
    // ... outros campos
  }
]
```

### Métricas Calculadas
```javascript
const metrics = {
  totalChamadas: 150,
  duracaoMediaAtendimento: 5.5,
  notaMediaAtendimento: 4.2,
  notaMediaSolucao: 4.0,
  tempoMedioLogado: 480,
  tempoMedioPausado: 60
}
```

## 🎨 Padrões de Código

### 1. **CSS Classes**
```css
/* Usar BEM methodology */
.component {}
.component__element {}
.component--modifier {}
```

### 2. **React Components**
```jsx
// Sempre usar memo para componentes pesados
const Component = memo(({ prop1, prop2 }) => {
  // Component logic
})
```

### 3. **Hooks**
```javascript
// Usar useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

## 🔍 Debugging

### Console Logs Úteis
```javascript
// Para debugging de dados
console.log('📊 Dados recebidos:', data)
console.log('🎯 Métricas calculadas:', metrics)
console.log('🔄 Drag end:', { active, over })
```

### Ferramentas Recomendadas
- **React DevTools**: Para inspecionar componentes
- **Redux DevTools**: Se usar Redux no futuro
- **Network Tab**: Para requisições Google Sheets
- **Application Tab**: Para localStorage

## 📱 Testes de Responsividade

### Breakpoints para Testar
- **320px**: iPhone SE
- **375px**: iPhone 12
- **768px**: iPad
- **1024px**: Desktop pequeno
- **1440px**: Desktop grande

### Componentes para Testar
- Sidebar colapsável
- Cards empilhados
- Gráficos responsivos
- Formulários adaptativos

## 🚀 Comandos Úteis

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules && npm install

# Verificar dependências desatualizadas
npm outdated

# Build e preview
npm run build && npm run preview
```

## 📋 Checklist de Desenvolvimento

### Antes de Começar
- [ ] Instalar dependências (`npm install`)
- [ ] Configurar variáveis de ambiente
- [ ] Verificar se Google Sheets está acessível
- [ ] Testar login com Google

### Durante o Desenvolvimento
- [ ] Usar variáveis CSS para cores
- [ ] Testar em diferentes temas (claro/escuro)
- [ ] Verificar responsividade
- [ ] Testar drag & drop
- [ ] Validar dados do Google Sheets

### Antes de Deploy
- [ ] Build sem erros (`npm run build`)
- [ ] Testar todas as funcionalidades
- [ ] Verificar performance
- [ ] Limpar console.logs desnecessários

---

**🎯 Este arquivo contém tudo que você precisa para trabalhar no frontend!**
