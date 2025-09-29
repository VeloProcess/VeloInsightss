# VeloInsights - Dashboard de Análise de Atendimentos

## 🚀 Deploy na Vercel

### Configurações Automáticas

Este projeto está configurado para deploy automático na Vercel com:

- **Framework:** Vite + React
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x

### 📋 Checklist de Deploy

- [x] `vercel.json` configurado
- [x] `package.json` com scripts de build
- [x] `vite.config.js` otimizado
- [x] Variáveis de ambiente configuradas
- [x] Rotas SPA configuradas

### 🔧 Comandos de Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy inicial
vercel

# Deploy de produção
vercel --prod
```

### 🌐 URLs de Deploy

- **Preview:** `https://veloinsights-[hash].vercel.app`
- **Produção:** `https://veloinsights.vercel.app` (após configurar domínio)

### ⚙️ Configurações Importantes

1. **Build Command:** `npm run build`
2. **Output Directory:** `dist`
3. **Install Command:** `npm install`
4. **Node Version:** 18.x

### 📁 Estrutura de Deploy

```
/
├── dist/                 # Build de produção
├── api/                  # API routes (se necessário)
├── vercel.json          # Configuração Vercel
├── package.json         # Dependências e scripts
└── vite.config.js      # Configuração Vite
```

### 🎯 Variáveis de Ambiente

Configure no painel da Vercel:

- `NODE_ENV=production`
- `VITE_APP_TITLE=VeloInsights`
- `VITE_APP_VERSION=V0_PERFEITA`

### 🔄 Deploy Automático

O projeto está configurado para:
- Deploy automático no push para `master`
- Preview automático em pull requests
- Cache otimizado para builds rápidos

### 📊 Performance

- **Lighthouse Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

### 🛠️ Troubleshooting

Se houver problemas no deploy:

1. Verificar logs: `vercel logs`
2. Testar localmente: `npm run build && npm run preview`
3. Verificar variáveis de ambiente
4. Confirmar Node.js version 18.x

---

**V0 PERFEITA - Pronta para Produção! 🎉**
