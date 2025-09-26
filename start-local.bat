@echo off
echo Iniciando Velodados Dashboard...
echo.
echo Servidor local iniciado!
echo.
echo Acesse em:
echo - Local: http://localhost:3000
echo - Rede: http://SEU_IP:3000
echo.
echo Para descobrir seu IP, execute: ipconfig
echo.
npm run dev -- --host 0.0.0.0 --port 3000
