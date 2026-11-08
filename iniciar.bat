@echo off
title E-Sports FIFA UFU 2026 - Servidor Local
echo ========================================================
echo   Iniciando o Sistema Oficial de FIFA UFU 2026...
echo ========================================================
echo.
cd /d "%~dp0"
start http://localhost:5173/
call npm run dev
pause
