# VeloInsights - Configuração Vercel

## 🚀 Deploy Automático Configurado

### ✅ Arquivos de Configuração Criados:

1. **`vercel.json`** - Configuração principal da Vercel
2. **`DEPLOY_VERCEL.md`** - Documentação completa
3. **`vite.config.js`** - Otimizado para produção

### 🔧 Configurações da Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 📋 Checklist de Deploy:

- [x] `vercel.json` configurado
- [x] `package.json` com script `build`
- [x] `vite.config.js` otimizado
- [x] Rotas SPA configuradas
- [x] Build otimizado com chunks
- [x] Minificação habilitada

### 🎯 Comandos para Deploy:

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login na Vercel
vercel login

# 3. Deploy inicial
vercel

# 4. Deploy de produção
vercel --prod
```

### 🌐 URLs Esperadas:

- **Preview:** `https://veloinsights-[hash].vercel.app`
- **Produção:** `https://veloinsights.vercel.app`

### ⚙️ Configurações no Painel Vercel:

1. **Framework Preset:** Vite
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`
5. **Node.js Version:** 18.x

### 🔄 Deploy Automático:

- ✅ Push para `master` → Deploy automático
- ✅ Pull Request → Preview automático
- ✅ Cache otimizado para builds rápidos

### 📊 Performance Esperada:

- **Lighthouse Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

### 🛠️ Troubleshooting:

Se houver problemas:

1. **Verificar logs:** `vercel logs`
2. **Testar localmente:** `npm run build && npm run preview`
3. **Verificar Node.js:** Versão 18.x
4. **Verificar dependências:** `npm install`

---

**V0 PERFEITA - Pronta para Deploy na Vercel! 🎉**
