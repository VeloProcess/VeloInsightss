@echo off
echo 🚀 Iniciando Velodados...
echo.

echo 📡 Iniciando Backend...
start "Backend" cmd /k "npm run api"

timeout /t 3 /nobreak > nul

echo 🌐 Iniciando Frontend...
start "Frontend" cmd /k "npm start"

timeout /t 5 /nobreak > nul

echo.
echo ✅ Sistema iniciado!
echo 🌐 Acesse: http://localhost:8080
echo.
echo 📁 Arraste o arquivo Excel para começar
echo.
pause
