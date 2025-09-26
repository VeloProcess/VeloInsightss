@echo off
echo ========================================
echo    VeloInsights - Deploy GitHub Pages
echo ========================================
echo.

echo [1/4] Verificando status do Git...
git status
echo.

echo [2/4] Adicionando arquivos...
git add .
echo.

echo [3/4] Fazendo commit...
git commit -m "Deploy automático: %date% %time%"
echo.

echo [4/4] Enviando para GitHub...
git push origin main
echo.

echo ========================================
echo    Deploy concluído com sucesso!
echo ========================================
echo.
echo O GitHub Actions irá detectar automaticamente
echo as mudanças e fazer o deploy no GitHub Pages.
echo.
echo GitHub: https://github.com/VeloProcess/VeloInsightss
echo Site: https://veloprocess.github.io/VeloInsightss/
echo.
pause
