# 🚀 Guia de Deploy - GitHub Pages

## ✅ Status Atual
- ✅ Código enviado para GitHub: https://github.com/VeloProcess/VeloInsightss.git
- ✅ Projeto configurado para GitHub Pages
- ✅ GitHub Actions configurado
- ⏳ Deploy automático ativo

## 🌐 Acesso Online

**URL Principal**: https://veloprocess.github.io/VeloInsightss/

## 🔧 Configurações Aplicadas

### 1. Vite Config (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/VeloInsightss/',  // ← Configurado para GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. GitHub Actions (`.github/workflows/deploy.yml`)
- ✅ Deploy automático em push para `main`
- ✅ Build com Node.js 18
- ✅ Deploy para GitHub Pages

### 3. Package.json
- ✅ Script `deploy-github` adicionado
- ✅ Dependência `gh-pages` incluída

## 🔄 Deploy Automático

### Como Funciona:
1. **Push para `main`** → GitHub Actions detecta
2. **Build automático** → `npm run build`
3. **Deploy automático** → GitHub Pages atualizado
4. **Site online** → https://veloprocess.github.io/VeloInsightss/

### Deploy Manual:
```bash
# Opção 1: Script automático
deploy.bat

# Opção 2: Manual
npm run build
git add .
git commit -m "Update"
git push origin main
```

## 📋 Checklist de Deploy

- [x] ✅ Código no GitHub
- [x] ✅ Configuração GitHub Pages
- [x] ✅ GitHub Actions configurado
- [x] ✅ Vite configurado para GitHub Pages
- [ ] ⏳ Deploy executado (próximo push)
- [ ] ⏳ Site funcionando online

## 🎯 Próximos Passos

1. **Fazer commit das mudanças**
2. **Push para GitHub**
3. **Aguardar deploy automático** (2-3 minutos)
4. **Testar site online**

## 🌐 URLs Importantes

- **Site**: https://veloprocess.github.io/VeloInsightss/
- **GitHub**: https://github.com/VeloProcess/VeloInsightss.git
- **Actions**: https://github.com/VeloProcess/VeloInsightss/actions

## 🆘 Troubleshooting

### Se o site não carregar:
1. Verifique se o GitHub Pages está habilitado
2. Confirme se o branch `gh-pages` foi criado
3. Verifique os logs do GitHub Actions

### Para habilitar GitHub Pages:
1. Vá em Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `/ (root)`

## 🔄 Atualizações Futuras

Para atualizar o site:
```bash
# Execute o script
deploy.bat

# Ou manualmente
git add .
git commit -m "Update"
git push origin main
```

O GitHub Actions fará o deploy automaticamente!
